// app/api/upload/presign/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { PresignSchema } from '@/lib/validators/admin.schema';
// Fixed: Importing both the function and the type from their true source file
import { createPresignedUploadUrl, type PresignResult } from '@/lib/services/storage.service';

/**
 * Route response contract directly tracking the core service types
 */
export interface PresignUploadResponse {
  data: PresignResult | null; 
  error: string | null;
}

export async function POST(
  req: Request
): Promise<NextResponse<PresignUploadResponse>> {
  try {
    // 1. Authenticate user identity session parameters
    const user = await requireAuth();

    // 2. Safely parse incoming payload streams
    const body = await req.json();
    
    // 3. Enforce structural parameter validations
    const input = PresignSchema.parse(body);

    // 4. Extract network metadata securely for the storage rate limiters
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
                     
    const requestId = req.headers.get('x-request-id') || undefined;

    // 5. Generate direct-to-bucket edge allocation metrics matching all 4 arguments
    const result = await createPresignedUploadUrl(
      input,
      user.id,
      clientIp,   
      requestId   
    );

    // 6. Formulate explicit, type-safe API output parameters without artificial cast layers
    const responseBody: PresignUploadResponse = {
      data: result, 
      error: null,
    };

    const response = NextResponse.json<PresignUploadResponse>(responseBody);

    // 7. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<PresignUploadResponse>;
  }
}