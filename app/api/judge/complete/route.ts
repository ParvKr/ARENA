// app/api/judge/complete/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { CompleteEvaluationSchema } from '@/lib/validators/judging.schema';
import { completeEvaluation } from '@/lib/services/judging.service';

export const dynamic = 'force-dynamic';

export interface JudgeEvaluationCompleteResponse {
  data: {
    message: string;
  } | null;
  error: string | null;
}

export async function POST(
  req: Request
): Promise<NextResponse<JudgeEvaluationCompleteResponse>> {
  try {
    // 1. Authenticate user identity session bounds
    const user = await requireAuth();
    await requireProfileRole(user.id, 'judge');

    // 2. Safely parse incoming payload streams
    const body = await req.json();
    
    // 3. Enforce structural validation boundaries using your validation schema
    const input = CompleteEvaluationSchema.parse(body);

    const requestId = req.headers.get('x-request-id') || undefined;

    // 4. Mark judge evaluation as complete (Scores become immutable)
    await completeEvaluation(input.sprint_id, user.id);

    // 5. Build explicit, type-safe API output contracts
    const responseBody: JudgeEvaluationCompleteResponse = {
      data: { 
        message: 'Evaluation submitted successfully. Thank you for your review.' 
      },
      error: null,
    };

    const response = NextResponse.json<JudgeEvaluationCompleteResponse>(responseBody);

    // 6. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<JudgeEvaluationCompleteResponse>;
  }
}