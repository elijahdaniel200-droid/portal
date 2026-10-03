const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  const query = `
    CREATE TABLE IF NOT EXISTS school_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      location TEXT,
      color TEXT DEFAULT 'indigo',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    await client.query(query);
    console.log("Table 'school_events' created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await client.end();
  }
}

createTable();
