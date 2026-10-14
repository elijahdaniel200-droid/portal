import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { lmsFallbackStore } from '@/lib/lms-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Resolve student's class and enrolled subjects
    const { data: student } = await supabase
      .from('students')
      .select('class_id')
      .eq('id', student_id)
      .maybeSingle();

    let classSubjectIds: string[] = [];

    if (student?.class_id) {
      const { data: classSubjects } = await supabase
        .from('class_subjects')
        .select('id, subject_id, subjects(name, code)')
        .eq('class_id', student.class_id);

      if (classSubjects && classSubjects.length > 0) {
        classSubjectIds = classSubjects.map(cs => cs.id);
      }
    }

    // Fallback: also check grades table
    const { data: grades } = await supabase
      .from('grades')
      .select('class_subject_id')
      .eq('student_id', student_id);

    if (grades) {
      for (const g of grades) {
        if (!classSubjectIds.includes(g.class_subject_id)) {
          classSubjectIds.push(g.class_subject_id);
        }
      }
    }

    // Fetch subjects details for filter dropdown
    let subjectsList: any[] = [];
    if (classSubjectIds.length > 0) {
      const { data: subData } = await supabase
        .from('class_subjects')
        .select('id, subjects(id, name, code)')
        .in('id', classSubjectIds);
      subjectsList = subData || [];
    }

    // 2. Fetch Assignments
    let assignments: any[] = [];
    const { data: dbAssignments, error: asgErr } = await supabase
      .from('assignments')
      .select('*, class_subjects(subjects(name, code))')
      .in('class_subject_id', classSubjectIds.length > 0 ? classSubjectIds : ['00000000-0000-0000-0000-000000000000'])
      .order('created_at', { ascending: false });

    if (asgErr && asgErr.code === 'PGRST205') {
      assignments = lmsFallbackStore.getAssignments().map(a => ({
        ...a,
        class_subjects: { subjects: { name: 'Core Subject', code: 'CORE' } }
      }));
    } else if (!asgErr && dbAssignments && dbAssignments.length > 0) {
      assignments = dbAssignments;
    } else {
      assignments = lmsFallbackStore.getAssignments().map(a => ({
        ...a,
        class_subjects: { subjects: { name: 'Core Subject', code: 'CORE' } }
      }));
    }

    // 3. Fetch Submissions for this student and merge with assignments
    let submissions: any[] = [];
    const { data: dbSubmissions, error: subErr } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('student_id', student_id);

    if (subErr && subErr.code === 'PGRST205') {
      submissions = lmsFallbackStore.getStudentSubmissions(student_id);
    } else if (!subErr && dbSubmissions) {
      submissions = dbSubmissions;
    } else {
      submissions = lmsFallbackStore.getStudentSubmissions(student_id);
    }

    const assignmentsWithSubmissions = assignments.map(a => {
      const sub = submissions.find(s => s.assignment_id === a.id);
      return {
        ...a,
        submission: sub ? {
          id: sub.id,
          status: sub.status || 'SUBMITTED',
          score: sub.score,
          feedback: sub.feedback,
          file_url: sub.file_url,
          submission_text: sub.submission_text,
          submitted_at: sub.submitted_at
        } : null
      };
    });

    // 4. Fetch Materials
    let materials: any[] = [];
    const { data: dbMaterials, error: matErr } = await supabase
      .from('learning_materials')
      .select('*, class_subjects(subjects(name, code))')
      .in('class_subject_id', classSubjectIds.length > 0 ? classSubjectIds : ['00000000-0000-0000-0000-000000000000'])
      .order('created_at', { ascending: false });

    if (matErr && matErr.code === 'PGRST205') {
      materials = lmsFallbackStore.getMaterials().map(m => ({
        ...m,
        class_subjects: { subjects: { name: 'General Resource', code: 'GEN' } }
      }));
    } else if (!matErr && dbMaterials && dbMaterials.length > 0) {
      materials = dbMaterials;
    } else {
      materials = lmsFallbackStore.getMaterials().map(m => ({
        ...m,
        class_subjects: { subjects: { name: 'General Resource', code: 'GEN' } }
      }));
    }

    return NextResponse.json({
      assignments: assignmentsWithSubmissions,
      materials,
      subjects: subjectsList
    });

  } catch (err: any) {
    console.error('Student e-learning GET exception:', err);
    return NextResponse.json({
      assignments: lmsFallbackStore.getAssignments().map(a => ({
        ...a,
        class_subjects: { subjects: { name: 'General Subject', code: 'GEN' } },
        submission: null
      })),
      materials: lmsFallbackStore.getMaterials().map(m => ({
        ...m,
        class_subjects: { subjects: { name: 'General Resource', code: 'GEN' } }
      })),
      subjects: []
    });
  }
}
