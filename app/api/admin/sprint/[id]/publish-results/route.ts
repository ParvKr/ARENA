// app/api/admin/sprint/[id]/publish-results/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { limitPublish } from '@/lib/middleware/rateLimit';
import { PublishResultsSchema } from '@/lib/validators/admin.schema';
import { publishResults } from '@/lib/services/results.service';
import { audit } from '@/lib/utils/audit';

export const dynamic = 'force-dynamic';

export interface AdminPublishResultsResponse {
  data: {
    message: string;
  } | null;
  error: string | null;
}

interface RouteContext {
  params: Promise<{ id: string }>; // Enforces modern async parameter routing definitions
}

export async function POST(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse<AdminPublishResultsResponse>> {
  try {
    // 1. Resolve asynchronous routing context parameters cleanly to prevent compiler crashes
    const { id: sprintId } = await params;

    // 2. Authenticate user administrative identity session parameters
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');

    // 3. Extract network metadata securely for your Upstash sliding-window rate limiter
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
                     
    const requestId = req.headers.get('x-request-id') || undefined;

    // 4. Await atomic edge rate-limiting using your exact complete signature rules
    await limitPublish(user.id, clientIp, requestId);

    // 5. Safely consume request body and execute protective Zod payload structural checks
    const body = await req.json();
    PublishResultsSchema.parse({ ...body, sprint_id: sprintId });

    // 6. Execute core results transition mutation via the service layer
    await publishResults(sprintId, user.id);

    // 7. Record transaction properties inside the immutable system audit trail (Fire-and-forget)
    void audit({
      actor_id: user.id,
      action: 'sprint.results_published',
      entity_type: 'sprint',
      entity_id: sprintId,
      metadata: { 
        published_at: new Date().toISOString()
      },
    });

    // 8. Formulate explicit, type-safe API output parameters
    const responseBody: AdminPublishResultsResponse = {
      data: { message: 'Results successfully published. Participant placement and leaderboard notification emails have been queued.' },
      error: null,
    };

    const response = NextResponse.json<AdminPublishResultsResponse>(responseBody);

    // 9. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<AdminPublishResultsResponse>;
  }
}