import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddToCartButton } from '@/components/AddToCartButton'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch
global.alert = vi.fn()

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location
    delete (window as any).location
    window.location = { href: '' } as any
  })

  describe('Rendering', () => {
    it('should render enabled button when stock > 0', () => {
      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="เสื้อยืดสีดำ"
          price={299}
        />
      )

      const button = screen.getByRole('button', { name: /เพิ่มลงตะกร้า/ })
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
      expect(button).not.toHaveClass('bg-gray-300', 'cursor-not-allowed')
    })

    it('should render gradient classes for in-stock items', () => {
      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="Test Product"
          price={100}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-cyan-600')
    })

    it('should render disabled button when stock = 0', () => {
      render(
        <AddToCartButton
          productId={1}
          stock={0}
          name="สินค้าหมด"
          price={299}
        />
      )

      const button = screen.getByRole('button', { name: 'สินค้าหมด' })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
      expect(button).toHaveClass('bg-gray-300', 'cursor-not-allowed')
    })

    it('should show cart icon in button text', () => {
      render(
        <AddToCartButton
          productId={1}
          stock={5}
          name="Test"
          price={100}
        />
      )

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should alert "สินค้าหมด" when clicking out of stock item', async () => {
      const user = userEvent.setup()

      render(
        <AddToCartButton
          productId={1}
          stock={0}
          name="เสื้อยืดสีดำ"
          price={299}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(global.alert).toHaveBeenCalledWith('สินค้าหมด')
    })

    it('should call API when adding to cart', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: {} }),
      } as Response)

      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="เสื้อยืดสีดำ"
          price={299}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockFetch).toHaveBeenCalledWith('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 1, quantity: 1 }),
      })
    })

    it('should show success alert with Thai text', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: {} }),
      } as Response)

      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="เสื้อยืดสีดำ"
          price={299}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('เพิ่ม "เสื้อยืดสีดำ" ลงในตะกร้าเรียบร้อย')
      )
    })

    it('should show formatted price in success message', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: {} }),
      } as Response)

      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="เสื้อยืดสีดำ"
          price={299}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('฿299.00')
      )
    })

    it('should redirect to cart page on success', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: {} }),
      } as Response)

      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="Test"
          price={100}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(window.location.href).toBe('/cart')
    })
  })

  describe('Error Handling', () => {
    it('should show error message when API returns error', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: false, error: 'สินค้าไม่เพียงพอ' }),
      } as Response)

      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="Test"
          price={100}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(global.alert).toHaveBeenCalledWith('สินค้าไม่เพียงพอ')
    })

    it('should show generic error message when no error in response', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: false }),
      } as Response)

      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="Test"
          price={100}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(global.alert).toHaveBeenCalledWith('ไม่สามารถเพิ่มสินค้าได้')
    })

    it('should show generic error when fetch throws', async () => {
      const user = userEvent.setup()
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(
        <AddToCartButton
          productId={1}
          stock={10}
          name="Test"
          price={100}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(global.alert).toHaveBeenCalledWith('เกิดข้อผิดพลาด')
    })
  })

  describe('Props', () => {
    it('should pass correct productId to API', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true }),
      } as Response)

      render(
        <AddToCartButton
          productId={42}
          stock={10}
          name="Test"
          price={100}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cart',
        expect.objectContaining({
          body: JSON.stringify({ productId: 42, quantity: 1 }),
        })
      )
    })

    it('should always send quantity: 1', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true }),
      } as Response)

      render(
        <AddToCartButton
          productId={1}
          stock={100}
          name="Test"
          price={100}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.quantity).toBe(1)
    })
  })
})
