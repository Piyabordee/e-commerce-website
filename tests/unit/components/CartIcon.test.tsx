import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CartIcon } from '@/components/CartIcon'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock window.addEventListener and window.removeEventListener
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

describe('CartIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
  })

  describe('Rendering', () => {
    it('should render cart icon SVG', () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      } as Response)

      render(<CartIcon />)

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render link to cart page', () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      } as Response)

      render(<CartIcon />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/cart')
    })

    it('should have hover classes', () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      } as Response)

      render(<CartIcon />)

      const link = screen.getByRole('link')
      expect(link).toHaveClass('hover:bg-blue-50')
    })
  })

  describe('Cart Count Badge', () => {
    it('should not display badge when cart is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      } as Response)

      render(<CartIcon />)

      await waitFor(() => {
        expect(screen.queryByText('0')).not.toBeInTheDocument()
      })
    })

    it('should display count badge when cart has items', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [
            { id: 1, quantity: 2 },
            { id: 2, quantity: 1 },
          ],
        }),
      } as Response)

      render(<CartIcon />)

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument()
      })
    })

    it('should display 9+ for counts >= 10', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [
            { id: 1, quantity: 5 },
            { id: 2, quantity: 5 },
          ],
        }),
      } as Response)

      render(<CartIcon />)

      await waitFor(() => {
        expect(screen.getByText('9+')).toBeInTheDocument()
      })
    })

    it('should display 9+ for counts > 9', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [
            { id: 1, quantity: 15 },
          ],
        }),
      } as Response)

      render(<CartIcon />)

      await waitFor(() => {
        expect(screen.getByText('9+')).toBeInTheDocument()
      })
    })

    it('should have gradient classes on badge', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [{ id: 1, quantity: 1 }],
        }),
      } as Response)

      render(<CartIcon />)

      await waitFor(() => {
        const badge = screen.getByText('1').parentElement
        expect(badge).toHaveClass('bg-gradient-to-r', 'from-red-500', 'to-pink-500')
      })
    })

    it('should have bounce animation on badge', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [{ id: 1, quantity: 1 }],
        }),
      } as Response)

      render(<CartIcon />)

      await waitFor(() => {
        const badge = screen.getByText('1').parentElement
        expect(badge).toHaveClass('animate-bounce')
      })
    })
  })

  describe('API Integration', () => {
    it('should fetch cart count on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      } as Response)

      render(<CartIcon />)

      expect(mockFetch).toHaveBeenCalledWith('/api/cart')
    })

    it('should calculate total quantity from cart items', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [
            { id: 1, quantity: 2 },
            { id: 2, quantity: 3 },
            { id: 3, quantity: 1 },
          ],
        }),
      } as Response)

      render(<CartIcon />)

      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<CartIcon />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Event Listeners', () => {
    it('should add focus event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      } as Response)

      render(<CartIcon />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove focus event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      } as Response)

      const { unmount } = render(<CartIcon />)
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })
})
