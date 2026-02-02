import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
    test('Guest user can add item and checkout', async ({ page }) => {
        // Mock Supabase Products
        await page.route('**/rest/v1/products*', async route => {
            const json = [{
                id: 'e2e-product-1',
                name: 'E2E Cake',
                price: 75,
                image_url: null,
                stock_status: 'IN_STOCK',
                description: 'Delicious Test Cake',
                is_active: true
            }];
            await route.fulfill({ json });
        });

        // Mock Supabase Order Submission
        await page.route('**/rest/v1/orders', async route => {
            const json = {
                id: 'e2e-order-1',
                customer_name: 'Test User',
                total_amount: 75,
                shipping_method: '7-11',
                seven_eleven_store_id: '999999',
                seven_eleven_address: 'Test Store Address'
            };
            await route.fulfill({ status: 201, json });
        });

        // Mock Supabase Order Fetch (Success Page)
        await page.route('**/rest/v1/orders?*', async route => {
            const json = {
                id: 'e2e-order-1',
                customer_name: 'Test User',
                total_amount: 75,
                shipping_method: '7-11',
                seven_eleven_store_id: '999999',
                seven_eleven_address: 'Test Store Address',
                items: [{ name: 'E2E Cake', quantity: 1, price: 75 }]
            };
            await route.fulfill({ json: [json] });
        });

        // 1. Go to Home
        await page.goto('/');

        // 2. Add Item to Cart
        // Using test-id for robustness
        const productCard = page.getByTestId('product-card-e2e-product-1');
        // Wait for it to be visible to ensure loading finished
        await expect(productCard).toBeVisible();

        // Add to cart directly
        await page.getByTestId('add-to-cart-e2e-product-1').click();

        // 3. Verify Cart
        // Wait for URL or UI feedback
        // Just go to checkout for simplicity in checking flow, or check header
        await expect(page.locator('text=Cart')).toContainText('1'); // Optional check

        await page.goto('/checkout');

        // 4. Fill Checkout Form
        await expect(page).toHaveURL('/checkout');
        await page.getByTestId('checkout-name').fill('Test User');
        await page.getByTestId('checkout-phone').fill('0912345678');

        // Select 7-11
        await page.click('text=7-11 Pickup');
        await page.getByTestId('checkout-store-id').fill('999999');
        await page.getByTestId('checkout-store-address').fill('Test Store Address');

        // 5. Submit
        await page.getByTestId('checkout-submit').click();

        // 6. Success
        await expect(page).toHaveURL(/\/checkout\/success/);
        await expect(page.locator('h1')).toContainText('Thank You');
        await expect(page.locator('text=999999')).toBeVisible();
    });
});
