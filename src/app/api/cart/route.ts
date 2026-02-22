import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

// GET /api/cart - Get cart items
export async function GET() {
  try {
    const cookieStore = cookies()
    let sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      sessionId = uuidv4()
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: cartItems })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    let sessionId = cookieStore.get('session_id')?.value
    let isNewSession = false

    if (!sessionId) {
      sessionId = uuidv4()
      isNewSession = true
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body

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

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        sessionId_productId: {
          sessionId,
          productId,
        },
      },
    })

    const response = NextResponse.json({ success: true })

    // Set session_id cookie if new session
    if (isNewSession) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      })

      return NextResponse.json({ success: true, data: updatedItem })
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          sessionId,
          productId,
          quantity,
        },
        include: { product: true },
      })

      const resp = NextResponse.json({ success: true, data: cartItem }, { status: 201 })

      // Set session_id cookie for new sessions
      if (isNewSession) {
        resp.cookies.set('session_id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      }

      return resp
    }
  } catch (error) {
    console.error('Cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}
