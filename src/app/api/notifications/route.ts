import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20); // Get latest 20 notifications

    if (error) throw error;

    return NextResponse.json({ notifications: notifications || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, notificationIds } = await req.json();

    if (!userId || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'userId and notificationIds array are required' }, { status: 400 });
    }

    if (notificationIds.length === 0) {
      return NextResponse.json({ success: true });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds)
      .eq('user_id', userId); // Ensure the notifications belong to the user

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
