// app/api/admin/sprint/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles'; 
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { CreateSprintSchema } from '@/lib/validators/sprint.schema';
import { createSprint } from '@/lib/services/sprint.service';
import { audit } from '@/lib/utils/audit'; 
import type { Sprint } from '@/types/api.types'; // Fixed: Import your actual structural Sprint interface type

export const dynamic = 'force-dynamic';

export interface AdminSprintCreateResponse {
  data: {
    sprint: Sprint;
  } | null;
  error: string | null;
}

export async function POST(
  req: Request
): Promise<NextResponse<AdminSprintCreateResponse>> {
  try {
    // 1. Authenticate user session parameters
    const user = await requireAuth();

    // 2. Enforce strict administrative authorization boundaries
    await requireProfileRole(user.id, 'admin');

    // 3. Safely consume and parse the incoming JSON request payload
    const body = await req.json();
    
    // 4. Validate input layout parameters against your strict schema configuration
    const input = CreateSprintSchema.parse(body);

    const requestId = req.headers.get('x-request-id') || undefined;

    // 5. Execute core sprint initialization query via your backend service layer
    const sprint = await createSprint(input, user.id);

    // 6. Record the transaction to the system audit trail (Fire-and-forget, non-blocking)
    // 6. Record the transaction to the system audit trail (Fixed: swapped name for title)
    void audit({
      actor_id: user.id,
      action: 'sprint.created',
      entity_type: 'sprint',
      entity_id: sprint.id,
      metadata: { 
        title: input.title || sprint.title, // Fixed: Uses the valid schema 'title' property
        created_at: new Date().toISOString()
      },
    });

    // 7. Formulate explicit, type-safe API output parameters
    const responseBody: AdminSprintCreateResponse = {
      data: { sprint: sprint as Sprint }, // Asserts zero-overhead alignment directly with the type contract
      error: null,
    };

    const response = NextResponse.json<AdminSprintCreateResponse>(responseBody, { status: 201 });

    // 8. Enforce no-cache policies to prevent administrative dashboards from reading stale metrics
    // response setup
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<AdminSprintCreateResponse>;
  }
}