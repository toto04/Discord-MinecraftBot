const express = require('express')
const app = express()

app.get('/list', (req, res) => {
    
})

app.post('/start', (req, res) => {
    res.send()
})

app.use(express.static('static'))

module.exports = app