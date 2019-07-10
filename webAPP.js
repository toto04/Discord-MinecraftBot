const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

module.exports = server => {
    io.on('connection', socket => {
        let ip = socket.handshake.address
        if (ip.startsWith('::ffff:')) ip = ip.substring(7)
        console.log(`[webApp] Client connected with ip ${ip}`)

        // incoming messages
        socket.on('newMessage', msg => {
            server.say(msg)
        })

        socket.on('newCommand', cmd => {
            if (process.env.WEB_COMMANDS != 'true') {
                socket.emit('console', 'cannot execute command: not permitted\n')
                return
            }
            server.command(cmd)
        })
    })

    // reroutes the events for the web app
    server.on('statusChange', (s) => {
        io.emit('statusChange', s)
    })
    server.on('console', (t) => {
        io.emit('console', t)
    })
    server.on('listUpdate', () => {
        io.emit('listUpdate')
    })
    server.on('chat', (player, text) => {
        io.emit('chat', player, text)
    })

    // api endpoints
    app.post('/start', (req, res) => {
        res.send(server.start())
    })
    app.post('/stop', (req, res) => {
        res.send(server.stop())
    })
    app.get('/status', (req, res) => {
        res.send(server.status)
    })
    app.get('/list', async (req, res) => {
        res.send(JSON.stringify(server.list))
    })

    app.use(express.static('static'))

    return httpServer
}