const Discord = require('discord.js')
Discord.Client.prototype.log = (txt) => {
    console.log('[discordBot] ' + txt)
}
const client = new Discord.Client()

module.exports = server => {
    server.on('chat', (player, text) => {
        const cID = process.env.CHANNEL_ID
        if (!cID) return
        const ch = client.channels.get(cID)
        if (ch) ch.send(`[minecraft] ${player}: ${text}`)
        else client.log('No channel for given id, change CHANNEL_ID in .env file')
    })

    client.on('message', async message => {
        if (!message.guild) return  // returns if sender is the bot
        if (!message.content.startsWith(process.env.COMMAND_PREFIX)) {
            // if not a command
        } else {
            // gets command and payload from the message, separated by a space
            let cmd, payload = ''
            if (message.content.indexOf(' ') == -1) {
                cmd = message.content.substring(1, message.content.length)
            } else {
                cmd = message.content.substring(1, message.content.indexOf(' '))
                payload = message.content.substring(message.content.indexOf(' ') + 1, message.content.length)
            }
    
            switch (cmd) {
                // list of commands
                case 'start':
                    message.channel.send(server.start())
                    break
                case 'stop':
                    message.channel.send(server.stop())
                    break
                case 'status':
                    message.channel.send(`Server is currently ${server.status}`)
                    break
                case 'list':
                    let res = await server.list()
                    let msg
                    if (typeof(res) == 'string') {
                        msg = res
                    } else {
                        msg = `${res}`
                    }
                    message.channel.send()
                    break
                case 'command':
                    server.command(payload)
                    break
                default:
                    message.channel.send(`Unknown command, type ${process.env.COMMAND_PREFIX}help to get available commands`)
                    return
            }
    
            client.log(`<${message.author.username}> command: ${cmd}, payload: ${payload}, `)
        }
    })

    client.on('ready', () => {
        client.log(`Logged in as ${client.user.tag}`)
    })

    return client
}
