const parser = require('@babel/parser');
const code = `
const a = (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
      const cfg = statusConfig[status];
      const Icon = cfg.icon;
      const pct = Math.round((counts[status] / students.length) * 100);
      return (
        <div key={status} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className={\`w-9 h-9 rounded-lg flex items-center justify-center \${cfg.active}\`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{counts[status]}</p>
            <p className="text-xs text-slate-400">{cfg.label} ({pct}%)</p>
          </div>
        </div>
      );
    })}
  </div>
);
`;
try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Snippet OK');
} catch(e) {
  console.log('Snippet error:', e.message);
}
