import { Resend } from 'resend';

// ─── SINGLETON MODULE SCOPE INITIALIZATION ──────────────────────────────────
// Cached instance prevents memory footprint accumulation across serverless cold starts
const apiKey = process.env.RESEND_API_KEY;
const isProduction = process.env.NODE_ENV === 'production';

if (!apiKey && isProduction) {
  throw new Error('[CRITICAL CONFIG] Missing required production environmental variable: RESEND_API_KEY');
}

const resendInstance = new Resend(apiKey || 'mock_key_development_sentinel');

/* * FIXED: Dynamically switch sender configuration.
 * Development sandbox mode requires using the onboarding@resend.dev address.
 */
const FROM_ADDRESS = isProduction
  ? `Arena <no-reply@mail.projectarena.com>`
  : `Arena Staging <onboarding@resend.dev>`;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://projectarena.vercel.app';

interface CentralizedEmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Centralized Email Wrapper Core Delivery Engine.
 * Wraps every transactional execution block defensively to protect core flows from provider downtimes.
 */
async function sendEmail({ to, subject, html }: CentralizedEmailPayload): Promise<void> {
  try {
    /*
     * FIXED: Intercept destination parameters in development mode.
     * Resend blocks delivery to unverified external emails unless they match your account owner address.
     * In development mode, we route the email parameters to onboarding@resend.dev to pass safely.
     */
    const destinationRecipient = isProduction ? to : 'onboarding@resend.dev';

    const { error } = await resendInstance.emails.send({
      from: FROM_ADDRESS,
      to: destinationRecipient,
      subject: isProduction ? subject : `[STAGING RE-ROUTE FOR ${to}]: ${subject}`,
      html,
    });

    if (error) {
      console.error(`[EMAIL DELIVERY REJECTION] Resend API error: ${error.message}`, { to, subject });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown connection infrastructure exception';
    console.error(`[EMAIL SYSTEM FAILURE] Out-of-band delivery crash: ${message}`, { to, subject, errorInstance: err });
  }
}

// ─── RE-ENGINEERED TRANSACTIONAL METRICS LIFECYCLE ──────────────────────────

/**
 * Broadcasts a challenge notification email to all registered users when a new Sprint brief drops.
 */
export async function sendBriefDropEmail(sprintId: string): Promise<void> {
  // V0.1 Simulation Stub — Triggered safely inside detached async threads
  console.log(`[OUT-OF-BAND TASK ENGINE] Brief drop broadcast emails queued for sprint entry id: ${sprintId}`);
  return Promise.resolve();
}

/**
 * Sent immediately after a competitor submits their entry.
 */
export async function sendSubmissionConfirmation(
  email: string,
  submissionId: string,
  sprintId: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Your Arena submission is in — good luck.',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <h2>You're in.</h2>
        <p>Your submission has been received and is safely queued for blind judging.</p>
        <div style="background: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>Entry Identifier Reference:</strong><br/>
          <code style="font-size: 14px;">${submissionId}</code>
        </div>
        <p>Results will be published on Wednesday. We will notify you via email the exact second they drop live.</p>
        <a href="${BASE_URL}/sprint/${sprintId}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View the Brief</a>
      </div>
    `,
  });
}

/**
 * Sent to a judge when they are assigned to an active sprint.
 */
export async function sendJudgeAssignment(
  email: string,
  sprintId: string,
  sprintTitle: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `[Arena] Judge Assignment: ${sprintTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <h2>Judge Assignment Activated</h2>
        <p>You have been assigned to evaluate entries for: <strong>${sprintTitle}</strong>.</p>
        <p>The judging matrix opens automatically when the submission window closes (Sunday 6:00 PM UTC).</p>
        <p>You have exactly <strong>48 hours</strong> to complete your evaluations. Reminder: To ensure unbiased scoring, all competitor identity attributes are strictly anonymized.</p>
        <a href="${BASE_URL}/judge/sprint/${sprintId}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">Open Judge Dashboard</a>
      </div>
    `,
  });
}

/**
 * Sent to a judge who has outstanding entries remaining with less than 24 hours in the window.
 */
export async function sendJudgeReminder(
  email: string,
  scored: number,
  total: number
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Urgent Reminder: Your Arena judging window closes in 24 hours.',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <h2>Your evaluation window closes in 24 hours.</h2>
        <p>You have currently scored <strong>${scored}</strong> out of <strong>${total}</strong> total submission payloads.</p>
        <p>Please log in to finalize your outstanding evaluations before the deadline lock resets.</p>
        <a href="${BASE_URL}/judge" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">Continue Judging</a>
      </div>
    `,
  });
}

/**
 * Sent to a participant when sprint results are published.
 */
export async function sendResultsNotification(
  email: string,
  rank: number,
  sprintId: string
): Promise<void> {
  const isWinner = rank <= 3;
  const subject = isWinner
    ? `🏆 You placed #${rank} in an Arena Sprint!`
    : 'Arena Sprint results are officially live.';

  await sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <h2>${isWinner ? '🏆 You placed on the leaderboard!' : 'Results are in.'}</h2>
        <p>You finished with an official placement of <strong>#${rank}</strong> for this competitive Sprint track.</p>
        <p>Thank you for competing. Head over to the global leaderboard to review the winning entries and breakdown mechanics.</p>
        <a href="${BASE_URL}/sprint/${sprintId}/results" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">See Full Results</a>
      </div>
    `,
  });
}

/**
 * Sent to a user when their account profile is created.
 */
export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Welcome to Arena, ${username}.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
        <h2>Welcome to the Arena, @${username}.</h2>
        <p>Arena is built to show what you can actually execute. No resumes, no fluff—just raw craft skill.</p>
        <p>A new live Sprint brief drops every single Friday at 6:00 PM UTC. You have exactly 48 hours to design, iterate, and submit your solution.</p>
        <a href="${BASE_URL}/sprint" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">See This Week's Brief</a>
      </div>
    `,
  });
}
