import { createLogger, format, transports } from 'winston'

const { combine, errors, json, timestamp } = format 

export const logger = createLogger({
  level: 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app.log'})
  ]
})

export const naoCadastradosLogger = createLogger({
  level: 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'nao-cadastrados.log'})
  ]
})

export const associadosLogger = createLogger({
  level: 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'associados.log'})
  ]
})
