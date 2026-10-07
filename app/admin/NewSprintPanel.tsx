'use client';

// app/admin/NewSprintPanel.tsx
// Slide-over that holds the create-sprint form, so it isn't taking half the console all the time.

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CreateSprintForm } from './CreateSprintForm';

export function NewSprintPanel({ nextSprintNumber, onClose }: { nextSprintNumber: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/80"
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="New sprint"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-2xl flex-col border-l border-white/15 bg-void"
      >
        <header className="flex items-center justify-between border-b border-white/15 px-6 py-4">
          <div>
            <h2 className="font-poster text-3xl uppercase leading-none">New sprint</h2>
            <p className="mt-1 font-mono text-xs text-smoke">Sprint #{nextSprintNumber} · saved as a draft</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 hover:border-chalk hover:text-chalk"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <CreateSprintForm nextSprintNumber={nextSprintNumber} onCreated={onClose} />
        </div>
      </motion.aside>
    </>
  );
}
