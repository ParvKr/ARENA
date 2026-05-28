// Arena V0.1
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes safely with complete deduping optimizations.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string or instance safely for localized display.
 * Backstopped against NaN parsing errors and runtime type collapses.
 */
export function formatDate(
  dateStr: string | Date | null | undefined,
  locale = 'en-IN'
): string {
  if (!dateStr) return '';

  try {
    const parsedDate = dateStr instanceof Date ? dateStr : new Date(dateStr);
    
    // Explicit safeguard evaluating if the instantiation created an Invalid Date reference
    if (isNaN(parsedDate.getTime())) {
      console.warn(`[formatDate Utils] Parsed invalid date payload structure: "${dateStr}"`);
      return '';
    }

    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(parsedDate);
  } catch (error) {
    console.error('[formatDate Utils] Critical formatting crash intercepted:', error);
    return '';
  }
}

/**
 * Truncate strings with ellipsis safely without risking out-of-bounds negative indexing.
 */
export function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str) return '';
  if (maxLen <= 3) return '...';
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
}

/**
 * Generate a deterministic HSL color definition from a string.
 * Performance tuned to minimize bitwise collision variations for avatar nodes.
 */
export function stringToColour(str: string | null | undefined): string {
  if (!str) return 'hsl(0, 0%, 20%)'; // Solid fallback slate token
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  // Preservation of exact brand-aligned aesthetic design tokens (Saturated, Medium-Dark)
  return `hsl(${hue}, 65%, 40%)`;
}