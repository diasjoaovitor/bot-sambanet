const socket = io()
const ul = document.querySelector('ul')

const start = document.getElementById('start')
const clear = document.getElementById('clear')
const reset = document.getElementById('reset')

const notes = document.querySelector('input')

const disableButtons = () => {
  !start.hasAttribute('disabled') && start.setAttribute('disabled', true)
  !reset.hasAttribute('disabled') && reset.setAttribute('disabled', true)
}

const removeDisable = () => {
  start.removeAttribute('disabled')
  reset.removeAttribute('disabled')
}

const render = (msg) => {
  const [text, link] = msg.split('[')
  const li = document.createElement('li')
  li.innerHTML = !link
    ? text
    : `<a href="${link.replace(']', '')}" target="_blank">${text}</a>`
  ul.appendChild(li)
  const main = document.querySelector('main')
  main.scrollTop = ul.clientHeight
}

start.onclick = () => {
  disableButtons()
  socket.emit('script', !notes.value ? 'start' : notes.value)
}

clear.onclick = () => {
  ul.innerHTML = ''
}

reset.onclick = () => {
  disableButtons()
  socket.emit('script', 'reset')
}

socket.on('log', (msg) => {
  disableButtons()
  render(msg)
  if (
    msg === 'Execução finalizada!' ||
    msg === 'Error: Não foi possível finalizar!'
  ) {
    removeDisable()
  }
})
