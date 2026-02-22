'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CartItem {
  id: number
  quantity: number
}

export function CartIcon() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Fetch cart count
    const fetchCartCount = async () => {
      try {
        const res = await fetch('/api/cart')
        const data = await res.json()
        if (data.success) {
          const count = data.data.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
          setCartCount(count)
        }
      } catch (error) {
        console.error('Failed to fetch cart count:', error)
      }
    }

    fetchCartCount()

    // Refetch cart count when window gains focus
    window.addEventListener('focus', fetchCartCount)
    return () => window.removeEventListener('focus', fetchCartCount)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-full hover:bg-blue-50 transition-all duration-300 group"
    >
      <svg
        className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </Link>
  )
}
