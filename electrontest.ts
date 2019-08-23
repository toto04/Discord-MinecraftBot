import { app, BrowserWindow, Tray, nativeImage, Menu } from 'electron'
import dotenv from 'dotenv'
import Server from './server'
import createBot from './discordBot'
import createWeb from './webAPP'

dotenv.config()
const mcServer = new Server()
const client = createBot(mcServer)
const webApp = createWeb(mcServer)
const port = process.env.SERVER_PORT || 2580

process.stdin.on('data', (data) => {
    // passes the console input to the minecraft console
    if (mcServer.process) {
        data = data.toString()
        mcServer.process.stdin.write(data)
    }
})

webApp.listen(port, () => {
    console.log(`[webApp] Server listening on port ${port}`)
})

client.login(process.env.BOT_TOKEN)

client.on('error', (e) => {
    console.error(e)
})

let tray: Tray
let win: BrowserWindow | undefined
let menuTemplate = [
    { label: 'start', enabled: true, click: startStop },
    { label: 'open', enabled: true, click: spawnWindow },
    { label: 'quit', enabled: true, click: app.quit }
]

function spawnWindow() {
    if (win) win.show()
    else {
        win = new BrowserWindow({
            width: 800,
            height: 600,
            icon: __dirname + '/electron_static/icon.png'
        })
        win.loadFile('static/index.html')
        win.on('close', () => {
            win = undefined
        })
    }
}

function spawnTray() {
    tray = new Tray(__dirname + '/electron_static/icon.png')
    tray.on('click', spawnWindow)
    tray.setToolTip('online')
    tray.setContextMenu(Menu.buildFromTemplate(menuTemplate))
    Menu.setApplicationMenu(Menu.buildFromTemplate([{label: 'server', submenu: menuTemplate}]))
}

mcServer.on('statusChange', (s: 'offline' | 'booting' | 'online' | 'stopping' | 'downloading') => {
    if (s == 'offline') {
        menuTemplate[0].label = 'start'
        menuTemplate[0].enabled = true
    } else if (s == 'online') {
        menuTemplate[0].label = 'stop'
        menuTemplate[0].enabled = true
    } else {
        menuTemplate[0].label = s
        menuTemplate[0].enabled = false
    }
    tray.setContextMenu(Menu.buildFromTemplate(menuTemplate))
    Menu.setApplicationMenu(Menu.buildFromTemplate([{label: 'server', submenu: menuTemplate}]))
})

app.on('ready', () => {
    spawnTray()
    spawnWindow()
})

app.on('window-all-closed', () => { }) // here to prevent app quitting on window closing

function startStop() {
    if (mcServer.status == 'online') mcServer.stop()
    else if (mcServer.status == 'offline') mcServer.start()
}