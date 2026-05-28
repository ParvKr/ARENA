// app/api/admin/sprint/[id]/compute-results/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { allJudgesComplete } from '@/lib/services/judging.service';
import { computeResults } from '@/lib/services/results.service';
import { audit } from '@/lib/utils/audit';

export const dynamic = 'force-dynamic';

export interface AdminComputeResultsResponse {
  data: {
    message: string;
  } | null;
  error: string | null;
}

interface RouteContext {
  params: Promise<{ id: string }>; // Enforces async Next.js dynamic routing type standards
}

export async function POST(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse<AdminComputeResultsResponse>> {
  try {
    // 1. Resolve asynchronous routing context parameters cleanly to prevent compiler crashes
    const { id: sprintId } = await params;

    // 2. Authenticate user administrative identity session parameters
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');

    const requestId = req.headers.get('x-request-id') || undefined;

    // 3. Guard: Verify that all assigned judges have finalized their evaluation tasks
    const ready = await allJudgesComplete(sprintId);
    if (!ready) {
      // Returns flat string layouts perfectly matching your strict generic ApiError response contracts
      return NextResponse.json<AdminComputeResultsResponse>(
        { 
          data: null, 
          error: 'Conflict: Not all assigned judges have completed evaluation. Calculation aborted.' 
        },
        { status: 409 }
      );
    }

    // 4. Execute atomic leaderboard ranking aggregation computations via the service layer
    await computeResults(sprintId);

    // 5. Record transaction properties inside the immutable system audit trail
    void audit({
      actor_id: user.id,
      action: 'sprint.results_computed',
      entity_type: 'sprint',
      entity_id: sprintId,
      metadata: { 
        computed_at: new Date().toISOString()
      },
    });

    // 6. Formulate explicit, type-safe API output contracts
    const responseBody: AdminComputeResultsResponse = {
      data: { message: 'Leaderboard results successfully computed. Review and publish when ready.' },
      error: null,
    };

    const response = NextResponse.json<AdminComputeResultsResponse>(responseBody);

    // 7. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<AdminComputeResultsResponse>;
  }
}