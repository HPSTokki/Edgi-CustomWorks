// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  const token = cookies.get('token');
  console.log('Token found in layout.server.ts:', token ? 'yes' : 'no');

  if (token) {
    try {
      console.log('Fetching user data from API...');
      const userResponse = await fetch('http://localhost:3000/api/auth/token-verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API response status:', userResponse.status);

      if (userResponse.ok) {
        const user = await userResponse.json();
        console.log('User data:', user);
        return { user };
      } else {
        console.log('API response not OK, clearing token');
        cookies.delete('token', { path: '/' });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      cookies.delete('token', { path: '/' });
    }
  }

  return { user: null };
};