import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// POST /api/views/boost - Boost views for a product (Admin only)
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
    const { productId, count } = body

    if (!productId || !count || count < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid product ID and count are required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create boosted view logs
    const viewLogs = Array.from({ length: count }, () => ({
      productId,
      isBoosted: true,
    }))

    await prisma.viewLog.createMany({
      data: viewLogs,
    })

    // Update product view count
    await prisma.product.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: count,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully boosted ${count} views for product`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to boost views' },
      { status: 500 }
    )
  }
}
