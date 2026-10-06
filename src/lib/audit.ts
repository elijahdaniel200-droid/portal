import { createAdminClient } from './supabase-admin';

export async function logAuditAction(userId: string | null, action: string, details: Record<string, any> = {}) {
  try {
    const supabase = createAdminClient();
    await supabase.from('audit_logs').insert({
      user_id: userId || null,
      action,
      details,
    });
  } catch (err) {
    console.error('Failed to log audit action:', err);
  }
}
