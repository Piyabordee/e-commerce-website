'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartItem {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image: string
    stock: number
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (data.success) {
        setCartItems(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })

      if (res.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const removeItem = async (id: number) => {
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('ตะกร้าสินค้าว่างเปล่า')
      return
    }

    alert('✅ สั่งซื้อสินค้าสำเร็จ! ขอบคุณที่ใช้บริการ 🎉\n\nหมายเลขคำสั่งซื้อ: #' + Math.random().toString(36).substring(7).toUpperCase())
    setCartItems([])
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            ตะกร้าสินค้า 🛒
          </h1>
          <p className="text-gray-600">
            {cartItems.length === 0
              ? 'ยังไม่มีสินค้าในตะกร้า'
              : `มีสินค้า ${cartItems.length} รายการ`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ตะกร้าสินค้าว่างเปล่า
            </h2>
            <p className="text-gray-600 mb-8">
              ไปเลือกซื้อสินค้ากันก่อนนะ!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              ช้อปเลย
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-32 h-48 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 128px"
                      />
                    </div>

                    <div className="flex-grow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-grow">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mt-2">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-50 transition flex items-center justify-center font-bold text-gray-700"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.min(item.product.stock, item.quantity + 1)
                              )
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-50 transition flex items-center justify-center font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500">รวม</p>
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      {item.quantity >= item.product.stock && (
                        <p className="text-orange-500 text-sm mt-2">
                          ⚠️ ถึงจำนวนสูงสุดแล้ว
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  สรุปคำสั่งซื้อ
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>ยอดรวมสินค้า</span>
                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ค่าจัดส่ง</span>
                    <span className="text-green-600 font-bold">ฟรี!</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">รวมทั้งหมด</span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  ดำเนินการชำระเงิน 💳
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl">🔒</div>
                      <p className="text-xs text-gray-500">ปลอดภัย</p>
                    </div>
                    <div>
                      <div className="text-2xl">🚚</div>
                      <p className="text-xs text-gray-500">จัดส่งฟรี</p>
                    </div>
                    <div>
                      <div className="text-2xl">↩️</div>
                      <p className="text-xs text-gray-500">คืนได้</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/"
                  className="block text-center text-blue-600 hover:text-blue-700 mt-4 font-medium"
                >
                  ← ซื้อสินค้าเพิ่มเติม
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
