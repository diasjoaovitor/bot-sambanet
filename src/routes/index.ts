import '../config/alias-config'
import { Router } from 'express'
import { getAssociatedProducts, render } from '../controllers'

const router = Router()

router.get('/', render)
router.get('/associados', getAssociatedProducts)

export default router
