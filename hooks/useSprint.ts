// hooks/useSprint.ts
// Fully type-safe SWR query hooks with structured error extraction and strict return interfaces.
'use client';

import useSWR from 'swr';
import type { Sprint } from '@/types/api.types';
import type { KeyedMutator } from 'swr';

// ── Strict API Response Typing ────────────────────────────────────────────

export interface SprintSubmission {
  id: string;
  sprint_id: string;
  user_id: string;
  code_url: string;
  screenshot_url?: string;
  score: number | null;
  created_at: string;
}

export interface SprintResult {
  id: string;
  rank: number;
  score: number;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  submission: {
    id: string;
    code_url: string;
    created_at: string;
  };
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface CurrentSprintPayload {
  sprint: Sprint | null;
  entry_count: number;
}

interface SprintResultsPayload {
  sprint: Sprint | null;
  results: SprintResult[];
}

interface MySubmissionPayload {
  submission: SprintSubmission | null;
}

// ── Structured Error Class ───────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.info = info;
  }
}

// ── Type-Safe Error Handling Fetcher ──────────────────────────────────────

const typedFetcher = async <T>(url: string): Promise<ApiResponse<T>> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    let errorInfo: unknown = null;
    let errorMessage = `HTTP Error ${response.status}`;
    
    try {
      // Attempt to extract structured error objects sent by the backend action layer
      errorInfo = await response.json();
      if (typeof errorInfo === 'object' && errorInfo !== null && 'error' in errorInfo && typeof errorInfo.error === 'string') {
        errorMessage = errorInfo.error;
      }
    } catch {
      // Fallback if the server crashes with a non-JSON response (e.g., raw HTML 502)
    }
    
    throw new ApiError(errorMessage, response.status, errorInfo);
  }
  
  return response.json();
};

// ── Strict Query Hooks ───────────────────────────────────────────────────

interface UseSprintReturn {
  sprint: Sprint | null;
  entryCount: number;
  isLoading: boolean;
  error: ApiError | null;
  mutate: KeyedMutator<ApiResponse<CurrentSprintPayload>>;
}

export function useCurrentSprint(): UseSprintReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CurrentSprintPayload>, ApiError>(
    '/api/sprint/current',
    typedFetcher,
    {
      refreshInterval: 30_000,
      dedupingInterval: 4_000,
      revalidateOnReconnect: true,
    }
  );

  return {
    sprint: data?.data?.sprint ?? null,
    entryCount: data?.data?.entry_count ?? 0,
    isLoading,
    error: error ?? null,
    mutate,
  };
}

interface UseSprintResultsReturn {
  sprint: Sprint | null;
  results: SprintResult[];
  isLoading: boolean;
  error: ApiError | null;
}

export function useSprintResults(sprintId: string | null | undefined): UseSprintResultsReturn {
  const { data, error, isLoading } = useSWR<ApiResponse<SprintResultsPayload>, ApiError>(
    sprintId ? `/api/sprint/${sprintId}/results` : null,
    typedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 10_000,
    }
  );

  return {
    sprint: data?.data?.sprint ?? null,
    results: data?.data?.results ?? [],
    isLoading,
    error: error ?? null,
  };
}

interface UseMySubmissionReturn {
  submission: SprintSubmission | null;
  isLoading: boolean;
  error: ApiError | null;
  mutate: KeyedMutator<ApiResponse<MySubmissionPayload>>;
}

export function useMySubmission(sprintId: string | null | undefined): UseMySubmissionReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<MySubmissionPayload>, ApiError>(
    sprintId ? `/api/sprint/${sprintId}/my-submission` : null,
    typedFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2_000,
    }
  );

  return {
    submission: data?.data?.submission ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}