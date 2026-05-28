import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { Json } from '@/types/database.types';

// ─── AUDIT ENTITY STRUCTURAL TYPES ──────────────────────────────────────────
export type AuditEntityType =
  | 'sprint'
  | 'submission'
  | 'judge'
  | 'profile'
  | 'result';

// ─── AUDIT LIFE-CYCLE TRACKING ACTION TYPE MATRIX ───────────────────────────
export type AuditAction =
  | 'sprint.created'
  | 'sprint.published'
  | 'sprint.closed'
  | 'sprint.results_computed'
  | 'sprint.results_published'
  | 'submission.created'
  | 'submission.disqualified'
  | 'submission.reinstated'
  | 'judge.assigned'
  | 'judge.evaluation_complete'
  | 'profile.created'
  | 'profile.role_changed';

export interface AuditLogEntry {
  actor_id: string | null;
  action: AuditAction;
  entity_type: AuditEntityType; // Fixed: Strong typed matching matrix limits
  entity_id: string | null;
  metadata?: Json; // Fixed: Optional payload configuration
  timestamp?: string; // Enterprise Optimization: Historical replay override string
}

/**
 * Appends an entry to the immutable audit log table.
 * * DESIGN PRINCIPLE: Errors are caught locally and never thrown up the stack.
 * Main request flows will never crash if the auditing pipeline experiences downtime.
 */
export async function audit(entry: AuditLogEntry): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    
    const { error } = await admin.from('audit_log').insert({
      actor_id: entry.actor_id,
      actor_action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      metadata: entry.metadata ?? {}, // Fallback configuration clean initialization
      created_at: entry.timestamp ?? new Date().toISOString(), // Standardizes deterministic inserts
    });

    if (error) {
      console.error(`[AUDIT ERROR] Database insertion rejection: ${error.message}`, entry);
    }
  } catch (err: unknown) { // Fixed: Narrowed type scoping safety catch block
    const systemErrorMessage = err instanceof Error 
      ? err.message 
      : 'Unknown audit infrastructure exception caught';
      
    console.error(`[AUDIT CRITICAL FAILURE] ${systemErrorMessage}`, { entry, errorInstance: err });
  }
}