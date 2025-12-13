import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response } from 'express';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { categoryName, productName } = req.body;
    
    // Create directory structure: uploads/category/product/
    const uploadDir = path.join(
      process.cwd(), 
      'uploads', 
      categoryName?.toLowerCase() || 'uncategorized',
      productName?.toLowerCase() || 'product'
    );
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload endpoint
router.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { categoryName, productName } = req.body;
    
    // Generate URL based on your structure
    const fileName = path.basename(req.file.path);
    const imageUrl = `http://localhost:3000/products/${categoryName}/${fileName}`.toLowerCase();
    
    // If you want full URL:
    const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
    res.json({
      message: 'File uploaded successfully',
      url: imageUrl, // or fullImageUrl
      path: req.file.path,
      filename: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Serve uploaded files
router.get('/products/:category/:filename', (req: Request, res: Response) => {
  try {
    const { category, filename } = req.params as { category: string; filename: string };
    
    const filePath = path.join(
      process.cwd(),
      'uploads',
      category,
      filename
    );
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;