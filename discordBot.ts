import Discord, { TextChannel } from 'discord.js'
import Server from './server'
function clientLog(txt: string) {
    console.log('[discordBot] ' + txt)
}
const client = new Discord.Client()
var OPs: string[] = []    // array of admins' IDs

export default (server: Server) => {
    server.on('chat', (player: string, text: string) => {
        // sends minecraft messages over to discord
        const cID = process.env.CHANNEL_ID
        if (!cID) return
        const ch = client.channels.get(cID)
        if (ch instanceof TextChannel && player != 'Server') ch.send(`[minecraft] ${player}: ${text}`)
        else clientLog('No channel for given id, change CHANNEL_ID in .env file')
    })
    server.on('statusChange', s => {
        // changes the presence according to current server status
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
    server.on('listUpdate', () => {
        // updates presence according to player list
        let res = server.list
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
        if (process.env.COMMAND_PREFIX && !message.content.startsWith(process.env.COMMAND_PREFIX)) {
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

            clientLog(`<${message.author.username}> command: ${cmd}, payload: ${payload}`)

            switch (cmd) {
                // commands
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
                    let res = server.list
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
                    if (!OPs.includes(message.author.id)) {
                        message.channel.send('You are not allowed to use commands')
                        return
                    }
                    server.command(payload)
                    break
                case 'help':
                    let cp = process.env.COMMAND_PREFIX
                    message.channel.send(
                        new Discord.RichEmbed()
                            .setColor(`#FF9900`)
                            .setTitle(`Command list`)
                            .addField(`${cp}start`, `executes the server.jar file, downloads first it if missing`)
                            .addField(`${cp}stop`, `stops the server process if running, by issuing the "/stop" minecraft command`)
                            .addField(`${cp}status`, `returns the current server status (downloading, booting, online, stopping, offline)`)
                            .addField(`${cp}list`, `if the server is running, lists all online players`)
                            .addField(
                                `${cp}/ [command] [arguments]`,
                                `submits a command to the server's stdin, only available to admins listed in the .env file\n` +
                                `For example the command '${process.env.COMMAND_PREFIX}/ say hi' will result in '[Server] hi' in the minecraft chat`
                            )
                            .setAuthor('view this project on github', 'https://github.com/toto04.png', 'https://github.com/toto04/Discord-MinecraftBot')
                    )
                    break
                default:
                    message.channel.send(`Unknown command, type ${process.env.COMMAND_PREFIX}help to get available commands`)
                    return
            }
        }
    })

    client.on('ready', () => {
        clientLog(`Logged in as ${client.user.tag}`)
        if (process.env.ADMIN_IDS) OPs = process.env.ADMIN_IDS.split(',')

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
