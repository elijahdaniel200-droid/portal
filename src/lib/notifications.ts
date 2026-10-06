import { createAdminClient } from './supabase-admin';

export async function createNotification(userId: string, title: string, message: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message
    });
  
  if (error) {
    console.error('Failed to create notification:', error);
  }
}
