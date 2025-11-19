// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface PageData {
			products: ProductData[];
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

	}
}
	
export {};
