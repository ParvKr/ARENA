// __tests__/anonymise.test.ts
import { describe, it, expect } from 'vitest';
import {
  anonymiseSubmission,
  anonymiseSubmissions,
  assertAnonymised,
  isAnonymised,
} from '../lib/utils/anonymise';
import type { Submission, AnonymisedSubmission } from '@/types/api.types';

const mockSubmission: Submission = {
  id: 'sub-123',
  sprint_id: 'sprint-456',
  user_id: 'user-789', 
  main_file_url: 'https://example.com/file.png',
  main_file_type: 'image/png',
  process_file_urls: ['https://example.com/wip1.png'],
  brief_interpretation: 'My interpretation of the brief',
  tools_used: 'Figma',
  time_spent_hours: 8,
  note_to_judges: null,
  is_disqualified: false, 
  disqualify_reason: null, 
  disqualified_at: null, 
  disqualified_by: null, 
  submitted_at: '2026-04-25T18:00:00Z',
};

describe('anonymiseSubmission', () => {
  it('strips user_id from submission', () => {
    const anon = anonymiseSubmission(mockSubmission);
    expect('user_id' in anon).toBe(false);
  });

  it('strips is_disqualified from submission', () => {
    const anon = anonymiseSubmission(mockSubmission);
    expect('is_disqualified' in anon).toBe(false);
  });

  it('strips disqualify_reason from submission', () => {
    const anon = anonymiseSubmission(mockSubmission);
    expect('disqualify_reason' in anon).toBe(false);
  });

  it('strips disqualified_at from submission', () => {
    const anon = anonymiseSubmission(mockSubmission);
    expect('disqualified_at' in anon).toBe(false);
  });

  it('strips disqualified_by from submission', () => {
    const anon = anonymiseSubmission(mockSubmission);
    expect('disqualified_by' in anon).toBe(false);
  });

  it('strips id to safeguard database metadata parameters', () => {
    const anon = anonymiseSubmission(mockSubmission);
    expect('id' in anon).toBe(false);
  });

  it('preserves safe fields', () => {
    const anon = anonymiseSubmission(mockSubmission) as AnonymisedSubmission;
    // Assert fields that are guaranteed to stay intact on the AnonymisedSubmission layout contract
    expect(anon.sprint_id).toBe(mockSubmission.sprint_id);
    expect(anon.main_file_url).toBe(mockSubmission.main_file_url);
    expect(anon.tools_used).toBe(mockSubmission.tools_used);
    expect(anon.brief_interpretation).toBe(mockSubmission.brief_interpretation);
  });

  it('does not mutate the original submission object tracking state', () => {
    const copy = { ...mockSubmission };
    anonymiseSubmission(mockSubmission);
    expect(mockSubmission).toEqual(copy);
  });
});

describe('assertAnonymised', () => {
  it('does not throw for a clean anonymised object configuration shape', () => {
    const anon = anonymiseSubmission(mockSubmission);
    // FIXED: Formulated proper typed generic parameter constraints to clear compiler bottlenecks
    expect(() => assertAnonymised(anon as Record<string, unknown>)).not.toThrow();
  });

  it('throws if user_id is present', () => {
    expect(() => assertAnonymised({ user_id: 'user-123' })).toThrow(/user_id/);
  });

  it('throws if username is present', () => {
    expect(() => assertAnonymised({ username: 'someuser' })).toThrow(/username/);
  });

  it('throws if email is present', () => {
    expect(() => assertAnonymised({ email: 'a@b.com' })).toThrow(/email/);
  });
});

describe('anonymiseSubmissions (array processing pipeline)', () => {
  it('anonymises all submissions packaged inside an iterable matrix', () => {
    const subs = [mockSubmission, { ...mockSubmission, id: 'sub-999' }];
    const anons = anonymiseSubmissions(subs);
    anons.forEach(a => expect('user_id' in a).toBe(false));
  });

  it('handles empty array parameters safely without throwing', () => {
    expect(anonymiseSubmissions([])).toEqual([]);
  });
});

describe('isAnonymised', () => {
  it('returns true for a clean object layout mapping sequence', () => {
    const anon = anonymiseSubmission(mockSubmission);
    expect(isAnonymised(anon)).toBe(true);
  });

  it('returns false for an un-scrubbed object with a remaining user_id pointer', () => {
    expect(isAnonymised({ id: '1', user_id: 'u-1' })).toBe(false);
  });
});