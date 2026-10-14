import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { lmsFallbackStore } from '@/lib/lms-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const class_subject_id = searchParams.get('class_subject_id');

    if (!class_subject_id) {
      return NextResponse.json({ error: 'class_subject_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    let assignments: any[] = [];
    let materials: any[] = [];

    // 1. Query Assignments
    const { data: dbAssignments, error: asgErr } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_subject_id', class_subject_id)
      .order('created_at', { ascending: false });

    if (asgErr && asgErr.code === 'PGRST205') {
      assignments = lmsFallbackStore.getAssignments(class_subject_id);
    } else if (!asgErr && dbAssignments && dbAssignments.length > 0) {
      assignments = dbAssignments;
    } else {
      // Empty or fallback
      assignments = lmsFallbackStore.getAssignments(class_subject_id);
    }

    // 2. Query Materials
    const { data: dbMaterials, error: matErr } = await supabase
      .from('learning_materials')
      .select('*')
      .eq('class_subject_id', class_subject_id)
      .order('created_at', { ascending: false });

    if (matErr && matErr.code === 'PGRST205') {
      materials = lmsFallbackStore.getMaterials(class_subject_id);
    } else if (!matErr && dbMaterials && dbMaterials.length > 0) {
      materials = dbMaterials;
    } else {
      materials = lmsFallbackStore.getMaterials(class_subject_id);
    }

    return NextResponse.json({ assignments, materials });
  } catch (err: any) {
    console.error('Teacher assignments GET error:', err);
    return NextResponse.json({
      assignments: lmsFallbackStore.getAssignments(),
      materials: lmsFallbackStore.getMaterials()
    });
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

      if (error && error.code === 'PGRST205') {
        const fallbackCreated = lmsFallbackStore.addAssignment(data);
        return NextResponse.json({ success: true, data: fallbackCreated });
      } else if (error) {
        throw error;
      }
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

      if (error && error.code === 'PGRST205') {
        const fallbackCreated = lmsFallbackStore.addMaterial(data);
        return NextResponse.json({ success: true, data: fallbackCreated });
      } else if (error) {
        throw error;
      }
      return NextResponse.json({ success: true, data: inserted });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    console.error('Teacher assignments POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
