import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/products - List all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create product (Admin only)
export async function POST(request: NextRequest) {
  // Check admin authentication
  const cookieStore = cookies()
  const adminToken = cookieStore.get('admin_token')?.value

  if (adminToken !== process.env.ADMIN_TOKEN_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name, description, price, image, stock } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: image || '/images/placeholder.png',
        stock: parseInt(stock) || 0,
      },
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
