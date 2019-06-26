require('dotenv').config()

const Discord = require('discord.js')
const webApp = require('./api.js')
const client = new Discord.Client()

client.on('message', message => {
    if (!message.guild) return
    if (!message.content.startsWith(process.env.COMMAND_PREFIX)) return

    let cmd, payload = ''
    if (message.content.indexOf(' ') == -1) {
        cmd = message.content.substring(1, message.content.length)
    } else {
        cmd = message.content.substring(1, message.content.indexOf(' '))
        payload = message.content.substring(message.content.indexOf(' ') + 1, message.content.length)
    }



    console.log(`Command: ${cmd}, payload: ${payload}`)
})

client.on('ready', () => {
    console.log(`Client logged in as ${client.user.tag}`)
})

let port = process.env.SERVER_PORT || 2580
webApp.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

client.login(process.env.BOT_TOKEN)