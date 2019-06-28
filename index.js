require('dotenv').config()

const mcServer = require('./server.js')
const client = require('./discordBot.js')(mcServer)
const webApp = require('./webAPP.js')(mcServer)
const port = process.env.SERVER_PORT || 2580

process.stdin.on('data', (data) => {
    if (mcServer.process) {
        data = data.toString()
        mcServer.process.stdin.write(data)    
    }
})

webApp.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

client.login(process.env.BOT_TOKEN)