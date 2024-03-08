import { createLogger, format, transports } from 'winston'

const { combine, errors, json, timestamp } = format

export function log(filename: string) {
  return createLogger({
    level: 'info',
    format: combine(errors({ stack: true }), timestamp(), json()),
    transports: [new transports.File({ filename })]
  })
}

export const logger = log('app.log')

export const naoCadastradosLogger = log('nao-cadastrados.log')

export const associadosLogger = log('associados.log')
