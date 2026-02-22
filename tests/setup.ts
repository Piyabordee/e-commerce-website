import { PrismaClient } from '@prisma/client'
import { vi, afterAll, afterEach } from 'vitest'

// Setup test environment
process.env.DATABASE_URL = 'file:./test.db'
process.env.ADMIN_PASSWORD = 'test-admin-password'
process.env.ADMIN_TOKEN_SECRET = 'test-admin-token-secret'

// Create Prisma client for testing
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Mock next/headers for all tests
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn((name: string) => {
      if (name === 'admin_token' && (global as any).__mockAdminToken) {
        return { value: (global as any).__mockAdminToken }
      }
      if (name === 'session_id' && (global as any).__mockSessionId) {
        return { value: (global as any).__mockSessionId }
      }
      return undefined
    }),
    set: vi.fn(),
  }),
}))

// Helper function to set mock admin token
export function setMockAdminToken(token?: string) {
  ;(global as any).__mockAdminToken = token ?? process.env.ADMIN_TOKEN_SECRET
}

export function clearMockAdminToken() {
  delete (global as any).__mockAdminToken
}

// Helper function to set mock session ID
export function setMockSessionId(sessionId: string) {
  ;(global as any).__mockSessionId = sessionId
}

export function clearMockSessionId() {
  delete (global as any).__mockSessionId
}

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect()
})

// Clean up database after each test
afterEach(async () => {
  await prisma.cartItem.deleteMany()
  await prisma.viewLog.deleteMany()
  await prisma.product.deleteMany()
})
