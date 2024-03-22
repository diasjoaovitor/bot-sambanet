import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import router from '@/routes'
import path from 'path'

const app = express()

app.use(express.static(path.join(__dirname, '..', 'views')))
app.use(express.json())
app.use(cors())
app.use(router)

export const server = createServer(app)
export const io = new Server(server)
