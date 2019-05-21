import axios from 'axios'
import { from, empty } from "rxjs";
import { expand, map, scan, last } from "rxjs/operators";



// Add a request interceptor
axios.interceptors.request.use(function(config) {
    // Do something before request is sent
    console.log("Calling", config.url)
    return config;
}, function(error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function(response) {
    // Do something with response data
    console.log("G0t Back", Object.keys(response))
    return response;
}, function(error) {
    // Do something with response error
    // keys config, request, response
    console.error(Object.keys(error.request))
    return Promise.reject(error);
});


function post$(url, data, config, ) {
    if (!data && !config) {
        return from(axios.post((url)))
    }
    if (data === null && config) {
        return from(axios({
            method: 'post',
            url: url,
            params: config
        }))
    }
    if (data && !config) {
        return from(axios.post(url, data))
    }
}

function getPagedData$(url, config) {
    const data = getPaging$(url, config);
    return data.pipe(
        expand(({ next }) => (next ? getPaging$(next) : empty())),
        map(({ data }) => data),
        scan((a, c) => [...a, ...c], []),
        last()
    );
}

function getPaging$(url, config) {
    if (!config) {
        return from(axios.get(url)).pipe(
            map(response => ({
                data: response.data.data,
                next: response.data.paging.next
            }))
        );
    } else {
        return from(axios.get(url, config)).pipe(
            map(response => ({
                data: response.data.data,
                next: response.data.paging.next
            }))
        );
    }
}

module.exports = {
    getPagedData$
}