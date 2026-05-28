import { handleRouteError } from '@/lib/middleware/errorHandler';
import { getEntryCount } from '@/lib/services/sprint.service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _req: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { id: sprintId } = await context.params;
    const supabaseClient = await createSupabaseServerClient();
    const count = await getEntryCount(sprintId, supabaseClient);

    return Response.json({
      data: { count },
      error: null,
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
