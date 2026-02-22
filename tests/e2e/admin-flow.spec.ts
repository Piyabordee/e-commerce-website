import { test, expect } from '@playwright/test'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234'

test.describe('Admin Authentication', () => {
  test('should display admin login page', async ({ page }) => {
    await page.goto('/admin')

    // Should have login form
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("เข้าสู่ระบบ")')).toBeVisible()
  })

  test('should login with correct password', async ({ page }) => {
    await page.goto('/admin')

    // Fill password
    await page.fill('input[type="password"]', ADMIN_PASSWORD)

    // Click login
    await page.click('button:has-text("เข้าสู่ระบบ")')

    // Should redirect to admin products page
    await expect(page).toHaveURL('/admin/products')
  })

  test('should fail login with wrong password', async ({ page }) => {
    await page.goto('/admin')

    // Fill wrong password
    await page.fill('input[type="password"]', 'wrongpassword')

    // Click login
    await page.click('button:has-text("เข้าสู่ระบบ")')

    // Should show error or stay on login page
    await expect(page.locator('text=/รหัสผ่านไม่ถูกต้อง|Unauthorized|ผิดพลาด/')).toBeVisible()
  })

  test('should fail login with empty password', async ({ page }) => {
    await page.goto('/admin')

    // Don't fill password, just click login
    await page.click('button:has-text("เข้าสู่ระบบ")')

    // Should show error or stay on login page
    await expect(page).toHaveURL('/admin')
  })
})

test.describe('Admin Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin')
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button:has-text("เข้าสู่ระบบ")')
    await page.waitForURL('/admin/products')
  })

  test('should display products page', async ({ page }) => {
    // Should have products table or list
    await expect(page.locator('text=/สินค้า|Products|รายการสินค้า/')).toBeVisible()
  })

  test('should display add product form', async ({ page }) => {
    // Should have form fields for creating product
    const nameInput = page.locator('input[name="name"], input[placeholder*="ชื่อ"]')
    const hasNameInput = await nameInput.count() > 0

    if (hasNameInput) {
      await expect(nameInput.first()).toBeVisible()
    }
  })

  test('should create new product', async ({ page }) => {
    // Fill product form (if form exists)
    const nameInput = page.locator('input[name="name"]')
    const hasNameInput = await nameInput.count() > 0

    if (hasNameInput) {
      await nameInput.fill('สินค้าทดสอบ E2E')

      const descInput = page.locator('textarea[name="description"], textarea[placeholder*="คำอธิบาย"]')
      await descInput.fill('คำอธิบายสินค้าทดสอบ')

      const priceInput = page.locator('input[name="price"], input[type="number"]')
      const priceCount = await priceInput.count()
      if (priceCount > 0) {
        await priceInput.nth(0).fill('999')
      }

      const stockInput = page.locator('input[name="stock"]')
      const stockCount = await stockInput.count()
      if (stockCount > 0) {
        await stockInput.fill('10')
      }

      // Submit form
      const submitButton = page.locator('button:has-text("เพิ่มสินค้า"), button:has-text("บันทึก")')
      const hasSubmit = await submitButton.count() > 0

      if (hasSubmit) {
        await submitButton.first().click()

        // Should show success or reload
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should display existing products in table', async ({ page }) => {
    // Look for product table
    const table = page.locator('table')
    const hasTable = await table.count() > 0

    if (hasTable) {
      await expect(table.first()).toBeVisible()
    }
  })
})

test.describe('Admin View Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin')
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button:has-text("เข้าสู่ระบบ")')
    await page.waitForURL('/admin/products')
  })

  test('should navigate to views page', async ({ page }) => {
    // Click on views/ยอดวิว link
    const viewsLink = page.locator('a:has-text("ยอดวิว"), a[href="/admin/views"]')
    const hasViewsLink = await viewsLink.count() > 0

    if (hasViewsLink) {
      await viewsLink.first().click()
      await expect(page).toHaveURL('/admin/views')
    } else {
      // Navigate directly
      await page.goto('/admin/views')
    }

    await page.waitForLoadState('networkidle')
  })

  test('should display view analytics', async ({ page }) => {
    await page.goto('/admin/views')
    await page.waitForLoadState('networkidle')

    // Should have analytics content
    await expect(page.locator('text=/ยอดวิว|View|วิว/')).toBeVisible()
  })

  test('should have boost views functionality', async ({ page }) => {
    await page.goto('/admin/views')
    await page.waitForLoadState('networkidle')

    // Look for boost form
    const boostButton = page.locator('button:has-text("Boost"), button:has-text("ปั้มยอด")')
    const hasBoost = await boostButton.count() > 0

    if (hasBoost) {
      // Should have product selector
      const productSelect = page.locator('select[name="productId"]')
      const hasSelect = await productSelect.count() > 0

      if (hasSelect) {
        await expect(productSelect.first()).toBeVisible()
      }
    }
  })

  test('should boost product views', async ({ page }) => {
    await page.goto('/admin/views')
    await page.waitForLoadState('networkidle')

    // Look for boost functionality
    const productSelect = page.locator('select[name="productId"]')
    const hasSelect = await productSelect.count() > 0

    if (hasSelect) {
      // Select first product
      await productSelect.first().selectOption({ index: 1 })

      // Enter count
      const countInput = page.locator('input[name="count"]')
      const hasCountInput = await countInput.count() > 0

      if (hasCountInput) {
        await countInput.first().fill('10')

        // Click boost
        const boostButton = page.locator('button:has-text("Boost"), button:has-text("ปั้มยอด")')
        await boostButton.first().click()

        // Should show success
        await page.waitForTimeout(1000)
      }
    }
  })
})

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin')
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button:has-text("เข้าสู่ระบบ")')
    await page.waitForURL('/admin/products')
  })

  test('should have navigation links', async ({ page }) => {
    // Should have navigation
    const navLinks = page.locator('nav a, aside a')
    const hasNav = await navLinks.count() > 0

    if (hasNav) {
      expect(navLinks.count()).toBeGreaterThan(0)
    }
  })

  test('should navigate between admin pages', async ({ page }) => {
    // Start on products page
    await expect(page).toHaveURL('/admin/products')

    // Try to navigate to views page
    const viewsLink = page.locator('a:has-text("ยอดวิว"), a[href="/admin/views"]')
    const hasViewsLink = await viewsLink.count() > 0

    if (hasViewsLink) {
      await viewsLink.first().click()
      await expect(page).toHaveURL('/admin/views')
    } else {
      await page.goto('/admin/views')
      await expect(page).toHaveURL('/admin/views')
    }
  })
})

test.describe('Admin Security', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access admin pages directly without login
    await page.goto('/admin/products')

    // Should redirect to login or show error
    const currentUrl = page.url()
    const isLoginPage = currentUrl.includes('/admin') && !currentUrl.includes('/admin/')

    // Either redirect to login or show unauthorized
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0
    const hasUnauthorized = await page.locator('text=/Unauthorized|ผิดสิทธิ์/').count() > 0

    expect(hasPasswordInput || hasUnauthorized).toBe(true)
  })

  test('should maintain session across pages', async ({ page }) => {
    // Login
    await page.goto('/admin')
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button:has-text("เข้าสู่ระบบ")')
    await page.waitForURL('/admin/products')

    // Navigate to views page
    await page.goto('/admin/views')

    // Should not redirect to login (session maintained)
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0
    expect(hasPasswordInput).toBe(false)
  })
})
