require('dotenv').config()

const mcServer = require('./server.js')
const client = require('./discordBot.js')(mcServer)
const webApp = require('./webAPP.js')(mcServer)
const port = process.env.SERVER_PORT || 2580

process.stdin.on('data', (data) => {
    data = data.toString()
    mcServer.stdin.write(data + '\r')
})

webApp.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

client.login(process.env.BOT_TOKEN)