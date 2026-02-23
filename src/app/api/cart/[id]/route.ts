import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// PUT /api/cart/[id] - Update item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quantity } = body

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!cartItem || cartItem.sessionId !== sessionId) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(params.id) },
      data: { quantity },
      include: { product: true },
    })

    return NextResponse.json({ success: true, data: updatedItem })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 401 }
      )
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!cartItem || cartItem.sessionId !== sessionId) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
