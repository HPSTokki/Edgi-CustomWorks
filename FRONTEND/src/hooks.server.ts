import { redirect, type Handle } from '@sveltejs/kit';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

export const handle: Handle = async ({ event, resolve }) => {
  // Get token from cookies
  const token = event.cookies.get('token');
  
  // Get session ID from cookies or generate new one
  let sessionId = event.cookies.get('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    event.cookies.set('sessionId', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 // 1 minute
    });
  }

  // Initialize auth state
  let user: App.Locals['user'] = null;
  let isAuthenticated = false;

  // If token exists, verify it
  if (token) {
    try {
      const authResponse = await verifyTokenDirectly(token);
      
      if (authResponse.valid && authResponse.user) {
        user = authResponse.user;
        isAuthenticated = true;
      } else {
        // Token is invalid, clear it
        event.cookies.delete('token', { path: '/' });
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      event.cookies.delete('token', { path: '/' });
    }
  }

  // Set user data and session in locals for use in pages and endpoints
  event.locals.user = user;
  event.locals.isAuthenticated = isAuthenticated;
  event.locals.sessionId = sessionId;

  // Handle route protection
  if (event.url.pathname.startsWith('/protected') && !isAuthenticated) {
    throw redirect(302, '/');
  }

  if (event.url.pathname.startsWith('/admin') && (!isAuthenticated || user?.role !== 1)) {
    throw redirect(302, '/unauthorized');
  }
  

  const response = await resolve(event);
  return response;
};

// Direct token verification without HTTP request
async function verifyTokenDirectly(token: string): Promise<{ valid: boolean; user?: App.Locals['user']; message?: string }> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as App.Locals['user'];
    
    return {
      valid: true,
      user: decoded
    };
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return { valid: false, message: 'Token expired' };
    }
    
    return { valid: false, message: 'Invalid token' };
  }
}