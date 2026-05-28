'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import useSWR from 'swr';
import { useToast } from '../../../lib/store'; // Adjust relative path based on directory depth

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
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Background blur elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="font-display text-6xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-3"
            >
              ARENA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-base text-gray-400"
            >
              Join the competition
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="glass rounded-2xl p-8 border border-white/10"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Display Name
                </label>
                <input
                  {...register('display_name')}
                  type="text"
                  placeholder="Your professional handle"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                />
                {errors.display_name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-medium"
                  >
                    {errors.display_name.message}
                  </motion.p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-medium"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                />
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-medium"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Unique Handle
                </label>
                <div className="relative">
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="username"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-20 text-white placeholder-gray-500 text-sm font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                  />
                  
                  {rawUsernameInput.trim().length >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center select-none text-xs font-mono"
                    >
                      {isValidating ? (
                        <span className="text-gray-400 animate-pulse">checking...</span>
                      ) : (
                        <>
                          {usernameAvailable === true && (
                            <span className="text-green-400 font-bold flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded">
                              ✓ clear
                            </span>
                          )}
                          {usernameAvailable === false && (
                            <span className="text-red-400 font-bold flex items-center gap-1 bg-red-400/10 px-2 py-1 rounded">
                              ✕ taken
                            </span>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-medium"
                  >
                    {errors.username.message}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || usernameAvailable === false || isValidating || rawUsernameInput.trim().length < 3}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-6 py-3.5 rounded-lg font-display font-bold text-base transition-all duration-200 ${
                  loading || usernameAvailable === false || isValidating || rawUsernameInput.trim().length < 3
                    ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"
                    />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">ALREADY HERE?</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Sign In Link */}
            <motion.a
              href="/signin"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full py-3 text-center rounded-lg font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200"
            >
              Sign In
            </motion.a>
          </motion.div>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center text-xs text-gray-500 mt-8"
          >
            By creating an account, you agree to our{' '}
            <span className="text-cyan-400 hover:underline cursor-pointer">
              Terms of Service
            </span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
