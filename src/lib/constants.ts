// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Platform Constants & Taxonomies
// =============================================================================

export const SITE_NAME = 'BRUH TESFA';
export const SITE_TAGLINE = 'Empowering Ethiopian Families with Trustworthy, Screened Private Tutors';
export const SITE_AMHARIC_NAME = 'ብሩህ ተስፋ';
export const SITE_OROMO_NAME = 'Abdi Qajeelaa';

export const DEFAULT_TELEGRAM_COMMUNITY_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/bruhtesfa_community';
export const DEFAULT_TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/bruhtesfa_announcements';
export const DEFAULT_SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+251 91 123 4567';
export const DEFAULT_SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'contact@bruhtesfa.com';
export const DEFAULT_OFFICE_LOCATION = 'Addis Ababa, Ethiopia';

export const SUB_CITIES_ADDIS_ABABA = [
  'Bole',
  'Yeka',
  'Kirkos',
  'Arada',
  'Lideta',
  'Addis Ketema',
  'Kolfe Keranio',
  'Gullele',
  'Nifas Silk-Lafto',
  'Akaki Kality',
  'Lemi Kura',
] as const;

export const POPULAR_NEIGHBORHOODS = [
  'Bole Atlas',
  'Bole Medhanialem',
  'CMC',
  'Sarbet',
  'Kazanchis',
  'Megenagna',
  'Piassa',
  'Lebu',
  'Gerji',
  'Summit',
  'Ayat',
  'Bisrate Gabriel',
  'Gotera',
  'Mexico',
  'Old Airport',
  'Saralite / Hayahulet',
  'Torhailoch',
  'Sebeta / Oromia Zone',
  'Burayu / Oromia Zone',
] as const;

export const SUBJECTS_TAXONOMY = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'General Science (Grades 7-8)',
  'Social Studies (Grades 7-8)',
  'English Language & Literature',
  'Amharic (አማርኛ)',
  'Afaan Oromoo',
  'Economics & Business Studies',
  'SQ3R Study Skills & Exam Strategy',
  'ICT & Computer Programming',
  'History & Geography',
  'French Language',
  'Arabic Language',
] as const;

export const GRADE_LEVELS = [
  'Grades 1-4 (Foundational Primary)',
  'Grades 5-6 (Upper Primary)',
  'Grades 7-8 (Middle School / Ministry Prep)',
  'Grades 9-10 (Secondary School)',
  'Grades 11-12 (University Entrance / EUEE Prep)',
  'Cambridge IGCSE / O-Levels',
  'Cambridge AS & A-Levels',
  'International Baccalaureate (IB)',
  'Adult / College Level',
] as const;

export const CURRICULA = [
  'Ethiopian National Curriculum',
  'Cambridge International (IGCSE / A-Levels)',
  'International Baccalaureate (IB)',
  'American / AP Curriculum',
] as const;

export const TEACHING_LANGUAGES = [
  'English',
  'Amharic (አማርኛ)',
  'Afaan Oromoo',
  'Tigrinya',
  'French',
] as const;

export const LESSON_FREQUENCIES = [
  '2 days per week (e.g. 1.5 - 2 hrs each)',
  '3 days per week (standard recommendation)',
  '4-5 days per week (intensive ministry/exam prep)',
  'Weekends only (Saturday & Sunday)',
  'Flexible / On-demand tutoring',
] as const;

export const BUDGET_TIERS = [
  { label: '250 - 350 ETB / hour (Foundational / Student Tutor)', min: 250, max: 350 },
  { label: '350 - 500 ETB / hour (Standard Experienced Tutor)', min: 350, max: 500 },
  { label: '500 - 800 ETB / hour (Senior / Specialized EUEE & IGCSE)', min: 500, max: 800 },
  { label: '800+ ETB / hour (Premium / IB / Advanced Olympiad)', min: 800, max: 1500 },
] as const;

export const REFERRAL_SOURCES = [
  'Telegram Channel or Group',
  'Friend or Family Recommendation',
  'Facebook / Instagram',
  'TikTok',
  'University Campus Flyer / Noticeboard',
  'School Community / Teacher',
  'Google Search',
  'Other',
] as const;

// Default platform placement terms
export const DEFAULT_COMMISSION_PERCENTAGE = 60.00; // 60% on first month contract value
export const TERMS_VERSION = 'BT-TERMS-2026.1';
