import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {

    if(locals.isAuthenticated) {
        console.log('User is authenticated:', locals.user);
    }

    if(!locals.isAuthenticated) {
        console.log('User is not authenticated');
    }

    if(locals.user?.role === 0) {
        console.log('User info:', locals.user);
    }

    return {
        user: locals.user,
        isAuthenticated: locals.isAuthenticated
    }
}