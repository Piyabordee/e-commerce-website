'use client'

import { useState, useEffect, useRef } from 'react'

interface ViewCounterLiveProps {
  productId: number
  initialViewCount: number
}

/**
 * Real-time view counter using Server-Sent Events (SSE)
 * Displays view count that updates automatically when other users visit the product
 */
export function ViewCounterLive({ productId, initialViewCount }: ViewCounterLiveProps) {
  const [viewCount, setViewCount] = useState(initialViewCount)
  const [isLive, setIsLive] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource(`/api/views/stream?productId=${productId}`)
    eventSourceRef.current = eventSource

    // Connection opened
    eventSource.onopen = () => {
      setIsLive(true)
      console.log('SSE connected for product', productId)
    }

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (typeof data.viewCount === 'number') {
          setViewCount(data.viewCount)
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      setIsLive(false)
      eventSource.close()
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      setIsLive(false)
    }
  }, [productId])

  return (
    <div className="flex items-center space-x-2">
      {/* Live indicator */}
      {isLive && (
        <span className="flex items-center">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </span>
      )}

      {/* Eye icon and count */}
      <div className="flex items-center space-x-2 text-gray-600">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span className="text-sm font-medium">
          เข้าชม {viewCount.toLocaleString()} ครั้ง
        </span>
      </div>
    </div>
  )
}
