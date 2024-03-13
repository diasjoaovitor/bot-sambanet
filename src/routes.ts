import './config/alias-config'
import { Router } from 'express'
import { obterProdutosAssociados } from './controllers'

const router = Router()

router.get('/', obterProdutosAssociados)

export default router
