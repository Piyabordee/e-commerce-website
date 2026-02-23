'use client'

import { formatPrice, BASE_PATH } from '@/lib/utils'

interface AddToCartButtonProps {
  productId: number
  stock: number
  name: string
  price: number
}

export function AddToCartButton({ productId, stock, name, price }: AddToCartButtonProps) {
  const handleAddToCart = async () => {
    if (stock === 0) {
      alert('สินค้าหมด')
      return
    }

    try {
      const res = await fetch(`${BASE_PATH}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      const data = await res.json()

      if (data.success) {
        alert(`✅ เพิ่ม "${name}" ลงในตะกร้าเรียบร้อย (${formatPrice(price)})`)
        window.location.href = `${BASE_PATH}/cart`
      } else {
        alert(data.error || 'ไม่สามารถเพิ่มสินค้าได้')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={stock === 0}
      className={`w-full py-4 px-8 rounded-2xl font-bold text-white text-lg transition-all duration-300 ${
        stock === 0
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
      }`}
    >
      {stock === 0 ? 'สินค้าหมด' : (
        <span className="flex items-center justify-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          เพิ่มลงตะกร้า
        </span>
      )}
    </button>
  )
}
