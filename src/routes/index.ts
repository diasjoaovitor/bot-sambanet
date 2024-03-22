import '../config/alias-config'
import { Router } from 'express'
import { obterProdutosAssociados, render } from '../controllers'

const router = Router()

router.get('/', render)
router.get('/associados', obterProdutosAssociados)

export default router
