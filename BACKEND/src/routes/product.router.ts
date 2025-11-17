import { Router } from 'express';
import type { Request, Response } from 'express';
import { ProductService, CategoryService } from '../services/index.ts';
import type { CreateProductRequest, InterfaceBarrelLengthPricing, UpdateProductData } from '../types/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {

    try {
        const { categorySlug, search } = req.query;

        const products = await ProductService.getAll({
            categorySlug: categorySlug as string,
            search: search as string,
        });

        res.json(products);

    } catch (error) {
        console.error('Error Fetching Products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
});

router.get('/:slug', async (req: Request, res: Response) => {

    try {

        const product = await ProductService.getBySlug(req.params.slug as string);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let barrelPricing: any = [];

        if (product.hasBarrelLength) {
            barrelPricing = await ProductService.getBarrelLengthPricing(product.productId as number);
        }

        res.json({ ...product, barrelLengthPricing: barrelPricing });

    } catch (error) {
        console.error('Error Fetching Product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

});

router.post('/', async (req: Request, res: Response) => {

    try {

        const requestData: CreateProductRequest = req.body;

        const {
            categorySlug,
            name,
            slug,
            description,
            shortDescription,
            basePrice,
            stockQuantity,
            isActive,
            hasColorFinish,
            hasEngraving,
            hasBarrelMaterialType,
            hasBarrelLength,
            images,
            barrelLengthPricing: pricingTiers,
        } = requestData;

        
        if (!categorySlug || !name || basePrice === undefined) {
            return res.status(400).json({ message: 'Required Fields Missing' });
        }

        const category = await CategoryService.findBySlug(categorySlug);
        if (!category) {
            return res.status(400).json({ message: 'Invalid Category Slug' });
        }
        
        const newProduct = await ProductService.createProduct({
            categoryId: category.id,
            name: name,
            slug: slug,
            description: description,
            shortDescription: shortDescription,
            basePrice: basePrice,
            stockQuantity: stockQuantity,
            isActive: isActive,
            hasColorFinish: hasColorFinish ?? true,
            hasEngraving: hasEngraving ?? true,
            hasBarrelMaterialType: hasBarrelMaterialType ?? false,
            hasBarrelLength: hasBarrelLength ?? false,
            images: images || [],
        })

        if (pricingTiers && Array.isArray(pricingTiers) && pricingTiers.length > 0) {
            if(!newProduct) {
                throw new Error('Newly created product is missing an ID.');
            }
            const barrelPricingData: InterfaceBarrelLengthPricing[] = pricingTiers.map(tier => ({
                productId: newProduct.id,
                minLengthMm: tier.minLengthMm,
                maxLengthMm: tier.maxLengthMm,
                price: tier.price.toString(),
                isAvailable: tier.isAvailable ?? true,
            }));
            await ProductService.createBarrelPricing(barrelPricingData);
        }
        res.status(201).json(newProduct);
    } catch (error: any) {
        console.error('Error Creating Product:', error);
        if (error.message === "23505") {
            res.status(409).json({ message: 'Product Slug Already Exists' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

})

    router.patch('/:id', async (req: Request, res: Response) => {
        try {

            if(!req.params.id) {
                return res.status(400).json({ message: 'Product ID is required' });
            }

            const updated = await ProductService.updateProduct(parseInt(req.params.id), req.body as UpdateProductData);

            if(!updated) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(updated);


        } catch (error) {
            console.error('Error Updating Product:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    })

export default router;
