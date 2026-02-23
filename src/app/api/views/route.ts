import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/views - Get view stats per product (Admin only)
export async function GET() {
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
    const products = await prisma.product.findMany({
      include: {
        viewLogs: {
          select: {
            isBoosted: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const viewStats = products.map((product) => {
      const organicViews = product.viewLogs.filter((log) => !log.isBoosted).length
      const boostedViews = product.viewLogs.filter((log) => log.isBoosted).length

      return {
        id: product.id,
        name: product.name,
        organicViews,
        boostedViews,
        totalViews: organicViews + boostedViews,
      }
    })

    return NextResponse.json({ success: true, data: viewStats })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch view stats' },
      { status: 500 }
    )
  }
}
