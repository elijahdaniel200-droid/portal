// Standardized Continuous Assessment & Grading System
// Aligned with the West African Examinations Council (WAEC) & Nigerian Secondary Education Scheme

export interface AssessmentBreakdown {
  ca1: number; // Max 20
  ca2: number; // Max 20
  exam: number; // Max 60
}

export interface GradeResult {
  score: number;
  grade: string;
  remark: string;
  points: number;
  color: string;
  badgeClass: string;
}

export function computeTotalScore(breakdown: Partial<AssessmentBreakdown>): number {
  const ca1 = Math.min(Math.max(Number(breakdown.ca1) || 0, 0), 20);
  const ca2 = Math.min(Math.max(Number(breakdown.ca2) || 0, 0), 20);
  const exam = Math.min(Math.max(Number(breakdown.exam) || 0, 0), 60);
  return Math.round(ca1 + ca2 + exam);
}

export function calculateGrade(score: number): GradeResult {
  const rounded = Math.min(Math.max(Math.round(score), 0), 100);

  if (rounded >= 75) {
    return {
      score: rounded,
      grade: 'A1',
      remark: 'Distinction',
      points: 9,
      color: '#059669',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
  }
  if (rounded >= 70) {
    return {
      score: rounded,
      grade: 'B2',
      remark: 'Very Good',
      points: 8,
      color: '#0284c7',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    };
  }
  if (rounded >= 65) {
    return {
      score: rounded,
      grade: 'B3',
      remark: 'Good',
      points: 7,
      color: '#2563eb',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    };
  }
  if (rounded >= 60) {
    return {
      score: rounded,
      grade: 'C4',
      remark: 'Credit',
      points: 6,
      color: '#0d9488',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    };
  }
  if (rounded >= 55) {
    return {
      score: rounded,
      grade: 'C5',
      remark: 'Credit',
      points: 5,
      color: '#d97706',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }
  if (rounded >= 50) {
    return {
      score: rounded,
      grade: 'C6',
      remark: 'Credit',
      points: 4,
      color: '#ea580c',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    };
  }
  if (rounded >= 45) {
    return {
      score: rounded,
      grade: 'D7',
      remark: 'Pass',
      points: 3,
      color: '#b45309',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
  }
  if (rounded >= 40) {
    return {
      score: rounded,
      grade: 'E8',
      remark: 'Pass',
      points: 2,
      color: '#9333ea',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    };
  }
  return {
    score: rounded,
    grade: 'F9',
    remark: 'Fail',
    points: 0,
    color: '#e11d48',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  };
}
