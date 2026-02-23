'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BASE_PATH } from '@/lib/utils'

interface ViewStat {
  id: number
  name: string
  organicViews: number
  boostedViews: number
  totalViews: number
}

export default function AdminViewsPage() {
  const [viewStats, setViewStats] = useState<ViewStat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [setProductId, setSetProductId] = useState<number | null>(null)
  const [boostCount, setBoostCount] = useState('100')
  const [setViewCount, setSetViewCount] = useState('')
  const [boosting, setBoosting] = useState(false)
  const [setting, setSetting] = useState(false)

  const fetchViewStats = async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/views`)
      const data = await res.json()
      if (data.success) {
        setViewStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch view stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchViewStats()
  }, [])

  const handleBoost = async () => {
    if (!selectedProductId) {
      alert('กรุณาเลือกสินค้า')
      return
    }

    const count = parseInt(boostCount)
    if (count < 1) {
      alert('กรุณาระบุจำนวนที่ต้องการปั้มยอด')
      return
    }

    setBoosting(true)

    try {
      const res = await fetch(`${BASE_PATH}/api/views/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProductId, count }),
      })

      const data = await res.json()

      if (data.success) {
        alert(`🚀 ปั้มยอดวิว ${count.toLocaleString()} สำเร็จ!`)
        fetchViewStats()
      } else {
        alert(data.error || 'ไม่สามารถปั้มยอดได้')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    } finally {
      setBoosting(false)
    }
  }

  const handleSetViewCount = async () => {
    if (!setProductId) {
      alert('กรุณาเลือกสินค้า')
      return
    }

    const count = parseInt(setViewCount)
    if (isNaN(count) || count < 0) {
      alert('กรุณาระบุยอดวิวที่ถูกต้อง (>= 0)')
      return
    }

    setSetting(true)

    try {
      const res = await fetch(`${BASE_PATH}/api/views/set`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: setProductId, viewCount: count }),
      })

      const data = await res.json()

      if (data.success) {
        alert(`✅ กำหนดยอดวิวเป็น ${count.toLocaleString()} สำเร็จ!`)
        fetchViewStats()
      } else {
        alert(data.error || 'ไม่สามารถกำหนดยอดวิวได้')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    } finally {
      setSetting(false)
    }
  }

  const totalOrganicViews = viewStats.reduce((sum, s) => sum + s.organicViews, 0)
  const totalBoostedViews = viewStats.reduce((sum, s) => sum + s.boostedViews, 0)
  const totalViews = totalOrganicViews + totalBoostedViews

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
                className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                จัดการสินค้า
              </Link>
              <Link
                href="/admin/views"
                className="px-4 py-2 rounded-full bg-white/20 text-white font-medium"
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            👁 สถิติการเข้าชม
          </h1>
          <p className="text-white/60">
            เข้าชมทั้งหมด {totalViews.toLocaleString()} ครั้ง
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400/80 font-medium mb-1">Organic Views</p>
                <p className="text-3xl font-bold text-white">
                  {totalOrganicViews.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-500/30 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🌱</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400/80 font-medium mb-1">Boosted Views</p>
                <p className="text-3xl font-bold text-white">
                  {totalBoostedViews.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-500/30 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-sky-500/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400/80 font-medium mb-1">ยอดรวม</p>
                <p className="text-3xl font-bold text-white">
                  {totalViews.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-cyan-500/30 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👁</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boost Views Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-2xl mr-2">🚀</span>
            ปั้มยอดวิว (Boost Views)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2 font-medium">เลือกสินค้า</label>
              <select
                value={selectedProductId || ''}
                onChange={(e) =>
                  setSelectedProductId(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="" className="bg-slate-800">-- เลือกสินค้า --</option>
                {viewStats.map((stat) => (
                  <option key={stat.id} value={stat.id} className="bg-slate-800">
                    {stat.name} (วิวปัจจุบัน: {stat.totalViews.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 mb-2 font-medium">จำนวน</label>
              <input
                type="number"
                value={boostCount}
                onChange={(e) => setBoostCount(e.target.value)}
                min="1"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="100"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleBoost}
                disabled={boosting || !selectedProductId}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {boosting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    กำลังปั้ม...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Boost!
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Set View Count Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            กำหนดยอดวิว (Set View Count)
          </h2>
          <p className="text-white/60 mb-4 text-sm">
            ตั้งยอดวิวเป็นค่าที่ต้องการโดยตรง (จะปรับ ViewLog ให้ตรงกับยอดที่ตั้ง)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2 font-medium">เลือกสินค้า</label>
              <select
                value={setProductId || ''}
                onChange={(e) =>
                  setSetProductId(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="" className="bg-slate-800">-- เลือกสินค้า --</option>
                {viewStats.map((stat) => (
                  <option key={stat.id} value={stat.id} className="bg-slate-800">
                    {stat.name} (วิวปัจจุบัน: {stat.totalViews.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 mb-2 font-medium">ยอดวิวที่ต้องการ</label>
              <input
                type="number"
                value={setViewCount}
                onChange={(e) => setSetViewCount(e.target.value)}
                min="0"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="1000"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSetViewCount}
                disabled={setting || !setProductId}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {setting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    กำหนดยอด
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* View Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : viewStats.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/10">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-white/60 text-xl">ไม่พบข้อมูล</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <span className="text-xl mr-2">📊</span>
                กราฟยอดวิวรวม
              </h3>
              <div className="space-y-4">
                {viewStats.map((stat) => {
                  const maxViews = Math.max(...viewStats.map((s) => s.totalViews), 1)
                  const percentage = (stat.totalViews / maxViews) * 100
                  return (
                    <div key={stat.id}>
                      <div className="flex justify-between text-sm text-white/80 mb-2">
                        <span className="font-medium">{stat.name}</span>
                        <span className="text-blue-400 font-bold">
                          {stat.totalViews.toLocaleString()} วิว
                        </span>
                      </div>
                      <div className="h-10 bg-white/10 rounded-full overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-end pr-3 text-sm font-bold text-white transition-all duration-500"
                          style={{ width: `${(stat.organicViews / maxViews) * 100}%` }}
                          title={`Organic: ${stat.organicViews}`}
                        >
                          {stat.organicViews > 0 && stat.organicViews > maxViews * 0.05 && stat.organicViews}
                        </div>
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-end pr-3 text-sm font-bold text-white transition-all duration-500"
                          style={{ width: `${(stat.boostedViews / maxViews) * 100}%` }}
                          title={`Boosted: ${stat.boostedViews}`}
                        >
                          {stat.boostedViews > 0 && stat.boostedViews > maxViews * 0.05 && stat.boostedViews}
                        </div>
                      </div>
                      <div className="flex text-xs text-white/60 mt-1">
                        <span className="flex items-center mr-4">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Organic: {stat.organicViews.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          Boosted: {stat.boostedViews.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stats Table */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <span className="text-xl mr-2">📋</span>
                  ตารางสถิติรายสินค้า
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-white/80 font-medium">สินค้า</th>
                      <th className="px-6 py-4 text-right text-white/80 font-medium">
                        Organic
                      </th>
                      <th className="px-6 py-4 text-right text-white/80 font-medium">
                        Boosted
                      </th>
                      <th className="px-6 py-4 text-right text-white/80 font-medium">
                        รวม
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewStats.map((stat) => (
                      <tr key={stat.id} className="border-t border-white/10 hover:bg-white/5 transition">
                        <td className="px-6 py-4 text-white font-medium">
                          {stat.name}
                        </td>
                        <td className="px-6 py-4 text-right text-green-400 font-bold">
                          {stat.organicViews.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-blue-400 font-bold">
                          {stat.boostedViews.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-bold text-lg">
                          {stat.totalViews.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
