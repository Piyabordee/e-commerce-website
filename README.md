# 🛒 ร้านของปิยบดี — E-Commerce Website

> Full-stack e-commerce web application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** — featuring a customer storefront, shopping cart, live view counter, and a complete admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![Vibe Coded](https://img.shields.io/badge/vibe_coded-100%25-ff69b4)

> 🎧 **Vibe Coded 100%** — โปรเจกต์นี้เขียนด้วย AI (GitHub Copilot) ทั้งหมด ไม่มีการเขียนโค้ดด้วยมือแม้แต่บรรทัดเดียว เป็นตัวอย่างการพัฒนาซอฟต์แวร์แบบ AI-first ตั้งแต่ต้นจนจบ

---

## ✨ Features

### หน้าลูกค้า (Customer Storefront)
- **Product Grid** — แสดงสินค้าพร้อมรูป ราคา และยอดเข้าชม
- **Product Detail** — รายละเอียดสินค้า + นับ view อัตโนมัติเมื่อเปิดหน้า
- **Live View Counter** — ยอดวิวอัพเดทแบบ real-time ผ่าน SSE (Server-Sent Events)
- **Shopping Cart** — เพิ่ม / ปรับจำนวน / ลบสินค้า / mock checkout
- **Session-based Cart** — ใช้ cookie session แทน user login

### หน้า Admin Dashboard
- **Admin Login** — ยืนยันตัวตนด้วย password + HTTP-only cookie
- **Product CRUD** — เพิ่ม แก้ไข ลบสินค้า พร้อม image upload
- **View Analytics** — ตารางและ bar chart แสดง organic vs boosted views
- **View Boost** — เลือกสินค้าและจำนวน เพื่อปั้มยอดวิว

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes (Route Handlers) |
| Database | SQLite (dev) · PostgreSQL (production) |
| ORM | Prisma |
| Auth | Password-based · HTTP-only cookie |
| Realtime | Server-Sent Events (SSE) |
| DevOps | Docker · Docker Compose · Nginx |
| Language | TypeScript (strict mode) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Clone & install

```bash
git clone https://github.com/Piyabordee/e-commerce-website.git
cd e-commerce-website
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# แก้ไขค่าใน .env ตามต้องการ
```

```.env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="your_password_here"
ADMIN_TOKEN_SECRET="your_random_secret_minimum_32_chars"
```

> Generate a secure secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Setup database & seed

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run dev server

```bash
npm run dev
```

เปิด [http://localhost:3000/piyabordee-shop](http://localhost:3000/piyabordee-shop)

---

## 🐳 Production (Docker)

```bash
# 1. Copy and configure production env
cp .env.production.example .env.production
# แก้ไข DB_PASSWORD, ADMIN_PASSWORD, ADMIN_TOKEN_SECRET

# 2. Start all services
docker compose --env-file .env.production up -d

# 3. Check status
docker compose ps
```

ดูรายละเอียดการ deploy และ backup ที่ [DOCKER.md](DOCKER.md)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home — product grid
│   ├── products/[id]/page.tsx    # Product detail
│   ├── cart/page.tsx             # Shopping cart
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Login
│   │   ├── products/page.tsx     # Product management
│   │   └── views/page.tsx        # Analytics & boost
│   └── api/                      # Route handlers
│       ├── products/
│       ├── cart/
│       ├── views/
│       ├── upload/
│       └── admin/login/
├── components/
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── CartIcon.tsx
│   ├── ViewCounter.tsx
│   ├── ViewCounterLive.tsx       # SSE real-time counter
│   ├── AddToCartButton.tsx
│   └── AdminSidebar.tsx
└── lib/
    ├── prisma.ts                 # Prisma client singleton
    ├── actions.ts                # Server actions
    └── utils.ts
```

---

## 🗄 Database Schema

```prisma
model Product {
  id          Int        @id @default(autoincrement())
  name        String
  description String
  price       Float
  image       String
  stock       Int
  viewCount   Int        @default(0)
  cartItems   CartItem[]
  viewLogs    ViewLog[]
}

model CartItem {
  id        Int     @id @default(autoincrement())
  sessionId String              // cookie-based, no login required
  productId Int
  quantity  Int     @default(1)
  @@unique([sessionId, productId])
}

model ViewLog {
  id        Int     @id @default(autoincrement())
  productId Int
  ip        String?
  isBoosted Boolean @default(false)  // organic vs boosted views
}
```

---

## 🌱 Seed Data

ตัวอย่างสินค้า 6 รายการที่ใส่มาใน seed:

| สินค้า | ราคา |
|--------|------|
| เสื้อยืดสีดำ | ฿299 |
| กางเกงยีนส์ | ฿890 |
| รองเท้าผ้าใบ | ฿1,590 |
| กระเป๋าสะพาย | ฿750 |
| หมวกแก๊ป | ฿199 |
| นาฬิกาข้อมือ | ฿2,490 |

---

## 📄 License

This project is for portfolio / educational purposes.

---

<p align="center">
  🎧 <strong>Vibe Coded 100%</strong> — every single line written with AI<br/>
  Made with ❤️ by <a href="https://github.com/Piyabordee">Piyabordee</a>
</p>
