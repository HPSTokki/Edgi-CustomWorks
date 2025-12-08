// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		

		
		interface Locals {
			user: {
				id: number;
				email: string;
				role: number | string;
			} | null;
			isAuthenticated: boolean;
			sessionId: string
		}

		interface AuthResponse {
		valid: boolean;
		user: {
			id: number | string;
			email: string;
			role: number | string;
			// Add other user fields if needed
			} | null;
		message: string;
		}
		
		interface PageData {
			products?: ProductData[];
			loginData?: LoginData;
			signupData?: SignupData;
			user?: AuthResponse | null;
			sessionId?: string;
		}

		interface ProductData {
			productId: number | string;
			categoryId: number | string;
			categoryName: string;
			categorySlug: string;
			name: string;
			slug: string;
			description: string;
			shortDescription: string;
			basePrice: number;
			stockQuantity: number;
			isActive: boolean;
			hasColorFinish?: boolean;
			hasEngraving?: boolean;
			hasBarrelMaterialType?: boolean;
			hasBarrelLength?: boolean;
			images: string[];
			createdAt: Date;
			updatedAt: Date;
		}

		interface LoginData {
			id: number | string;
			email: string;
			password: string;
			role: 0 | 1;
			token: string;
			sessionId?: string;
		}

		interface SignupData {
			id?: number | string;
			email: string;
			password: string;
			role: 0 | 1;
		}

		interface CartItem {
		id: number;
		quantity: number;
		customizations: any;
		productId: number;
		productName: string;
		productSlug: string;
		categorySlug: string;
		basePrice: number;
		images: string[] | null;
		unitPrice: number;
		itemTotal: number;
		}

		interface CartData {
		cartId?: number;
		items: CartItem[];
		subtotal: number;
		}

	}
}
	
export {};
