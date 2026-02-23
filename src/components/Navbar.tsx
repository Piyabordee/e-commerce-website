import Link from 'next/link'
import { CartIcon } from './CartIcon'

export function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
              🛍️
            </span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
              ร้านของปิยบดี
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 font-medium"
            >
              หน้าแรก
            </Link>
            <Link
              href="/#products"
              className="px-4 py-2 rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 font-medium"
            >
              สินค้า
            </Link>
            <Link
              href="/cart"
              className="px-4 py-2 rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 font-medium"
            >
              ตะกร้า
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <CartIcon />

            <Link
              href="/admin"
              className="px-4 py-2 rounded-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300 font-medium"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
