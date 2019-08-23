"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = __importDefault(require("https"));
var fs_1 = __importDefault(require("fs"));
var readline_1 = __importDefault(require("readline"));
function prepareServer() {
    // this function searches for the latest version in the version_manifest.json used by minecraft's launcher
    // then looks for the download link for the server .jar executable and downloads it
    return new Promise(function (resolve, reject) {
        console.log('[downloader] Preparing server.jar! The server will start when the download is finished');
        var dir = './mcServer';
        if (!fs_1.default.existsSync(dir)) {
            console.log('[downloader] making directory!');
            fs_1.default.mkdirSync(dir);
        }
        var file = fs_1.default.createWriteStream("mcServer/server.jar");
        file.on('finish', function () {
            resolve();
            console.log('\n[downloader] Finished downloading .jar!');
        });
        var url = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';
        https_1.default.get(url, function (res) {
            // ahh yes, callback hell ( ͡° ͜ʖ ͡°)
            console.log('[downloader] retrieving latest version!');
            var rawData = '';
            res.on('data', function (chunk) {
                rawData += chunk;
            });
            res.on('end', function () {
                var parsed = JSON.parse(rawData);
                var latest = parsed.latest.release;
                for (var _i = 0, _a = parsed.versions; _i < _a.length; _i++) {
                    var version = _a[_i];
                    if (version.id == latest) {
                        https_1.default.get(version.url, function (res) {
                            console.log('[downloader] retrieving download link!');
                            var rawData = '';
                            res.on('data', function (chunk) {
                                rawData += chunk;
                            });
                            res.on('end', function () {
                                var parsed = JSON.parse(rawData);
                                https_1.default.get(parsed.downloads.server.url, function (res) {
                                    console.log('[downloader] starting download!');
                                    if (process.stdout.isTTY) {
                                        var tot_1 = parseInt(res.headers['content-length'] + '', 10);
                                        var cur_1 = 0;
                                        res.on('data', function (chunk) {
                                            cur_1 += chunk.length;
                                            var perc = 100 * cur_1 / tot_1;
                                            readline_1.default.cursorTo(process.stdout, 0);
                                            process.stdout.write("[downloader] Downloading... [" + perc.toFixed(2) + "%]");
                                        });
                                    }
                                    res.pipe(file);
                                });
                            });
                        });
                        break;
                    }
                }
            });
        });
    });
}
exports.default = prepareServer;
module.exports = prepareServer;
