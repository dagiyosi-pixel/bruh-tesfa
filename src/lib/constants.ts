// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Platform Constants & Taxonomies
// =============================================================================

export const SITE_NAME = 'BRUH TESFA';
export const SITE_TAGLINE = 'Empowering Ethiopian Families with Trustworthy, Screened Private Tutors';
export const SITE_AMHARIC_NAME = 'ብሩህ ተስፋ';
export const SITE_OROMO_NAME = 'Abdi Qajeelaa';

export const DEFAULT_TELEGRAM_COMMUNITY_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/bruh_tesfa_tutoring_ethiopia';
export const DEFAULT_TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/bruh_tesfa_tutoring_ethiopia';
export const DEFAULT_TELEGRAM_ADMIN_USERNAME = 'biruh_tesfa_tutoring';
export const DEFAULT_SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+251 93 173 6692';
export const SECONDARY_SUPPORT_PHONE = process.env.NEXT_PUBLIC_SECONDARY_PHONE || '+251 97 955 8343';
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

export type SubCityName = (typeof SUB_CITIES_ADDIS_ABABA)[number];

export interface SubCityDirectoryEntry {
  name: SubCityName;
  amharic: string;
  tagline: string;
  neighborhoods: string[];
  prominentLandmarks: string[];
}

/**
 * Exhaustive directory of all 11 Addis Ababa Sub-Cities (ክፍለ ከተሞች),
 * their famous residential neighborhoods (ሰፈሮች), and key landmarks.
 */
export const ADDIS_ABABA_SUB_CITIES_DIRECTORY: Record<SubCityName, SubCityDirectoryEntry> = {
  Kirkos: {
    name: 'Kirkos',
    amharic: 'ቂርቆስ',
    tagline: 'Diplomatic & commercial core with iconic squares',
    neighborhoods: [
      'Mexico',
      'Kazanchis',
      'Gotera',
      'Sarbet (AU Area)',
      'Kera',
      'Meskel Square',
      'Olympia',
      'Riche',
      'Beherawi (National Theatre)',
      'Agona Cinema',
      'Kirkos Church',
      'Wello Sefer (West)',
    ],
    prominentLandmarks: [
      'Mexico Square & Commerce College',
      'African Union Headquarters (AU)',
      'UNECA (United Nations)',
      'Meskel Square & Addis Ababa Stadium',
      'National Theatre (Beherawi)',
      'Radisson Blu & Intercontinental',
    ],
  },
  Arada: {
    name: 'Arada',
    amharic: 'አራዳ',
    tagline: 'Historic university campuses, monuments & culture',
    neighborhoods: [
      '4 Kilo (Arat Kilo)',
      '6 Kilo (Sidist Kilo)',
      '5 Kilo (Amist Kilo)',
      'Piazza (Piassa)',
      'Aware',
      'Eri Bekentu',
      'Somale Tera',
      'Dejach Wube Sefer',
      'Ras Mekonnen Bridge',
      'Giorgis',
      'Habte Giorgis',
    ],
    prominentLandmarks: [
      'AAU 4 Kilo (Faculty of Natural Sciences)',
      'AAU 6 Kilo (Main Campus & Institute of Ethiopian Studies)',
      'AAU 5 Kilo (Technology & Engineering)',
      'Ethiopian Parliament & National Palace',
      'St. George Cathedral (Piazza)',
      'Yekatit 12 Martyrs Monument (6 Kilo)',
      'Taitu Hotel & Churchill Road',
    ],
  },
  Bole: {
    name: 'Bole',
    amharic: 'ቦሌ',
    tagline: 'Vibrant international, embassy & commercial sector',
    neighborhoods: [
      'Bole Medhanialem',
      'Bole Atlas',
      'Bole Brass',
      'Gerji (Imperial, Mebrat Hail)',
      'Bulbula (Mariam, 93)',
      'Rwanda',
      'Bole Japan',
      'Bole 24',
      'Bole 18',
      'Edna Mall area',
      'Bole Michael',
      'Urael',
      'Flamingo',
      'Wollo Sefer',
    ],
    prominentLandmarks: [
      'Bole International Airport',
      'Medhane Alem Cathedral',
      'Edna Mall / Cameroon Street',
      'Japanese Embassy',
      'Unity University Gerji',
      'Atlas Junction',
    ],
  },
  Yeka: {
    name: 'Yeka',
    amharic: 'የካ',
    tagline: 'Eastern transit hubs, embassies & educational centers',
    neighborhoods: [
      'Megenagna',
      'Hayahulet (22 Mazoria / Golagol)',
      'Kotebe (02, KMU, Hana Mariam)',
      'Shola (Shola Gebeya)',
      'Signal',
      'Lem Hotel',
      'Gurd Shola',
      'Ferensay Legasion (French Legation)',
      'Yeka Mikael',
      'Kara',
      'Kotebe Metal Tools',
    ],
    prominentLandmarks: [
      'Megenagna Roundabout & Zefmesh Grand Mall',
      'Kotebe Metropolitan University (KMU)',
      'British Embassy & French Embassy',
      'Century Mall Gurd Shola',
      'Golagol Tower (Hayahulet 22)',
      'Shola Traditional Market',
    ],
  },
  'Lemi Kura': {
    name: 'Lemi Kura',
    amharic: 'ለሚ ኩራ',
    tagline: 'Fast-growing modern real estate & residential estates',
    neighborhoods: [
      'CMC (Michael, Tsehay Real Estate)',
      'Ayat (Ayat Square, Zones 1-8)',
      'Summit (Safari, Pepsi, Condominium)',
      'Meri Luke',
      'Figa',
      'Goro',
      'Yerer Ber',
      'Bole Arabsa',
      'Beshale Hotel area',
    ],
    prominentLandmarks: [
      'Tsehay Real Estate CMC',
      'Ayat Grand Roundabout',
      'Summit Pepsi & Condominium Site',
      'Goro Interchange',
      'Civil Service University (nearby)',
    ],
  },
  Lideta: {
    name: 'Lideta',
    amharic: 'ልደታ',
    tagline: 'Central financial district & judicial institutions',
    neighborhoods: [
      'Mexico (Lideta side)',
      'Balcha Hospital',
      'Lideta Condominium',
      'Abenet',
      'Senga Tera (Financial District)',
      'Tor Hailoch (Lideta border)',
      'Geja Sefer',
      'D’Afrique Hotel area',
      'Teklehaimanot',
    ],
    prominentLandmarks: [
      'Federal High Court Lideta',
      'Senga Tera Financial District (Commercial Bank of Ethiopia HQ)',
      'Balcha Hospital',
      'Lideta Catholic Cathedral',
      'Bunna Board / Mexico junction',
    ],
  },
  'Nifas Silk-Lafto': {
    name: 'Nifas Silk-Lafto',
    amharic: 'ንፋስ ስልክ ላፍቶ',
    tagline: 'Southwest suburban family homes & international schools',
    neighborhoods: [
      'Sarbet (ICS Area, Karl Square)',
      'Bisrate Gabriel',
      'Lebu (Lebu Mebrat Hail, Varnero)',
      'Jemo (Jemo 1, 2, 3)',
      'Mekanisa (Semmit, Abo)',
      'Vefa',
      'Lafto Mall area',
      'Haile Garment',
      'Gotera interchange',
    ],
    prominentLandmarks: [
      'International Community School (ICS)',
      'Laphto Mall & Bisrate Gabriel Church',
      'Karl Square Sarbet',
      'Lebu Commercial Center',
      'Jemo Glass Factory & Condominiums',
    ],
  },
  Gullele: {
    name: 'Gullele',
    amharic: 'ጉለሌ',
    tagline: 'Northern highlands, botanical gardens & traditional crafts',
    neighborhoods: [
      'Shiro Meda',
      'Addisu Gebeya',
      'Semen Mazegaja',
      'Rufael',
      'Enkulal Fabrika',
      'Kechene (Medhanialem)',
      'Wingate',
      'Yohannes',
      'Gullele Botanic area',
    ],
    prominentLandmarks: [
      'United States Embassy (Shiro Meda)',
      'Shiro Meda Traditional Textile Market',
      'Gullele Botanical Garden',
      'General Wingate Polytechnic College',
      'Addisu Gebeya Market',
    ],
  },
  'Addis Ketema': {
    name: 'Addis Ketema',
    amharic: 'አዲስ ከተማ',
    tagline: 'Africa’s largest open marketplace & commerce center',
    neighborhoods: [
      'Merkato',
      'Autobus Tera',
      'Abenet',
      'Sebategna',
      'Mesalemia',
      'Amanuel',
      'Gojam Berenda',
      'Military Tera',
    ],
    prominentLandmarks: [
      'Addis Merkato (Tana Gebeya, Dubai Tera)',
      'Autobus Tera (Inter-City Bus Terminal)',
      'Grand Anwar Mosque',
      'St. Raguel Church Merkato',
      'Amanuel Mental Specialized Hospital',
    ],
  },
  'Kolfe Keranio': {
    name: 'Kolfe Keranio',
    amharic: 'ኮልፌ ቀራኒዮ',
    tagline: 'Western medical centers & residential hills',
    neighborhoods: [
      'Tor Hailoch',
      'Ayer Tena',
      'Bethel',
      'Zenebework',
      'Asko',
      'Repi',
      'Total 3',
      'Alert Hospital area',
    ],
    prominentLandmarks: [
      'Torhailoch Hospital & Ring Road Roundabout',
      'ALERT Specialized Hospital (Zenebework)',
      'Bethel Teaching Hospital',
      'Ayer Tena Square',
      'Asko Bus Terminal',
    ],
  },
  'Akaki Kality': {
    name: 'Akaki Kality',
    amharic: 'አቃቂ ቃሊቲ',
    tagline: 'Southern logistics hub, highway gateway & industrial zone',
    neighborhoods: [
      'Kality Total',
      'Kality Customs / Dry Port',
      'Akaki',
      'Tulu Dimtu',
      'Gelan',
      'Saris (Abo, Dama, Kadisco)',
      'Crown Hotel area',
    ],
    prominentLandmarks: [
      'Addis-Adama Expressway Toll Gate (Tulu Dimtu)',
      'Kality Dry Port & Customs Terminal',
      'Crown Hotel Saris',
      'Tulu Dimtu Condominium Complex',
    ],
  },
};

/**
 * Tremendously expanded list of popular Addis Ababa neighborhoods and landmarks.
 */
export const POPULAR_NEIGHBORHOODS = [
  // Arada
  '4 Kilo (Arat Kilo)',
  '6 Kilo (Sidist Kilo)',
  '5 Kilo (Amist Kilo)',
  'Piazza (Piassa)',
  'Aware',
  // Kirkos
  'Mexico',
  'Kazanchis',
  'Gotera',
  'Sarbet',
  'Meskel Square',
  'Olympia',
  'Kera',
  // Bole
  'Bole Medhanialem',
  'Bole Atlas',
  'Bole Brass',
  'Gerji',
  'Bulbula',
  'Rwanda',
  'Bole 24',
  'Edna Mall area',
  // Lemi Kura
  'CMC',
  'Ayat',
  'Summit',
  'Meri Luke',
  'Goro',
  // Yeka
  'Megenagna',
  'Hayahulet (22)',
  'Kotebe',
  'Shola',
  'Gurd Shola',
  // Nifas Silk-Lafto
  'Bisrate Gabriel',
  'Lebu',
  'Jemo',
  'Mekanisa',
  // Gullele
  'Shiro Meda',
  'Addisu Gebeya',
  'Semen Mazegaja',
  // Kolfe Keranio
  'Tor Hailoch',
  'Ayer Tena',
  'Bethel',
  // Addis Ketema
  'Merkato',
  'Autobus Tera',
  // Akaki Kality
  'Kality',
  'Saris',
  'Tulu Dimtu',
  // Special Commuter Zones
  'Sebeta',
  'Burayu',
  'Legetafo',
] as const;

/**
 * Intelligent resolver that maps any neighborhood or landmark query
 * (like "Mexico", "4 Kilo", "Piazza", "CMC", "Sarbet", "Shiro Meda")
 * to its official Addis Ababa sub-city.
 */
export function resolveSubCityForNeighborhood(query: string): SubCityName | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // 1. Direct high-frequency landmark aliases
  if (q.includes('4 kilo') || q.includes('arat kilo') || q.includes('4kilo') || q.includes('አራት ኪሎ')) return 'Arada';
  if (q.includes('6 kilo') || q.includes('sidist kilo') || q.includes('6kilo') || q.includes('ስድስት ኪሎ')) return 'Arada';
  if (q.includes('5 kilo') || q.includes('amist kilo') || q.includes('5kilo') || q.includes('አምስት ኪሎ')) return 'Arada';
  if (q.includes('piazza') || q.includes('piassa') || q.includes('ፒያሳ')) return 'Arada';
  if (q.includes('mexico') || q.includes('ሜክሲኮ')) return 'Kirkos';
  if (q.includes('kazanchis') || q.includes('kasanchis') || q.includes('ካዛንቺስ')) return 'Kirkos';
  if (q.includes('sarbet') || q.includes('sar bet') || q.includes('ሳርቤት')) return 'Nifas Silk-Lafto';
  if (q.includes('cmc') || q.includes('tsehay') || q.includes('ሲኤምሲ')) return 'Lemi Kura';
  if (q.includes('ayat') || q.includes('አያት')) return 'Lemi Kura';
  if (q.includes('summit') || q.includes('ሰሚት')) return 'Lemi Kura';
  if (q.includes('lebu') || q.includes('ለቡ')) return 'Nifas Silk-Lafto';
  if (q.includes('jemo') || q.includes('ጀሞ')) return 'Nifas Silk-Lafto';
  if (q.includes('bisrate gabriel') || q.includes('ብሥራተ ገብርኤል')) return 'Nifas Silk-Lafto';
  if (q.includes('mekanisa') || q.includes('መካኒሳ')) return 'Nifas Silk-Lafto';
  if (q.includes('megenagna') || q.includes('መገናኛ')) return 'Yeka';
  if (q.includes('hayahulet') || q.includes('22') || q.includes('golagol') || q.includes('ሃያ ሁለት')) return 'Yeka';
  if (q.includes('kotebe') || q.includes('ኮተቤ')) return 'Yeka';
  if (q.includes('shiro meda') || q.includes('shiromeda') || q.includes('ሽሮ ሜዳ')) return 'Gullele';
  if (q.includes('addisu gebeya') || q.includes('አዲሱ ገበያ')) return 'Gullele';
  if (q.includes('tor hailoch') || q.includes('torhailoch') || q.includes('ጦር ኃይሎች')) return 'Kolfe Keranio';
  if (q.includes('bethel') || q.includes('ቤተል')) return 'Kolfe Keranio';
  if (q.includes('ayer tena') || q.includes('አየር ጤና')) return 'Kolfe Keranio';
  if (q.includes('merkato') || q.includes('mercato') || q.includes('መርካቶ')) return 'Addis Ketema';
  if (q.includes('gerji') || q.includes('ገርጂ')) return 'Bole';
  if (q.includes('atlas') || q.includes('አትላስ')) return 'Bole';
  if (q.includes('medhanialem') || q.includes('መድኃኔዓለም')) return 'Bole';
  if (q.includes('bulbula') || q.includes('ቡልቡላ')) return 'Bole';
  if (q.includes('kality') || q.includes('ቃሊቲ') || q.includes('saris') || q.includes('ሳሪስ')) return 'Akaki Kality';

  // 2. Structured check across all directory entries
  for (const [subCity, data] of Object.entries(ADDIS_ABABA_SUB_CITIES_DIRECTORY)) {
    if (subCity.toLowerCase() === q) return subCity as SubCityName;
    if (data.amharic.includes(q)) return subCity as SubCityName;
    if (data.neighborhoods.some((n) => n.toLowerCase().includes(q) || q.includes(n.toLowerCase()))) {
      return subCity as SubCityName;
    }
    if (data.prominentLandmarks.some((l) => l.toLowerCase().includes(q) || q.includes(l.toLowerCase()))) {
      return subCity as SubCityName;
    }
  }

  return null;
}

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
