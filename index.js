const fb = require('./src/facebook')
const { forkJoin, of } = require('rxjs')
const { mergeMap, switchMap } = require('rxjs/operators')
const fsu = require('./src/fileSystem.util')
const sites = require('./src/sites.json')


const fbSites = sites.filter(site => site.fb_insights_include === "TRUE")

const sites$ = of(fbSites)
sites$
    .pipe(
        mergeMap(sites => forkJoin(sites.map(site => genReport(site))))
    )
    .subscribe(r => console.log(r))

function genReport(site) {
    return fb.getReport(site)
        .pipe(
            switchMap(result => fsu.saveToFile(result, site.fb_account_name))
        )
}
// fsu.cleanDataDir()