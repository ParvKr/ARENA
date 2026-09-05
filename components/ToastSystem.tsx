'use client'

import { useArenaStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Trophy, Crown } from 'lucide-react'
import { ToastType } from '@/lib/store/toast.slice'
import { ReactNode } from 'react'

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-arena-green" />,
  error: <AlertCircle className="w-5 h-5 text-arena-red" />,
  warning: <AlertTriangle className="w-5 h-5 text-arena-gold" />,
  info: <Info className="w-5 h-5 text-arena-cyan" />,
  achievement: <Trophy className="w-5 h-5 text-arena-purple" />,
  rankup: <Crown className="w-5 h-5 text-arena-gold" />
}

const colors: Record<ToastType, string> = {
  success: 'border-arena-green',
  error: 'border-arena-red',
  warning: 'border-arena-gold',
  info: 'border-arena-cyan',
  achievement: 'border-arena-purple',
  rankup: 'border-arena-gold glow-gold'
}

export default function ToastSystem() {
  const toasts = useArenaStore((state) => state.toasts)
  const removeToast = useArenaStore((state) => state.removeToast)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-arena-card border-l-4 ${colors[toast.type]} rounded shadow-lg relative`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 text-sm font-medium pr-6">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-4 right-4 text-arena-gray hover:text-arena-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
