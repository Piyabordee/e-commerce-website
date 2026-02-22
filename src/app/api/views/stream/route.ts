import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * SSE Endpoint for real-time view updates
 * Client connects and receives updates when product view count changes
 *
 * Usage: new EventSource('/api/views/stream?productId=1')
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId')

  if (!productId) {
    return new Response('Product ID is required', { status: 400 })
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial view count
      try {
        const product = await prisma.product.findUnique({
          where: { id: parseInt(productId) },
          select: { viewCount: true },
        })

        if (product) {
          const data = `data: ${JSON.stringify({ viewCount: product.viewCount })}\n\n`
          controller.enqueue(encoder.encode(data))
        }

        // Set up polling to check for updates (simple approach)
        // In production, you'd use PostgreSQL LISTEN/NOTIFY or a pub/sub service
        const intervalId = setInterval(async () => {
          try {
            const updatedProduct = await prisma.product.findUnique({
              where: { id: parseInt(productId) },
              select: { viewCount: true },
            })

            if (updatedProduct) {
              const data = `data: ${JSON.stringify({ viewCount: updatedProduct.viewCount })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          } catch (error) {
            console.error('Error polling for view updates:', error)
          }
        }, 2000) // Poll every 2 seconds

        // Cleanup when client disconnects
        request.signal.addEventListener('abort', () => {
          clearInterval(intervalId)
          controller.close()
        })
      } catch (error) {
        console.error('Error in SSE stream:', error)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}
