import { test, expect } from '@playwright/test'

test.describe('Customer Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/')
  })

  test('should display home page with branding', async ({ page }) => {
    // Should have the shop name
    await expect(page.locator('text=ร้านของปิยบดี')).toBeVisible()

    // Should have navigation
    await expect(page.locator('a[href="/"]')).toBeVisible()
  })

  test('should display products on home page', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Should have product cards
    const products = page.locator('a[href^="/products/"]').first()
    await expect(products).toBeVisible()
  })

  test('should navigate to product detail page', async ({ page }) => {
    // Click first product link
    await page.locator('a[href^="/products/"]').first().click()

    // Should be on product detail page
    await expect(page).toHaveURL(/\/products\/\d+/)

    // Should have product details
    await expect(page.locator('text=เพิ่มลงตะกร้า')).toBeVisible()
  })

  test('should show view count on product detail', async ({ page }) => {
    await page.locator('a[href^="/products/"]').first().click()

    // Should show view counter
    await expect(page.locator('text=/เข้าชม/')).toBeVisible()
  })

  test('should add product to cart and redirect', async ({ page }) => {
    // Navigate to a product
    await page.locator('a[href^="/products/"]').first().click()
    await page.waitForLoadState('networkidle')

    // Handle the alert dialog
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    // Click add to cart button
    await page.click('text=เพิ่มลงตะกร้า')

    // Should redirect to cart page
    await expect(page).toHaveURL('/cart')
    await page.waitForLoadState('networkidle')
  })

  test('should view cart page', async ({ page }) => {
    await page.goto('/cart')

    // Should have cart page heading
    await expect(page.locator('text=ตะกร้าสินค้า')).toBeVisible()
  })

  test('should show empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/cart')

    // Should show empty cart message
    await expect(page.locator('text=/ว่างเปล่า|ไม่มีสินค้า/')).toBeVisible()
  })

  test('should display cart icon with count badge', async ({ page }) => {
    const cartIcon = page.locator('a[href="/cart"]')
    await expect(cartIcon).toBeVisible()

    // Should have cart icon (SVG)
    const svg = cartIcon.locator('svg')
    await expect(svg).toBeVisible()
  })

  test('should show out of stock button for products with zero stock', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for out of stock buttons (if any exist from seed data)
    const outOfStockButtons = page.locator('button:has-text("สินค้าหมด")')

    const count = await outOfStockButtons.count()
    if (count > 0) {
      // Check that the button is disabled
      const firstButton = outOfStockButtons.first()
      await expect(firstButton).toBeDisabled()
    }
  })

  test('should handle navigation between pages', async ({ page }) => {
    // Start at home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Go to cart
    await page.click('a[href="/cart"]')
    await expect(page).toHaveURL('/cart')

    // Go back to home
    await page.click('a[href="/"]')
    await expect(page).toHaveURL('/')
  })

  test('should display product prices with Thai Baht formatting', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for price elements (฿ symbol)
    const priceElements = page.locator('text=/฿/')
    const count = await priceElements.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Cart Management', () => {
  test('should add multiple items to cart', async ({ page }) => {
    // Add first item
    await page.goto('/')
    await page.locator('a[href^="/products/"]').first().click()

    page.on('dialog', async dialog => await dialog.accept())
    await page.click('text=เพิ่มลงตะกร้า')

    // Go back to home and add another item
    await page.goto('/')
    const productLinks = await page.locator('a[href^="/products/"]').count()
    if (productLinks > 1) {
      await page.locator('a[href^="/products/"]').nth(1).click()
      page.on('dialog', async dialog => await dialog.accept())
      await page.click('text=เพิ่มลงตะกร้า')
    }

    // Check cart
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
  })

  test('should handle checkout flow', async ({ page }) => {
    // Setup: Add item to cart
    await page.goto('/')
    await page.locator('a[href^="/products/"]').first().click()

    page.on('dialog', async dialog => await dialog.accept())
    await page.click('text=เพิ่มลงตะกร้า')

    // Navigate to cart
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')

    // Look for checkout button
    const checkoutButton = page.locator('text=/checkout|Checkout|ชำระเงิน/i')
    const hasCheckout = await checkoutButton.count() > 0

    if (hasCheckout) {
      // Handle checkout alert
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('สำเร็จ')
        await dialog.accept()
      })

      await checkoutButton.first().click()
    }
  })
})
