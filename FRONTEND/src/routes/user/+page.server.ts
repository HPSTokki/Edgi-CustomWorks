import { redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }
    
    try {
      // Get guest session ID from localStorage (passed via form)
      const guestSessionId = formData.get('guestSessionId')?.toString();
      
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.toString(),
          password: password.toString(),
          guestSessionId: guestSessionId || undefined
        })
      });
      
      if (response.ok) {
        const loginData = await response.json();
        
        if (loginData.token) {
          cookies.set('token', loginData.token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 // 1 minute
          });
        }

        // Return the login data including sessionId to the client
        return {
          success: true,
          loginData: {
            ...loginData,
            // This will be available in the form data for the client to use
          }
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
};