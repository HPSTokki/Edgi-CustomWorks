import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {

    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();

    return {
        products
    }

}