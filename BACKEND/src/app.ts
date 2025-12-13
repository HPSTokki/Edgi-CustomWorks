import express from "express";
import 'dotenv/config';
import morgan from "morgan";
import routes from "./routes/index.ts";
import cors from "cors";
import { authenticateToken as authMiddleware } from "./middleware/authMiddleware.ts";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'], // Your SvelteKit dev and build URLs
  credentials: true, // This is crucial for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// Add this before your static file serving
app.get('/debug-image', (req, res) => {
    const imagePath = path.join(__dirname, 'src/products/suppressors/gated_suppressor.jpg');
    const exists = require('fs').existsSync(imagePath);
    
    res.json({
        imagePath,
        exists,
        folderContents: exists ? require('fs').readdirSync(path.dirname(imagePath)) : 'Folder not found'
    });
});

app.use('/products', express.static(path.join(__dirname, './src/products')));
app.use("/api", routes);
app.get('/hello', (req, res) => {
    res.send('Hello, World!');
});
app.get('/debug-paths', (req, res) => {
    const possiblePaths = [
        path.join(__dirname, 'products'),
        path.join(__dirname, '../products'),
        path.join(__dirname, '../../products'),
        path.join(__dirname, 'src/products'),
        path.join(__dirname, '../src/products'),
    ];
    
    const pathInfo = possiblePaths.map(p => ({
        path: p,
        exists: fs.existsSync(p),
        files: fs.existsSync(p) ? fs.readdirSync(p) : []
    }));
    
    res.json({
        __dirname,
        currentFile: __filename,
        paths: pathInfo
    });
});

export default app;