import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createDomainError } from '@/lib/middleware/errorHandler';
import { limitUpload } from '@/lib/middleware/rateLimit';
import { ALLOWED_SUBMISSION_FORMATS, type AllowedSubmissionFormat } from '../validators/submission.schema';

// ─── CENTRALIZED SECURE BUCKET REGISTRY ─────────────────────────────────────
const BUCKET_SUBMISSIONS = 'submissions';
const BUCKET_PROCESS_DOCS = 'process-docs';

// Server-side extension mapping to block extension spoofing attempts
const MIME_EXTENSION_MAP: Record<AllowedSubmissionFormat, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'application/pdf': 'pdf'
};

// Enforced payload size thresholds matching our core gateway policies
const MAX_MAIN_FILE_BYTES = 10 * 1024 * 1024;    // 10MB Limit
const MAX_PROCESS_FILE_BYTES = 5 * 1024 * 1024;  // 5MB Limit

export interface PresignResult {
  upload_url: string;
  public_url: string;
  path: string;
}

/**
 * Generates an authenticated pre-signed upload URL for an asset payload.
 * Verifies payload sizes, enforces rate limits, and locks down file extensions server-side.
 */
export async function createPresignedUploadUrl(
  input: {
    file_name: string;
    file_type: string;
    file_size: number;
    is_process_doc: boolean;
  },
  userId: string,
  clientIp: string,
  reqId?: string
): Promise<PresignResult> {
  // 1. Fixed: Explicitly await the rate limiter to prevent pipeline bypass windows
  await limitUpload(userId, clientIp, reqId);

  // 2. Fixed: Replaced the raw type cast with a deterministic runtime search array map
  const targetFormat = ALLOWED_SUBMISSION_FORMATS.find(format => format === input.file_type);
  if (!targetFormat) {
    throw createDomainError(`Requested media format category '${input.file_type}' is not supported by the storage engine`, 400);
  }

  // 3. Evaluate capacity limits against the destination bucket target
  const upperCapacityLimit = input.is_process_doc ? MAX_PROCESS_FILE_BYTES : MAX_MAIN_FILE_BYTES;
  if (input.file_size > upperCapacityLimit) {
    const formattedMegabytesLimit = upperCapacityLimit / 1024 / 1024;
    throw createDomainError(`Asset payload size exceeds the maximum permitted ${formattedMegabytesLimit}MB limit`, 400);
  }

  // 4. Fixed: Sanitize the user ID string to neutralize path-traversal attacks
  const safeUserId = userId.replace(/[^a-zA-Z0-9\-_]/g, '');

  const admin = getSupabaseAdmin();
  const targetedBucket = input.is_process_doc ? BUCKET_PROCESS_DOCS : BUCKET_SUBMISSIONS;
  
  // 5. Derive the true extension from our server-side map, ignoring user-supplied inputs
  const cleanExtension = MIME_EXTENSION_MAP[targetFormat];
  
  // 6. Build the secure storage path key using the sanitized parameters
  const secureStoragePathKey = `${safeUserId}/${Date.now()}-${crypto.randomUUID()}.${cleanExtension}`;

  // 7. Request a short-lived 15-minute upload token from Supabase Storage
  const { data, error } = await admin.storage
    .from(targetedBucket)
    .createSignedUploadUrl(secureStoragePathKey);

  if (error || !data) {
    throw createDomainError(`Cloud bucket connection refused signed path generation: ${error?.message ?? 'Unknown Exception'}`, 500);
  }

  // 8. Use the native SDK path builder to compile the resource lookups
  const { publicUrl } = admin.storage.from(targetedBucket).getPublicUrl(secureStoragePathKey).data;

  return {
    upload_url: data.signedUrl,
    public_url: publicUrl,
    path: secureStoragePathKey,
  };
}

/**
 * Deletes a targeted file path from a storage bucket when an entry is disqualified.
 * DESIGN PRINCIPLE: Fail-silent execution context protects parent DB records from storage API glitches.
 */
export async function deleteFile(path: string, isProcessDoc: boolean): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const targetedBucket = isProcessDoc ? BUCKET_PROCESS_DOCS : BUCKET_SUBMISSIONS;
    
    const { error } = await admin.storage.from(targetedBucket).remove([path]);
    
    if (error) {
      console.error(`[STORAGE EXCEPTION] Object deletion from bucket '${targetedBucket}' rejected: ${error.message} Path: ${path}`);
    }
} catch (err: unknown) {
  const fallbackMessage =
    err instanceof Error
      ? err.message
      : 'Storage cluster timeout interruption context';

  console.error(
    `[STORAGE CRITICAL FAILURE] Object eviction pipeline crashed: ${fallbackMessage}`,
    { path, isProcessDoc }
  );
}
}