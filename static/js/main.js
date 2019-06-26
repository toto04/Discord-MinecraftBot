window.addEventListener('load', () => {
    document.getElementById('start').addEventListener('click', async () => {
        var started = await fetch('/start', {
            method: 'post'
        })
        console.log(await started.json())
    })

    document.getElementById('stop').addEventListener('click', async () => {
        var stopped = await fetch('/stop', {
            method: 'post'
        })
        console.log(await stopped.text())
    })
})

window.addEventListener('resize', () => {
    
})