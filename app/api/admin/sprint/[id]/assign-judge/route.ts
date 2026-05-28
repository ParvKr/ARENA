// app/api/admin/sprint/[id]/assign-judge/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { AssignJudgeSchema } from '@/lib/validators/admin.schema';
import { assignJudge } from '@/lib/services/judging.service';
import { sendJudgeAssignment } from '@/lib/services/email.service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSprintById } from '@/lib/services/sprint.service';

export const dynamic = 'force-dynamic';

export interface AdminAssignJudgeResponse {
  data: {
    message: string;
  } | null;
  error: string | null;
}

interface RouteContext {
  params: Promise<{ id: string }>; 
}

export async function POST(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse<AdminAssignJudgeResponse>> {
  try {
    // 1. Resolve asynchronous routing context parameters cleanly
    const { id: sprintId } = await params;

    // 2. Authenticate user administrative identity session parameters
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');

    // 3. Safely consume request body stream parameters
    const body = await req.json();
    const input = AssignJudgeSchema.parse({ ...body, sprint_id: sprintId });

    const requestId = req.headers.get('x-request-id') || undefined;

    // 4. Execute atomic judge assignment matching your exact service definition arguments
    await assignJudge(sprintId, input.judge_user_id, user.id);

    // 5. Query context and dispatch non-blocking invitation notifications
    try {
      const admin = getSupabaseAdmin();
      
      const [sprint, authResponse] = await Promise.all([
        getSprintById(sprintId),
        admin.auth.admin.getUserById(input.judge_user_id)
      ]);

      const judgeUser = authResponse.data?.user;
      if (judgeUser?.email) {
        sendJudgeAssignment(judgeUser.email, sprintId, sprint.title).catch((emailErr: unknown) => {
          const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
          console.error(`[BACKGROUND_NOTIFICATION_ERROR]: Failed to route judge invitation email: ${message}`);
        });
      }
    } catch (bgContextError: unknown) { // Fixed: Typed as unknown to satisfy strict linting filters
      const message = bgContextError instanceof Error ? bgContextError.message : String(bgContextError);
      console.error(`[BACKGROUND_CONTEXT_WARNING]: Assignment email generation bypassed: ${message}`);
    }

    // 6. Formulate explicit, type-safe API response payload parameters
    const responseBody: AdminAssignJudgeResponse = {
      data: { message: 'Judge successfully assigned to sprint and verification notification queued.' },
      error: null,
    };

    const response = NextResponse.json<AdminAssignJudgeResponse>(responseBody);

    // 7. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<AdminAssignJudgeResponse>;
  }
}