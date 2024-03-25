const socket = io()
const ul = document.querySelector('ul')

const start = document.getElementById('start')
const clear = document.getElementById('clear')
const reset = document.getElementById('reset')

const notes = document.querySelector('input').value

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
  start.setAttribute('disabled', true)
  reset.setAttribute('disabled', true)
  socket.emit('script', !notes ? 'start' : notes)
}

clear.onclick = () => {
  ul.innerHTML = ''
}

reset.onclick = () => {
  start.setAttribute('disabled', true)
  reset.setAttribute('disabled', true)
  socket.emit('script', 'reset')
}

socket.on('log', (msg) => {
  render(msg)
  if (msg === 'Execução finalizada!' || msg === 'Não foi possível finalizar!') {
    start.removeAttribute('disabled', true)
    reset.removeAttribute('disabled', true)
  }
})
