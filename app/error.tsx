'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <AlertTriangle className="w-16 h-16 text-arena-gold mb-6" />
      <h2 className="text-2xl font-body font-semibold text-arena-offwhite mb-4">Something went wrong!</h2>
      <p className="text-arena-gray mb-8 max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      <Button 
        onClick={() => reset()}
        className="bg-arena-surface-h hover:bg-arena-border-l text-arena-offwhite"
      >
        Try again
      </Button>
    </div>
  )
}
