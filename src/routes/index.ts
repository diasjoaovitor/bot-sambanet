import '../config/alias-config'
import { Router } from 'express'
import {
  getAssociatedProducts,
  getUnregisteredProductsController,
  render
} from '../controllers'

const router = Router()

router.get('/', render)
router.get('/associados', getAssociatedProducts)
router.get('/pendentes', getUnregisteredProductsController)

export default router
