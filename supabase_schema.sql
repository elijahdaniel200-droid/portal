-- Custom Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_status') THEN
        CREATE TYPE fee_status AS ENUM ('PENDING', 'PAID', 'OVERDUE');
    END IF;
END $$;

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students Table (Role-specific details)
CREATE TABLE IF NOT EXISTS students (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  enrollment_number TEXT UNIQUE NOT NULL,
  date_of_birth DATE,
  class_id UUID,
  emergency_contact TEXT
);

-- Teachers Table (Role-specific details)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  department TEXT,
  hire_date DATE
);

-- Academics
CREATE TABLE IF NOT EXISTS academic_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  form_teacher_id UUID REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id)
);

-- Grading & Attendance
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  class_subject_id UUID REFERENCES class_subjects(id),
  term_id UUID REFERENCES academic_terms(id),
  score NUMERIC(5, 2),
  grade TEXT,
  remarks TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'))
);

-- Fees
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  term_id UUID REFERENCES academic_terms(id),
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE,
  status fee_status DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id),
  reference_code TEXT UNIQUE NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gateway_response JSONB
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Add Foreign Key Constraint for students class_id
ALTER TABLE students ADD CONSTRAINT fk_class_id FOREIGN KEY (class_id) REFERENCES classes(id);
