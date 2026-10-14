// In-memory fallback and seed cache for LMS and Announcements
// Used when tables are pending execution of `supabase_production_migration.sql` in the Supabase SQL editor.

export interface Assignment {
  id: string;
  class_subject_id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  file_url?: string | null;
  created_at: string;
}

export interface LearningMaterial {
  id: string;
  class_subject_id: string;
  title: string;
  description: string;
  file_url?: string | null;
  material_type: 'DOCUMENT' | 'PDF' | 'VIDEO' | 'LINK';
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string;
  file_url?: string | null;
  score?: number | null;
  feedback?: string | null;
  status: 'SUBMITTED' | 'GRADED' | 'PENDING';
  submitted_at: string;
  students?: {
    enrollment_number: string;
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'ALL' | 'STUDENT' | 'TEACHER' | 'SPECIFIC_CLASS';
  category?: 'ACADEMIC' | 'EVENT' | 'EXAM' | 'FEES' | 'GENERAL';
  class_id?: string | null;
  created_by?: string | null;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

// Global in-memory cache shared across API calls in the Node process
const globalAssignments: Assignment[] = [
  {
    id: 'asg-math-01',
    class_subject_id: 'default',
    title: 'Calculus & Quadratic Equations Worksheet',
    description: 'Solve problems 1 through 15 on page 42. Show all step-by-step working including factorization and the quadratic formula.',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    max_score: 100,
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'asg-eng-02',
    class_subject_id: 'default',
    title: 'Expository Essay: Climate Change in West Africa',
    description: 'Write a 500-word essay discussing the effects of desertification and coastal erosion on agriculture and economic stability in Nigeria.',
    due_date: new Date(Date.now() + 8 * 86400000).toISOString(),
    max_score: 50,
    file_url: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'asg-phy-03',
    class_subject_id: 'default',
    title: 'Newtonian Mechanics Lab Experiment Report',
    description: 'Submit your completed lab write-up including hypothesis, apparatus diagram, data tables, acceleration vs mass graphs, and percentage error calculations.',
    due_date: new Date(Date.now() + 10 * 86400000).toISOString(),
    max_score: 100,
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  }
];

const globalMaterials: LearningMaterial[] = [
  {
    id: 'mat-01',
    class_subject_id: 'default',
    title: 'First Term Scheme of Work & Syllabus',
    description: 'Complete syllabus breakdown, week-by-week topics, recommended textbooks, and continuous assessment calendar.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    material_type: 'PDF',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'mat-02',
    class_subject_id: 'default',
    title: 'Video Lecture: Organic Chemistry Reactions',
    description: 'Step-by-step explanation of alkanes, alkenes, functional groups, and esterification reaction mechanisms.',
    file_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    material_type: 'VIDEO',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'mat-03',
    class_subject_id: 'default',
    title: 'WAEC Past Questions & Solutions (2020-2025)',
    description: 'Compiled past examinations questions with detailed model solutions and chief examiners report remarks.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    material_type: 'DOCUMENT',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  }
];

const globalSubmissions: Submission[] = [
  {
    id: 'sub-01',
    assignment_id: 'asg-math-01',
    student_id: '10eb2b57-4ced-4c54-8eed-76402dab8b01',
    submission_text: 'Attached is my step-by-step solution to the 15 quadratic equations problems using both factorization and completing the square.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    score: 92,
    feedback: 'Excellent methodology and clear step-by-step derivations. Keep up the high standard!',
    status: 'GRADED',
    submitted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    students: {
      enrollment_number: 'STU-2026-1456',
      profiles: {
        first_name: 'Daniel',
        last_name: 'Elijah',
        email: 'daniel.student@school.edu'
      }
    }
  },
  {
    id: 'sub-02',
    assignment_id: 'asg-math-01',
    student_id: '0a1eea81-16ec-473a-ac23-a69ef6f8b40e',
    submission_text: 'I completed all questions from 1 through 15. For question 12, I used the discriminant test to verify real roots.',
    file_url: null,
    score: null,
    feedback: null,
    status: 'SUBMITTED',
    submitted_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    students: {
      enrollment_number: 'STU-2026-7444',
      profiles: {
        first_name: 'Chioma',
        last_name: 'Okeke',
        email: 'chioma.student@school.edu'
      }
    }
  }
];

const globalAnnouncements: Announcement[] = [
  {
    id: 'ann-01',
    title: 'First Term Mid-Term Assessment Schedule Released',
    content: 'Continuous Assessment 2 (CA2) testing will commence on Monday next week. All students are advised to check their respective subject timetable and ensure all pending assignments are submitted.',
    target: 'ALL',
    category: 'ACADEMIC',
    class_id: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    profiles: {
      first_name: 'Vice Principal',
      last_name: 'Academics'
    }
  },
  {
    id: 'ann-02',
    title: 'School Fees Settlement & Bursary Clearance Reminder',
    content: 'All parents and guardians are reminded that the portal deadline for First Term tuition fee settlement is approaching. Instant electronic receipts can now be downloaded directly from your Student Finance Center.',
    target: 'ALL',
    category: 'FEES',
    class_id: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    profiles: {
      first_name: 'Bursar',
      last_name: 'Finance'
    }
  },
  {
    id: 'ann-03',
    title: 'Annual Inter-House Sports & Cultural Festival',
    content: 'House color selections and sports registration have opened! House captains should report to the Sports Pavilion on Thursday at 3:00 PM for track and field heats.',
    target: 'STUDENT',
    category: 'EVENT',
    class_id: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    profiles: {
      first_name: 'Director',
      last_name: 'Student Affairs'
    }
  }
];

// Helper functions for fallback management
export const lmsFallbackStore = {
  getAssignments: (classSubjectId?: string | null) => {
    if (!classSubjectId || classSubjectId === 'default') return globalAssignments;
    const filtered = globalAssignments.filter(a => a.class_subject_id === classSubjectId || a.class_subject_id === 'default');
    return filtered.length > 0 ? filtered : globalAssignments;
  },
  addAssignment: (asg: Partial<Assignment>) => {
    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      class_subject_id: asg.class_subject_id || 'default',
      title: asg.title || 'Untitled Assignment',
      description: asg.description || '',
      due_date: asg.due_date || new Date(Date.now() + 7 * 86400000).toISOString(),
      max_score: asg.max_score || 100,
      file_url: asg.file_url || null,
      created_at: new Date().toISOString()
    };
    globalAssignments.unshift(newAsg);
    return newAsg;
  },
  getMaterials: (classSubjectId?: string | null) => {
    if (!classSubjectId || classSubjectId === 'default') return globalMaterials;
    const filtered = globalMaterials.filter(m => m.class_subject_id === classSubjectId || m.class_subject_id === 'default');
    return filtered.length > 0 ? filtered : globalMaterials;
  },
  addMaterial: (mat: Partial<LearningMaterial>) => {
    const newMat: LearningMaterial = {
      id: `mat-${Date.now()}`,
      class_subject_id: mat.class_subject_id || 'default',
      title: mat.title || 'Untitled Material',
      description: mat.description || '',
      file_url: mat.file_url || null,
      material_type: mat.material_type || 'DOCUMENT',
      created_at: new Date().toISOString()
    };
    globalMaterials.unshift(newMat);
    return newMat;
  },
  getSubmissions: (assignmentId: string) => {
    return globalSubmissions.filter(s => s.assignment_id === assignmentId || assignmentId.startsWith('asg-'));
  },
  saveSubmission: (sub: { assignment_id: string; student_id: string; submission_text: string; file_url?: string | null }) => {
    const existingIndex = globalSubmissions.findIndex(s => s.assignment_id === sub.assignment_id && s.student_id === sub.student_id);
    if (existingIndex >= 0) {
      globalSubmissions[existingIndex] = {
        ...globalSubmissions[existingIndex],
        submission_text: sub.submission_text,
        file_url: sub.file_url || globalSubmissions[existingIndex].file_url,
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString()
      };
      return globalSubmissions[existingIndex];
    }
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignment_id: sub.assignment_id,
      student_id: sub.student_id,
      submission_text: sub.submission_text,
      file_url: sub.file_url || null,
      status: 'SUBMITTED',
      submitted_at: new Date().toISOString(),
      students: {
        enrollment_number: 'STU-2026-CURRENT',
        profiles: {
          first_name: 'Current',
          last_name: 'Student',
          email: 'student@school.edu'
        }
      }
    };
    globalSubmissions.unshift(newSub);
    return newSub;
  },
  gradeSubmission: (submissionId: string, score: number, feedback: string) => {
    const sub = globalSubmissions.find(s => s.id === submissionId);
    if (sub) {
      sub.score = score;
      sub.feedback = feedback;
      sub.status = 'GRADED';
      return sub;
    }
    return null;
  },
  getStudentSubmissions: (studentId: string) => {
    return globalSubmissions.filter(s => s.student_id === studentId);
  },
  getAnnouncements: (target?: string | null, classId?: string | null) => {
    return globalAnnouncements.filter(a => {
      if (!target || target === 'ALL') return true;
      if (a.target === 'ALL') return true;
      if (a.target === target) {
        if (target === 'SPECIFIC_CLASS' && classId) {
          return a.class_id === classId;
        }
        return true;
      }
      return false;
    });
  },
  addAnnouncement: (ann: Partial<Announcement>) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: ann.title || 'Untitled Announcement',
      content: ann.content || '',
      target: ann.target || 'ALL',
      category: ann.category || 'GENERAL',
      class_id: ann.class_id || null,
      created_by: ann.created_by || null,
      created_at: new Date().toISOString(),
      profiles: {
        first_name: 'Administration',
        last_name: ''
      }
    };
    globalAnnouncements.unshift(newAnn);
    return newAnn;
  }
};
