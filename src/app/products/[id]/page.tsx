import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { ViewCounterLive } from '@/components/ViewCounterLive'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductCard } from '@/components/ProductCard'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const productId = parseInt(params.id)

  // Fetch product and track view in a transaction
  const product = await prisma.$transaction(async (tx) => {
    // Get product
    const product = await tx.product.findUnique({
      where: { id: productId },
    })

    if (!product) return null

    // Create view log
    await tx.viewLog.create({
      data: {
        productId,
        ip: null,
        userAgent: null,
        isBoosted: false,
      },
    })

    // Update product view count
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return updatedProduct
  })

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-gray-500 text-xl mb-8">ไม่พบสินค้า</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition"
            >
              กลับหน้าแรก
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Fetch recommended products (excluding current product, random 4)
  const allProducts = await prisma.product.findMany({
    where: {
      id: { not: productId }
    },
    select: {
      id: true,
      name: true,
      price: true,
      image: true,
      viewCount: true,
      stock: true,
    }
  })

  // Shuffle and take first 4 (or fewer if not enough products)
  const recommendedProducts = allProducts
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition">
              หน้าแรก
            </Link>
            <span>/</span>
            <Link href="/#products" className="hover:text-blue-600 transition">
              สินค้า
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 relative h-96 md:h-auto min-h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Stock Badge */}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                  🔥 เหลือน้อย! เพียง {product.stock} ชิ้น
                </div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl">
                    สินค้าหมดชั่วคราว
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8 md:p-12">
              <div className="mb-6">
                <ViewCounterLive productId={product.id} initialViewCount={product.viewCount} />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {product.name}
              </h1>

              <div className="mb-8">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-2">รายละเอียดสินค้า</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Info */}
              <div className="flex items-center space-x-4 mb-8">
                <div className={`px-4 py-2 rounded-full font-bold ${
                  product.stock === 0
                    ? 'bg-red-100 text-red-600'
                    : product.stock <= 5
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {product.stock === 0
                    ? '❌ สินค้าหมด'
                    : product.stock <= 5
                    ? `⚠️ เหลือ ${product.stock} ชิ้น`
                    : `✅ มีสินค้า ${product.stock} ชิ้น`}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <AddToCartButton
                  productId={product.id}
                  stock={product.stock}
                  name={product.name}
                  price={product.price}
                />

                <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>รับประกันความพอใจ 100%</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl mb-1">🚚</div>
                  <p className="text-xs text-gray-500">จัดส่งฟรี</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <p className="text-xs text-gray-500">ชำระปลอดภัย</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">↩️</div>
                  <p className="text-xs text-gray-500">คืนได้ 7 วัน</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {recommendedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              สินค้าแนะนำ 🌟
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  viewCount={product.viewCount}
                  stock={product.stock}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
