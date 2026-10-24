import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'bruh-tesfa-db.json');

// Read existing file
const raw = fs.readFileSync(DB_FILE, 'utf-8');
const db = JSON.parse(raw);

// 1. Filter out all test tutors (anyone with 'Test' or 'Abebe' from tests)
db.tutors = (db.tutors || []).filter(
  (t) => !t.full_legal_name.includes('Test Candidate') && !t.id.startsWith('tut-179')
);

// 2. Filter out all test parent requests
db.parent_requests = (db.parent_requests || []).filter(
  (r) => !r.id.startsWith('req-179') && !r.parent_name.includes('(PRIVATE)')
);

// 3. Filter out all test vacancies
db.vacancies = (db.vacancies || []).filter(
  (v) => !v.id.startsWith('vac-179') && !v.title.includes('Test State Machine') && !v.title.includes('Test')
);

// 4. Filter out all test vacancy applications
db.vacancy_applications = (db.vacancy_applications || []).filter(
  (a) => !a.id.startsWith('vapp-179') && (a.id === 'vapp-001' || a.id === 'vapp-002')
);

// 5. Filter out all test broadcast logs
db.telegram_broadcast_logs = (db.telegram_broadcast_logs || []).filter(
  (b) => !b.vacancy_id?.includes('test') && !b.caption_snippet?.includes('Test')
);

// 6. Filter out all test subscribers
db.telegram_subscribers = (db.telegram_subscribers || []).filter(
  (s) => s.id === 'sub-001' || s.id === 'sub-002'
);

// 7. Clean audit logs
db.audit_logs = (db.audit_logs || []).filter(
  (l) => !l.actor?.includes('Test Candidate') && !l.id?.startsWith('log-179')
);

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

console.log('Database cleaned successfully!');
console.log('Remaining Tutors:', db.tutors.length);
console.log('Remaining Parent Requests:', db.parent_requests.length);
console.log('Remaining Vacancies:', db.vacancies.length);
console.log('Remaining Applications:', db.vacancy_applications.length);
