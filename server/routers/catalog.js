import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/catalog.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router;
