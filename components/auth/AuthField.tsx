// components/auth/AuthField.tsx
// Labelled input with an inline error, wired up for screen readers (label ↔ input,
// aria-invalid, aria-describedby). Spreads react-hook-form's register() props.
'use client'

import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const authInputClass =
  'auth-input w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-base text-chalk placeholder:text-white/35 outline-none transition-colors focus:border-signal focus:bg-white/[0.07] focus:ring-2 focus:ring-signal/30 aria-[invalid=true]:border-signal'

interface AuthFieldProps extends ComponentPropsWithRef<'input'> {
  label: string
  error?: string | undefined
  hint?: string
  /** Rendered inside the right edge of the input (status chip, toggle…). */
  adornment?: ReactNode
}

export function AuthField({ label, error, hint, adornment, className = '', ...props }: AuthFieldProps) {
  const id = useId()
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ')

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-chalk">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${authInputClass} ${adornment ? 'pr-28' : ''} ${className}`}
          {...props}
        />
        {adornment && <div className="absolute right-3 top-1/2 -translate-y-1/2">{adornment}</div>}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-smoke">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-signal">
          {error}
        </p>
      )}
    </div>
  )
}

/** AuthField with a show/hide toggle for passwords. */
export function PasswordField(props: Omit<AuthFieldProps, 'type' | 'adornment'>) {
  const [shown, setShown] = useState(false)
  return (
    <AuthField
      {...props}
      type={shown ? 'text' : 'password'}
      adornment={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          className="flex h-9 w-9 items-center justify-center rounded-full text-smoke transition-colors hover:text-chalk focus-visible:outline-2 focus-visible:outline-white"
        >
          {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
      className="pr-14"
    />
  )
}

export const authPrimaryButtonClass =
  'w-full rounded-full bg-signal py-4 font-display text-base font-bold text-chalk transition-colors hover:bg-chalk hover:text-void disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:hover:bg-white/10 disabled:hover:text-white/40'
