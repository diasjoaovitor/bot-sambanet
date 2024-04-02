import { bot } from './bot'
import { dbConnection, io, server } from './config'
import { print } from './utils'

const port = process.env.PORT || 3000

io.on('connection', (socket) => {
  socket.on('script', async (msg) => {
    await bot({ option: msg })
  })
})

server.listen(port, async () => {
  print('Conectando ao banco de dados...')
  await dbConnection()
  print('Conectado!')
  print(`Acesse: http://localhost:${port}`)
})
