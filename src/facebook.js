const axios = require('axios')
const { from, of, empty } = require('rxjs')
const { expand, map, scan, last } = require('rxjs/operators')

const config = require('./fb.config.json')
    // Add a request interceptor
axios.interceptors.request.use(function(config) {
    // Do something before request is sent
    console.log("Calling", config.url)
    return config;
}, function(error) {
    // Do something with request error
    console.error(error)
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function(response) {
    // Do something with response data
    console.log("G0t Back", { status: response.status, message: response.statusText })
    return response;
}, function(error) {
    // Do something with response error
    // keys config, request, response
    // console.error(Object.keys(error.response))
    console.error({ status: error.response.status, message: error.response.statusText, ...error.response.data.error })
    return Promise.reject(error);
});

const fb = {
    getReport: (configObj) => {
        return from(axios({
            method: 'get',
            url: `https://graph.facebook.com/v3.2/${configObj.fb_id}/insights`,
            params: {
                access_token: config.access_token,
                level: 'ad',
                date_preset: 'last_week_mon_sun',
                fields: 'account_name,account_id,ad_name,ad_id,adset_name,adset_id,campaign_name,campaign_id,impressions,inline_link_clicks,clicks,cpc,ctr,cpm,cpp,spend,social_spend,created_time,reach,frequency',
                action_breakdowns: 'action_device',
                breakdowns: 'impression_device'
            }
        })).pipe(
            map(response => {
                if (response.data.next) {
                    return {
                        data: response.data.data,
                        next: response.data.paging.next
                    }
                }
                return {
                    data: response.data.data,
                    next: false
                }
            }),
            expand(({ next }) => (next ? _get(next) : empty())),
            map(({ data }) => data),
            scan((a, c) => [...a, ...c], []),
            last()
        )
    },

}

module.exports = fb

// https://graph.facebook.com/v3.2/act_10153683404035667/insights?access_token=EAAFlOVB8mIABANgT4yc5hS85oW7iRSHCvy9Sistl5auZBEa48uUIGmImYpRZABBwpXKk6QPGfQXJLmtTFdD2vTQq41xvgPUH9EcNsl84Jf8jBMTCVMPvxuB877rEuWlKOZCw61KXl5PZCZB1hjRk6QlLCZBb2NitWaVzyFV0BqJgW4snYwjFot&date_preset=last_month&level=ad&filtering=[{field:%22ad.impressions%22,operator:%22GREATER_THAN%22,value:0}]&fields=account_name,account_id,ad_name,ad_id,adset_name,adset_id,campaign_name,campaign_id,impressions,inline_link_clicks,clicks,cpc,ctr,cpm,cpp,spend,social_spend,created_time,reach,frequency,website_ctr,actions&action_breakdowns=action_device&breakdowns=impression_device

function _get(url, config) {
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