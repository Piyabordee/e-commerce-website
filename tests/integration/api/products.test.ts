import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST, GET } from '@/app/api/products/route'
import { prisma, setMockAdminToken, clearMockAdminToken } from '@/../../tests/setup'

describe('GET /api/products', () => {
  it('should return empty array when no products exist', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should return all products ordered by createdAt desc', async () => {
    // Create test products with timestamps
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    await prisma.product.create({
      data: {
        name: 'Product A',
        description: 'Description A',
        price: 100,
        createdAt: yesterday,
      },
    })

    await prisma.product.create({
      data: {
        name: 'Product B',
        description: 'Description B',
        price: 200,
        createdAt: now,
      },
    })

    const response = await GET()
    const data = await response.json()

    expect(data.data).toHaveLength(2)
    expect(data.data[0].name).toBe('Product B') // Latest first
    expect(data.data[1].name).toBe('Product A')
  })

  it('should include all product fields', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'เสื้อยืดสีดำ',
        description: 'เสื้อยืดคอกลม 100% คอตตอน',
        price: 299,
        image: '/images/shirt.jpg',
        stock: 50,
        viewCount: 10,
      },
    })

    const response = await GET()
    const data = await response.json()
    const returnedProduct = data.data[0]

    expect(returnedProduct).toMatchObject({
      id: product.id,
      name: 'เสื้อยืดสีดำ',
      description: 'เสื้อยืดคอกลม 100% คอตตอน',
      price: 299,
      image: '/images/shirt.jpg',
      stock: 50,
      viewCount: 10,
    })
    expect(returnedProduct.createdAt).toBeDefined()
    expect(returnedProduct.updatedAt).toBeDefined()
  })
})

describe('POST /api/products', () => {
  beforeEach(() => {
    clearMockAdminToken()
  })

  it('should return 401 without admin token', async () => {
    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 401 with invalid admin token', async () => {
    setMockAdminToken('invalid-token')

    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', description: 'Test', price: '100' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should create product with valid admin token', async () => {
    setMockAdminToken()

    const requestBody = {
      name: 'เสื้อยืดสีดำ',
      description: 'เสื้อยืดคอกลม 100% คอตตอน',
      price: '299',
      stock: '50',
      image: '/images/shirt.jpg',
    }

    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('เสื้อยืดสีดำ')
    expect(data.data.price).toBe(299)
    expect(data.data.stock).toBe(50)
    expect(data.data.image).toBe('/images/shirt.jpg')
    expect(data.data.id).toBeDefined()
    expect(data.data.createdAt).toBeDefined()
  })

  it('should use default image when not provided', async () => {
    setMockAdminToken()

    const requestBody = {
      name: 'Test Product',
      description: 'Test Description',
      price: '100',
      stock: '10',
    }

    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.image).toBe('/images/placeholder.png')
  })

  it('should use default stock of 0 when not provided', async () => {
    setMockAdminToken()

    const requestBody = {
      name: 'Test Product',
      description: 'Test Description',
      price: '100',
    }

    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.stock).toBe(0)
  })

  it('should handle decimal prices', async () => {
    setMockAdminToken()

    const requestBody = {
      name: 'Test Product',
      description: 'Test',
      price: '99.99',
      stock: '5',
    }

    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.price).toBe(99.99)
  })

  it('should handle Thai text correctly', async () => {
    setMockAdminToken()

    const requestBody = {
      name: 'กางเกงยีนส์ขาสั้น',
      description: 'กางเกงยีนส์ขาสั้น ผ้ายีนส์คุณภาพดี สวมใส่สบาย',
      price: '890',
      stock: '30',
    }

    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(data.data.name).toBe('กางเกงยีนส์ขาสั้น')
    expect(data.data.description).toContain('ผ้ายีนส์คุณภาพดี')
  })

  it('should return 500 on database error', async () => {
    setMockAdminToken()

    // Mock prisma to throw error
    const originalCreate = prisma.product.create
    vi.spyOn(prisma.product, 'create').mockRejectedValueOnce(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        description: 'Test',
        price: '100',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to create product')

    // Restore original
    vi.spyOn(prisma.product, 'create').mockRestore()
  })
})
