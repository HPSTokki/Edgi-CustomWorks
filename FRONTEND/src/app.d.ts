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
				id: number | string;
				email: string;
				role: number | string;
			} | null;
			isAuthenticated: boolean;
		}
		
		interface PageData {
			products?: ProductData[];
			loginData?: LoginData;
			signupData?: SignupData;
			user?: {
				id: number | string;
				email: string;
				role: number | string;
			} | null;
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
		}

		interface SignupData {
			id?: number | string;
			email: string;
			password: string;
			role: 0 | 1;
		}

	}
}
	
export {};
