import { Router } from 'express';
import { AuthService } from '../services/index.ts';
import type { Request, Response } from 'express';
import type { AccountSignUpData } from '../types/types.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const router = Router();
const jwtSecret = process.env.JWT_SECRET


router.post('/signup', async (req: Request, res: Response) => {

    try {
        const accountData: AccountSignUpData = req.body;

        const newAccount = await AuthService.signUp(accountData);

        if (newAccount) {
            res.status(201).json(newAccount);
        } else {
            res.status(400).json({ message: 'Account creation failed' });
        }
    } catch (error: any) {
        console.error('Error during sign up:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }

})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const result = await AuthService.logIn({
      email,
      password,
      role,
    })

    if (!result.loginData) {
      return res.status(401).json({ message: 'Invalid Email or Password'})
    }

    const { password: _, ...userWithoutPassword } = result.loginData;

    res.cookie('token', result.token, {
      httpOnly: true,
      maxAge: 60 * 1000, // 1 minute
      secure: process.env.NODE_ENV === 'production', // Add this
      sameSite: 'lax', // Add this
      path: '/', // Add this
    })

    res.json({
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      token: result.token,
      expiresIn: '1min'
    })
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
})

router.post('/token-verify', async (req: Request, res: Response) => {

    const token = req.cookies?.token || 
                  req.headers['authorization']?.replace('Bearer ', '') || 
                  req.body?.token;

                  console.log("Received token for verification:", token);
                  console.log("Request headers:", req.headers['authorization']);
                  console.log("Request cookies:", req.cookies);
                  console.log("Request body:", req.body);


    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decode = jwt.verify(token, jwtSecret as string);
        console.log("Token successfully verified:", decode);
        res.json({
            valid: true,
            user: decode,
            message: 'Token is valid'
        })
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }

})

router.post('/protected-route', async (req: Request, res: Response) => {

    const token = req.cookies?.token || req.headers['authorization']?.replace('Bearer ', '') || req.body?.token;

    if(!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {

        const decoded = jwt.verify(token, jwtSecret as string) as { id: number; role: number; email: string; };

        res.json({
            message: 'Access granted to protected route',
            user: {
                id: decoded.id,
                role: decoded.role,
                email: decoded.email,
            }
        })

    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }

})

router.post('/admin-only', async (req: Request, res: Response) => {

    const token = req.cookies?.token || req.headers['authorization']?.replace('Bearer ', '') || req.body?.token;

    if(!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {

        const decoded = jwt.verify(token, jwtSecret as string) as { id: number; role: number; email?: string; };

        if (decoded.role !== 1) {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        res.json({
            message: 'Access granted to admin route',
            user: {
                id: decoded.id,
                role: decoded.role,
                email: decoded.email
            }
        })

    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }

})


export default router;