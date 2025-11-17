import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

interface Product {
    categorySlug: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    stockQuantity: number;
    isActive: boolean;
    hasColorFinish: boolean;
    hasEngraving: boolean;
    hasBarrelMaterialType: boolean;
    hasBarrelLength: boolean;
    images: string[];
    minBarrelLength?: number;
    maxBarrelLength?: number;
    barrelLengthPricing?: BarrelLengthPricing[];
}

interface BarrelLengthPricing {
    minLengthMm: number;
    maxLengthMm: number;
    price: number;
}

const products: Product[] = [
    {
        categorySlug: 'barrel',
        name: 'Aluminum Outer Barrel',
        slug: 'aluminum-outer-barrel',
        description: 'Upgrade your airsoft sniper rifle with EDGI’s precision-engineered aluminum outer barrel, designed for strength, weight reduction, and compatibility with high-performance builds. This outer barrel provides a rigid structure for your inner barrel while maintaining a lightweight profile for improved handling.',
        shortDescription: 'Lightweight aluminum outer barrel for airsoft sniper rifles.',
        basePrice: 5400.00,
        stockQuantity: 10,
        isActive: true,
        hasColorFinish: true,
        hasEngraving: true,
        hasBarrelMaterialType: true,
        hasBarrelLength: true,
        images: [
            '../products/barrel/aluminum_outer_barrel.jpg',
        ],
        minBarrelLength: 80,
        maxBarrelLength: 150,
        barrelLengthPricing: [
            { minLengthMm: 85, maxLengthMm: 150, price: 1200.00 },
            { minLengthMm: 151, maxLengthMm: 200, price: 1300.00 },
            { minLengthMm: 201, maxLengthMm: 250, price: 1400.00 },
            { minLengthMm: 251, maxLengthMm: 300, price: 1500.00 },
            { minLengthMm: 301, maxLengthMm: 400, price: 1600.00 },
            { minLengthMm: 401, maxLengthMm: 450, price: 1700.00 },
            { minLengthMm: 451, maxLengthMm: 500, price: 1800.00 },
            { minLengthMm: 501, maxLengthMm: 549, price: 1900.00 },
            { minLengthMm: 550, maxLengthMm: 599, price: 2000.00 },
            { minLengthMm: 600, maxLengthMm: 609, price: 2100.00 },
            { minLengthMm: 610, maxLengthMm: 619, price: 2200.00 },
            { minLengthMm: 620, maxLengthMm: 629, price: 2300.00 },
            { minLengthMm: 630, maxLengthMm: 639, price: 2400.00 },
            { minLengthMm: 640, maxLengthMm: 649, price: 2500.00 },
            { minLengthMm: 650, maxLengthMm: 659, price: 2600.00 },
            { minLengthMm: 660, maxLengthMm: 669, price: 2700.00 },
            { minLengthMm: 670, maxLengthMm: 679, price: 2800.00 },
            { minLengthMm: 680, maxLengthMm: 689, price: 2900.00 },
            { minLengthMm: 690, maxLengthMm: 699, price: 3000.00 },
            { minLengthMm: 700, maxLengthMm: 709, price: 3100.00 },
            { minLengthMm: 710, maxLengthMm: 719, price: 3200.00 },
            { minLengthMm: 720, maxLengthMm: 729, price: 3300.00 },
            { minLengthMm: 730, maxLengthMm: 739, price: 3400.00 },
            { minLengthMm: 740, maxLengthMm: 749, price: 3500.00 },
        ],
    },
    {
        categorySlug: 'barrel',
        name: 'Carbon Outer Barrel and Suppressor',
        slug: 'carbon-outer-barrel-and-suppressor',
        description: 'Upgrade your Tokyo Marui VSR platform with EDGI’s Carbon Fiber Outer Barrel and Suppressor Set, designed for ultra-lightweight performance, rigidity, and stealth. This premium set combines carbon fiber construction with precision machining for superior durability and aesthetics.',
        shortDescription: 'Lightweight carbon fiber outer barrel and suppressor for airsoft sniper rifles.',
        basePrice: 9000.00,
        stockQuantity: 5,
        isActive: true,
        hasColorFinish: true,
        hasEngraving: true,
        hasBarrelMaterialType: true,
        hasBarrelLength: true,
        images: [
            '../products/barrel/carbon_outer_barrel_and_suppressor.png',
        ],
        minBarrelLength: 80,
        maxBarrelLength: 150,
        barrelLengthPricing: [
            { minLengthMm: 85, maxLengthMm: 150, price: 1200.00 },
            { minLengthMm: 151, maxLengthMm: 200, price: 1300.00 },
            { minLengthMm: 201, maxLengthMm: 250, price: 1400.00 },
            { minLengthMm: 251, maxLengthMm: 300, price: 1500.00 },
            { minLengthMm: 301, maxLengthMm: 400, price: 1600.00 },
            { minLengthMm: 401, maxLengthMm: 450, price: 1700.00 },
            { minLengthMm: 451, maxLengthMm: 500, price: 1800.00 },
            { minLengthMm: 501, maxLengthMm: 549, price: 1900.00 },
            { minLengthMm: 550, maxLengthMm: 599, price: 2000.00 },
            { minLengthMm: 600, maxLengthMm: 609, price: 2100.00 },
            { minLengthMm: 610, maxLengthMm: 619, price: 2200.00 },
            { minLengthMm: 620, maxLengthMm: 629, price: 2300.00 },
            { minLengthMm: 630, maxLengthMm: 639, price: 2400.00 },
            { minLengthMm: 640, maxLengthMm: 649, price: 2500.00 },
            { minLengthMm: 650, maxLengthMm: 659, price: 2600.00 },
            { minLengthMm: 660, maxLengthMm: 669, price: 2700.00 },
            { minLengthMm: 670, maxLengthMm: 679, price: 2800.00 },
            { minLengthMm: 680, maxLengthMm: 689, price: 2900.00 },
            { minLengthMm: 690, maxLengthMm: 699, price: 3000.00 },
            { minLengthMm: 700, maxLengthMm: 709, price: 3100.00 },
            { minLengthMm: 710, maxLengthMm: 719, price: 3200.00 },
            { minLengthMm: 720, maxLengthMm: 729, price: 3300.00 },
            { minLengthMm: 730, maxLengthMm: 739, price: 3400.00 },
            { minLengthMm: 740, maxLengthMm: 749, price: 3500.00 },
        ],
    },
    {
        categorySlug: 'barrel',
        name: 'Carbon Outer Barrel',
        slug: 'carbon-outer-barrel',
        description: 'Achieve the perfect balance of strength and weight reduction with EDGI’s carbon fiber outer barrel. Designed for high-performance sniper builds, this barrel combines carbon fiber construction with precision-machined aluminum components for superior rigidity and durability.',
        shortDescription: 'Lightweight carbon fiber outer barrel for airsoft sniper rifles.',
        basePrice: 5900.00,
        stockQuantity: 8,
        isActive: true,
        hasColorFinish: true,
        hasEngraving: true,
        hasBarrelMaterialType: true,
        hasBarrelLength: true,
        images: [
            '../products/barrel/carbon_outer_barrel.jpg',
        ],
        barrelLengthPricing: [
            { minLengthMm: 85, maxLengthMm: 150, price: 1200.00 },
            { minLengthMm: 151, maxLengthMm: 200, price: 1300.00 },
            { minLengthMm: 201, maxLengthMm: 250, price: 1400.00 },
            { minLengthMm: 251, maxLengthMm: 300, price: 1500.00 },
            { minLengthMm: 301, maxLengthMm: 400, price: 1600.00 },
            { minLengthMm: 401, maxLengthMm: 450, price: 1700.00 },
            { minLengthMm: 451, maxLengthMm: 500, price: 1800.00 },
            { minLengthMm: 501, maxLengthMm: 549, price: 1900.00 },
            { minLengthMm: 550, maxLengthMm: 599, price: 2000.00 },
            { minLengthMm: 600, maxLengthMm: 609, price: 2100.00 },
            { minLengthMm: 610, maxLengthMm: 619, price: 2200.00 },
            { minLengthMm: 620, maxLengthMm: 629, price: 2300.00 },
            { minLengthMm: 630, maxLengthMm: 639, price: 2400.00 },
            { minLengthMm: 640, maxLengthMm: 649, price: 2500.00 },
            { minLengthMm: 650, maxLengthMm: 659, price: 2600.00 },
            { minLengthMm: 660, maxLengthMm: 669, price: 2700.00 },
            { minLengthMm: 670, maxLengthMm: 679, price: 2800.00 },
            { minLengthMm: 680, maxLengthMm: 689, price: 2900.00 },
            { minLengthMm: 690, maxLengthMm: 699, price: 3000.00 },
            { minLengthMm: 700, maxLengthMm: 709, price: 3100.00 },
            { minLengthMm: 710, maxLengthMm: 719, price: 3200.00 },
            { minLengthMm: 720, maxLengthMm: 729, price: 3300.00 },
            { minLengthMm: 730, maxLengthMm: 739, price: 3400.00 },
            { minLengthMm: 740, maxLengthMm: 749, price: 3500.00 },
        ],
    },
    {
        categorySlug: 'suppressors',
        name: 'Aluminum Suppressor',
        slug: 'aluminum-suppressor',
        description: 'Achieve a quieter and more tactical shooting experience with EDGI’s precision-engineered aluminum suppressor. Designed for airsoft sniper rifles, this suppressor combines durability, lightweight construction, and sleek aesthetics for optimal performance in the field.',
        shortDescription: 'Lightweight aluminum suppressor for airsoft sniper rifles.',
        basePrice: 2500.00,
        stockQuantity: 15,
        isActive: true,
        hasColorFinish: true,
        hasEngraving: true,
        hasBarrelMaterialType: false,
        hasBarrelLength: false,
        images: [
            '../products/suppressors/aluminum_suppressor.jpg',
        ],
    },
    {
        categorySlug: 'suppressors',
        name: 'Carbon Suppressor',
        slug: 'carbon-suppressor',
        description: 'Take your sniper rifle build to the next level with EDGI’s carbon fiber suppressor, engineered for maximum strength and minimal weight. The carbon fiber construction offers superior durability and a sleek, modern look while delivering effective sound dampening for stealth operations.',
        shortDescription: 'Lightweight carbon fiber suppressor for airsoft sniper rifles.',
        basePrice: 3000.00,
        stockQuantity: 12,
        isActive: true,
        hasColorFinish: true,
        hasEngraving: true,
        hasBarrelMaterialType: false,
        hasBarrelLength: false,
        images: [
            '../products/suppressors/carbon_suppressor.jpg',
        ],
    },
    {
        categorySlug: 'suppressors',
        name: 'Gated Suppressor',
        slug: 'gated-suppressor',
        description: 'Enhance your sniper rifle with EDGI’s gated aluminum suppressor, featuring a rugged knurled pattern for superior grip and a bold tactical look. Built for durability and performance, this suppressor offers effective sound dampening while maintaining a lightweight profile.',
        shortDescription: 'Gated aluminum suppressor for airsoft sniper rifles.',
        basePrice: 4500.00,
        stockQuantity: 7,
        isActive: true,
        hasColorFinish: true,
        hasEngraving: true,
        hasBarrelMaterialType: false,
        hasBarrelLength: false,
        images: [
            '../products/suppressors/gated_suppressor.jpg',
        ],
    }
];


async function seedProducts() {
    console.log('Seeding Products...');

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
        try {
            console.log(`Creating product: ${product.name}`);

            const response = await axios.post(`${BASE_URL}/api/products`, product);

            if(response.status === 201) {
                console.log(`Successfully created product: ${product.name}`);
                successCount++;
            } else {
                console.error(`Failed to create product: ${product.name}. Status: ${response.status}`);
                errorCount++;
            }

            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error: any) {
            errorCount++;
            if (error.response) {
                console.error(`Error creating product: ${product.name}. Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error(`Error creating product: ${product.name}. No response received. Request: ${error.request}`);
            } else {
                console.error(`Error creating product: ${product.name}. Message: ${error.message}`);
            }
        }
    }

    console.log(`Seeding completed. Success: ${successCount}, Errors: ${errorCount}`);

    if (errorCount > 0) {
        process.exit(1);
    }

}

seedProducts().catch(error => {
    console.error('Unexpected error during seeding:', error);
    process.exit(1);
});

export { seedProducts, products };