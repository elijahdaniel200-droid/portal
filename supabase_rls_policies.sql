-- ============================================================
-- EduPortal — Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor AFTER running supabase_schema.sql
-- ============================================================

-- ── Helper function: get current user role ──
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ════════════════════════════════════════════
-- PROFILES TABLE
-- ════════════════════════════════════════════

-- Users can read their own profile; admins can read all (checking JWT to avoid infinite recursion)
CREATE POLICY "profiles: own read"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- Only admins can insert new profiles
CREATE POLICY "profiles: admin insert"
  ON profiles FOR INSERT
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- Users can update their own profile; admins can update any
CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- Only admins can delete profiles
CREATE POLICY "profiles: admin delete"
  ON profiles FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');


-- ════════════════════════════════════════════
-- STUDENTS TABLE
-- ════════════════════════════════════════════

CREATE POLICY "students: own read"
  ON students FOR SELECT
  USING (id = auth.uid() OR get_my_role() IN ('ADMIN', 'TEACHER'));

CREATE POLICY "students: admin write"
  ON students FOR INSERT
  WITH CHECK (get_my_role() = 'ADMIN');

CREATE POLICY "students: admin update"
  ON students FOR UPDATE
  USING (get_my_role() = 'ADMIN');

CREATE POLICY "students: admin delete"
  ON students FOR DELETE
  USING (get_my_role() = 'ADMIN');


-- ════════════════════════════════════════════
-- TEACHERS TABLE
-- ════════════════════════════════════════════

CREATE POLICY "teachers: read by admin and self"
  ON teachers FOR SELECT
  USING (id = auth.uid() OR get_my_role() = 'ADMIN');

CREATE POLICY "teachers: admin write"
  ON teachers FOR ALL
  USING (get_my_role() = 'ADMIN');


-- ════════════════════════════════════════════
-- GRADES TABLE
-- ════════════════════════════════════════════

-- Students can only see their own grades
CREATE POLICY "grades: student own read"
  ON grades FOR SELECT
  USING (
    student_id = auth.uid()
    OR get_my_role() = 'ADMIN'
    OR (
      get_my_role() = 'TEACHER'
      AND class_subject_id IN (
        SELECT id FROM class_subjects WHERE teacher_id = auth.uid()
      )
    )
  );

-- Only teachers (for their subjects) and admins can insert/update grades
CREATE POLICY "grades: teacher insert"
  ON grades FOR INSERT
  WITH CHECK (
    get_my_role() = 'ADMIN'
    OR (
      get_my_role() = 'TEACHER'
      AND class_subject_id IN (
        SELECT id FROM class_subjects WHERE teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "grades: teacher update"
  ON grades FOR UPDATE
  USING (
    get_my_role() = 'ADMIN'
    OR (
      get_my_role() = 'TEACHER'
      AND class_subject_id IN (
        SELECT id FROM class_subjects WHERE teacher_id = auth.uid()
      )
    )
  );


-- ════════════════════════════════════════════
-- INVOICES TABLE
-- ════════════════════════════════════════════

-- Students see only their own invoices; admins see all
CREATE POLICY "invoices: student own read"
  ON invoices FOR SELECT
  USING (student_id = auth.uid() OR get_my_role() = 'ADMIN');

CREATE POLICY "invoices: admin write"
  ON invoices FOR ALL
  USING (get_my_role() = 'ADMIN');


-- ════════════════════════════════════════════
-- TRANSACTIONS TABLE
-- ════════════════════════════════════════════
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions: student own read"
  ON transactions FOR SELECT
  USING (
    get_my_role() = 'ADMIN'
    OR invoice_id IN (
      SELECT id FROM invoices WHERE student_id = auth.uid()
    )
  );

-- Only the backend (service role) or admin can insert transactions
CREATE POLICY "transactions: admin insert"
  ON transactions FOR INSERT
  WITH CHECK (get_my_role() = 'ADMIN');


-- ════════════════════════════════════════════
-- PUBLIC READ TABLES (Academics, Classes, Subjects)
-- ════════════════════════════════════════════
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read academic data
CREATE POLICY "academic_terms: auth read" ON academic_terms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "academic_terms: admin write" ON academic_terms FOR ALL USING (get_my_role() = 'ADMIN');

CREATE POLICY "classes: auth read" ON classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "classes: admin write" ON classes FOR ALL USING (get_my_role() = 'ADMIN');

CREATE POLICY "subjects: auth read" ON subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "subjects: admin write" ON subjects FOR ALL USING (get_my_role() = 'ADMIN');

CREATE POLICY "class_subjects: auth read" ON class_subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "class_subjects: admin write" ON class_subjects FOR ALL USING (get_my_role() = 'ADMIN');

-- Attendance: teachers write for their classes, students read own
CREATE POLICY "attendance: read" ON attendance FOR SELECT
  USING (student_id = auth.uid() OR get_my_role() IN ('ADMIN', 'TEACHER'));

CREATE POLICY "attendance: teacher write" ON attendance FOR INSERT
  WITH CHECK (get_my_role() IN ('ADMIN', 'TEACHER'));

CREATE POLICY "attendance: teacher update" ON attendance FOR UPDATE
  USING (get_my_role() IN ('ADMIN', 'TEACHER'));


-- ════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ════════════════════════════════════════════
-- This trigger fires after a new auth.users record is created
-- and creates a corresponding profiles row automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
