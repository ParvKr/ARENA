'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import useSWR from 'swr';
import { useToast } from '@/lib/store';
import { AuthProviderButtons } from '@/components/AuthProviderButtons';

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

// FIXED: Aligned properties to cleanly capture root-level parameters
interface AvailabilityResponse {
  available: boolean;
  error?: string;
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

  // FIXED: Accessing property at the root instead of using an invalid intermediate structural path wrapper
  const usernameAvailable = usernameData?.available;

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

  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-4 selection:bg-arena-red selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md space-y-8 bg-arena-card p-8 rounded-xl border border-arena-border/40 shadow-2xl backdrop-blur-md"
      >
        <div className="text-center space-y-2">
          <h1 className="font-display font-black text-5xl tracking-tighter text-arena-red">
            ARENA
          </h1>
          <p className="text-sm text-arena-gray">Forge your digital creative credential</p>
        </div>

        <AuthProviderButtons />

        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-arena-gray before:h-px before:flex-1 before:bg-arena-border after:h-px after:flex-1 after:bg-arena-border">
          or create with email
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Display Name Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-arena-gray">
              Display Name
            </label>
            <input
              {...register('display_name')}
              type="text"
              placeholder="Your professional creative handle"
              className="w-full bg-arena-surface border border-arena-border rounded-md p-3 text-arena-offwhite placeholder-arena-gray/30 text-sm focus:border-arena-red focus:outline-none focus:ring-1 focus:ring-arena-red/20 transition-all duration-200"
            />
            {errors.display_name && (
              <p className="text-xs font-medium text-arena-red mt-1">{errors.display_name.message}</p>
            )}
          </div>

          {/* Email Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-arena-gray">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@domain.com"
              className="w-full bg-arena-surface border border-arena-border rounded-md p-3 text-arena-offwhite placeholder-arena-gray/30 text-sm focus:border-arena-red focus:outline-none focus:ring-1 focus:ring-arena-red/20 transition-all duration-200"
            />
            {errors.email && (
              <p className="text-xs font-medium text-arena-red mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-arena-gray">
              Secure Password
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-arena-surface border border-arena-border rounded-md p-3 text-arena-offwhite placeholder-arena-gray/30 text-sm focus:border-arena-red focus:outline-none focus:ring-1 focus:ring-arena-red/20 transition-all duration-200"
            />
            {errors.password && (
              <p className="text-xs font-medium text-arena-red mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Username Validation Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-arena-gray">
              Unique Handle (Username)
            </label>
            <div className="relative">
              <input
                {...register('username')}
                type="text"
                placeholder="handle"
                className="w-full bg-arena-surface border border-arena-border rounded-md p-3 pr-24 text-arena-offwhite placeholder-arena-gray/30 text-sm font-mono focus:border-arena-red focus:outline-none focus:ring-1 focus:ring-arena-red/20 transition-all duration-200"
              />
              
              {rawUsernameInput.trim().length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center select-none text-xs font-mono">
                  {/* FIXED: Checks explicit SWR pipeline fetching states first to show text fallback */}
                  {isValidating ? (
                    <span className="text-arena-gray animate-pulse">checking...</span>
                  ) : (
                    <>
                      {usernameAvailable === true && (
                        <span className="text-arena-green font-bold flex items-center gap-1 bg-arena-green/10 px-2 py-1 rounded">
                          ✓ clear
                        </span>
                      )}
                      {usernameAvailable === false && (
                        <span className="text-arena-red font-bold flex items-center gap-1 bg-arena-red/10 px-2 py-1 rounded">
                          ✕ taken
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-arena-red mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Form Action Controller Button */}
          <button
            type="submit"
            disabled={loading || usernameAvailable === false || isValidating || rawUsernameInput.trim().length < 3}
            className={`w-full py-3.5 rounded-md font-display font-bold text-base transition-all duration-200 transform ${
              loading || usernameAvailable === false || isValidating || rawUsernameInput.trim().length < 3
                ? 'bg-arena-surface border border-arena-border text-arena-gray/40 cursor-not-allowed'
                : 'bg-arena-red text-white hover:bg-red-600 active:scale-[0.99] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-arena-gray pt-2">
          Already have an active registration?{' '}
          <a
            href="/signin"
            className="text-arena-cyan font-semibold transition-colors duration-150 hover:text-cyan-400 hover:underline"
          >
            Sign in here
          </a>
        </p>
      </motion.div>
    </div>
  );
}
