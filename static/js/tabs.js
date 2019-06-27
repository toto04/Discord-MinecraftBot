var buttons = document.querySelectorAll('.tabs>button')
buttons[0].addEventListener('click', showChat)
buttons[1].addEventListener('click', showConsole)

showChat()

function showChat() {
    buttons[0].className = 'active'
    buttons[1].className = ''
}

function showConsole() {
    buttons[0].className = ''
    buttons[1].className = 'active'
}