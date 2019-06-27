window.addEventListener('load', () => {
    fetch('status').then(async (res) => {
        document.getElementById('server-status').innerHTML = await res.text()
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

    var socket = io()
    socket.on('statusChange', (status) => {
        document.getElementById('server-status').innerHTML = status
    })
})