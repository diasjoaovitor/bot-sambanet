import express from 'express'
import cors from 'cors'
import { join } from 'path'
import { Server } from 'socket.io'
import { createServer } from 'http'
import router from '@/routes'

const app = express()

app.set('views', join(__dirname, '..', 'views'))
app.set('view engine', 'pug')

const env = process.env.NODE_ENV
const basePath = env === 'production' ? '../public' : 'public'

app.use(express.static(join(__dirname, '..', '..', basePath)))
app.use(express.json())
app.use(cors())
app.use(router)

export const server = createServer(app)
export const io = new Server(server)
