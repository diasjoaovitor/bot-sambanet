/* eslint no-undef: "off" */

const socket = io()
const ul = document.querySelector('ul')

const start = document.getElementById('start')
const clear = document.getElementById('clear')
const reset = document.getElementById('reset')

const notes = document.querySelector('input')

const getStorage = () => JSON.parse(localStorage.getItem('bot_sambanet')) || []

const setStorage = (data) => {
  localStorage.setItem('bot_sambanet', JSON.stringify(data))
}

let logs = getStorage()

const clearAll = () => {
  setStorage([])
  logs = []
  ul.innerHTML = '<li>Painel de logs</li>'
}

const disableButtons = () => {
  !start.hasAttribute('disabled') && start.setAttribute('disabled', true)
  !reset.hasAttribute('disabled') && reset.setAttribute('disabled', true)
}

const removeDisable = () => {
  start.removeAttribute('disabled')
  reset.removeAttribute('disabled')
}

const render = (msg) => {
  if (!msg) return
  const [text, link] = msg.split('[')
  const li = document.createElement('li')
  li.innerHTML = !link
    ? text
    : `<a href="${link.replace(']', '')}" target="_blank">${text}</a>`
  ul.appendChild(li)
  ul.scrollTop = ul.clientHeight
}

start.onclick = () => {
  clearAll()
  ul.innerHTML = ''
  disableButtons()
  socket.emit('script', !notes.value ? 'start' : notes.value)
}

clear.onclick = () => {
  clearAll()
}

reset.onclick = () => {
  clearAll()
  disableButtons()
  socket.emit('script', 'reset')
}

logs.forEach((log) => {
  render(log)
})

socket.on('log', (msg) => {
  disableButtons()
  logs.push(msg)
  setStorage(logs)
  render(msg)
  if (
    msg === 'Execução finalizada!' ||
    msg === 'Algo deu Errado! Não foi possível finalizar'
  ) {
    removeDisable()
  }
})
