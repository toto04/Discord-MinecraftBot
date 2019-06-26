window.addEventListener('load', () => {
    document.getElementById('start').addEventListener('click', async () => {
        var started = await fetch('/start', {
            method: 'post'
        })
        console.log(await started.json())
    })
})

window.addEventListener('resize', () => {
    
})