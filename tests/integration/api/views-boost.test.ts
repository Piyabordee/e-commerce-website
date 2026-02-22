import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/views/boost/route'
import { prisma, setMockAdminToken, clearMockAdminToken } from '@/../../tests/setup'

describe('POST /api/views/boost', () => {
  beforeEach(() => {
    clearMockAdminToken()
  })

  describe('Authentication', () => {
    it('should require admin authentication', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: 10 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject invalid admin token', async () => {
      setMockAdminToken('invalid-token')

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: 10 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('should accept valid admin token', async () => {
      setMockAdminToken()

      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 5 },
      })

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 10 }),
      })

      const response = await POST(request as any)

      expect(response.status).not.toBe(401)
    })
  })

  describe('Input Validation', () => {
    beforeEach(() => {
      setMockAdminToken()
    })

    it('should validate count must be positive', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: -5 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Valid product ID and count are required')
    })

    it('should validate count must be at least 1', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: 0 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should require productId', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ count: 10 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should require count', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject null count', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: null }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Product Validation', () => {
    beforeEach(() => {
      setMockAdminToken()
    })

    it('should return 404 for non-existent product', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 99999, count: 10 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Product not found')
    })

    it('should return 404 for productId = 0', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 0, count: 10 }),
      })

      const response = await POST(request as any)

      expect(response.status).toBe(404)
    })
  })

  describe('Boost Functionality', () => {
    beforeEach(() => {
      setMockAdminToken()
    })

    it('should boost views and create view logs', async () => {
      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 5 },
      })

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 100 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      // Verify response
      expect(data.success).toBe(true)
      expect(data.message).toContain('100 views')

      // Verify product view count incremented
      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } })
      expect(updatedProduct?.viewCount).toBe(105) // 5 + 100

      // Verify boosted logs created
      const boostedLogs = await prisma.viewLog.findMany({
        where: { productId: product.id, isBoosted: true },
      })
      expect(boostedLogs.length).toBe(100)
    })

    it('should handle large boost counts efficiently', async () => {
      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 0 },
      })

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 1000 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data.success).toBe(true)

      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } })
      expect(updatedProduct?.viewCount).toBe(1000)

      const boostedLogs = await prisma.viewLog.findMany({
        where: { productId: product.id, isBoosted: true },
      })
      expect(boostedLogs.length).toBe(1000)
    })

    it('should create boosted view logs without IP and userAgent', async () => {
      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 0 },
      })

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 5 }),
      })

      await POST(request as any)

      const boostedLogs = await prisma.viewLog.findMany({
        where: { productId: product.id, isBoosted: true },
      })

      expect(boostedLogs).toHaveLength(5)
      boostedLogs.forEach(log => {
        expect(log.ip).toBeNull()
        expect(log.userAgent).toBeNull()
        expect(log.isBoosted).toBe(true)
      })
    })

    it('should allow multiple boosts on same product', async () => {
      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10, viewCount: 0 },
      })

      // First boost
      const request1 = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 50 }),
      })
      await POST(request1 as any)

      // Second boost
      const request2 = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 30 }),
      })
      await POST(request2 as any)

      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } })
      expect(updatedProduct?.viewCount).toBe(80) // 50 + 30

      const boostedLogs = await prisma.viewLog.findMany({
        where: { productId: product.id, isBoosted: true },
      })
      expect(boostedLogs.length).toBe(80)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      setMockAdminToken()
    })

    it('should return 500 on database error', async () => {
      // Mock prisma to throw error
      vi.spyOn(prisma.product, 'findUnique').mockRejectedValueOnce(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: 10 }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to boost views')

      vi.spyOn(prisma.product, 'findUnique').mockRestore()
    })
  })
})
