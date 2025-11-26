import { redirect, type Handle } from '@sveltejs/kit';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

interface User {
  id: number;
  email: string;
  role: number;
}

interface AuthResponse {
  valid: boolean;
  user?: User;
  message?: string;
}

export const handle: Handle = async ({ event, resolve }) => {
  // Get token from cookies
  const token = event.cookies.get('token');

  // Initialize auth state
  let user: User | null = null;
  let isAuthenticated = false;

  

  // If token exists, verify it
  if (token) {
    try {
      // Verify the token directly without making an HTTP request
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

  // Set user data in locals for use in pages and endpoints
  event.locals.user = user;
  event.locals.isAuthenticated = isAuthenticated;

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
async function verifyTokenDirectly(token: string): Promise<AuthResponse> {
  try {
    // Import jwt for token verification
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as User;
    
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