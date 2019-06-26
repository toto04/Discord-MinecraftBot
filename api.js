const express = require('express')
const app = express()
const cp = require('child_process')
const fs = require('fs')
var status = 'offline'

var serverProcess

app.get('/list', (req, res) => {
    
})

app.get('/status', (req, res) => {
    res.send(JSON.stringify({
        status
    }))
})

app.post('/start', (req, res) => {
    if (status != 'offline') return
    const path = __dirname + '/mcServer/server.jar'
    if (!fs.existsSync(path)) {
        res.send(JSON.stringify({
            status: 404,
            message: 'missing server.jar in /mcServer/ folder'
        }))
        return
    }
    
    serverProcess = cp.spawn(
        "java",
        ['-Xms1024M', '-Xmx1024M', '-jar', 'server.jar', 'nogui'],
        {
            cwd: __dirname + '/mcServer'
        }
    )

    serverProcess.stdout.on('data', data => {
        console.log('MC Server: ' + data)
    })

    serverProcess.stderr.on('data', data => {
        console.error('MC Server ERROR: ' + data)
    })

    serverProcess.on('exit', () => {
        serverProcess = null
        console.log('Server closed!')
    })

    res.send(JSON.stringify({
        status: 200,
        message: 'ciao'
    }))
})

app.post('/stop', (req, res) => {
    console.log('Stopping server...')
    res.send('Stopping server')
    if (serverProcess) {
        serverProcess.stdin.write('stop\r')
    }
})

app.use(express.static('static'))

module.exports = app