import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { lmsFallbackStore } from '@/lib/lms-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');
    const classId = searchParams.get('class_id');

    const supabase = createAdminClient();

    let query = supabase
      .from('announcements')
      .select('*, profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (target) {
      if (classId && target === 'SPECIFIC_CLASS') {
        query = query.eq('class_id', classId);
      } else {
        query = query.or(`target.eq.ALL,target.eq.${target}`);
      }
    }

    const { data, error } = await query;

    if (error && error.code === 'PGRST205') {
      const fallbackAnnouncements = lmsFallbackStore.getAnnouncements(target, classId);
      return NextResponse.json({ data: fallbackAnnouncements });
    } else if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      const fallbackAnnouncements = lmsFallbackStore.getAnnouncements(target, classId);
      return NextResponse.json({ data: fallbackAnnouncements });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Announcements GET error:', err);
    return NextResponse.json({ data: lmsFallbackStore.getAnnouncements() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('announcements')
      .insert([body])
      .select()
      .single();

    if (error && error.code === 'PGRST205') {
      const fallbackCreated = lmsFallbackStore.addAnnouncement(body);
      return NextResponse.json({ success: true, data: fallbackCreated });
    } else if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Announcements POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
