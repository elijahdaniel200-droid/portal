const fs = require('fs');
const code = fs.readFileSync('src/app/teacher/attendance/page.tsx', 'utf8');

const regex = /<\/?div\b[^>]*>/g;
let match;
let depth = 0;
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  const lineRegex = /<\/?div\b[^>]*>/g;
  while ((m = lineRegex.exec(line)) !== null) {
    const tag = m[0];
    if (tag.endsWith('/>')) {
      // self-closing
    } else if (tag.startsWith('</')) {
      depth--;
    } else {
      depth++;
    }
  }
  if (i > 80 && i < 220) {
    if (line.trim() !== '' && !line.includes('//')) console.log(`${i+1} [${depth}]: ${line.trim()}`);
  }
}
