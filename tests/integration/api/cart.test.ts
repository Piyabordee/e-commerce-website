import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST, GET } from '@/app/api/cart/route'
import { prisma, setMockAdminToken, clearMockAdminToken, setMockSessionId, clearMockSessionId } from '@/../../tests/setup'

describe('GET /api/cart', () => {
  beforeEach(() => {
    clearMockSessionId()
  })

  it('should return empty array for new session', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should return cart items for existing session', async () => {
    // Create test product
    const product = await prisma.product.create({
      data: { name: 'Test Product', description: 'Test', price: 100, stock: 10 },
    })

    // Create cart item
    const sessionId = 'test-session-123'
    await prisma.cartItem.create({
      data: {
        sessionId,
        productId: product.id,
        quantity: 2,
      },
    })

    // Set mock session
    setMockSessionId(sessionId)

    const response = await GET()
    const data = await response.json()

    expect(data.data).toHaveLength(1)
    expect(data.data[0].quantity).toBe(2)
    expect(data.data[0].product.name).toBe('Test Product')
  })

  it('should return cart items ordered by createdAt desc', async () => {
    const product1 = await prisma.product.create({
      data: { name: 'Product 1', description: 'Test', price: 100, stock: 10 },
    })
    const product2 = await prisma.product.create({
      data: { name: 'Product 2', description: 'Test', price: 200, stock: 10 },
    })

    const sessionId = 'test-session-456'
    await prisma.cartItem.create({
      data: { sessionId, productId: product1.id, quantity: 1 },
    })
    await prisma.cartItem.create({
      data: { sessionId, productId: product2.id, quantity: 1 },
    })

    setMockSessionId(sessionId)

    const response = await GET()
    const data = await response.json()

    // Most recently added item should be first
    expect(data.data[0].product.name).toBe('Product 2')
    expect(data.data[1].product.name).toBe('Product 1')
  })
})

describe('POST /api/cart', () => {
  beforeEach(() => {
    clearMockSessionId()
  })

  it('should return 404 for non-existent product', async () => {
    const request = new Request('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: 99999, quantity: 1 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Product not found')
  })

  it('should create new session and add item to cart', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test Product', description: 'Test', price: 100, stock: 10 },
    })

    const request = new Request('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: 2 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.quantity).toBe(2)
    expect(data.data.product.id).toBe(product.id)
    expect(data.data.sessionId).toBeDefined()
  })

  it('should use default quantity of 1 when not provided', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test Product', description: 'Test', price: 100, stock: 10 },
    })

    const request = new Request('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.quantity).toBe(1)
  })

  it('should update quantity if item already in cart', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test Product', description: 'Test', price: 100, stock: 10 },
    })

    const sessionId = 'test-session-789'

    // Create existing cart item
    await prisma.cartItem.create({
      data: { sessionId, productId: product.id, quantity: 1 },
    })

    setMockSessionId(sessionId)

    // Add more of same product
    const request = new Request('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: 3 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.quantity).toBe(4) // 1 + 3
  })

  it('should allow adding multiple different products to cart', async () => {
    const product1 = await prisma.product.create({
      data: { name: 'Product 1', description: 'Test', price: 100, stock: 10 },
    })
    const product2 = await prisma.product.create({
      data: { name: 'Product 2', description: 'Test', price: 200, stock: 10 },
    })

    const sessionId = 'test-session-multi'

    setMockSessionId(sessionId)

    // Add first product
    await prisma.cartItem.create({
      data: { sessionId, productId: product1.id, quantity: 1 },
    })

    // Add second product via API
    const request = new Request('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product2.id, quantity: 2 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.product.name).toBe('Product 2')
    expect(data.data.quantity).toBe(2)

    // Verify both items in cart
    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
    })

    expect(cartItems).toHaveLength(2)
  })

  it('should handle large quantities', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test Product', description: 'Test', price: 100, stock: 100 },
    })

    const request = new Request('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: 99 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.quantity).toBe(99)
  })

  it('should return 500 on database error', async () => {
    // Mock prisma to throw error
    vi.spyOn(prisma.product, 'findUnique').mockRejectedValueOnce(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: 1, quantity: 1 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to add item to cart')

    vi.spyOn(prisma.product, 'findUnique').mockRestore()
  })
})
