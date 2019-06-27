const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

module.exports = (server) => {
    server.on('statusChange', (s) => {
        io.emit('statusChange', s)
    })
    server.on('console', (t) => {
        io.emit('console', t)
    })
    server.on('listUpdate', () => {
        io.emit('listUpdate')
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