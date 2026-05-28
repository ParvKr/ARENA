// lib/middleware/errorHandler.ts
// Standardized exception translation matrix across Route Handlers and Server Actions.
// Hardened with strict TypeScript Type Guards, telemetry tracking context, and public message boundaries.

import { ZodError } from 'zod';
import { AuthError } from './auth';
import { RoleError } from './roles';
import { RateLimitError } from './rateLimit';

export interface StandardizedErrorPayload {
  error: string;
  code: string;
  requestId?: string;
  timestamp: string;
  details?: Array<{ field: string; message: string }>;
}

export interface DomainError extends Error {
  status: number;
  code?: string;
  isDomainError: true;
}

/**
 * TypeScript Type Guard to safely determine if an unknown exception is an explicit DomainError.
 * Natively narrows the compiler context scope to eliminate down-stream type assertions.
 */
function isDomainError(error: unknown): error is DomainError {
  return (
    error instanceof Error &&
    'isDomainError' in error &&
    (error as DomainError).isDomainError === true
  );
}

/**
 * Normalizes an unknown execution exception into a strictly structured, type-safe data payload.
 * Guarantees zero-knowledge internal message leakage on production environments.
 */
export function normalizeError(error: unknown, reqId?: string): { status: number; payload: StandardizedErrorPayload } {
  const currentTimestamp = new Date().toISOString();
  const requestId = reqId || 'req_unanalyzed';

  // Base payload defaults
  const basePayload = {
    timestamp: currentTimestamp,
    requestId,
  };

  // 1. Handle Zod validation faults (400 Bad Request)
  if (error instanceof ZodError) {
    return {
      status: 400,
      payload: {
        ...basePayload,
        error: 'Validation failed. Check your input fields.',
        code: 'VALIDATION_ERROR',
        details: error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }
    };
  }

  // 2. Handle Stateless Session Faults (401 Unauthorized)
  if (error instanceof AuthError) {
    return {
      status: error.status,
      payload: { ...basePayload, error: error.message, code: error.code }
    };
  }

  // 3. Handle Stateful Database Role Exceptions (403 Forbidden)
  if (error instanceof RoleError) {
    return {
      status: error.status,
      payload: { ...basePayload, error: error.message, code: error.code }
    };
  }

  // 4. Handle Distributed Transaction Rate Throttling (429 Too Many Requests)
  if (error instanceof RateLimitError) {
    return {
      status: error.status,
      payload: { ...basePayload, error: error.message, code: error.code }
    };
  }

  // 5. Handle explicit custom domain-level errors (Type narrowed automatically)
  if (isDomainError(error)) {
    return {
      status: error.status || 400,
      payload: { 
        ...basePayload,
        error: error.message, // Explicitly authored internal developer string intended for public output
        code: error.code || 'DOMAIN_ERROR' 
      }
    };
  }

  // 6. Unknown Internal Execution Faults / Database Driver Crash (500 Internal Server Error)
  // Hyper-detailed system telemetry logged strictly to your private server-side console
  console.error(`[ARENA_UNHANDLED_EXCEPTION] [Trace ID: ${requestId}]:`, error);
  
  return {
    status: 500,
    payload: {
      ...basePayload,
      error: 'An unexpected execution error occurred.',
      code: 'INTERNAL_SERVER_ERROR'
    }
  };
}

/**
 * Universal error translation wrapper for explicit Next.js Route Handlers (API Endpoints).
 * @returns Standardized Web API native Response object
 */
export function handleRouteError(error: unknown, requestId?: string): Response {
  const { status, payload } = normalizeError(error, requestId);
  return Response.json(payload, { status });
}

/**
 * Universal error translation wrapper for modern Next.js Server Actions ('use server').
 * Prevents execution unhandled shell rejections from breaking serialization bindings.
 */
export function handleActionError(error: unknown, requestId?: string): StandardizedErrorPayload {
  const { payload } = normalizeError(error, requestId);
  return payload;
}

/**
 * Factory helper to synthesize an explicit application domain error with structured status signatures.
 * Explicitly branded with an immutable runtime flag to cleanly distinguish it from database internal errors.
 */
export function createDomainError(message: string, status: number, code = 'DOMAIN_FAULT'): DomainError {
  const error = new Error(message) as DomainError;
  error.status = status;
  error.code = code;
  error.isDomainError = true;
  return error;
}