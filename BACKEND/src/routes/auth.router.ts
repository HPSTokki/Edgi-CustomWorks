import { Router } from 'express';
import { AuthService } from '../services/index.ts';
import type { Request, Response } from 'express';
import type { AccountSignUpData } from '../types/types.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { CartService } from '../services/cart.services.ts';
import { SessionService } from '../services/session.service.ts';

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

router.post('/login', async (req, res) => {
  try {
    const { email, password, role, guestSessionId } = req.body;

    const result = await AuthService.logIn({
      email,
      password,
      role,
    });

    if (!result.loginData) {
      return res.status(401).json({ message: 'Invalid Email or Password'});
    }

    const { password: _, ...userWithoutPassword } = result.loginData;

    // Handle cart session conversion if guestSessionId is provided
    if (guestSessionId) {
      try {
        const cartService = new CartService();
        await cartService.convertGuestToUserCart(guestSessionId, result.loginData.id);
      } catch (cartError) {
        console.error('Cart conversion failed:', cartError);
        // Don't fail login if cart conversion fails
      }
    }

    // Generate a new session ID for the authenticated user
    const userSessionId = SessionService.generateSessionId();

    res.cookie('token', result.token, {
      httpOnly: true,
      maxAge: 60, // 1 minute
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Also set a session cookie for cart purposes
    res.cookie('sessionId', userSessionId, {
      httpOnly: true,
      maxAge: 60, // 1 minute
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      token: result.token,
      sessionId: userSessionId, // Make sure this is returned
      expiresIn: '1min'
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

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