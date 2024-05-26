import express from 'express'
import cors from 'cors'
import { join } from 'path'
import { Server } from 'socket.io'
import { createServer } from 'http'
import router from '@/routes'

const app = express()

app.set('views', join(__dirname, '..', 'views'))
app.set('view engine', 'pug')

app.use(express.static(join(__dirname, '..', '..', 'public')))
app.use(express.json())
app.use(cors())
app.use(router)

export const server = createServer(app)
export const io = new Server(server)
