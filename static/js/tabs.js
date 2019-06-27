var buttons = document.querySelectorAll('.tabs>button')
var pres = document.getElementsByClassName('box-pre')
buttons[0].addEventListener('click', showChat)
buttons[1].addEventListener('click', showConsole)

showChat()

function showChat() {
    buttons[0].className = 'active'
    buttons[1].className = ''
    pres[0].style.display = 'block'
    pres[1].style.display = 'none'
}

function showConsole() {
    buttons[0].className = ''
    buttons[1].className = 'active'
    pres[0].style.display = 'none'
    pres[1].style.display = 'block'
}