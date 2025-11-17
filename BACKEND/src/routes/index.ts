import { Router } from 'express';
import categoryRouter from './category.router.ts';
import productRouter from './product.router.ts';
import authRouter from './auth.router.ts'

const router = Router();

router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/auth', authRouter);

export default router;