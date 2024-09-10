import { addAlias } from 'module-alias'
import { resolve } from 'path'

const env = process.env.NODE_ENV

const basePath = env === 'production' ? 'dist/src' : 'src'

addAlias('@', resolve(basePath))
