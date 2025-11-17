import type { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

const secretkey = "helloworld";

export interface AuthRequest extends Request {

    user?: {
        id: number;
        role: number;
    }

}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {

    const token = req.cookies?.token || req.headers['authorization']?.replace('Bearer', '') || req.body?.token;

    if(!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, secretkey) as { id: number; role: number; email?: string; };
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    } catch (error) {
        console.error('Invalid Token:', error);
        next();
        
    }

}
