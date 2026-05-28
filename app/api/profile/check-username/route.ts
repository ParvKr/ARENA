// app/api/profile/check-username/route.ts
import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { isUsernameAvailable } from '@/lib/services/profile.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  // FIXED: Added .transform() to automatically sanitize mixed-case queries safely
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username cannot exceed 20 characters')
    .transform((val) => val.toLowerCase().trim()) 
    .refine((val) => /^[a-z0-9_]+$/.test(val), {
      message: 'User handles must contain alphanumeric characters or underscores only',
    }),
});

export interface UsernameAvailabilityResponse {
  data: {
    available: boolean;
    username: string;
  } | null;
  error: { message: string; code?: string } | null;
}

export async function GET(req: Request): Promise<NextResponse<UsernameAvailabilityResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    
    // Zod now safely handles mixed-case requests like "Parv01" without crashing
    const { username } = QuerySchema.parse({
      username: searchParams.get('username'),
    });

    const requestId = req.headers.get('x-request-id') || undefined;
    const available = await isUsernameAvailable(username);

    const responseBody: UsernameAvailabilityResponse = {
      data: { available, username },
      error: null,
    };

    const response = NextResponse.json<UsernameAvailabilityResponse>(responseBody);

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) response.headers.set('x-request-id', requestId);

    return response;
  } catch (error) {
    return handleRouteError(error) as NextResponse<UsernameAvailabilityResponse>;
  }
}