import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  id: number
  name: string
  price: number
  image: string
  viewCount: number
  stock: number
}

export function ProductCard({ id, name, price, image, viewCount, stock }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`}>
      <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-cyan-200">
        <div className="relative h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Stock Badge */}
          {stock <= 5 && stock > 0 && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              เหลือน้อย! ({stock})
            </div>
          )}

          {/* Out of Stock Overlay */}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl">
                สินค้าหมด
              </div>
            </div>
          )}

          {/* Quick View Badge */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              ดูรายละเอียด →
            </div>
          </div>

          {/* View Count Badge */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            👁 {viewCount.toLocaleString()}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                {formatPrice(price)}
              </span>
              {stock > 0 && stock <= 5 && (
                <span className="block text-xs text-orange-500 mt-1">⚠️ เหลือน้อย</span>
              )}
            </div>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              stock === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white group-hover:scale-110'
            }`}>
              <svg
                className="w-6 h-6"
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
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
