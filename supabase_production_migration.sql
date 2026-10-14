-- ==============================================================================
-- EDUPORTAL — PRODUCTION DATABASE SCHEMA & RLS SECURITY LOCKDOWN
-- Run this in your Supabase SQL Editor:
-- Dashboard -> Project Settings / SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Types & Enums (Idempotent)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE fee_status AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE grade_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'LOCKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE announcement_target AS ENUM ('ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'SPECIFIC_CLASS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE timetable_type AS ENUM ('CLASS', 'EXAMINATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('PENDING', 'SUBMITTED', 'LATE', 'GRADED', 'RESUBMITTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Alter Existing Tables with Missing Columns
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.subjects 
  ADD COLUMN IF NOT EXISTS is_elective BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS credit_units INTEGER DEFAULT 1;

ALTER TABLE IF EXISTS public.grades
  ADD COLUMN IF NOT EXISTS ca1 NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ca2 NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exam NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS breakdown JSONB DEFAULT '{"ca1":0,"ca2":0,"exam":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS status grade_status DEFAULT 'DRAFT';

-- 4. Foreign Key Constraints & Uniqueness
ALTER TABLE IF EXISTS public.students DROP CONSTRAINT IF EXISTS fk_class_id;
ALTER TABLE IF EXISTS public.students 
  ADD CONSTRAINT fk_class_id FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

DO $$ BEGIN
    ALTER TABLE public.grades 
      ADD CONSTRAINT unique_student_subject_term UNIQUE (student_id, class_subject_id, term_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.attendance 
      ADD CONSTRAINT unique_student_daily_attendance UNIQUE (student_id, date);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN null; END $$;

-- 5. Missing Tables DDL

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_subject_id UUID REFERENCES public.class_subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    max_score NUMERIC(5, 2) DEFAULT 100,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    score NUMERIC(5, 2),
    feedback TEXT,
    status submission_status DEFAULT 'PENDING',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- Learning Materials
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_subject_id UUID REFERENCES public.class_subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    material_type TEXT CHECK (material_type IN ('PDF', 'VIDEO', 'DOCUMENT', 'LINK')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetables
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type timetable_type NOT NULL DEFAULT 'CLASS',
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT
);

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target announcement_target NOT NULL DEFAULT 'ALL',
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- School Settings
CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name TEXT NOT NULL DEFAULT 'EduPortal International High School',
    school_address TEXT DEFAULT '10 Academic Boulevard, Uyo, Akwa Ibom State',
    school_logo_url TEXT DEFAULT '/eduportal-logo.jpg',
    current_term_id UUID REFERENCES public.academic_terms(id) ON DELETE SET NULL,
    grading_system JSONB DEFAULT '{"A1":[75,100],"B2":[70,74],"B3":[65,69],"C4":[60,64],"C5":[55,59],"C6":[50,54],"D7":[45,49],"E8":[40,44],"F9":[0,39]}'::jsonb,
    payment_gateway_config JSONB DEFAULT '{"provider":"PAYSTACK","currency":"NGN"}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row if table is empty
INSERT INTO public.school_settings (school_name)
SELECT 'EduPortal International High School'
WHERE NOT EXISTS (SELECT 1 FROM public.school_settings);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT DEFAULT 'All Day',
    location TEXT DEFAULT 'Main Campus',
    color TEXT DEFAULT 'indigo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance Composite Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON public.teachers(department);
CREATE INDEX IF NOT EXISTS idx_grades_lookup ON public.grades(student_id, term_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_subject ON public.grades(class_subject_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student_status ON public.invoices(student_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_date_class ON public.attendance(date, class_id);
CREATE INDEX IF NOT EXISTS idx_timetables_teacher_day ON public.timetables(teacher_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(created_at DESC);

-- 7. Helper Security Function
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 8. Row Level Security (RLS) Lockdown

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles: own read" ON public.profiles;
CREATE POLICY "profiles: own read" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "profiles: admin write" ON public.profiles;
CREATE POLICY "profiles: admin write" ON public.profiles FOR ALL
  USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Students Policies
DROP POLICY IF EXISTS "students: read" ON public.students;
CREATE POLICY "students: read" ON public.students FOR SELECT
  USING (id = auth.uid() OR public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN', 'TEACHER'));

DROP POLICY IF EXISTS "students: admin write" ON public.students;
CREATE POLICY "students: admin write" ON public.students FOR ALL
  USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Teachers Policies
DROP POLICY IF EXISTS "teachers: read" ON public.teachers;
CREATE POLICY "teachers: read" ON public.teachers FOR SELECT
  USING (id = auth.uid() OR public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "teachers: admin write" ON public.teachers;
CREATE POLICY "teachers: admin write" ON public.teachers FOR ALL
  USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Academic Catalog (Classes, Subjects, Terms)
DROP POLICY IF EXISTS "academic_terms: auth read" ON public.academic_terms;
CREATE POLICY "academic_terms: auth read" ON public.academic_terms FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "academic_terms: admin write" ON public.academic_terms;
CREATE POLICY "academic_terms: admin write" ON public.academic_terms FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "classes: auth read" ON public.classes;
CREATE POLICY "classes: auth read" ON public.classes FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "classes: admin write" ON public.classes;
CREATE POLICY "classes: admin write" ON public.classes FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "subjects: auth read" ON public.subjects;
CREATE POLICY "subjects: auth read" ON public.subjects FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "subjects: admin write" ON public.subjects;
CREATE POLICY "subjects: admin write" ON public.subjects FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "class_subjects: auth read" ON public.class_subjects;
CREATE POLICY "class_subjects: auth read" ON public.class_subjects FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "class_subjects: admin write" ON public.class_subjects;
CREATE POLICY "class_subjects: admin write" ON public.class_subjects FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Grades Policies
DROP POLICY IF EXISTS "grades: read" ON public.grades;
CREATE POLICY "grades: read" ON public.grades FOR SELECT
  USING (
    (student_id = auth.uid() AND status = 'APPROVED') OR
    public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN') OR
    (public.get_my_role() = 'TEACHER' AND class_subject_id IN (
      SELECT id FROM public.class_subjects WHERE teacher_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "grades: teacher insert" ON public.grades;
CREATE POLICY "grades: teacher insert" ON public.grades FOR INSERT
  WITH CHECK (
    public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN') OR
    (public.get_my_role() = 'TEACHER' AND class_subject_id IN (
      SELECT id FROM public.class_subjects WHERE teacher_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "grades: teacher update" ON public.grades;
CREATE POLICY "grades: teacher update" ON public.grades FOR UPDATE
  USING (
    public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN') OR
    (public.get_my_role() = 'TEACHER' AND status IN ('DRAFT', 'REJECTED') AND class_subject_id IN (
      SELECT id FROM public.class_subjects WHERE teacher_id = auth.uid()
    ))
  );

-- Invoices & Transactions
DROP POLICY IF EXISTS "invoices: read" ON public.invoices;
CREATE POLICY "invoices: read" ON public.invoices FOR SELECT
  USING (student_id = auth.uid() OR public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "invoices: admin write" ON public.invoices;
CREATE POLICY "invoices: admin write" ON public.invoices FOR ALL
  USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "transactions: read" ON public.transactions;
CREATE POLICY "transactions: read" ON public.transactions FOR SELECT
  USING (
    public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN') OR
    invoice_id IN (SELECT id FROM public.invoices WHERE student_id = auth.uid())
  );

-- Announcements & Notifications
DROP POLICY IF EXISTS "announcements: read" ON public.announcements;
CREATE POLICY "announcements: read" ON public.announcements FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "announcements: admin write" ON public.announcements;
CREATE POLICY "announcements: admin write" ON public.announcements FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "notifications: own read" ON public.notifications;
CREATE POLICY "notifications: own read" ON public.notifications FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications: own update" ON public.notifications;
CREATE POLICY "notifications: own update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Timetables & Materials
DROP POLICY IF EXISTS "timetables: auth read" ON public.timetables;
CREATE POLICY "timetables: auth read" ON public.timetables FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "timetables: admin write" ON public.timetables;
CREATE POLICY "timetables: admin write" ON public.timetables FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "learning_materials: auth read" ON public.learning_materials;
CREATE POLICY "learning_materials: auth read" ON public.learning_materials FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "learning_materials: teacher write" ON public.learning_materials;
CREATE POLICY "learning_materials: teacher write" ON public.learning_materials FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN', 'TEACHER'));

-- Events
DROP POLICY IF EXISTS "events: auth read" ON public.events;
CREATE POLICY "events: auth read" ON public.events FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "events: admin write" ON public.events;
CREATE POLICY "events: admin write" ON public.events FOR ALL USING (public.get_my_role() IN ('ADMIN', 'SUPER_ADMIN'));
