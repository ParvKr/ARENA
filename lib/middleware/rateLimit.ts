// lib/middleware/rateLimit.ts
// Hardened Distributed Rate Limiter utilizing an Atomic Sliding Window policy.
// Eliminates allocation overhead via pre-allocated singleton engines and implements critical fail-closed gates.

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export class RateLimitError extends Error {
  readonly status = 429;
  readonly code = 'RATE_LIMITED';

  constructor(message = 'Too many requests. Please try again later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// 1. Immutable, single-instance initialization of the centralized Redis connection
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Add this directly underneath your uploadLimiter instance
const publishLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'arena_ratelimit:publish',
});

// 2. Predefined, static singleton instances to eliminate object construction memory allocations completely
const submissionLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'arena_ratelimit:submit',
});

const signupLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'arena_ratelimit:signup',
});

const scoringLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(120, '1 h'),
  prefix: 'arena_ratelimit:score',
});

const uploadLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'arena_ratelimit:upload',
});

interface ExecutionContext {
  identifier: string;
  ip: string;
  requestId?: string;
  endpoint: string;
}

/**
 * Structured security telemetry logger designed to pipe structured JSON parameters directly into observability stacks.
 */
function logSecurityTelemetry(status: 'ALLOWED' | 'BLOCKED' | 'SYSTEM_FAIL_OPEN' | 'SYSTEM_FAIL_CLOSED', context: ExecutionContext, remaining = 0, reset = 0): void {
  const telemetryPayload = {
    timestamp: new Date().toISOString(),
    event_type: 'SECURITY_RATE_LIMIT',
    status,
    endpoint: context.endpoint,
    client_ip: context.ip,
    actor_identity: context.identifier,
    request_id: context.requestId || 'req_unanalyzed',
    metrics: {
      tokens_remaining: remaining,
      window_reset_timestamp: reset
    }
  };

  if (status === 'BLOCKED' || status === 'SYSTEM_FAIL_CLOSED') {
    console.error(JSON.stringify(telemetryPayload));
  } else if (status === 'SYSTEM_FAIL_OPEN') {
    console.warn(JSON.stringify(telemetryPayload));
  } else {
    console.log(JSON.stringify(telemetryPayload));
  }
}

// ─── Hardened Execution Interface Layers ─────────────────────────────────────────────

/** Throttles project submissions. Fails open to avoid locking out genuine submissions due to transient Redis drops. */
export async function limitSubmission(userId: string, sprintId: string, clientIp: string, reqId?: string): Promise<void> {
  const ctx: ExecutionContext = { identifier: userId, ip: clientIp, endpoint: `submissions:${sprintId}`,  ...(reqId && { requestId: reqId }), };

  if (!process.env.UPSTASH_REDIS_REST_URL) return;

  try {
    const { success, remaining, reset } = await submissionLimiter.limit(`${userId}:${sprintId}`);
    
    if (!success) {
      logSecurityTelemetry('BLOCKED', ctx, remaining, reset);
      const retryAfterSec = Math.ceil(Math.max(0, reset - Date.now()) / 1000);
      throw new RateLimitError(`Rate limit exceeded. Try again in ${retryAfterSec} seconds.`);
    }

    logSecurityTelemetry('ALLOWED', ctx, remaining, reset);
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    // Fail Open strategy: Keep non-critical services available during cache cluster drops
    logSecurityTelemetry('SYSTEM_FAIL_OPEN', ctx);
  }
}

/** * Protects onboarding signup gates. 
 * CRITICAL GATEWAY: Fails closed to explicitly block automated brute force fuzzing attacks if Redis drops offline.
 */
export async function limitSignup(clientIp: string, reqId?: string): Promise<void> {
  const ctx: ExecutionContext = { identifier: 'anonymous_registration', ip: clientIp, endpoint: 'auth:signup',  ...(reqId && { requestId: reqId }), };

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn('[SECURITY_WARNING]: Redis unconfigured. Failing closed on critical signup endpoint.');
    throw new RateLimitError('Authentication service temporarily unavailable.');
  }

  try {
    const { success, remaining, reset } = await signupLimiter.limit(clientIp);
    
    if (!success) {
      logSecurityTelemetry('BLOCKED', ctx, remaining, reset);
      const retryAfterSec = Math.ceil(Math.max(0, reset - Date.now()) / 1000);
      throw new RateLimitError(`Too many registration attempts. Please retry in ${retryAfterSec} seconds.`);
    }

    logSecurityTelemetry('ALLOWED', ctx, remaining, reset);
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    // Fail Closed strategy: Harden entry vaults against registration floods during coordinator dropouts
    logSecurityTelemetry('SYSTEM_FAIL_CLOSED', ctx);
    throw new RateLimitError('Security verification offline. Connection rejected.');
  }
}

/** Controls judging scoring matrices. Fails open to preserve leaderboard compilation flows. */
export async function limitScoring(judgeId: string, clientIp: string, reqId?: string): Promise<void> {
  const ctx: ExecutionContext = { identifier: judgeId, ip: clientIp, endpoint: 'scores:save',  ...(reqId && { requestId: reqId }), };
  
  if (!process.env.UPSTASH_REDIS_REST_URL) return;

  try {
    const { success, remaining, reset } = await scoringLimiter.limit(judgeId);
    
    if (!success) {
      logSecurityTelemetry('BLOCKED', ctx, remaining, reset);
      const retryAfterSec = Math.ceil(Math.max(0, reset - Date.now()) / 1000);
      throw new RateLimitError(`Evaluation quota exceeded. Try again in ${retryAfterSec} seconds.`);
    }

    logSecurityTelemetry('ALLOWED', ctx, remaining, reset);
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    logSecurityTelemetry('SYSTEM_FAIL_OPEN', ctx);
  }
}

/** Throttles pre-signed upload generation lookups. Fails open dynamically. */
export async function limitUpload(userId: string, clientIp: string, reqId?: string): Promise<void> {
  const ctx: ExecutionContext = { identifier: userId, ip: clientIp, endpoint: 'storage:presign',  ...(reqId && { requestId: reqId }), };
  
  if (!process.env.UPSTASH_REDIS_REST_URL) return;

  try {
    const { success, remaining, reset } = await uploadLimiter.limit(userId);
    
    if (!success) {
      logSecurityTelemetry('BLOCKED', ctx, remaining, reset);
      const retryAfterSec = Math.ceil(Math.max(0, reset - Date.now()) / 1000);
      throw new RateLimitError(`Asset ticket requests blocked. Retry in ${retryAfterSec} seconds.`);
    }

    logSecurityTelemetry('ALLOWED', ctx, remaining, reset);
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    logSecurityTelemetry('SYSTEM_FAIL_OPEN', ctx);
  }
}

/** * Protects administrative sprint publication gates.
 * CRITICAL GATEWAY: Fails closed to explicitly block execution loop cascades 
 * and email worker thread flooding if Redis drops offline.
 */
export async function limitPublish(adminId: string, clientIp: string, reqId?: string): Promise<void> {
  const ctx: ExecutionContext = { 
    identifier: adminId, 
    ip: clientIp, 
    endpoint: 'admin:sprint:publish',  
    ...(reqId && { requestId: reqId }), 
  };

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn('[SECURITY_WARNING]: Redis unconfigured. Failing closed on critical sprint publication gate.');
    throw new RateLimitError('Administrative configuration validation service temporarily offline.');
  }

  try {
    const { success, remaining, reset } = await publishLimiter.limit(adminId);
    
    if (!success) {
      logSecurityTelemetry('BLOCKED', ctx, remaining, reset);
      const retryAfterSec = Math.ceil(Math.max(0, reset - Date.now()) / 1000);
      throw new RateLimitError(`Sprint publication rate limit exceeded. Please wait ${retryAfterSec} seconds before retrying.`);
    }

    logSecurityTelemetry('ALLOWED', ctx, remaining, reset);
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    // Fail Closed strategy: Harden mutation boundaries against broadcast storms during coordinator dropouts
    logSecurityTelemetry('SYSTEM_FAIL_CLOSED', ctx);
    throw new RateLimitError('Security state validation offline. Administrative mutation rejected.');
  }
}