'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Provider = 'google' | 'apple';

interface AuthProviderButtonsProps {
  next?: string;
}

export function AuthProviderButtons({ next = '/sprint' }: AuthProviderButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (provider: Provider) => {
    setPendingProvider(provider);
    setError(null);

    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', isSafeNextPath(next) ? next : '/sprint');

    const { error: oauthError } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });

    if (oauthError) {
      setError(`Unable to continue with ${provider === 'google' ? 'Google' : 'Apple'}. Please try again.`);
      setPendingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <ProviderButton provider="google" pendingProvider={pendingProvider} onClick={signIn} />
        <ProviderButton provider="apple" pendingProvider={pendingProvider} onClick={signIn} />
      </div>
      {error && <p className="text-center text-xs text-arena-red" role="alert">{error}</p>}
    </div>
  );
}

function ProviderButton({ provider, pendingProvider, onClick }: { provider: Provider; pendingProvider: Provider | null; onClick: (provider: Provider) => void }) {
  const label = provider === 'google' ? 'Google' : 'Apple';
  const isPending = pendingProvider === provider;

  return (
    <button
      type="button"
      disabled={pendingProvider !== null}
      onClick={() => void onClick(provider)}
      className="flex items-center justify-center gap-2 rounded-md border border-arena-border bg-arena-surface px-3 py-3 text-sm font-semibold text-arena-offwhite transition hover:border-arena-gray hover:bg-arena-card disabled:cursor-wait disabled:opacity-60"
    >
      {provider === 'google' ? <GoogleIcon /> : <AppleIcon />}
      {isPending ? 'Connecting…' : `Continue with ${label}`}
    </button>
  );
}

function GoogleIcon() {
  return <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.2 13.7a6 6 0 0 1 0-3.5V7.6H2.9a10 10 0 0 0 0 8.9l3.3-2.8Z"/><path fill="#EA4335" d="M12 6c1.6 0 3 .5 4.1 1.6L19.2 4C17 2 14.7 1 12 1a10 10 0 0 0-9.1 5.6l3.3 2.6C7 7.8 9.3 6 12 6Z"/></svg>;
}

function AppleIcon() {
  return <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M16.7 12.9c0-2.1 1.7-3.1 1.8-3.2a3.9 3.9 0 0 0-3.1-1.7c-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.9.9-3.6 2.3-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.7-2.1.8-1.2 1.2-2.3 1.2-2.4a3.6 3.6 0 0 1-2.3-3.9ZM14.5 6.5c.6-.7 1-1.6.9-2.5-.9 0-1.9.6-2.5 1.3-.6.6-1 1.5-.9 2.4.9.1 1.8-.4 2.5-1.2Z"/></svg>;
}

function isSafeNextPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}
