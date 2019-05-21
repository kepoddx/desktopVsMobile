const path = require('path')
const { createWriteStream, readdir } = require('fs')
const { Readable } = require('stream')
const fse = require('fs-extra')
const { bindCallback, of } = require('rxjs')

const readdir$ = bindCallback(readdir)
const dataPath = 'data'

function saveToFile(data, fileName) {
    const savePath = path.join(process.cwd(), dataPath, `${fileName}.json`)
    const reader = new Readable({
        read() {}
    })
    reader.push(JSON.stringify(data, null, 4))
    const writer = createWriteStream(savePath)

    reader.pipe(writer)
    return of(`File Saved ${fileName}.json`)
}

async function cleanDataDir() {
    try {
        const dataDir = path.join(process.cwd(), dataPath)
        readdir$(dataDir)
            .subscribe(files => {
                const fullPaths = files[1].map(fileName => path.join(process.cwd(), dataPath, fileName))
                fullPaths.map(async(file) => await fse.remove(file))
            })
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    saveToFile,
    cleanDataDir
}