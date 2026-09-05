// app/signin/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useArenaStore } from '@/lib/store';
import { AuthProviderButtons } from '@/components/AuthProviderButtons';

const SignInSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Sign-in parameter must contain at least 3 characters')
    .max(254, 'Input parameter exceeds maximum length thresholds')
    .trim(),
  password: z.string().min(1, 'Password field cannot be left blank'),
});

type SignInFormValues = z.infer<typeof SignInSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    mode: 'onTouched', // Restored dynamic validation tracing
  });

  async function onSubmit(data: SignInFormValues) {
    setIsSubmitting(true);
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

        const resolveJson = await resolveRes.json();

        if (!resolveRes.ok) {
          throw new Error(resolveJson.error || 'Failed to resolve profile mapping data markers.');
        }

        targetEmail = resolveJson.email;
      }

      // Supabase authentication request transaction dispatch
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: data.password,
      });

      if (authError) {
        throw authError;
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

      // Hardened session validation routing sequence
      router.push(next);
      router.refresh();
    } catch (error) {
      console.error('[SIGNIN_CRASH_RECOVERY]:', error);
      const message = error instanceof Error ? error.message : 'Sign in failed';

      // Replaced legacy generic browser alert with global system toast channel
      if (addToast) {
        addToast({
          type: 'error',
          message: message,
          duration: 6000,
          priority: 3,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-arena-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-arena-card border border-arena-border rounded-2xl p-8 shadow-2xl"
      >
        <div className="space-y-2 mb-8">
          <h1 className="font-display text-5xl font-black text-arena-red">
            ARENA
          </h1>

          <p className="text-arena-gray">
            Welcome back, competitor.
            Please sign in.
          </p>
        </div>

        <AuthProviderButtons next={next} />

        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-arena-gray before:h-px before:flex-1 before:bg-arena-border after:h-px after:flex-1 after:bg-arena-border">
          or use email
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-arena-gray font-bold">
              Username or Email Address
            </label>

            <input
              {...register('identifier')}
              type="text"
              autoComplete="username"
              className="w-full bg-arena-black border border-arena-border rounded-xl px-4 py-3 text-arena-offwhite outline-none focus:border-arena-red"
            />

            {errors.identifier && (
              <p className="text-sm text-arena-red">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-arena-gray font-bold">
              Password
            </label>

            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="w-full bg-arena-black border border-arena-border rounded-xl px-4 py-3 text-arena-offwhite outline-none focus:border-arena-red"
            />

            {errors.password && (
              <p className="text-sm text-arena-red">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-display font-black text-lg bg-arena-red text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-arena-gray">
          New to ARENA?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="text-arena-cyan font-bold hover:underline"
          >
            Create an account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-arena-black px-4">
      <div className="h-130 w-full max-w-md animate-pulse rounded-2xl border border-arena-border bg-arena-card" />
    </div>
  );
}

/** Prevent an untrusted query string from turning sign-in into an open redirect. */
function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/sprint';
  return next;
}
