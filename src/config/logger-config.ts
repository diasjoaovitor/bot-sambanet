import { createLogger, format, transports } from 'winston'

const { combine, errors, json, timestamp, prettyPrint } = format

export const logger = createLogger({
  level: 'info',
  format: combine(errors({ stack: true }), timestamp(), json(), prettyPrint()),
  transports: [new transports.File({ filename: 'app.log' })]
})
