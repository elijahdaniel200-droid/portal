const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'src/app/admin/academics/page.tsx', title: 'Academics Setup' },
  { path: 'src/app/admin/events/page.tsx', title: 'Events & Calendar' },
  { path: 'src/app/admin/logs/page.tsx', title: 'System Logs' },
  { path: 'src/app/admin/settings/page.tsx', title: 'System Settings' },
  { path: 'src/app/teacher/classes/page.tsx', title: 'My Classes' },
  { path: 'src/app/teacher/settings/page.tsx', title: 'Teacher Settings' }
];

const template = (title) => `"use client";

import { Hammer } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Hammer className="w-12 h-12" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">${title}</h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          This module is currently under active development. Please check back later or contact the system administrator.
        </p>
      </div>
    </div>
  );
}
`;

pages.forEach(p => {
  const fullPath = path.join(__dirname, p.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, template(p.title), 'utf-8');
});

console.log("Placeholder pages created successfully!");
