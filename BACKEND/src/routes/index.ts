import { Router } from 'express';
import categoryRouter from './category.router.ts';
import productRouter from './product.router.ts';
import authRouter from './auth.router.ts'
import cartRouter from './cart.router.ts';
import orderRouter from './order.routes.ts';
import productAdminRouter from './admin/product.router.ts';
import productServiceAdminRouter from './admin/adminProduct.router.ts';
import uploadRouter from '../services/upload.ts';

const router = Router();

router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/auth', authRouter);
router.use('/cartSessions', cartRouter);
router.use('/orderRouting', orderRouter);
router.use('/admin/orders', productAdminRouter);
router.use('/admin/products', productAdminRouter);
router.use('/admin/productsService', productServiceAdminRouter);
router.use('/upload', uploadRouter);

export default router;