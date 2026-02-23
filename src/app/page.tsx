import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { ProductCard } from '@/components/ProductCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch products directly from Prisma (more efficient than API call)
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-cyan-600/90"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-200 via-cyan-200 to-teal-200">
                ยินดีต้อนรับสู่
              </span>
              <br />
              <span className="text-white">ร้านของปิยบดี</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
              ช้อปปิ้งสินค้าคุณภาพดี ราคามิตรภาพ จัดส่งทั่วประเทศ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#products"
                className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-cyan-300 hover:text-blue-700 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
              >
                เริ่มช้อปเลย
              </Link>
              <Link
                href="/cart"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                ดูตะกร้า
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24 fill-sky-50" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">สินค้าคุณภาพ</h3>
              <p className="text-gray-600">คัดสรรสินค้าคุณภาพดีที่สุด พร้อมรับประกันความพึงพอใจ</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">จัดส่งรวดเร็ว</h3>
              <p className="text-gray-600">จัดส่งทั่วประเทศภายใน 1-3 วันทำการ พร้อมระบบติดตามพัสดุ</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ชำระปลอดภัย</h3>
              <p className="text-gray-600">ระบบชำระเงินปลอดภัย รองรับบัตรเครดิตและโอนเงิน</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              สินค้ามาแรง 🔥
            </h2>
            <p className="text-gray-600 text-lg">
              สินค้าขายดีประจำเดือนนี้ {products.length} รายการ
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">ไม่พบสินค้า</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            พร้อมที่จะช้อปปิ้งแล้วหรือยัง?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            สมัครสมาชิกวันนี้ รับส่วนลดพิเศษ 10% สำหรับคำสั่งซื้อแรก!
          </p>
          <button className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-cyan-300 hover:text-blue-700 transition-all duration-300 shadow-2xl hover:scale-105">
            สมัครสมาชิกฟรี
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🛍️ ร้านของปิยบดี</h3>
              <p className="text-gray-400">ร้านค้าออนไลน์ที่เชื่อถือได้ บริการดีเยี่ยม สินค้าคุณภาพ</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">เมนูลัด</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition">หน้าแรก</Link></li>
                <li><Link href="/cart" className="hover:text-white transition">ตะกร้าสินค้า</Link></li>
                <li><a href="#products" className="hover:text-white transition">สินค้าทั้งหมด</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">บริการลูกค้า</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">วิธีการสั่งซื้อ</a></li>
                <li><a href="#" className="hover:text-white transition">การจัดส่ง</a></li>
                <li><a href="#" className="hover:text-white transition">การคืนสินค้า</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://github.com/Piyabordee" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.113.16-.055.16-.645v-2.25h-1.09c-.73 0-.88-.365-.88-.89V11.2h1.97c.09 0 .16-.08.16-.17V9.5c0-2.23-1.36-3.61-3.14-3.61-.86 0-1.41.35-1.83.72-.32-.32-.52-.74-.52-1.2V3.6c0-.48.16-.9.48-1.25.42-.46.97-.73 1.83-.73 1.78 0 3.14 1.38 3.14 3.61v1.53c0 .09.07.17.16.17h1.97v5.755c0 .28-.095.59-.16.645-4.77 1.59-8.205-6.075-8.205-11.385C0 5.37 5.37 0 12 0z"/>
                    </svg>
                    @Piyabordee
                  </a>
                </li>
                <li>📧 support@piyabordee.shop</li>
                <li>💬 Line: @piyabordee</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 ร้านของปิยบดี. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
