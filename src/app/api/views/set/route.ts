import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

/**
 * PUT /api/views/set - Set view count to a specific value (Admin only)
 * This directly sets the viewCount instead of incrementing
 */
export async function PUT(request: NextRequest) {
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
    const { productId, viewCount } = body

    if (!productId || viewCount === undefined || viewCount < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid product ID and view count (>= 0) are required' },
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

    // Calculate the difference to determine how many boosted views to add/remove
    const currentViewCount = product.viewCount
    const difference = viewCount - currentViewCount

    if (difference === 0) {
      return NextResponse.json({
        success: true,
        message: 'View count unchanged (already at target value)',
      })
    }

    if (difference > 0) {
      // Add boosted view logs for the difference
      const viewLogs = Array.from({ length: difference }, () => ({
        productId,
        isBoosted: true,
      }))

      await prisma.viewLog.createMany({
        data: viewLogs,
      })
    } else {
      // Remove some boosted view logs (remove oldest ones first)
      const toRemove = Math.abs(difference)
      const boostedLogs = await prisma.viewLog.findMany({
        where: {
          productId,
          isBoosted: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: toRemove,
        select: {
          id: true,
        },
      })

      if (boostedLogs.length > 0) {
        await prisma.viewLog.deleteMany({
          where: {
            id: {
              in: boostedLogs.map((log) => log.id),
            },
          },
        })
      }
    }

    // Update product view count to exact value
    await prisma.product.update({
      where: { id: productId },
      data: {
        viewCount: viewCount,
      },
    })

    return NextResponse.json({
      success: true,
      message: `View count set to ${viewCount.toLocaleString()} for product`,
      data: { previousCount: currentViewCount, newCount: viewCount },
    })
  } catch (error) {
    console.error('Error setting view count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set view count' },
      { status: 500 }
    )
  }
}
