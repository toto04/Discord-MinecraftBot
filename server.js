const EventEmitter = require('events')
const prepareServer = require('./downloader.js')
const cp = require('child_process')
const fs = require('fs')

class Server extends EventEmitter {
    constructor() {
        super()
        this.status = 'offline'
        this.process = null
        this.list = {
            num: null,
            max: null,
            players: []
        }
    }

    _setStatus(s) {
        // function called internally to update status
        this.status = s
        this.emit('statusChange', s)
        this.logln('Status set to ' + s)
    }

    _updateList() {
        // asynchronously returns an object containing:
        // len: number of players online
        // max: max number of players online
        // players: array of the players' usernames
        let pro = new Promise((resolve, reject) => {
            if (this.status != 'online' || !this.process) {
                this.list = {
                    num: null,
                    max: null,
                    players: []
                }
            }
            this.process.stdin.write('list\r')
            this.process.stdout.once('data', (data) => {
                let match = data.toString().match(/\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\]: There are (\d+) of a max (\d+) players online:(.{0,})/)
                if (match) {
                    let players = match[3].substring(1).split(", ")
                    this.list = {
                        len: match[1],
                        max: match[2],
                        players
                    }
                    resolve()
                } else {
                    this.list = {
                        len: null,
                        max: null,
                        players: []
                    }
                    resolve() // very poor error handling
                }
            })
        })
        pro.then(() => {
            this.emit('listUpdate')
        })
        return pro
    }

    start() {
        if (this.status != 'offline') return 'Server already running!'
        if (!fs.existsSync(__dirname + '/mcServer/server.jar')) {
            // creates the folder and downloads the latest server.jar file, restarts when finished
            prepareServer().then(() => {
                this._setStatus('offline')
                this.start()
            })
            this._setStatus('downloading')
            return 'Downloading jar file...'
        }

        this.process = cp.spawn(
            // runs the server
            "java",
            ['-Xms1024M', '-Xmx1024M', '-jar', 'server.jar', 'nogui'],
            {
                cwd: __dirname + '/mcServer'
            }
        )

        this._setStatus('booting')

        this.process.stdout.on('data', data => {
            // parses useful stuff when the server process outputs something
            data = data.toString()
            this.log(data)
            if (data.includes('joined') | data.includes('left')) this._updateList()
            let match = data.match(/\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\]: (?:\[([^\]]+)\]|<([^>]+)>) (.+)/)
            if (match) {
                if (match[1]) this.emit('chat', match[1], match[3])
                else this.emit('chat', match[2], match[3])
            }
            if (data.substring(10, 37) == ' [Server thread/INFO]: Done') this._setStatus('online')
        })
        this.process.stderr.on('data', data => {
            console.error('[server: ERROR] ' + data)
        })
        this.process.on('exit', () => {
            this.process = null
            this._setStatus('offline')
        })

        return 'Server starting...'
    }

    log(txt) {
        this.emit('console', txt)
        process.stdout.write('[server] ' + txt)
    }

    logln(txt) {
        this.log(txt + '\n')
    }

    stop() {
        // stops the server
        if (this.status != 'online' || !this.process) return `Server is ${this.status}`
        this._setStatus('stopping')
        this.process.stdin.write('stop\r')
        return 'Server stopping...'
    }

    command(cmd) {
        // submits a given command to the server stdin
        if (this.status != 'online') return this.logln('cannot execute command: server offline')
        this.process.stdin.write(cmd + '\r')
    }

    say(msg) {
        this.command('say ' + msg)
    }
}

module.exports = new Server()