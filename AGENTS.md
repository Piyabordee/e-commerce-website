# AGENTS.md — ร้านของปิยบดี E-Commerce Specification

## Project Overview

เว็บไซต์ E-Commerce ของ **ร้านของปิยบดี** ประกอบด้วย **หน้าเว็บลูกค้า** และ **หน้า Admin** พร้อมระบบนับยอดเข้าชม, ตะกร้าสินค้า, และเครื่องมือปั้มยอดวิว

**GitHub**: https://github.com/Piyabordee
**ปี**: 2026

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Frontend     | Next.js 14 (App Router) + Tailwind CSS |
| Backend API  | Next.js API Routes (Route Handlers) |
| Database     | SQLite via Prisma ORM             |
| Auth (Admin) | Simple password-based (env var)   |
| Language     | TypeScript                        |
| Package Mgr  | npm                               |

## Project Structure

```
e-commerce-website/
├── AGENTS.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
├── .env                        # ADMIN_PASSWORD, DATABASE_URL
├── prisma/
│   └── schema.prisma           # Product, CartItem, ViewLog models
├── public/
│   └── images/                 # Product images (placeholder)
├── src/
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── utils.ts            # Shared helpers
│   ├── app/
│   │   ├── layout.tsx          # Root layout (html, body, Tailwind)
│   │   ├── page.tsx            # Home — product listing grid
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Product detail + add-to-cart
│   │   ├── cart/
│   │   │   └── page.tsx        # Cart page — view/edit/checkout
│   │   ├── admin/
│   │   │   ├── page.tsx        # Admin dashboard (login gate)
│   │   │   ├── products/
│   │   │   │   └── page.tsx    # Manage products (CRUD)
│   │   │   └── views/
│   │   │       └── page.tsx    # View analytics + boost views
│   │   └── api/
│   │       ├── products/
│   │       │   ├── route.ts        # GET all, POST create
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET one, PUT update, DELETE
│   │       ├── cart/
│   │       │   ├── route.ts        # GET cart, POST add item
│   │       │   └── [id]/
│   │       │       └── route.ts    # PUT update qty, DELETE remove
│   │       ├── views/
│   │       │   ├── route.ts        # GET view stats
│   │       │   ├── track/
│   │       │   │   └── route.ts    # POST track a page view
│   │       │   └── boost/
│   │       │       └── route.ts    # POST boost views (admin)
│   │       └── admin/
│   │           └── login/
│   │               └── route.ts    # POST login (returns token/cookie)
│   └── components/
│       ├── Navbar.tsx
│       ├── ProductCard.tsx
│       ├── CartIcon.tsx
│       ├── ViewCounter.tsx
│       └── AdminSidebar.tsx
```

## Database Schema (Prisma)

```prisma
model Product {
  id          Int       @id @default(autoincrement())
  name        String
  description String
  price       Float
  image       String    @default("/images/placeholder.png")
  stock       Int       @default(0)
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  cartItems   CartItem[]
  viewLogs    ViewLog[]
}

model CartItem {
  id        Int      @id @default(autoincrement())
  sessionId String               // ใช้ cookie/session ID แทน user auth
  productId Int
  quantity  Int      @default(1)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([sessionId, productId])
}

model ViewLog {
  id        Int      @id @default(autoincrement())
  productId Int
  ip        String?
  userAgent String?
  isBoosted Boolean  @default(false)   // true = ปั้มยอด, false = organic
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

---

## Features & Functional Requirements

### 1. Customer-Facing Pages (หน้าเว็บลูกค้า)

#### 1.1 Home Page (`/`)
- แสดง Product Grid (รูป, ชื่อ, ราคา, ยอดวิว)
- กดเข้าไปหน้า Product Detail
- แสดงจำนวนสินค้าในตะกร้าที่ Navbar

#### 1.2 Product Detail (`/products/[id]`)
- แสดงรายละเอียดสินค้า (รูป, ชื่อ, คำอธิบาย, ราคา, stock)
- แสดงยอดเข้าชม (viewCount)
- ปุ่ม "เพิ่มลงตะกร้า" — เรียก `POST /api/cart`
- เมื่อเปิดหน้านี้ → เรียก `POST /api/views/track` อัตโนมัติ เพื่อนับ view

#### 1.3 Cart Page (`/cart`)
- แสดงรายการสินค้าในตะกร้า (ชื่อ, จำนวน, ราคารวม)
- ปรับจำนวน (+/-) → `PUT /api/cart/[id]`
- ลบสินค้า → `DELETE /api/cart/[id]`
- แสดงราคารวมทั้งหมด
- ปุ่ม "Checkout" (MVP = แค่แสดง alert สำเร็จ แล้วล้างตะกร้า)

### 2. Admin Pages (หน้า Admin)

#### 2.1 Admin Login (`/admin`)
- ฟอร์มใส่รหัสผ่าน → `POST /api/admin/login`
- เทียบกับ `ADMIN_PASSWORD` ใน env
- สำเร็จ → set cookie `admin_token` แล้ว redirect ไปหน้า dashboard
- ล้มเหลว → แสดง error

#### 2.2 Product Management (`/admin/products`)
- ตาราง list สินค้าทั้งหมด
- ฟอร์ม เพิ่ม/แก้ไข สินค้า (name, description, price, image URL, stock)
- ปุ่มลบสินค้า
- CRUD ผ่าน `/api/products`

#### 2.3 View Analytics & Boost (`/admin/views`)
- ตารางแสดง: สินค้า, ยอด organic views, ยอด boosted views, ยอดรวม
- กราฟง่ายๆ (bar chart) แสดงยอดวิวแต่ละสินค้า
- **ปั้มยอดวิว**: เลือกสินค้า → ใส่จำนวน → กด "Boost" → `POST /api/views/boost`
  - body: `{ productId: number, count: number }`
  - สร้าง ViewLog records จำนวน `count` รายการ โดย `isBoosted = true`
  - อัพเดท `product.viewCount += count`

---

## API Endpoints

### Products

| Method | Endpoint              | Description         | Auth  |
| ------ | --------------------- | ------------------- | ----- |
| GET    | `/api/products`       | List all products   | No    |
| POST   | `/api/products`       | Create product      | Admin |
| GET    | `/api/products/[id]`  | Get product detail  | No    |
| PUT    | `/api/products/[id]`  | Update product      | Admin |
| DELETE | `/api/products/[id]`  | Delete product      | Admin |

### Cart

| Method | Endpoint          | Description          | Auth |
| ------ | ----------------- | -------------------- | ---- |
| GET    | `/api/cart`       | Get cart items (by sessionId cookie) | No |
| POST   | `/api/cart`       | Add item to cart     | No   |
| PUT    | `/api/cart/[id]`  | Update item quantity | No   |
| DELETE | `/api/cart/[id]`  | Remove item from cart| No   |

### Views

| Method | Endpoint            | Description                  | Auth  |
| ------ | ------------------- | ---------------------------- | ----- |
| GET    | `/api/views`        | Get view stats per product   | Admin |
| POST   | `/api/views/track`  | Track a page view (organic)  | No    |
| POST   | `/api/views/boost`  | Boost views for a product    | Admin |

### Admin

| Method | Endpoint            | Description      | Auth |
| ------ | ------------------- | ---------------- | ---- |
| POST   | `/api/admin/login`  | Admin login      | No   |

---

## Authentication & Session

- **Admin Auth**: Password จาก `ADMIN_PASSWORD` env var → ตรวจผ่าน cookie `admin_token` (simple hashed token)
- **Cart Session**: ใช้ cookie `session_id` (UUID) — สร้างอัตโนมัติถ้ายังไม่มี ไม่ต้อง login

## Coding Conventions

- ใช้ TypeScript strict mode
- ใช้ `async/await` ไม่ใช้ `.then()`
- API response format: `{ success: boolean, data?: any, error?: string }`
- ใช้ Prisma client singleton pattern (`src/lib/prisma.ts`)
- Component ใช้ React Server Components เป็นหลัก ยกเว้นที่ต้อง interactive ให้ใส่ `"use client"`
- Tailwind CSS utility classes เท่านั้น ไม่เขียน custom CSS
- ภาษาใน UI: **ภาษาไทย** (ปุ่ม, label, ข้อความ)
- Error handling: try/catch ทุก API route, return proper HTTP status codes

## Design System & Color Theme

### Primary Colors (Blue/Cyan Theme)

| Usage | Gradient/Color | Example |
| ----- | -------------- | ------- |
| Primary Buttons | `from-blue-600 to-cyan-600` | เพิ่มลงตะกร้า, ช้อปเลย |
| Primary Hover | `hover:from-blue-700 hover:to-cyan-700` | Button hover states |
| Price Text | `from-blue-600 to-cyan-600` (bg-clip-text) | ราคาสินค้า |
| Logo/Branding | `from-blue-600 to-cyan-600` | ร้านของปิยบดี |
| Link Hover | `hover:text-blue-600` | Navigation links |
| Backgrounds | `from-sky-50 to-white` | Page backgrounds |
| Admin Background | `from-slate-900 via-blue-900 to-slate-900` | Admin panel |
| Admin Login | `from-blue-900 via-cyan-900 to-sky-800` | Login page |

### Secondary Colors

| Purpose | Color |
| ------- | ----- |
| Success | `green-500` / `emerald-500` |
| Warning | `orange-500` |
| Error/Out of Stock | `red-500` |
| Info | `blue-500` / `cyan-500` |

### UI Patterns

- **Gradients**: ใช้ `bg-gradient-to-r` สำหรับ buttons, `bg-clip-text` สำหรับข้อความราคา
- **Rounded Corners**: `rounded-2xl` (cards), `rounded-full` (buttons, badges)
- **Shadows**: `shadow-lg` / `shadow-xl` / `shadow-2xl`
- **Transitions**: `transition-all duration-300` for smooth interactions
- **Hover Effects**: `hover:scale-[1.02]` / `hover:shadow-xl` for interactive elements

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in your values:

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="your_strong_password_here"
ADMIN_TOKEN_SECRET="your_random_secret_minimum_32_chars"
```

## Development Commands

```bash
npm install                  # Install dependencies
npx prisma generate          # Generate Prisma client
npx prisma db push           # Push schema to DB
npx prisma db seed           # Seed sample products
npm run dev                  # Start dev server (localhost:3000)
```

## Seed Data

สร้างสินค้าตัวอย่างอย่างน้อย 6 รายการ ใน `prisma/seed.ts`:

| ชื่อสินค้า         | ราคา (บาท) | stock |
| ------------------- | ----------- | ----- |
| เสื้อยืดสีดำ        | 299         | 50    |
| กางเกงยีนส์         | 890         | 30    |
| รองเท้าผ้าใบ        | 1,590       | 20    |
| กระเป๋าสะพาย        | 750         | 15    |
| หมวกแก๊ป            | 199         | 100   |
| นาฬิกาข้อมือ        | 2,490       | 10    |

---

## MVP Scope / Out of Scope

### In Scope (MVP)
- [x] Product listing & detail with view count
- [x] Shopping cart (add, update qty, remove, clear)
- [x] Mock checkout (alert success + clear cart)
- [x] Admin login (password-based)
- [x] Admin CRUD products
- [x] Admin view analytics (organic vs boosted)
- [x] Admin boost views (ปั้มยอด)
- [x] View tracking (auto track on page visit)

### Out of Scope (Future)
- [ ] User registration / login
- [ ] Real payment gateway
- [ ] Order history
- [ ] Product categories / search / filter
- [ ] Image upload (ใช้ URL แทน)
- [ ] Email notifications
- [ ] Multi-language support
