import Link from 'next/link'
import { usePathname } from 'next/navigation'

'use client'

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: '📊 แดชบอร์ด' },
    { href: '/admin/products', label: '📦 จัดการสินค้า' },
    { href: '/admin/views', label: '👁 สถิติการเข้าชม' },
  ]

  return (
    <aside className="w-64 bg-gray-800 min-h-screen">
      <div className="p-4">
        <Link href="/admin" className="text-xl font-bold text-white">
          ⚙️ Admin Panel
        </Link>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition ${
                isActive ? 'bg-gray-700 text-white border-l-4 border-blue-500' : ''
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Link
          href="/"
          className="block text-center text-gray-400 hover:text-white transition text-sm"
        >
          ← กลับหน้าร้านค้า
        </Link>
      </div>
    </aside>
  )
}
