'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatPrice, BASE_PATH } from '@/lib/utils'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  stock: number
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    stock: '',
  })
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/products`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingProduct
      ? `${BASE_PATH}/api/products/${editingProduct.id}`
      : `${BASE_PATH}/api/products`
    const method = editingProduct ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert(editingProduct ? '✅ แก้ไขสินค้าสำเร็จ' : '✅ เพิ่มสินค้าสำเร็จ')
        setShowForm(false)
        setEditingProduct(null)
        setFormData({
          name: '',
          description: '',
          price: '',
          image: '',
          stock: '',
        })
        setImagePreview('')
        setImageInputMode('url')
        fetchProducts()
      } else {
        alert(data.error || 'ไม่สามารถบันทึกข้อมูลได้')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      stock: product.stock.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ ยืนยันที่จะลบสินค้านี้?')) return

    try {
      const res = await fetch(`${BASE_PATH}/api/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('✅ ลบสินค้าสำเร็จ')
        fetchProducts()
      } else {
        alert('ไม่สามารถลบสินค้าได้')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      stock: '',
    })
    setImagePreview('')
    setImageInputMode('url')
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }

    setUploadingFile(true)

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)

      const res = await fetch(`${BASE_PATH}/api/upload`, {
        method: 'POST',
        body: uploadData,
      })

      const data = await res.json()

      if (data.success) {
        setFormData({ ...formData, image: data.data.url })
        setImagePreview(data.data.url)
      } else {
        alert(data.error || 'ไม่สามารถอัพโหลดรูปภาพได้')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleImageModeChange = (mode: 'url' | 'upload') => {
    setImageInputMode(mode)
    if (mode === 'url' && imagePreview && !formData.image.startsWith('http')) {
      // If switching to URL mode and we have an uploaded image, keep the image
      setImagePreview('')
    }
  }

  // Reset image preview when opening the form for editing
  useEffect(() => {
    if (showForm && editingProduct) {
      setImagePreview(editingProduct.image)
    } else if (showForm && !editingProduct) {
      setImagePreview('')
      setImageInputMode('url')
    }
  }, [showForm, editingProduct])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Admin Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-2xl">⚙️</span>
              <span className="text-xl font-bold text-white">ร้านของปิยบดี - Admin</span>
            </Link>

            <nav className="flex items-center space-x-1">
              <Link
                href="/admin"
                className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                แดชบอร์ด
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2 rounded-full bg-white/20 text-white font-medium"
              >
                จัดการสินค้า
              </Link>
              <Link
                href="/admin/views"
                className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                สถิติวิว
              </Link>
              <Link
                href="/"
                className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all ml-4"
              >
                ดูหน้าเว็บ →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📦 จัดการสินค้า
            </h1>
            <p className="text-white/60">
              {products.length} รายการ
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มสินค้า
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingProduct ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-white/60 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">ชื่อสินค้า *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="เสื้อยืดสีดำ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">ราคา (บาท) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="299"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 mb-2 font-medium">รูปภาพ *</label>

                    {/* Image Input Mode Toggle */}
                    <div className="flex space-x-2 mb-3">
                      <button
                        type="button"
                        onClick={() => handleImageModeChange('url')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                          imageInputMode === 'url'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        🔗 วางลิงก์รูปภาพ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImageModeChange('upload')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                          imageInputMode === 'upload'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        📤 อัพโหลดไฟล์
                      </button>
                    </div>

                    {/* URL Input Mode */}
                    {imageInputMode === 'url' ? (
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value })
                          setImagePreview(e.target.value)
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="https://images.unsplash.com/..."
                        required
                      />
                    ) : (
                      /* File Upload Mode */
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFile}
                            className="flex-1 bg-white/10 border-2 border-dashed border-white/30 hover:border-blue-500 text-white py-4 rounded-xl transition flex flex-col items-center justify-center"
                          >
                            {uploadingFile ? (
                              <>
                                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-sm">กำลังอัพโหลด...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-8 h-8 mb-2 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm">คลิกเพื่อเลือกไฟล์</span>
                                <span className="text-xs text-white/40 mt-1">JPG, PNG, GIF, WEBP (สูงสุด 5MB)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Image Preview */}
                    {(formData.image || imagePreview) && (
                      <div className="mt-3 relative">
                        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                          <Image
                            src={formData.image || imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">สต็อก *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">รายละเอียด *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="เสื้อยืดคอกลม ทำจาก cotton 100%..."
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {editingProduct ? '💾 บันทึกการแก้ไข' : '✅ เพิ่มสินค้า'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/10">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-white/60 text-xl">ไม่พบสินค้า</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                        หมดสต็อก
                      </span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      เหลือ {product.stock}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-white text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      {formatPrice(product.price)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      product.stock === 0
                        ? 'bg-red-500/20 text-red-400'
                        : product.stock <= 5
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {product.stock === 0
                        ? 'หมด'
                        : product.stock <= 5
                        ? 'น้อย'
                        : `สต็อก ${product.stock}`}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-xl font-bold hover:bg-blue-500/30 transition flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500/20 text-red-400 py-2 px-4 rounded-xl font-bold hover:bg-red-500/30 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
