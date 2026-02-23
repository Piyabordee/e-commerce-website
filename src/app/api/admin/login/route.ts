import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Admin password not configured' },
        { status: 500 }
      )
    }

    if (password === adminPassword) {
      const adminToken = process.env.ADMIN_TOKEN_SECRET

      if (!adminToken) {
        return NextResponse.json(
          { success: false, error: 'Server configuration error' },
          { status: 500 }
        )
      }


      const response = NextResponse.json({ success: true })
      response.cookies.set('admin_token', adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process login' },
      { status: 500 }
    )
  }
}
