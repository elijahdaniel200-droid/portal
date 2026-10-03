import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Fetch all class_subjects with related info
    const { data, error } = await supabase
      .from('class_subjects')
      .select(`
        id,
        classes ( id, name ),
        subjects ( id, name, code ),
        teachers ( profiles ( first_name, last_name ) )
      `);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Format response
    const formattedData = data.map((item: any) => ({
      id: item.id,
      class_name: item.classes?.name || 'Unknown Class',
      subject_name: item.subjects?.name || 'Unknown Subject',
      subject_code: item.subjects?.code || '---',
      teacher_name: item.teachers?.profiles 
        ? `${item.teachers.profiles.first_name} ${item.teachers.profiles.last_name}` 
        : 'TBA'
    }));

    return NextResponse.json({ data: formattedData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
