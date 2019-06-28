const Discord = require('discord.js')
Discord.Client.prototype.log = (txt) => {
    console.log('[discordBot] ' + txt)
}
const client = new Discord.Client()
var OPs = []

module.exports = server => {
    server.on('chat', (player, text) => {
        // sends minecraft messages over to discord
        const cID = process.env.CHANNEL_ID
        if (!cID) return
        const ch = client.channels.get(cID)
        if (ch && player != 'Server') ch.send(`[minecraft] ${player}: ${text}`)
        else client.log('No channel for given id, change CHANNEL_ID in .env file')
    })
    server.on('statusChange', s => {
        if (s == 'online') {
            client.user.setPresence({
                status: 'online'
            })
        } else if (s == 'offline') {
            client.user.setPresence({
                status: 'dnd',
                game: {
                    name: 'Server offline'
                }
            })
        } else {
            client.user.setPresence({
                status: 'idle',
                game: {
                    name: `Server ${s}`
                }
            })
        }
    })
    server.on('listUpdate', async () => {
        let res = await server.list()
        let msg = `Server ${server.status}\n${res.len} of ${res.max} online:`
        for (const player of res.players) {
            msg += `\n- ${player}`
        }
        client.user.setPresence({
            game: {
                name: msg
            }
        })
    })

    client.on('message', async message => {
        if (message.author == client.user) return // returns if sender is the bot
        const cID = process.env.CHANNEL_ID
        if (cID && cID != message.channel.id && process.env.BIND_TO_CHANNEL == 'true') return //channel is not the one bound
        if (!message.content.startsWith(process.env.COMMAND_PREFIX)) {
            // sends discord messages over to minecraft
            if (server.status != 'online') return
            server.say(`<${message.author.username}> ${message.content}`)
        } else {
            // gets command and payload from the message, separated by a space
            let cmd, payload = ''
            if (message.content.indexOf(' ') == -1) {
                cmd = message.content.substring(1, message.content.length)
            } else {
                cmd = message.content.substring(1, message.content.indexOf(' '))
                payload = message.content.substring(message.content.indexOf(' ') + 1, message.content.length)
            }

            client.log(`<${message.author.username}> command: ${cmd}, payload: ${payload}`)

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
                    if (typeof (res) == 'string') {
                        msg = res
                    } else {
                        msg = `${res.len} of ${res.max} online:`
                        for (const player of res.players) {
                            msg += `\n- ${player}`
                        }
                    }
                    message.channel.send(msg)
                    break
                case '/':
                    // TODO: check permissions
                    if (!OPs.includes(message.author.id)) {
                        message.channel.send('You are not allowed to use commands')
                        return
                    }
                    server.command(payload)
                    break
                case 'help':
                    // TODO: help
                    message.channel.send('Elia culo ti attacchi')
                    break
                default:
                    message.channel.send(`Unknown command, type ${process.env.COMMAND_PREFIX}help to get available commands`)
                    return
            }
        }
    })

    client.on('ready', () => {
        client.log(`Logged in as ${client.user.tag}`)
        OPs = process.env.ADMIN_IDS.split(',')

        client.user.setPresence({
            status: 'dnd',
            game: {
                name: 'Server offline',
                type: 'PLAYING'
            }
        })
    })

    return client
}
