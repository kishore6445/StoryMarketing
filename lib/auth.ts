// Authentication utilities - configure when you add a database integration
// This demonstrates the auth flow that will be implemented

import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session management with JWT
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  
  return token
}

export async function validateSession(sessionToken: string) {
  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET)
    return payload as { userId: string; role: string }
  } catch (error) {
    return null
  }
}

export async function destroySession(sessionToken: string) {
  // JWT tokens are stateless, client just needs to remove the cookie
  return true
}

// Get user from request token
export async function getUserFromToken(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = await validateSession(token)
    
    if (!payload) {
      return null
    }

    return {
      id: payload.userId,
      role: payload.role
    }
  } catch (error) {
    console.error('[v0] Error getting user from token:', error)
    return null
  }
}

// Alias for Next.js Request compatibility
export async function getUserFromRequest(request: Request | { cookies: { get: (name: string) => { value: string } | undefined } }) {
  try {
    // Check Authorization header first
    if ('headers' in request && request.headers) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const payload = await validateSession(token)
        
        if (payload) {
          return {
            id: payload.userId,
            role: payload.role
          }
        }
      }
    }

    // Fallback to cookie-based auth
    if ('cookies' in request) {
      const sessionCookie = request.cookies.get('session')
      if (sessionCookie) {
        const payload = await validateSession(sessionCookie.value)
        
        if (payload) {
          return {
            id: payload.userId,
            role: payload.role
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error('[v0] Error getting user from request:', error)
    return null
  }
}

// Verify authentication from request
export async function verifyAuth(request: Request) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return {
        authenticated: false,
        user: null
      }
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        role: user.role
      }
    }
  } catch (error) {
    console.error('[v0] Error verifying auth:', error)
    return {
      authenticated: false,
      user: null
    }
  }
}

// These will be used in API routes once database is connected
export const authHelpers = {
  hashPassword,
  verifyPassword,
  createSession,
  validateSession,
  destroySession,
  getUserFromToken,
  verifyAuth,
};
