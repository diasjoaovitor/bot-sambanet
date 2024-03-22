const socket = io()
const ul = document.querySelector('ul')

const iniciar = document.getElementById('iniciar')
const limpar = document.getElementById('limpar')
const resetar = document.getElementById('resetar')

const notas = document.querySelector('input').value

const render = (msg) => {
  const [texto, link] = msg.split('[')
  const li = document.createElement('li')
  li.innerHTML = !link
    ? texto
    : `<a href="${link.replace(']', '')}" target="_blank">${texto}</a>`
  ul.appendChild(li)
  const main = document.querySelector('main')
  main.scrollTop = ul.clientHeight
}

iniciar.onclick = () => {
  iniciar.setAttribute('disabled', true)
  console.log(iniciar)
  resetar.setAttribute('disabled', true)
  socket.emit('script', !notas ? 'Iniciar' : notas)
}

limpar.onclick = () => {
  ul.innerHTML = ''
}

resetar.onclick = () => {
  iniciar.setAttribute('disabled', true)
  resetar.setAttribute('disabled', true)
  socket.emit('script', 'Resetar')
}

socket.on('log', (msg) => {
  render(msg)
  if (msg === 'Execução finalizada!' || msg === 'Não foi possível finalizar!') {
    iniciar.removeAttribute('disabled', true)
    resetar.removeAttribute('disabled', true)
  }
})
