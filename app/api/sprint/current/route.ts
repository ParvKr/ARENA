import { handleRouteError } from '@/lib/middleware/errorHandler';
import {
  getCurrentSprint,
  getEntryCount,
} from '@/lib/services/sprint.service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Returns live sprint state + entry metrics.
 * Public endpoint.
 */
export async function GET(): Promise<Response> {
  try {
    const supabaseClient = await createSupabaseServerClient();

    const sprint = await getCurrentSprint(supabaseClient);

    if (!sprint) {
      return Response.json(
        {
          data: null,
          error: null,
          meta: {
            has_active_sprint: false,
          },
        },
        { status: 200 }
      );
    }

    const entryCount =
      sprint.sprint_status === 'live'
        ? await getEntryCount(sprint.id, supabaseClient)
        : null;

    return Response.json({
      data: {
        sprint,
        entry_count: entryCount,
      },
      error: null,
      meta: {
        has_active_sprint: true,
      },
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}