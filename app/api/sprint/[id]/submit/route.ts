import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole } from '@/lib/middleware/roles';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { createDomainError } from '@/lib/middleware/errorHandler';

import { SubmissionSchema } from '@/lib/validators/submission.schema';
import { createSubmission } from '@/lib/services/submission.service';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Creates a sprint submission for an authenticated competitor.
 */
export async function POST(
  req: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { id: targetSprintId } = await context.params;

    const authenticatedUser = await requireAuth();

    await requireProfileRole(authenticatedUser.id, 'competitor');

    if (!authenticatedUser.email) {
      throw createDomainError(
        'Authenticated account is missing a valid email address',
        400
      );
    }

    const rawRequestBody = await req.json();

    const validatedInputData = SubmissionSchema.parse({
      ...rawRequestBody,
      sprint_id: targetSprintId,
    });

    const freshSubmissionRecord = await createSubmission(
      validatedInputData,
      authenticatedUser.id,
      authenticatedUser.email
    );

    return Response.json(
      {
        data: {
          submission: freshSubmissionRecord,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
