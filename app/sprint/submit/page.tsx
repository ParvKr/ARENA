'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import {
  Upload, CheckCircle2, X, FileText,
  Image as ImageIcon, Loader2, File, AlertCircle
} from 'lucide-react';
import { useArenaStore } from '@/lib/store';

// ─── FILE UPLOAD HELPER ───────────────────────────────────────────────────────
async function uploadFile(file: File, bucket: 'main' | 'process'): Promise<string> {
  const presignRes = await fetch('/api/upload/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      file_name: file.name,
      file_type: file.type, 
      file_size: file.size, 
      is_process_doc: bucket === 'process' 
    }),
  });
  
  const presignJson = await presignRes.json();
  if (!presignRes.ok) throw new Error(presignJson.error ?? 'Failed to secure upload URL');
  const data = presignJson.data;
  
  const uploadRes = await fetch(data.upload_url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!uploadRes.ok) throw new Error('Failed to upload file');
  
  return data.public_url;
}

// ─── SUBMISSION FORM ──────────────────────────────────────────────────────────
function SubmitForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const user = useArenaStore(s => s.user);

  // Fetch Sprint
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data: sprintData, error: sprintError } = useSWR(id ? `/api/sprint/${id}` : null, fetcher);
  const sprint = sprintData?.data?.sprint;

  // ─── FORM STATE ───
  // Main
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainUrl, setMainUrl] = useState<string | null>(null);
  const [mainUploading, setMainUploading] = useState(false);

  // WIP
  const [wipFiles, setWipFiles] = useState<{ id: string; file: File; url: string | null; uploading: boolean }[]>([]);

  // Brief
  const [interp, setInterp] = useState('');
  const [tools, setTools] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmOwner, setConfirmOwner] = useState(false);

  // Submission state
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  // ─── HANDLERS ───
  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainFile(file);
    setMainUploading(true);
    try {
      const url = await uploadFile(file, 'main');
      setMainUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
      setMainFile(null);
    } finally {
      setMainUploading(false);
    }
  };

  const handleWipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Check max count (10)
    if (wipFiles.length + files.length > 10) {
      alert('Maximum 10 process files allowed.');
      return;
    }

    const newWips = files.map(f => ({ id: Math.random().toString(36).slice(2), file: f, url: null, uploading: true }));
    setWipFiles(prev => [...prev, ...newWips]);

    for (const wip of newWips) {
      try {
        const url = await uploadFile(wip.file, 'process');
        setWipFiles(prev => prev.map(p => p.id === wip.id ? { ...p, url, uploading: false } : p));
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Upload failed');
        setWipFiles(prev => prev.filter(p => p.id !== wip.id));
      }
    }
  };

  const removeWip = (id: string) => {
    setWipFiles(prev => prev.filter(p => p.id !== id));
  };

  const submit = async () => {
    setSubmitStatus('loading');
    setServerError(null);
    try {
      if (!mainUrl) throw new Error('Main deliverable is required.');
      if (wipFiles.length < 2) throw new Error('At least 2 process screenshots are required.');
      if (wipFiles.some(w => !w.url)) throw new Error('Some process files are still uploading.');
      
      const body = {
        main_file_url: mainUrl,
        main_file_type: mainFile?.type,
        process_file_urls: wipFiles.map(w => w.url),
        brief_interpretation: interp,
        tools_used: tools,
        time_spent_hours: Number(hours),
        note_to_judges: notes || undefined,
        ownership_confirmed: confirmOwner,
      };

      const res = await fetch(`/api/sprint/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
      setSubmitStatus('success');
    } catch (err) {
      setSubmitStatus('error');
      setServerError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (user === null) {
      router.replace('/signin');
    }
  }, [user, router]);

  if (user === null) return null;
  if (!id) return <div className="p-10 text-center font-mono text-[#737380]">No sprint ID provided.</div>;
  if (sprintError) return <div className="p-10 text-center font-mono text-[#FF2D55]">Failed to load sprint.</div>;
  if (!sprint) return <div className="p-10 text-center font-mono text-[#737380] animate-pulse">Loading sprint data...</div>;

  if (sprint.sprint_status !== 'live') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="rounded-xl border border-[#FF2D55]/30 bg-[#FF2D55]/5 p-8 text-center max-w-md">
          <AlertCircle className="mx-auto h-8 w-8 text-[#FF2D55] mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Submissions Closed</h2>
          <p className="text-sm text-[#A3A3B0] mb-6">This sprint is no longer accepting submissions.</p>
          <button onClick={() => router.push('/sprint')} className="font-mono text-xs text-[#7C5CFF] hover:text-[#9070FF]">
            ← Back to Active Sprint
          </button>
        </div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl border border-[#4ADE80]/30 bg-[#0A0A0F] p-10 text-center max-w-md w-full shadow-[0_0_50px_rgba(74,222,128,0.1)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4ADE80]/10 mb-6">
            <CheckCircle2 className="h-8 w-8 text-[#4ADE80]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Submission Received</h2>
          <p className="text-sm text-[#A3A3B0] mb-8 leading-relaxed">
            Your project for <strong>{sprint.title}</strong> has been securely logged. Results will be published after the judging phase.
          </p>
          <button onClick={() => router.push('/profile/' + user.username)} className="w-full rounded-xl bg-[#4ADE80] py-3.5 font-display text-sm font-bold text-black transition hover:bg-[#4ADE80]/80">
            View My Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="border-b border-[#1C1C26] bg-[#0A0A0F] pt-24 pb-10">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#7C5CFF] mb-3">Sprint #{sprint.sprint_number} • {sprint.discipline}</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{sprint.title}</h1>
          <p className="font-mono text-sm text-[#737380]">Submit your final deliverables.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 mt-12 space-y-8">
        
        {/* Section 1: Main */}
        <section className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] overflow-hidden">
          <div className="border-b border-[#1C1C26] bg-[#101017] px-6 py-4 flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#7C5CFF]/10 font-mono text-xs font-bold text-[#7C5CFF]">1</span>
            <h2 className="font-display text-base font-bold text-white">Main Deliverable</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-[#A3A3B0]">Upload your final presentation or hero image.</p>
              <p className="font-mono text-[10px] text-[#737380] mt-1">Accepts: PNG, JPEG, PDF. Max 10MB.</p>
            </div>
            
            <label className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition cursor-pointer overflow-hidden ${mainUrl ? 'border-[#4ADE80]/30 bg-[#4ADE80]/5' : mainUploading ? 'border-[#7C5CFF]/30 bg-[#7C5CFF]/5' : 'border-[#1C1C26] hover:border-[#7C5CFF]/50 bg-[#050507]'}`}>
              <input type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" onChange={handleMainUpload} disabled={mainUploading} />
              
              {mainUploading ? (
                <div className="flex flex-col items-center gap-3 text-[#7C5CFF]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="font-mono text-xs">Uploading {mainFile?.name}…</span>
                </div>
              ) : mainUrl ? (
                <div className="flex flex-col items-center gap-3 text-[#4ADE80]">
                  <CheckCircle2 className="h-8 w-8" />
                  <span className="font-mono text-xs">{mainFile?.name} uploaded</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#737380]">
                  <Upload className="h-8 w-8 text-[#A3A3B0]" />
                  <span className="font-mono text-xs">Click to browse or drag and drop</span>
                </div>
              )}
            </label>
          </div>
        </section>

        {/* Section 2: WIP */}
        <section className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] overflow-hidden">
          <div className="border-b border-[#1C1C26] bg-[#101017] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#7C5CFF]/10 font-mono text-xs font-bold text-[#7C5CFF]">2</span>
              <h2 className="font-display text-base font-bold text-white">Process & WIP</h2>
            </div>
            <span className="font-mono text-xs text-[#737380]">{wipFiles.length} / 10</span>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-[#A3A3B0]">Upload at least 2 screenshots showing your work in progress.</p>
              <p className="font-mono text-[10px] text-[#737380] mt-1">Accepts: PNG, JPEG, PDF. Max 5MB each. 2-10 files required.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {wipFiles.map(wip => (
                <div key={wip.id} className="group relative aspect-square rounded-lg border border-[#1C1C26] bg-[#050507] overflow-hidden flex items-center justify-center">
                  {wip.uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#7C5CFF]" />
                  ) : wip.file.type.startsWith('image/') && wip.url ? (
                    <img src={wip.url} alt="WIP" className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-8 w-8 text-[#737380]" />
                  )}
                  {!wip.uploading && (
                    <button onClick={() => removeWip(wip.id)} className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 group-hover:opacity-100 transition backdrop-blur">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              
              {wipFiles.length < 10 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#1C1C26] bg-[#050507] transition hover:border-[#7C5CFF]/50 text-[#737380] hover:text-[#A3A3B0]">
                  <input type="file" multiple accept="image/png,image/jpeg,application/pdf" className="hidden" onChange={handleWipUpload} />
                  <Upload className="h-5 w-5" />
                  <span className="font-mono text-[10px]">Add Files</span>
                </label>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Brief Response */}
        <section className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] overflow-hidden">
          <div className="border-b border-[#1C1C26] bg-[#101017] px-6 py-4 flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#7C5CFF]/10 font-mono text-xs font-bold text-[#7C5CFF]">3</span>
            <h2 className="font-display text-base font-bold text-white">Brief Response</h2>
          </div>
          <div className="p-6 space-y-6">
            
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#A3A3B0]">Interpretation</label>
                <span className={`font-mono text-[10px] ${interp.length < 50 || interp.length > 300 ? 'text-[#FF2D55]' : 'text-[#737380]'}`}>
                  {interp.length} / 300
                </span>
              </div>
              <textarea value={interp} onChange={e => setInterp(e.target.value)} rows={3} placeholder="How did you interpret the brief and constraints?" className="w-full rounded-lg border border-[#1C1C26] bg-[#050507] px-3 py-2.5 text-sm text-[#F5F5F7] outline-none transition focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/30 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#A3A3B0]">Tools Used</label>
                <input type="text" value={tools} onChange={e => setTools(e.target.value)} placeholder="e.g. Figma, Midjourney" className="w-full rounded-lg border border-[#1C1C26] bg-[#050507] px-3 py-2.5 text-sm text-[#F5F5F7] outline-none transition focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/30" />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#A3A3B0]">Time Spent (Hours)</label>
                <input type="number" min="1" max="48" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 12" className="w-full rounded-lg border border-[#1C1C26] bg-[#050507] px-3 py-2.5 text-sm text-[#F5F5F7] outline-none transition focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#A3A3B0]">Note to Judges (Optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-[#1C1C26] bg-[#050507] px-3 py-2.5 text-sm text-[#F5F5F7] outline-none transition focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/30 resize-none" />
            </div>

          </div>
        </section>

        {/* Section 4: Submit */}
        <section className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] overflow-hidden">
          <div className="p-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#2C2C3A] bg-[#050507] transition-colors group-hover:border-[#7C5CFF]">
                <input type="checkbox" checked={confirmOwner} onChange={e => setConfirmOwner(e.target.checked)} className="peer absolute h-full w-full cursor-pointer opacity-0" />
                <div className="pointer-events-none opacity-0 transition-opacity peer-checked:opacity-100 text-[#7C5CFF]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-[#F5F5F7]">I confirm this is my original work.</p>
                <p className="text-xs text-[#737380] mt-1">I own all rights to the submitted assets and grant Arena permission to display them.</p>
              </div>
            </label>
            
            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex items-start gap-3 rounded-lg border border-[#FF2D55]/30 bg-[#FF2D55]/5 p-4">
                  <AlertCircle className="h-4 w-4 text-[#FF2D55] mt-0.5 shrink-0" />
                  <p className="font-mono text-xs text-[#FF2D55]">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={submit}
              disabled={submitStatus === 'loading' || !confirmOwner || !mainUrl || wipFiles.length < 2}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C5CFF] py-4 font-display text-base font-bold text-white transition-all hover:bg-[#9070FF] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(124,92,255,0.3)]"
            >
              {submitStatus === 'loading' ? <><Loader2 className="h-5 w-5 animate-spin" /> Finalizing Submission…</> : 'Submit Final Project'}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono text-[#737380]">Loading...</div>}>
      <SubmitForm />
    </Suspense>
  );
}
