import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${params.slug}`);
    
    if (!response.ok) {
      throw error(404, 'Product not found');
    }

    const product = await response.json();
    return { product };
  } catch (err) {
    throw error(404, 'Product not found');
  }
};