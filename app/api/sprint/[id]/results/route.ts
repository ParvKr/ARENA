import { handleRouteError } from '@/lib/middleware/errorHandler';
import { getPublishedResults } from '@/lib/services/results.service';
import { getSprintById } from '@/lib/services/sprint.service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Results are immutable after publication

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Returns finalized public sprint leaderboard results.
 */
export async function GET(
  _req: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { id: targetSprintId } = await context.params;

    const supabaseClient =
      await createSupabaseServerClient();

    const sprint = await getSprintById(
      targetSprintId,
      supabaseClient
    );

    if (sprint.sprint_status !== 'complete') {
      return Response.json(
        {
          data: null,
          error: {
            message:
              'Evaluation results for this sprint have not yet been published',
            code: 'NOT_PUBLISHED',
          },
        },
        { status: 404 }
      );
    }

    const results = await getPublishedResults(
      targetSprintId,
      supabaseClient
    );

    return Response.json({
      data: {
        sprint,
        results,
      },
      error: null,
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
