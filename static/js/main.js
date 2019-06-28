window.addEventListener('load', () => {
    fetch('status').then(async (res) => {
        updateStatus(await res.text())
        clearPres()
    })

    document.getElementById('start').addEventListener('click', async () => {
        var started = await fetch('/start', {
            method: 'post'
        })
        console.log(await started.text())
    })

    document.getElementById('stop').addEventListener('click', async () => {
        var stopped = await fetch('/stop', {
            method: 'post'
        })
        console.log(await stopped.text())
    })

    socket = io()
    socket.on('statusChange', (status) => {
        updateStatus(status)
    })
    socket.on('console', (txt) => {
        let cons = document.getElementById('console')
        cons.innerHTML += txt
        cons.scrollTo(0, cons.scrollHeight)
    })
    socket.on('chat', (player, text) => {
        let chat = document.getElementById('chat')
        chat.innerHTML += player + ': ' + text + '\n'
        chat.scrollTo(0, chat.scrollHeight)
    })
    socket.on('listUpdate', () => {
        updateList()
    })
})

function updateStatus(status) {
    start = document.getElementById('start')
    stop = document.getElementById('stop')
    reboot = document.getElementById('reboot')
    start.style.display = 'none'
    stop.style.display = 'none'
    reboot.style.display = 'none'

    document.getElementById('server-status').innerHTML = status
    if (status == 'online') {
        stop.style.display = 'block'
        reboot.style.display = 'block'
        updateList()
    } else {
        document.querySelectorAll('#on-num>span')[1].innerHTML = 'offline'
        document.querySelector('.list>ul').innerHTML = ''
        if (status == 'offline') {
            start.style.display = 'block'
        } else if (status == 'booting') {
            clearPres()
        }
    }
}

function clearPres() {
    let date = new Date(Date.now()).toGMTString()
    for (box of document.getElementsByClassName('box-pre')) {
        box.innerHTML = '<span class="att">Console attached: ' + date + '</span>\r'
    }
}

function updateList() {
    fetch('/list').then(async res => {
        let ls = await res.json()
        document.querySelectorAll('#on-num>span')[1].innerHTML = ls.len + '/' + ls.max
        document.querySelector('.list>ul').innerHTML = ''
        for (const player of ls.players) {
            document.querySelector('.list>ul').innerHTML += player
        }
    })
}