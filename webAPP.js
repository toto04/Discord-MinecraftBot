const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

module.exports = server => {
    io.on('connection', socket => {
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
        res.send(JSON.stringify(await server.list()))
    })

    app.use(express.static('static'))

    return httpServer
}