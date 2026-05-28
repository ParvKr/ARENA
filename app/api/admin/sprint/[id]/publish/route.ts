// app/api/admin/sprint/[id]/publish/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { limitPublish } from '@/lib/middleware/rateLimit'; // Now resolves cleanly from your middleware
import { publishSprint } from '@/lib/services/sprint.service';
import { audit } from '@/lib/utils/audit';

export const dynamic = 'force-dynamic';

export interface AdminSprintPublishResponse {
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
): Promise<NextResponse<AdminSprintPublishResponse>> {
  try {
    // 1. Resolve asynchronous routing context parameters cleanly
    const { id: sprintId } = await params;

    // 2. Authenticate user administrative identity session bounds
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');

    // 3. Extract network metadata securely for the Upstash sliding-window rate limiter
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
                     
    const requestId = req.headers.get('x-request-id') || undefined;

    // 4. Await atomic edge rate-limiting check using your new, complete signature rules
    await limitPublish(user.id, clientIp, requestId);

    // 5. Execute core sprint mutation query via your backend service layer
    await publishSprint(sprintId, user.id);

    // 6. Record transaction properties safely inside the system-wide audit trail
    void audit({
      actor_id: user.id,
      action: 'sprint.published',
      entity_type: 'sprint',
      entity_id: sprintId,
      metadata: { 
        published_at: new Date().toISOString()
      },
    });

    // 7. Formulate explicit, type-safe API output parameters
    const responseBody: AdminSprintPublishResponse = {
      data: { message: 'Sprint successfully published. Brief-drop notification emails have been queued.' },
      error: null,
    };

    const response = NextResponse.json<AdminSprintPublishResponse>(responseBody);

    // 8. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<AdminSprintPublishResponse>;
  }
}