import { Router } from 'express';
import type { Request, Response } from 'express';
import { CategoryService } from '../services/index.ts';

const router = Router();

router.get('/', async (req: Request, res: Response) => {

    try {
        const allCategories = await CategoryService.getAll();
        console.log('Fetched categories:', allCategories);
        res.json(allCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal Server Error'});
    }

});

router.post('/', async (req: Request, res: Response) => {

    try {
        const { name,  slug } = req.body;
        const newCategory = await CategoryService.create({ name, slug });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Internal Server Error'});
    }

})

export default router;

