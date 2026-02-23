export const BASE_PATH = '/piyabordee-shop'

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(price)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('th-TH').format(num)
}
