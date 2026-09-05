import { requireAuth } from '@/lib/middleware/auth';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { getUserSubmission } from '@/lib/services/submission.service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Returns the authenticated user's submission
 * for a specific sprint.
 */
export async function GET(
  _req: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { id: targetSprintId } = await context.params;

    const authenticatedUser = await requireAuth();

    const supabaseClient =
      await createSupabaseServerClient();

    const submission = await getUserSubmission(
      targetSprintId,
      authenticatedUser.id,
      supabaseClient
    );

    return Response.json({
      data: { submission },
      error: null,
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
