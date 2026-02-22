import { describe, it, expect } from 'vitest'
import { formatPrice, formatNumber } from '@/lib/utils'

describe('formatPrice', () => {
  it('should format Thai Baht currency correctly', () => {
    expect(formatPrice(299)).toBe('฿299.00')
    expect(formatPrice(1000)).toBe('฿1,000.00')
    expect(formatPrice(1590.50)).toBe('฿1,590.50')
    expect(formatPrice(999999)).toBe('฿999,999.00')
  })

  it('should handle zero values', () => {
    expect(formatPrice(0)).toBe('฿0.00')
  })

  it('should handle decimal precision correctly', () => {
    expect(formatPrice(99.9)).toBe('฿99.90')
    expect(formatPrice(100.009)).toBe('฿100.01')
    expect(formatPrice(0.5)).toBe('฿0.50')
  })

  it('should handle negative values', () => {
    expect(formatPrice(-100)).toBe('฿-100.00')
  })

  it('should handle large numbers', () => {
    expect(formatPrice(1000000)).toBe('฿1,000,000.00')
    expect(formatPrice(1234567.89)).toBe('฿1,234,567.89')
  })

  it('should handle values from seed data', () => {
    expect(formatPrice(299)).toBe('฿299.00')     // เสื้อยืดสีดำ
    expect(formatPrice(890)).toBe('฿890.00')     // กางเกงยีนส์
    expect(formatPrice(1590)).toBe('฿1,590.00')  // รองเท้าผ้าใบ
    expect(formatPrice(750)).toBe('฿750.00')     // กระเป๋าสะพาย
    expect(formatPrice(199)).toBe('฿199.00')     // หมวกแก๊ป
    expect(formatPrice(2490)).toBe('฿2,490.00')  // นาฬิกาข้อมือ
  })
})

describe('formatNumber', () => {
  it('should format numbers with Thai locale', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(10000)).toBe('10,000')
    expect(formatNumber(100000)).toBe('100,000')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle single digit numbers', () => {
    expect(formatNumber(1)).toBe('1')
    expect(formatNumber(9)).toBe('9')
  })

  it('should handle large numbers', () => {
    expect(formatNumber(999999999)).toBe('999,999,999')
    expect(formatNumber(1000000000)).toBe('1,000,000,000')
  })

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000')
  })
})
