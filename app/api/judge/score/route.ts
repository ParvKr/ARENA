// app/api/judge/score/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { ScoreSchema } from '@/lib/validators/judging.schema';
import { saveScore } from '@/lib/services/judging.service';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Needed for the safe contextual lookup
import { createDomainError } from '@/lib/middleware/errorHandler';
import type { Score } from '@/types/api.types';

export interface JudgeScoreSaveResponse {
  data: {
    score: Score;
  } | null;
  error: string | null;
}

export async function POST(
  req: Request
): Promise<NextResponse<JudgeScoreSaveResponse>> {
  try {
    // 1. Authenticate user identity session bounds
    const user = await requireAuth();
    await requireProfileRole(user.id, 'judge');

    // 2. Safely parse JSON payload streams
    const body = await req.json();
    
    // 3. Enforce structural validation boundaries using your validation schema
    const input = ScoreSchema.parse(body);

    const requestId = req.headers.get('x-request-id') || undefined;

    // 4. Resolve the sprintId from the database using the verified submission_id
    // This acts as a security check and provides the sprintId your service requires
    const supabase = await createSupabaseServerClient();
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('sprint_id')
      .eq('id', input.submission_id)
      .single();

    if (subError || !submission) {
      throw createDomainError('Malicious or forged transaction detected: Submission does not exist.', 400);
    }

    // 5. Execute score upsert matching your exact 3-argument service signature from your IDE screen
    const score = await saveScore(
      input,                 // argument 1: input (ScoreOutput)
      submission.sprint_id,  // argument 2: sprintId (string) - Pulled safely from DB context
      user.id                // argument 3: judgeId (string)
    );

    // 6. Build type-safe response payload layout
    const responseBody: JudgeScoreSaveResponse = {
      data: { score },
      error: null,
    };

    const response = NextResponse.json<JudgeScoreSaveResponse>(responseBody);

    // 7. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<JudgeScoreSaveResponse>;
  }
}