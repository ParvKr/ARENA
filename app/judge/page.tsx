import { redirect } from 'next/navigation';
import { requireAuth, AuthError } from '@/lib/middleware/auth';
import { requireProfileRole, RoleError } from '@/lib/middleware/roles';
import { JudgeDashboard } from './JudgeDashboard';

export default async function JudgePage() {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) redirect('/signin?next=/judge');
    throw error;
  }

  try {
    await requireProfileRole(user.id, 'judge');
  } catch (error) {
    if (error instanceof RoleError) redirect('/sprint');
    throw error;
  }

  return <JudgeDashboard />;
}
