// app/signin/page.tsx
'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useArenaStore } from '@/lib/store';
import { AuthProviderButtons } from '@/components/AuthProviderButtons';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField, PasswordField, authPrimaryButtonClass } from '@/components/auth/AuthField';

const SignInSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Sign-in parameter must contain at least 3 characters')
    .max(254, 'Input parameter exceeds maximum length thresholds')
    .trim(),
  password: z.string().min(1, 'Password field cannot be left blank'),
});

type SignInFormValues = z.infer<typeof SignInSchema>;

/** One wording for "no such username" and "wrong password", so sign-in can't be used to probe for valid usernames. */
const INVALID_LOGIN = 'Incorrect username, email or password.';

/** A failure the user can act on. These are shown to them, never logged as crashes. */
class ExpectedAuthError extends Error {}

function describeAuthError(error: { code?: string | undefined; status?: number | undefined }): ExpectedAuthError | null {
  if (error.code === 'invalid_credentials') return new ExpectedAuthError(INVALID_LOGIN);
  if (error.code === 'email_not_confirmed') return new ExpectedAuthError('Confirm your email first, then sign in.');
  if (error.status === 429 || error.code === 'over_request_rate_limit') {
    return new ExpectedAuthError('Too many attempts. Wait a minute and try again.');
  }
  return null;
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToast = useArenaStore((state) => state.addToast);

  const next = getSafeNextPath(searchParams.get('next'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [granted, setGranted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    mode: 'onTouched', // Restored dynamic validation tracing
  });

  const identifierValue = (useWatch({ control, name: 'identifier' }) ?? '').trim();

  async function onSubmit(data: SignInFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    const cleanIdentifier = data.identifier.trim().toLowerCase();
    let targetEmail = cleanIdentifier;

    try {
      const supabase = createSupabaseBrowserClient();

      // Username → Email resolution block logic
      if (!cleanIdentifier.includes('@')) {
        // Enforce strict clean alphanumeric mapping matching project handles
        const cleanUsername = cleanIdentifier.replace(/[^a-z0-9_]/g, '');

        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: cleanUsername,
          }),
        });

        if (resolveRes.status === 404 || resolveRes.status === 400) {
          // Unknown (or malformed) username: an expected outcome, not a crash.
          throw new ExpectedAuthError(INVALID_LOGIN);
        }
        if (resolveRes.status === 429) {
          throw new ExpectedAuthError('Too many attempts. Wait a minute and try again.');
        }

        const resolveJson = await resolveRes.json();

        if (!resolveRes.ok || !resolveJson.email) {
          throw new Error(resolveJson.error || 'Failed to resolve username.');
        }

        targetEmail = resolveJson.email;
      }

      // Supabase authentication request transaction dispatch
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: data.password,
      });

      if (authError) {
        throw describeAuthError(authError) ?? authError;
      }

      if (!authData?.user) {
        throw new Error('Authentication response yielded an empty user identity pointer.');
      }

      // Success logic notification callback trigger
      if (addToast) {
        addToast({
          type: 'success',
          message: 'Access authorized. Welcome back to the Arena.',
          duration: 4000,
          priority: 1,
        });
      }

      // Let the badge flip to "access granted" before leaving the page.
      setGranted(true);
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Hardened session validation routing sequence
      router.push(next);
      router.refresh();
    } catch (error) {
      let message: string;
      if (error instanceof ExpectedAuthError) {
        message = error.message;
      } else {
        // Something we didn't plan for: log it, but tell the user something plain.
        console.error('[SIGNIN_UNEXPECTED]:', error);
        message = 'Something went wrong on our side. Please try again.';
      }

      setFormError(message);
      if (addToast) {
        addToast({ type: 'error', message, duration: 6000, priority: 3 });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge={{ mode: 'signin', handle: identifierValue, stamp: granted ? 'granted' : null, locked: !granted }}
      blurb="Pick up where you left off: your rank, your entries and your next brief."
    >
      <h1 className="font-poster text-4xl uppercase leading-none lg:text-5xl">Sign in</h1>
      <p className="mt-3 text-base text-smoke">Welcome back, competitor.</p>

      <div className="mt-8">
        <AuthProviderButtons next={next} />
      </div>

      <div className="my-7 flex items-center gap-4 text-sm text-smoke before:h-px before:flex-1 before:bg-white/15 after:h-px after:flex-1 after:bg-white/15">
        or use email
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AuthField
          label="Username or email"
          type="text"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier', { onChange: () => setFormError(null) })}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { onChange: () => setFormError(null) })}
        />

        {formError && (
          <p role="alert" className="rounded-xl border border-signal/60 bg-signal/10 px-4 py-3 text-sm font-medium text-chalk">
            {formError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={`${authPrimaryButtonClass} mt-2`}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-center text-base text-smoke">
        New to Arena?{' '}
        <Link href="/signup" className="font-semibold text-chalk underline decoration-signal decoration-2 underline-offset-4 hover:text-signal">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function SignInFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-void px-4">
      <div className="h-[34rem] w-full max-w-md animate-pulse rounded-2xl bg-white/[0.04]" />
    </div>
  );
}

/** Prevent an untrusted query string from turning sign-in into an open redirect. */
function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/sprint';
  return next;
}
