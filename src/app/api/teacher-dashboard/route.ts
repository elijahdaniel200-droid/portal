import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacher_id = searchParams.get('teacher_id');

    if (!teacher_id) {
      return NextResponse.json({ error: 'teacher_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch classes assigned to this teacher
    const { data: classSubjects, error: csErr } = await supabase
      .from('class_subjects')
      .select(`
        id,
        classes ( id, name ),
        subjects ( id, name, code )
      `)
      .eq('teacher_id', teacher_id);

    if (csErr) {
      console.error("class_subjects fetch error:", csErr);
      return NextResponse.json({ error: csErr.message }, { status: 500 });
    }

    // Since we don't have easily accessible aggregate stats in one query,
    // let's format what we have.
    // For each class_subject, we could potentially count students.
    
    // Get unique classes
    const uniqueClassesMap = new Map();
    classSubjects?.forEach((cs: any) => {
      if (cs.classes) {
        if (!uniqueClassesMap.has(cs.classes.id)) {
          uniqueClassesMap.set(cs.classes.id, {
            id: cs.classes.id,
            name: cs.classes.name,
            subjects: []
          });
        }
        uniqueClassesMap.get(cs.classes.id).subjects.push(cs.subjects?.name);
      }
    });

    const assignedClasses = Array.from(uniqueClassesMap.values());
    
    // Count total students in these classes
    let totalStudents = 0;
    if (assignedClasses.length > 0) {
      const classIds = assignedClasses.map(c => c.id);
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .in('class_id', classIds);
        
      totalStudents = count || 0;
    }

    return NextResponse.json({ 
      assignedClasses,
      classSubjects,
      stats: {
        totalStudents,
        totalClasses: assignedClasses.length,
        totalSubjects: classSubjects?.length || 0
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
