import '../config/alias-config'
import { Router } from 'express'
import {
  associatedProducts,
  getAssociatedProducts,
  getUnregisteredProductsController,
  home,
  pending
} from '../controllers'

const router = Router()

router.get('/', home)
router.get('/associated-products', associatedProducts)
router.get('/pending', pending)

router.get('/products/associated', getAssociatedProducts)
router.get('/products/pending', getUnregisteredProductsController)

export default router
