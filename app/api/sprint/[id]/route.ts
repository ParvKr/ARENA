import { handleRouteError } from '@/lib/middleware/errorHandler';
import {
  getSprintById,
  getEntryCount,
} from '@/lib/services/sprint.service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Returns a specific sprint and its entry metrics.
 * Public endpoint.
 */
export async function GET(
  _req: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { id: targetSprintId } = await context.params;

    const supabaseClient = await createSupabaseServerClient();

    const [sprint, entryCount] = await Promise.all([
      getSprintById(targetSprintId, supabaseClient),
      getEntryCount(targetSprintId, supabaseClient),
    ]);

    return Response.json({
      data: {
        sprint,
        entry_count: entryCount,
      },
      error: null,
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
