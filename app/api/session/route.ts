import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/middleware/rateLimit';

// In-memory session storage (for production, use Redis or database)
// Using Map to store session data with automatic cleanup
const sessionStore = new Map<string, {
  data: unknown;
  expiresAt: number;
}>();

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of sessionStore.entries()) {
    if (now > value.expiresAt) {
      sessionStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Generate a secure random session ID
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `sess_${timestamp}_${random}${random2}`;
}

// Store data in session
export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.API_DEFAULT);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
      );
    }

    const body = await request.json();
    const { data, key } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    // Generate or use provided session key
    const sessionId = key || generateSessionId();

    // Store data with 1 hour expiration
    const expiresAt = Date.now() + (60 * 60 * 1000);
    sessionStore.set(sessionId, {
      data,
      expiresAt,
    });

    return NextResponse.json({
      sessionId,
      expiresAt,
    });
  } catch (error) {
    console.error('[Session Store Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to store session data' },
      { status: 500 }
    );
  }
}

// Retrieve data from session
export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.API_DEFAULT);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
      );
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID provided' },
        { status: 400 }
      );
    }

    const session = sessionStore.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      sessionStore.delete(sessionId);
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: session.data,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('[Session Retrieve Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to retrieve session data' },
      { status: 500 }
    );
  }
}

// Delete session data
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID provided' },
        { status: 400 }
      );
    }

    sessionStore.delete(sessionId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[Session Delete Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to delete session data' },
      { status: 500 }
    );
  }
}
