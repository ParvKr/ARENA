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

  const next = searchParams.get('next') || '/sprint';
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
              Welcome back, competitor
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="glass rounded-2xl p-8 border border-white/10"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Identifier */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Username or Email
                </label>
                <input
                  {...register('identifier')}
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                />
                {errors.identifier && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-medium"
                  >
                    {errors.identifier.message}
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
                  autoComplete="current-password"
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 py-3.5 rounded-lg font-display font-bold text-base bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"
                    />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">NEW HERE?</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Sign Up Link */}
            <motion.button
              onClick={() => router.push('/signup')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200"
            >
              Create Account
            </motion.button>
          </motion.div>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center text-xs text-gray-500 mt-8"
          >
            By signing in, you agree to our{' '}
            <span className="text-cyan-400 hover:underline cursor-pointer">
              Terms of Service
            </span>
          </motion.p>
        </motion.div>
      </div>
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
