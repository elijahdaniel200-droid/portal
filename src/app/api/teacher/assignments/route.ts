import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const class_subject_id = searchParams.get('class_subject_id');

    if (!class_subject_id) {
      return NextResponse.json({ error: 'class_subject_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_subject_id', class_subject_id)
      .order('created_at', { ascending: false });

    const { data: materials } = await supabase
      .from('learning_materials')
      .select('*')
      .eq('class_subject_id', class_subject_id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ assignments: assignments || [], materials: materials || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, ...data } = body;
    const supabase = createAdminClient();

    if (type === 'assignment') {
      const { data: inserted, error } = await supabase
        .from('assignments')
        .insert({
          class_subject_id: data.class_subject_id,
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          max_score: data.max_score,
          file_url: data.file_url
        })
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data: inserted });
    } else if (type === 'material') {
      const { data: inserted, error } = await supabase
        .from('learning_materials')
        .insert({
          class_subject_id: data.class_subject_id,
          title: data.title,
          description: data.description,
          file_url: data.file_url,
          material_type: data.material_type
        })
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data: inserted });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
