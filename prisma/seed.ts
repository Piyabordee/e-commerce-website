import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample products
  const products = [
    {
      name: 'เสื้อยืดสีดำ',
      description: 'เสื้อยืดคอกลม ทำจาก cotton 100% สวมใส่สบาย เหมาะกับทุกโอกาส',
      price: 299,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    },
    {
      name: 'กางเกงยีนส์',
      description: 'กางเกงยีนส์ขากระบอก สไตล์เกาหลี ใส่สบาย ทนทาน',
      price: 890,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
    },
    {
      name: 'รองเท้าผ้าใบ',
      description: 'รองเท้าผ้าใบสปอร์ต ออกกำลังกาย วิ่งเล่น ใส่สบาย',
      price: 1590,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
    },
    {
      name: 'กระเป๋าสะพาย',
      description: 'กระเป๋าสะพายไหล่ ทำจากหนัง PU คุณภาพดี ใส่ได้ทั้งแบบสะพายและถือ',
      price: 750,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop',
    },
    {
      name: 'หมวกแก๊ป',
      description: 'หมวกแก๊ปสไตล์เกาหลี ปรับขนาดได้ กันแดดได้ดี',
      price: 199,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
    },
    {
      name: 'นาฬิกาข้อมือ',
      description: 'นาฬิกาข้อมือสไตล์มินิมอล ตัวเรือนสแตนเลส กันน้ำได้',
      price: 2490,
      stock: 10,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop',
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
