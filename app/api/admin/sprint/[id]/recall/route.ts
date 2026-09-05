// app/api/admin/sprint/[id]/recall/route.ts
// Recalls a live sprint back to draft status.
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { recallSprint } from '@/lib/services/sprint.service';

interface RouteContext { params: Promise<{ id: string }>; }

export async function POST(_req: Request, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { id: sprintId } = await params;
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');
    await recallSprint(sprintId, user.id);
    const res = NextResponse.json({ data: { message: 'Sprint recalled to draft.' }, error: null });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    return handleRouteError(error) as NextResponse;
  }
}
