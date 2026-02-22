import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/views/track/route'
import { prisma } from '@/../../tests/setup'

describe('POST /api/views/track', () => {
  it('should track organic view for product', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 0 },
    })

    const request = new Request('http://localhost:3000/api/views/track', {
      method: 'POST',
      body: JSON.stringify({
        productId: product.id,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Test Agent',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.success).toBe(true)

    // Verify view log created
    const viewLog = await prisma.viewLog.findFirst({
      where: { productId: product.id, isBoosted: false },
    })
    expect(viewLog).toBeDefined()
    expect(viewLog?.ip).toBe('127.0.0.1')
    expect(viewLog?.userAgent).toBe('Mozilla/5.0 Test Agent')
    expect(viewLog?.isBoosted).toBe(false)

    // Verify product view count incremented
    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } })
    expect(updatedProduct?.viewCount).toBe(1)
  })

  it('should track view without IP and userAgent', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 0 },
    })

    const request = new Request('http://localhost:3000/api/views/track', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.success).toBe(true)

    const viewLog = await prisma.viewLog.findFirst({
      where: { productId: product.id, isBoosted: false },
    })
    expect(viewLog).toBeDefined()
    expect(viewLog?.ip).toBeNull()
    expect(viewLog?.userAgent).toBeNull()
  })

  it('should handle multiple views for same product', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 0 },
    })

    // Track first view
    await POST(
      new Request('http://localhost:3000/api/views/track', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, ip: '192.168.1.1' }),
      }) as any
    )

    // Track second view
    await POST(
      new Request('http://localhost:3000/api/views/track', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, ip: '192.168.1.2' }),
      }) as any
    )

    const viewLogs = await prisma.viewLog.findMany({
      where: { productId: product.id, isBoosted: false },
    })
    expect(viewLogs).toHaveLength(2)

    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } })
    expect(updatedProduct?.viewCount).toBe(2)
  })

  it('should return 404 for non-existent product', async () => {
    const request = new Request('http://localhost:3000/api/views/track', {
      method: 'POST',
      body: JSON.stringify({ productId: 99999, ip: '127.0.0.1' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Product not found')
  })

  it('should preserve existing view count when tracking', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 15 },
    })

    await POST(
      new Request('http://localhost:3000/api/views/track', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      }) as any
    )

    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } })
    expect(updatedProduct?.viewCount).toBe(16)
  })

  it('should handle various user agents', async () => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    ]

    const product = await prisma.product.create({
      data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 0 },
    })

    for (const ua of userAgents) {
      await POST(
        new Request('http://localhost:3000/api/views/track', {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, userAgent: ua }),
        }) as any
      )
    }

    const viewLogs = await prisma.viewLog.findMany({
      where: { productId: product.id, isBoosted: false },
    })
    expect(viewLogs).toHaveLength(3)
  })
})
