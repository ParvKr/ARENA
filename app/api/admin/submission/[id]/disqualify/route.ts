// app/api/admin/submission/[id]/disqualify/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; // Aligned with your project's role check utility function
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { DisqualifySchema } from '@/lib/validators/admin.schema';
import { disqualifySubmission } from '@/lib/services/submission.service';
import { audit } from '@/lib/utils/audit';

export interface AdminDisqualifySubmissionResponse {
  data: {
    message: string;
  } | null;
  error: string | null;
}

interface RouteContext {
  params: Promise<{ id: string }>; // Enforces async Next.js dynamic routing definitions
}

export async function POST(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse<AdminDisqualifySubmissionResponse>> {
  try {
    // 1. Resolve asynchronous routing context parameters cleanly to prevent compiler crashes
    const { id: submissionId } = await params;

    // 2. Authenticate user administrative identity session parameters
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');

    // 3. Safely consume request body stream parameters
    const body = await req.json();
    
    // 4. Validate input layout parameters against your strict schema configuration
    const input = DisqualifySchema.parse({ ...body, submission_id: submissionId });

    const requestId = req.headers.get('x-request-id') || undefined;

    // 5. Execute core disqualification mutation via your backend service layer
    await disqualifySubmission(submissionId, input.reason, user.id);

    // 6. Record transaction properties safely inside the system-wide audit trail (Fire-and-forget)
    void audit({
      actor_id: user.id,
      action: 'submission.disqualified',
      entity_type: 'submission',
      entity_id: submissionId,
      metadata: { 
        reason: input.reason,
        disqualified_at: new Date().toISOString()
      },
    });

    // 7. Formulate explicit, type-safe API response payload parameters
    const responseBody: AdminDisqualifySubmissionResponse = {
      data: { message: 'Submission successfully disqualified and removed from active evaluation streams.' },
      error: null,
    };

    const response = NextResponse.json<AdminDisqualifySubmissionResponse>(responseBody);

    // 8. Enforce no-cache policies to guarantee administrative dashboards never display stale data states
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    // 9. Catch and forward type-safe execution failures through your global handler
    return handleRouteError(error) as NextResponse<AdminDisqualifySubmissionResponse>;
  }
}