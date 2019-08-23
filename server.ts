import EventEmitter from 'events'
import prepareServer from './downloader'
import cp from 'child_process'
import fs from 'fs'

type status = 'offline' | 'booting' | 'online' | 'stopping' | 'downloading'

export default class Server extends EventEmitter {
    status: status
    process: any
    list: { len: number | null; max: number | null; players: string[]; }
    constructor() {
        super()
        this.status = 'offline'
        this.process = null
        this.list = {
            len: null,
            max: null,
            players: []
        }
    }

    private _setStatus(s: status) {
        // function called internally to update status
        this.status = s
        this.emit('statusChange', s)
        this.logln('Status set to ' + s)
    }

    private _updateList() {
        // asynchronously returns an object containing:
        // len: number of players online
        // max: max number of players online
        // players: array of the players' usernames
        let pro = new Promise((resolve, reject) => {
            if (this.status != 'online' || !this.process) {
                this.list = {
                    len: null,
                    max: null,
                    players: []
                }
            }
            this.process.stdin.write('list\r')
            this.process.stdout.once('data', (data: any) => {
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
            ['-Xms512M', '-Xmx2048M', '-jar', 'server.jar', 'nogui'],
            {
                cwd: __dirname + '/mcServer'
            }
        )

        this._setStatus('booting')

        this.process.stdout.on('data', (data: any) => {
            // parses useful stuff when the server process outputs something
            data = data.toString()
            this.log(data)
            if (data.includes('joined') || data.includes('left') || data.includes('logged in')) this._updateList()
            let match = data.match(/\[\d{2}:\d{2}:\d{2}\] (?:\[Server thread\/INFO\]|\[Async Chat Thread - #\d+\/INFO\]): <([^>]+)> (.+)/)
            if (match) {
                this.emit('chat', match[1], match[2])
            }
            if (data.substring(10, 37) == ' [Server thread/INFO]: Done') this._setStatus('online')
        })
        this.process.stderr.on('data', (data: string) => {
            console.error('[server: ERROR] ' + data)
        })
        this.process.on('exit', () => {
            this.process = null
            this._setStatus('offline')
        })

        return 'Server starting...'
    }

    log(txt: string) {
        this.emit('console', txt)
        process.stdout.write('[server] ' + txt)
    }

    logln(txt: string) {
        this.log(txt + '\n')
    }

    stop() {
        // stops the server
        if (this.status != 'online' || !this.process) return `Server is ${this.status}`
        this._setStatus('stopping')
        this.process.stdin.write('stop\r')
        return 'Server stopping...'
    }

    command(cmd: string) {
        // submits a given command to the server stdin
        if (this.status != 'online') return this.logln('cannot execute command: server offline')
        this.process.stdin.write(cmd + '\r')
    }

    say(msg: string) {
        this.command('say ' + msg)
    }
}