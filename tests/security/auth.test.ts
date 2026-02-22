import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST as ProductPOST } from '@/app/api/products/route'
import { POST as ProductUpdatePUT } from '@/app/api/products/[id]/route'
import { DELETE as ProductDELETE } from '@/app/api/products/[id]/route'
import { POST as BoostPOST } from '@/app/api/views/boost/route'
import { GET as ViewsGET } from '@/app/api/views/route'
import { prisma, setMockAdminToken, clearMockAdminToken } from '@/../../tests/setup'

describe('Security: Admin Authentication', () => {
  beforeEach(() => {
    clearMockAdminToken()
  })

  describe('Products API', () => {
    it('POST /api/products should reject request without admin token', async () => {
      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
      })

      const response = await ProductPOST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('POST /api/products should reject invalid admin token', async () => {
      setMockAdminToken('completely-wrong-token-12345')

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
      })

      const response = await ProductPOST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('POST /api/products should accept valid admin token', async () => {
      setMockAdminToken()

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test', price: '100', stock: '10' }),
      })

      const response = await ProductPOST(request as any)

      expect(response.status).not.toBe(401)
    })

    it('PUT /api/products/[id] should reject request without admin token', async () => {
      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10 },
      })

      const request = new Request(`http://localhost:3000/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      })

      const params = { params: { id: product.id.toString() } }
      const response = await ProductUpdatePUT(request as any, params as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('DELETE /api/products/[id] should reject request without admin token', async () => {
      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10 },
      })

      const request = new Request(`http://localhost:3000/api/products/${product.id}`, {
        method: 'DELETE',
      })

      const params = { params: { id: product.id.toString() } }
      const response = await ProductDELETE(request as any, params as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('Views API', () => {
    it('POST /api/views/boost should reject request without admin token', async () => {
      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: 10 }),
      })

      const response = await BoostPOST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('POST /api/views/boost should reject invalid admin token', async () => {
      setMockAdminToken('invalid-token-xyz')

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: 1, count: 10 }),
      })

      const response = await BoostPOST(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('POST /api/views/boost should accept valid admin token', async () => {
      setMockAdminToken()

      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10 },
      })

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 5 }),
      })

      const response = await BoostPOST(request as any)

      expect(response.status).not.toBe(401)
    })

    it('GET /api/views should reject request without admin token', async () => {
      const response = await ViewsGET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('GET /api/views should accept valid admin token', async () => {
      setMockAdminToken()

      const response = await ViewsGET()

      expect(response.status).not.toBe(401)
    })
  })

  describe('Token Security', () => {
    it('should reject empty token', async () => {
      setMockAdminToken('')

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
      })

      const response = await ProductPOST(request as any)

      expect(response.status).toBe(401)
    })

    it('should reject whitespace-only token', async () => {
      setMockAdminToken('   ')

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
      })

      const response = await ProductPOST(request as any)

      expect(response.status).toBe(401)
    })

    it('should handle token with special characters', async () => {
      // Valid token with special chars
      setMockAdminToken()

      const product = await prisma.product.create({
        data: { name: 'Test', description: 'Test', price: 100, stock: 10 },
      })

      const request = new Request('http://localhost:3000/api/views/boost', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, count: 5 }),
      })

      const response = await BoostPOST(request as any)

      expect(response.status).not.toBe(401)
    })

    it('should be case-sensitive for token comparison', async () => {
      setMockAdminToken(process.env.ADMIN_TOKEN_SECRET?.toUpperCase())

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
      })

      const response = await ProductPOST(request as any)

      // Should fail due to case sensitivity
      expect(response.status).toBe(401)
    })
  })

  describe('Cross-Request Security', () => {
    it('should not allow admin operations from public endpoints', async () => {
      // Public endpoint - should work
      const publicResponse = await fetch('http://localhost:3000/api/products')
      expect(publicResponse.status).not.toBe(401)

      // Protected endpoint - should fail without auth
      setMockAdminToken(undefined)
      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
      })
      const protectedResponse = await ProductPOST(request as any)

      expect(protectedResponse.status).toBe(401)
    })
  })
})
