// app/api/admin/sprint/[id]/route.ts
// DELETE: permanently deletes a draft sprint.
// PATCH: updates sprint fields.
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { deleteDraftSprint, updateSprint } from '@/lib/services/sprint.service';
import { UpdateSprintSchema } from '@/lib/validators/sprint.schema';
import type { Sprint } from '@/types/api.types';

interface RouteContext { params: Promise<{ id: string }>; }

export async function DELETE(_req: Request, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { id: sprintId } = await params;
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');
    await deleteDraftSprint(sprintId, user.id);
    const res = NextResponse.json({ data: { message: 'Draft sprint deleted.' }, error: null });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    return handleRouteError(error) as NextResponse;
  }
}

export async function PATCH(req: Request, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { id: sprintId } = await params;
    const user = await requireAuth();
    await requireProfileRole(user.id, 'admin');
    const body: unknown = await req.json();
    const input = UpdateSprintSchema.parse(body);
    const sprint: Sprint = await updateSprint(sprintId, input, user.id);
    const res = NextResponse.json({ data: { sprint }, error: null });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    return handleRouteError(error) as NextResponse;
  }
}
