import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ViewCounter } from '@/components/ViewCounter'

describe('ViewCounter', () => {
  describe('Rendering', () => {
    it('should render eye icon SVG', () => {
      render(<ViewCounter viewCount={0} />)

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render view count with Thai locale formatting', () => {
      render(<ViewCounter viewCount={1234567} />)

      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('should display "เข้าชม" label', () => {
      render(<ViewCounter viewCount={100} />)

      expect(screen.getByText(/เข้าชม/)).toBeInTheDocument()
    })

    it('should display "ครั้ง" suffix', () => {
      render(<ViewCounter viewCount={5} />)

      expect(screen.getByText(/ครั้ง/)).toBeInTheDocument()
    })

    it('should render complete text in correct format', () => {
      render(<ViewCounter viewCount={42} />)

      expect(screen.getByText('เข้าชม 42 ครั้ง')).toBeInTheDocument()
    })
  })

  describe('View Count Display', () => {
    it('should display zero views', () => {
      render(<ViewCounter viewCount={0} />)

      expect(screen.getByText('เข้าชม 0 ครั้ง')).toBeInTheDocument()
    })

    it('should display single digit views', () => {
      render(<ViewCounter viewCount={5} />)

      expect(screen.getByText('เข้าชม 5 ครั้ง')).toBeInTheDocument()
    })

    it('should display thousands with comma separator', () => {
      render(<ViewCounter viewCount={1500} />)

      expect(screen.getByText('เข้าชม 1,500 ครั้ง')).toBeInTheDocument()
    })

    it('should display millions with correct formatting', () => {
      render(<ViewCounter viewCount={2500000} />)

      expect(screen.getByText('เข้าชม 2,500,000 ครั้ง')).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      render(<ViewCounter viewCount={999999999} />)

      expect(screen.getByText('เข้าชม 999,999,999 ครั้ง')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have text-gray-600 color', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const div = container.querySelector('.text-gray-600')
      expect(div).toBeInTheDocument()
    })

    it('should use flex layout', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const div = container.querySelector('.flex')
      expect(div).toBeInTheDocument()
    })

    it('should have space between elements', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const div = container.querySelector('.space-x-2')
      expect(div).toBeInTheDocument()
    })

    it('should have small text size for count', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const span = container.querySelector('.text-sm')
      expect(span).toBeInTheDocument()
    })
  })

  describe('Icon', () => {
    it('should have correct icon dimensions', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-5', 'h-5')
    })

    it('should have stroke-current color', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })

    it('should have correct stroke width', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const paths = container.querySelectorAll('path')
      paths.forEach(path => {
        expect(path).toHaveAttribute('strokeWidth', '2')
      })
    })

    it('should have correct viewBox', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('should have fill="none"', () => {
      const { container } = render(<ViewCounter viewCount={100} />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'none')
    })
  })

  describe('Props', () => {
    it('should accept viewCount prop', () => {
      render(<ViewCounter viewCount={999} />)

      expect(screen.getByText('เข้าชม 999 ครั้ง')).toBeInTheDocument()
    })

    it('should handle undefined viewCount gracefully', () => {
      // @ts-expect-error - Testing undefined prop
      render(<ViewCounter viewCount={undefined} />)

      // Should render but show NaN or similar
      const text = screen.getByText(/เข้าชม/)
      expect(text).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle viewCount of 1 correctly', () => {
      render(<ViewCounter viewCount={1} />)

      expect(screen.getByText('เข้าชม 1 ครั้ง')).toBeInTheDocument()
    })

    it('should display numbers with multiple commas', () => {
      render(<ViewCounter viewCount={1234567890} />)

      expect(screen.getByText('1,234,567,890')).toBeInTheDocument()
    })
  })
})
