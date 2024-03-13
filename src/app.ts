import express from 'express'
import cors from 'cors'
import { bot } from './bot'
import router from './routes'
import { dbConnection } from './config'
import { print } from './utils'

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())
app.use(router)

app.listen(port, async () => {
  print('Acesse: http://localhost:5000')
  print('Conectando ao banco de dados...')
  await dbConnection()
  await bot()
})
