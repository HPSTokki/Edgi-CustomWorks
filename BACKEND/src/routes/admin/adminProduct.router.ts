import express from 'express';
import type { Request, Response } from 'express';
import { AdminProductService } from '../../services/admin/adminProduct.service.ts';
import type { ProductData, ProductFilters } from '../../services/admin/product.services.ts';

const router = express.Router();
const productService = new AdminProductService();

// Helper function to safely parse query parameters
const parseQueryParam = <T>(
  value: any,
  parser: (val: any) => T,
  defaultValue?: T
): T | undefined => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  try {
    return parser(value);
  } catch {
    return defaultValue;
  }
};

// Helper function to parse boolean query parameters
const parseBooleanQueryParam = (value: any): boolean | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
};

// Get all products with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      search,
      isActive,
      hasColorFinish,
      hasEngraving,
      hasBarrelMaterialType,
      hasBarrelLength,
      minPrice,
      maxPrice,
      page,
      limit
    } = req.query;

    // Build filters object with proper typing
    const filters: ProductFilters = {};

    // Set each filter only if it has a value
    if (categoryId !== undefined && categoryId !== '') {
      filters.categoryId = parseQueryParam(categoryId, Number);
    }

    if (search !== undefined && search !== '') {
      filters.search = search as string;
    }

    if (isActive !== undefined && isActive !== '') {
      filters.isActive = parseBooleanQueryParam(isActive);
    }

    if (hasColorFinish !== undefined && hasColorFinish !== '') {
      filters.hasColorFinish = parseBooleanQueryParam(hasColorFinish);
    }

    if (hasEngraving !== undefined && hasEngraving !== '') {
      filters.hasEngraving = parseBooleanQueryParam(hasEngraving);
    }

    if (hasBarrelMaterialType !== undefined && hasBarrelMaterialType !== '') {
      filters.hasBarrelMaterialType = parseBooleanQueryParam(hasBarrelMaterialType);
    }

    if (hasBarrelLength !== undefined && hasBarrelLength !== '') {
      filters.hasBarrelLength = parseBooleanQueryParam(hasBarrelLength);
    }

    if (minPrice !== undefined && minPrice !== '') {
      filters.minPrice = parseQueryParam(minPrice, Number);
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      filters.maxPrice = parseQueryParam(maxPrice, Number);
    }

    // Always set page and limit with defaults
    filters.page = parseQueryParam(page, Number, 1);
    filters.limit = parseQueryParam(limit, Number, 20);

    const products = await productService.getAllProducts(filters);
    
    // Get total count for pagination (remove page/limit for count query)
    const countFilters: ProductFilters = { ...filters };
    delete countFilters.page;
    delete countFilters.limit;
    
    const totalProducts = await productService.getAllProducts(countFilters);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: totalProducts.length,
        totalPages: Math.ceil(totalProducts.length / (filters.limit || 20))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await productService.getProductById(parseInt(id));
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(404).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// Get product by slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug is required'
      });
    }

    const product = await productService.getProductBySlug(slug);
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(404).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// Create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const productData: ProductData = req.body;

    // Basic validation
    if (!productData.categoryId || !productData.name || !productData.slug) {
      return res.status(400).json({
        success: false,
        message: 'Category ID, name, and slug are required'
      });
    }

    const product = await productService.createProduct(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('already exists')) {
      res.status(409).json({
        success: false,
        message: errorMessage
      });
    } else {
      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: Partial<ProductData> = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await productService.updateProduct(parseInt(id), updateData);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('already exists')) {
      res.status(409).json({
        success: false,
        message: errorMessage
      });
    } else if (errorMessage.includes('not found')) {
      res.status(404).json({
        success: false,
        message: errorMessage
      });
    } else {
      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }
});

// Update product stock
router.patch('/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity === undefined || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const product = await productService.updateProductStock(parseInt(id), Number(quantity));
    
    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// Toggle product status (active/inactive)
router.patch('/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await productService.toggleProductStatus(parseInt(id));
    
    res.json({
      success: true,
      message: 'Product status toggled successfully',
      data: product
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const deleted = await productService.deleteProduct(parseInt(id));
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Get product statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const stats = await productService.getProductStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics'
    });
  }
});

// Bulk update products
router.patch('/bulk/update', async (req: Request, res: Response) => {
  try {
    const { ids, data } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    const updatedCount = await productService.bulkUpdateProducts(ids, data);
    
    res.json({
      success: true,
      message: `${updatedCount} products updated successfully`
    });
  } catch (error) {
    console.error('Error bulk updating products:', error);
    res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// Search products
router.get('/search/quick', async (req: Request, res: Response) => {
  try {
    const { q, limit = '10' } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchLimit = parseQueryParam(limit, Number, 10);
    const products = await productService.searchProducts(q.trim(), searchLimit);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

export default router;