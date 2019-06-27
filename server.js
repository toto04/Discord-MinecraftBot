const EventEmitter = require('events');
const cp = require('child_process')
const fs = require('fs')

class Server extends EventEmitter {
    constructor() {
        super()
        this.status = 'offline'
        this.process = null
    }

    _setStatus(s) {
        this.status = s
        this.emit('statusChange', s)
        this.logln('Status is now: ' + s)
    }

    start() {
        if (this.status != 'offline') return 'Server already running!'
        if (!fs.existsSync(__dirname + '/mcServer/server.jar')) {
            return 'Server does not exist'
        }

        this.process = cp.spawn(
            "java",
            ['-Xms1024M', '-Xmx1024M', '-jar', 'server.jar', 'nogui'],
            {
                cwd: __dirname + '/mcServer'
            }
        )

        this._setStatus('booting')

        this.process.stdout.on('data', data => {
            data = data.toString()
            this.log(data)
            if (data.substring(10, 37) == ' [Server thread/INFO]: Done') this._setStatus('online')
        })
        this.process.stderr.on('data', data => {
            console.error('[server: ERROR] ' + data)
        })
        this.process.on('exit', () => {
            this.process = null
            this._setStatus('offline')
        })

        return 'Server starting'
    }

    log(txt) {
        this.emit('console', txt)
        process.stdout.write('[server] ' + txt)
    }

    logln(txt) {
        this.log(txt + '\r')
    }

    stop() {
        if (this.status == 'offline' || this.status == 'stopping' || !this.process) return 'Server already offline!'
        this._setStatus('stopping')
        this.process.stdin.write('stop\r')
    }

    list() {
        return new Promise((resolve, reject) => {
            if (this.status != 'online' || !this.process) {
                resolve('server offline')
            }
            this.process.stdin.write('list\r')
            this.process.stdout.once('data', (data) => {
                let match = data.toString().match(/\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\]: There are (\d+) of a max (\d+) players online:(.{0,})/)
                let players = match[3].substring(1).split(", ")
                let obj = {
                    len: match[1],
                    max: match[2],
                    players
                }
                resolve(obj)
            })
        })
    }
}

module.exports = new Server()