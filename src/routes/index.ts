import '../config/alias-config'
import { Router } from 'express'
import { associatedProducts, home, pending } from '../controllers'

const router = Router()

router.get('/', home)
router.get('/associated-products', associatedProducts)
router.get('/pending', pending)

export default router
