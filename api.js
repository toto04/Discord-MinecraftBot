const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const cp = require('child_process')
const fs = require('fs')
var status = 'offline'

var serverProcess

function setStatus(s) {
    status = s
    console.log('Status is now ' + s)
    io.emit('statusChange', s)
}

function startServer() {
    if (status != 'offline') return 'Server already running!'
    const path = __dirname + '/mcServer/server.jar'
    if (!fs.existsSync(path)) {
        return 'Server does not exist'
    }

    serverProcess = cp.spawn(
        "java",
        ['-Xms1024M', '-Xmx1024M', '-jar', 'server.jar', 'nogui'],
        {
            cwd: __dirname + '/mcServer'
        }
    )

    setStatus('booting')

    serverProcess.stdout.on('data', data => {
        data = data.toString() 
        process.stdout.write('MC Server: ' + data)
        if (data.substring(10, 37) == ' [Server thread/INFO]: Done') setStatus('online')
    })
    serverProcess.stderr.on('data', data => {
        console.error('MC Server ERROR: ' + data)
    })
    serverProcess.on('exit', () => {
        serverProcess = null
        setStatus('offline')
    })

    return 'Server starting'
}

function stopServer() {
    if (status == 'offline' || status == 'stopping' || !serverProcess) return 'Server already offline!'
    setStatus('stopping')
    serverProcess.stdin.write('stop\r')
}

io.on('connection', (socket) => {
    socket.on('start', startServer)
    socket.on('stop', stopServer)
})

app.get('/list', (req, res) => {
    if (status != 'online' || !serverProcess) {
        res.send(JSON.stringify('server offline'))
        return
    }
    serverProcess.stdin.write('list\r')
    serverProcess.stdout.once('data', (data) => {
        var players = data.toString().match(/\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\]: There are (\d+) of a max (\d+) players online:(.{0,})/)[3]
        players = players.substring(1, players.length).split(", ")
        res.send(JSON.stringify(players))
    })
})

app.get('/status', (req, res) => {
    res.send(status)
})

app.post('/start', (req, res) => {
    res.send(startServer())
})

app.post('/stop', (req, res) => {
    res.send(startServer())
})

app.use(express.static('static'))

module.exports = httpServer