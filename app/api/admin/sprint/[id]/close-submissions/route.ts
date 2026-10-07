// app/api/admin/sprint/[id]/close-submissions/route.ts
// live → judging. The admin console's "Close submissions" action.
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { closeSprint } from '@/lib/services/sprint.service';

export interface AdminSprintCloseResponse {
  data: { message: string } | null;
  error: string | null;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse<AdminSprintCloseResponse>> {
  try {
    const { id: sprintId } = await params;

    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');

    // closeSprint only moves a sprint that is currently live, and records its own audit entry.
    await closeSprint(sprintId, user.id);

    const response = NextResponse.json<AdminSprintCloseResponse>({
      data: { message: 'Submissions closed. The sprint is now in judging.' },
      error: null,
    });
    response.headers.set('Cache-Control', 'no-store');

    const requestId = req.headers.get('x-request-id');
    if (requestId) response.headers.set('x-request-id', requestId);

    return response;
  } catch (error) {
    return handleRouteError(error) as NextResponse<AdminSprintCloseResponse>;
  }
}
