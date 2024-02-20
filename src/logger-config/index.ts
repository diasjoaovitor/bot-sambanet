import { createLogger, format, transports } from 'winston'
import { TRelatorio } from '../types'

const { combine, errors, json, timestamp } = format 

function log(filename: string) {
  return createLogger({
    level: 'info',
    format: combine(
      errors({ stack: true }),
      timestamp(),
      json()
    ),
    transports: [
      new transports.File({ filename })
    ]
  })
 } 

export const logger = log('app.log')

export const naoCadastradosLogger = log('nao-cadastrados.log')

export const associadosLogger = log('associados.log')

export function print(mensagem: string) {
  console.log(`\n> ${mensagem}`)
  logger.info(mensagem)
}

export function printRelatorio(relatorio: TRelatorio) {
  relatorio.filter(({ produtos }) => produtos.length > 0).forEach(({ nf, produtos }) => {
    console.log(`\n  > ${nf}`)
    produtos.forEach(produto => {
      console.log(`\n    > ${produto}`)
    })
  })
}
