import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate required fields
        if (!email || !password) {
            return fail(400, {
                success: false,
                message: 'Email and password are required',
                email: email as string
            });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return fail(400, {
                success: false,
                message: 'Passwords do not match',
                email: email as string
            });
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                const signupData = await response.json();
                console.log('Signup successful:', signupData);
                throw redirect(303, '/user');
            } else {
                const errorData = await response.json().catch(() => ({}));
                return fail(response.status, {
                    success: false,
                    message: errorData.message || 'Signup failed',
                    email: email as string
                });
            }
        } catch (error) {
            // Check if it's a redirect by checking for the status and location properties
            if (typeof error === 'object' && error !== null && 'status' in error && 'location' in error) {
                throw error;
            }
            
            console.error('Signup error:', error);
            return fail(500, {
                success: false,
                message: error instanceof Error ? error.message : 'An unknown error occurred',
                email: email as string
            });
        }
    }
};