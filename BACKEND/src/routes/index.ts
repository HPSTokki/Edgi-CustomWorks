import { Router } from 'express';
import categoryRouter from './category.router.ts';
import productRouter from './product.router.ts';
import authRouter from './auth.router.ts'
import cartRouter from './cart.router.ts';
import orderRouter from './order.routes.ts';

const router = Router();

router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/auth', authRouter);
router.use('/cartSessions', cartRouter);
router.use('/orderRouting', orderRouter);

export default router;