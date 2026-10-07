// app/admin/types.ts
import type { SprintStatus } from '@/types/api.types';

export interface SprintRow {
  id: string;
  sprint_number: number;
  title: string;
  discipline: string;
  sprint_status: SprintStatus;
  open_at: string;
  close_at: string;
  results_at: string | null;
  brief_content?: { context: string; challenge: string; constraints: string; criteria: string; timeline: string } | null;
  prize_data?: {
    first: { description: string; cash_amount?: number; sponsor?: string };
    second: { description: string; sponsor?: string };
    third: { description: string; sponsor?: string };
  } | null;
}
