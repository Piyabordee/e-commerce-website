import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/views/track - Track a page view (organic)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get IP and User Agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    const userAgent = request.headers.get('user-agent') || null

    // Create view log
    await prisma.viewLog.create({
      data: {
        productId,
        ip,
        userAgent,
        isBoosted: false,
      },
    })

    // Update product view count
    await prisma.product.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to track view' },
      { status: 500 }
    )
  }
}
