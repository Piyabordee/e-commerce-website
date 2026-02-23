'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'

/**
 * Track a product view
 * This is a Server Action that runs on the server when a product page is visited
 */
export async function trackProductView(productId: number) {
  try {
    // Create view log
    await prisma.viewLog.create({
      data: {
        productId,
        ip: null, // Server actions don't have access to request headers directly
        userAgent: null,
        isBoosted: false,
      },
    })

    // Update product view count
    await prisma.product.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    // Revalidate the product page to show updated count
    revalidatePath(`/products/${productId}`)
    revalidatePath('/') // Also revalidate home page

    return { success: true }
  } catch (error) {
    console.error('Failed to track view:', error)
    return { success: false, error: 'Failed to track view' }
  }
}
