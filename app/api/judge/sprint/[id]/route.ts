// app/api/judge/sprint/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { getJudgingAssignment, getJudgeProgress } from '@/lib/services/judging.service';
import { getSubmissionsForJudging } from '@/lib/services/submission.service';
import type { AnonymisedSubmission } from '@/types/api.types'; 

export const dynamic = 'force-dynamic';

/**
 * Route response contract directly tracking the core data types
 */
export interface JudgeSprintResponse {
  data: {
    submissions: AnonymisedSubmission[]; // Absolute type safety without type bypasses
    progress: { 
      scored: number; 
      total: number; 
    };
    assignment: {
      is_complete: boolean;
      completed_at: string | null;
    };
  } | null;
  error: string | null;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse<JudgeSprintResponse>> {
  try {
    // 1. Resolve asynchronous routing context parameters cleanly
    const { id: sprintId } = await params;

    // 2. Authenticate User Identity Session Bounds
    const user = await requireAuth();
    await requireProfileRole(user.id, 'judge'); 

    // 3. Extract optional tracking ID for trace propagation only
    const requestId = req.headers.get('x-request-id') || undefined;

    // 4. Query data layer streams in parallel with verified parameter signatures
    const [assignment, submissions, progress] = await Promise.all([
      getJudgingAssignment(sprintId, user.id),
      getSubmissionsForJudging(sprintId), 
      getJudgeProgress(sprintId, user.id),
    ]);

    // 5. Formulate response payload with clean, zero-allocation data passing
    const responseBody: JudgeSprintResponse = {
      data: {
        submissions, 
        progress,
        assignment: {
          is_complete: assignment.is_complete,
          completed_at: assignment.completed_at,
        },
      },
      error: null,
    };

    const response = NextResponse.json<JudgeSprintResponse>(responseBody);

    // 6. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<JudgeSprintResponse>;
  }
}