import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ร้านของปิยบดี',
  description: 'ร้านค้าออนไลน์ที่เชื่อถือได้ บริการดีเยี่ยม สินค้าคุณภาพ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
