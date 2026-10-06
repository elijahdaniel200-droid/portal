const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function seedUsers() {
  const usersToCreate = [
    {
      email: 'admin@school.edu',
      password: 'password123',
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Admin'
    },
    {
      email: 'teacher@school.edu',
      password: 'password123',
      role: 'TEACHER',
      firstName: 'Demo',
      lastName: 'Teacher'
    },
    {
      email: 'student@school.edu',
      password: 'password123',
      role: 'STUDENT',
      firstName: 'Demo',
      lastName: 'Student',
      enrollment_number: 'STU-2026-0001'
    }
  ];

  for (const u of usersToCreate) {
    console.log(`Processing ${u.email}...`);
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log(`User ${u.email} already exists in auth.`);
      } else {
        console.error(`Error creating auth user for ${u.email}:`, authError.message);
        continue;
      }
    }

    // Get the user ID (either newly created or query existing one)
    let userId = authData?.user?.id;
    if (!userId) {
      // Find the user if already exists using admin api
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users.find(user => user.email === u.email);
      if (existingUser) {
          userId = existingUser.id;
          // Ensure password is correct
          await supabase.auth.admin.updateUserById(userId, { password: u.password });
      }
    }

    if (!userId) {
        console.error(`Could not get or create ID for ${u.email}`);
        continue;
    }

    // 2. Upsert Profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: u.email,
      first_name: u.firstName,
      last_name: u.lastName,
      role: u.role
    });

    if (profileError) {
      console.error(`Error upserting profile for ${u.email}:`, profileError.message);
    } else {
        console.log(`Profile upserted for ${u.email}`);
    }

    // 3. Upsert Role-specific data
    if (u.role === 'STUDENT') {
      const { error: studentError } = await supabase.from('students').upsert({
        id: userId,
        enrollment_number: u.enrollment_number
      });
      if (studentError) {
        console.error(`Error upserting student data for ${u.email}:`, studentError.message);
      }
    } else if (u.role === 'TEACHER') {
      const { error: teacherError } = await supabase.from('teachers').upsert({
        id: userId,
        department: 'General'
      });
      if (teacherError) {
        console.error(`Error upserting teacher data for ${u.email}:`, teacherError.message);
      }
    }
    console.log(`Successfully provisioned ${u.email}`);
  }
}

seedUsers().then(() => {
    console.log("Done");
    process.exit(0);
});
