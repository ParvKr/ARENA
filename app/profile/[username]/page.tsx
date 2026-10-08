'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { useArenaStore } from '@/lib/store';
import type { Profile } from '@/types/api.types';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileMissing, ProfileSkeleton } from '@/components/profile/ProfileState';
import { normaliseHistory, type RawHistoryEntry } from '@/components/profile/record';

interface ProfileApiResponse {
  data: { profile: Profile; sprint_history: RawHistoryEntry[] } | null;
}

class ProfileFetchError extends Error {
  constructor(readonly status: number) {
    super(`Profile request failed with ${status}`);
  }
}

const fetcher = async (url: string): Promise<ProfileApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new ProfileFetchError(res.status);
  return res.json();
};

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const viewer = useArenaStore((s) => s.user);

  const { data, error, isLoading } = useSWR<ProfileApiResponse, ProfileFetchError>(
    `/api/profile/${encodeURIComponent(username)}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  );

  if (isLoading) return <ProfileSkeleton />;

  const profile = data?.data?.profile;
  if (error || !profile) {
    return <ProfileMissing username={username} notFound={!error || error.status === 404} />;
  }

  const isOwner = !!viewer && viewer.username.toLowerCase() === profile.username.toLowerCase();
  return (
    <ProfileView profile={profile} history={normaliseHistory(data?.data?.sprint_history ?? [])} isOwner={isOwner} />
  );
}
