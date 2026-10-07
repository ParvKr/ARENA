'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';
import { useToast } from '@/lib/store';
import { AuthProviderButtons } from '@/components/AuthProviderButtons';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField, PasswordField, authPrimaryButtonClass } from '@/components/auth/AuthField';

const SignupSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(60, 'Display name cannot exceed 60 characters'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-z0-9_]+$/, 'User handles must contain lowercase letters, numbers, or underscores only'),
});

type SignupInput = z.infer<typeof SignupSchema>;

// The route responds with { data: { available, username } | null, error }.
interface AvailabilityResponse {
  data: { available: boolean; username: string } | null;
  error: { message: string; code?: string } | null;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network validation failed');
  return res.json();
});

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    mode: 'onChange',
  });

  const rawUsernameInput = useWatch({ control, name: 'username' }) ?? '';

  // Intercepting and normalising formatting to lowercase to block schema constraints
  useEffect(() => {
    const sanitized = rawUsernameInput.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (sanitized !== rawUsernameInput) {
      setValue('username', sanitized, { shouldValidate: true });
    }

    // Anti-spam layer: 350ms pause window keeps typing loops local in system memory
    const handler = setTimeout(() => {
      setDebouncedUsername(sanitized);
    }, 350);

    return () => clearTimeout(handler);
  }, [rawUsernameInput, setValue]);

  // Live database verify loop runs only when debounced state clears minimum bounds
  const { data: usernameData, isValidating } = useSWR<AvailabilityResponse>(
    debouncedUsername.length >= 3
      ? `/api/profile/check-username?username=${debouncedUsername}`
      : null,
    fetcher,
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const usernameAvailable = usernameData?.data?.available;

  async function onSubmit(data: SignupInput) {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.username.toLowerCase().trim(),
          display_name: data.display_name.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? 'An unexpected registration error occurred.');
      }

      toast.success('Account created! Welcome to the Arena.');
      router.push('/signin');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup mutation failed.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const usernameReady = rawUsernameInput.trim().length >= 3;
  const displayNameInput = useWatch({ control, name: 'display_name' }) ?? '';
  const stamp = usernameReady && !isValidating ? (usernameAvailable === true ? 'cleared' : usernameAvailable === false ? 'taken' : null) : null;
  const submitDisabled = loading || usernameAvailable === false || isValidating || !usernameReady;

  return (
    <AuthShell
      badge={{ mode: 'signup', name: displayNameInput, handle: rawUsernameInput, stamp: stamp }}
      blurb="Free to join. Browse any brief without an account; make one to submit your work and earn a public rank."
    >
      <h1 className="font-poster text-4xl uppercase leading-none lg:text-5xl">Create your account</h1>
      <p className="mt-3 text-base text-smoke">Forge your creative credential.</p>

      <div className="mt-8">
        <AuthProviderButtons />
      </div>

      <div className="my-7 flex items-center gap-4 text-sm text-smoke before:h-px before:flex-1 before:bg-white/15 after:h-px after:flex-1 after:bg-white/15">
        or create with email
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AuthField
          label="Display name"
          type="text"
          autoComplete="name"
          placeholder="Your name or creative handle"
          error={errors.display_name?.message}
          {...register('display_name')}
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <AuthField
          label="Username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="handle"
          hint="Lowercase letters, numbers and underscores. This is your public handle."
          error={errors.username?.message}
          className="font-mono"
          adornment={
            usernameReady ? (
              <span aria-live="polite" className="select-none font-mono text-xs">
                {isValidating ? (
                  <span className="animate-pulse text-smoke">checking…</span>
                ) : usernameAvailable === true ? (
                  <span className="rounded bg-white/10 px-2 py-1 font-bold text-chalk">✓ available</span>
                ) : usernameAvailable === false ? (
                  <span className="rounded bg-signal px-2 py-1 font-bold text-chalk">✕ taken</span>
                ) : null}
              </span>
            ) : null
          }
          {...register('username')}
        />

        <button type="submit" disabled={submitDisabled} className={`${authPrimaryButtonClass} mt-2`}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-base text-smoke">
        Already have an account?{' '}
        <Link href="/signin" className="font-semibold text-chalk underline decoration-signal decoration-2 underline-offset-4 hover:text-signal">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
