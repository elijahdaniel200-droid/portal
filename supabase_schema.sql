-- Custom Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
CREATE TYPE fee_status AS ENUM ('PENDING', 'PAID', 'OVERDUE');
CREATE TYPE grade_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE announcement_target AS ENUM ('ALL', 'TEACHERS', 'STUDENTS', 'SPECIFIC_CLASS');
CREATE TYPE timetable_type AS ENUM ('CLASS', 'EXAMINATION');
CREATE TYPE submission_status AS ENUM ('PENDING', 'SUBMITTED', 'LATE', 'GRADED');

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,
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
  code TEXT UNIQUE NOT NULL,
  is_elective BOOLEAN DEFAULT false
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
  ca1 NUMERIC(5, 2) DEFAULT 0,
  ca2 NUMERIC(5, 2) DEFAULT 0,
  exam NUMERIC(5, 2) DEFAULT 0,
  score NUMERIC(5, 2),
  grade TEXT,
  remarks TEXT,
  breakdown JSONB DEFAULT '{"ca1":0,"ca2":0,"exam":0}'::jsonb,
  status grade_status DEFAULT 'DRAFT',
  UNIQUE(student_id, class_subject_id, term_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
  UNIQUE(student_id, date)
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

-- Assignments & Submissions
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_subject_id UUID REFERENCES class_subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score NUMERIC(5, 2),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES students(id),
  submission_text TEXT,
  file_url TEXT,
  score NUMERIC(5, 2),
  feedback TEXT,
  status submission_status DEFAULT 'PENDING',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Learning Materials
CREATE TABLE IF NOT EXISTS learning_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_subject_id UUID REFERENCES class_subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  material_type TEXT CHECK (material_type IN ('PDF', 'VIDEO', 'DOCUMENT', 'LINK')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timetables
CREATE TABLE IF NOT EXISTS timetables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type timetable_type NOT NULL,
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT
);

-- Announcements & Notifications
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target announcement_target NOT NULL,
  class_id UUID REFERENCES classes(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings & Logs
CREATE TABLE IF NOT EXISTS school_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL,
  school_address TEXT,
  school_logo_url TEXT,
  current_term_id UUID REFERENCES academic_terms(id),
  grading_system JSONB,
  payment_gateway_config JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Add Foreign Key Constraint for students class_id
ALTER TABLE students DROP CONSTRAINT IF EXISTS fk_class_id;
ALTER TABLE students ADD CONSTRAINT fk_class_id FOREIGN KEY (class_id) REFERENCES classes(id);
