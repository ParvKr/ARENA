// app/api/profile/[username]/route.ts
import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/middleware/errorHandler';
// Fixed: Combined service utilities and let TypeScript infer the true return type model cleanly
import { getProfileByUsername, getSprintHistory } from '@/lib/services/profile.service';
import type { Profile } from '@/types/api.types'; 

// Uses TypeScript's ReturnType utility to extract the exact shape the database service returns
// Awaits the Promise array block dynamically so your API contract stays perfectly aligned
type ServiceHistoryEntry = Awaited<ReturnType<typeof getSprintHistory>>[number];

export interface PublicProfileResponse {
  data: {
    profile: Profile;
    sprint_history: ServiceHistoryEntry[]; // Natively mirrors what profile.service actually returns
  } | null;
  error: { message: string; code?: string } | null;
}

interface RouteContext {
  params: Promise<{ username: string }>; 
}

export async function GET(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse<PublicProfileResponse>> {
  try {
    const { username } = await params;

    const profile = await getProfileByUsername(username) as Profile;
    
    // Fixed: Removed the forced 'as SprintHistoryEntry[]' assertion block.
    // The data now flows natively with 100% accurate type inference out of the engine.
    const history = await getSprintHistory(profile.user_id);

    const responseBody: PublicProfileResponse = {
      data: { 
        profile, 
        sprint_history: history 
      },
      error: null,
    };

    const response = NextResponse.json<PublicProfileResponse>(responseBody);
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=59');

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<PublicProfileResponse>;
  }
}