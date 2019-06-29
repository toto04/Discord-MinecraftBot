const https = require('https')
const fs = require('fs')
const readline = require('readline')

function prepareServer() {
    // this function searches for the latest version in the version_manifest.json used by minecraft's launcher
    // then looks for the download link for the server .jar executable and downloads it
    return new Promise((resolve, reject) => {
        console.log('[downloader] Preparing server.jar! The server will start when the download is finished')
        const dir = './mcServer'
        if (!fs.existsSync(dir)) {
            console.log('[downloader] making directory!')
            fs.mkdirSync(dir)
        }
        const file = fs.createWriteStream("mcServer/server.jar");
        file.on('finish', () => {
            resolve()
            console.log('\n[downloader] Finished downloading .jar!')
        })
        var url = 'https://launchermeta.mojang.com/mc/game/version_manifest.json'
        https.get(url, res => {
            // ahh yes, callback hell ( ͡° ͜ʖ ͡°)
            console.log('[downloader] retrieving latest version!')
            let rawData = ''
            res.on('data', chunk => {
                rawData += chunk
            })
            res.on('end', () => {
                let parsed = JSON.parse(rawData)
                let latest = parsed.latest.release
                for (const version of parsed.versions) {
                    if (version.id == latest) {
                        https.get(version.url, res => {
                            console.log('[downloader] retrieving download link!')
                            let rawData = ''
                            res.on('data', chunk => {
                                rawData += chunk
                            })
                            res.on('end', () => {
                                let parsed = JSON.parse(rawData)
                                https.get(parsed.downloads.server.url, res => {
                                    console.log('[downloader] starting download!')
                                    if (process.stdout.isTTY) {
                                        let tot = parseInt(res.headers['content-length'], 10)
                                        let cur = 0
                                        res.on('data', chunk => {
                                            cur += chunk.length
                                            const perc = 100 * cur / tot
                                            readline.cursorTo(process.stdout, 0)
                                            process.stdout.write(`[downloader] Downloading... [${perc.toFixed(2)}%]`)
                                        })
                                    }
                                    res.pipe(file)
                                })
                            })
                        })
                        break;
                    }
                }
            })
        })
    })
}

module.exports = prepareServer