// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Addis Ababa Sefers & Colloquial Localities Directory
// =============================================================================
// In Addis Ababa, residents, taxi drivers, families, and tutors navigate almost
// exclusively by informal neighborhoods (ሰፈሮች), famous landmarks, and taxi drops
// rather than official woreda administrative boundaries.
//
// This catalog maps everyday colloquial Sefers to their official Sub-City (ክፍለ ከተማ),
// famous landmarks, taxi drop names, and search aliases in English and Amharic.
// =============================================================================

import { SubCityName } from './constants';

export interface SeferItem {
  id: string;
  name: string;
  amharic: string;
  subCity: SubCityName;
  taxiDropOrLandmark: string;
  aliases: string[];
}

export const ADDIS_ABABA_SEFERS: SeferItem[] = [
  // ---------------------------------------------------------------------------
  // KIRKOS (ቂርቆስ)
  // ---------------------------------------------------------------------------
  {
    id: 'mexico',
    name: 'Mexico',
    amharic: 'ሜክሲኮ',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'Mexico Square, Commerce College, Bunna Board, Federal High Court',
    aliases: ['mexico', 'mexico square', 'commerce', 'bunna board', 'ኮሜርስ', 'ቡና ቦርድ', 'ሜክሲኮ'],
  },
  {
    id: 'mexico-condo',
    name: 'Mexico Condominium',
    amharic: 'ሜክሲኮ ኮንዶሚኒየም',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'Behind Commerce College & near Federal Court',
    aliases: ['mexico condo', 'mexico condominium', 'ኮንዶሚኒየም', 'ሜክሲኮ ኮንዶ'],
  },
  {
    id: 'kazanchis',
    name: 'Kazanchis',
    amharic: 'ካዛንቺስ',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'UNECA Headquarters, Radisson Blu, Intercontinental, Bloom Tower',
    aliases: ['kazanchis', 'kasanchis', 'uneca', 'radisson', 'ካዛንቺስ', 'ካሳንቺስ', 'ኢሲኤ'],
  },
  {
    id: 'gotera',
    name: 'Gotera',
    amharic: 'ጎተራ',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'Gotera Masalecha, Gotera Condominium, Pepsi Factory, Ring Road',
    aliases: ['gotera', 'masalecha', 'gotera condo', 'ጎተራ', 'ማሳለጫ'],
  },
  {
    id: 'kera',
    name: 'Kera',
    amharic: 'ቄራ',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'Kera Abattoir, Bulgaria Mazoria, Agona Cinema, Riche',
    aliases: ['kera', 'bulgaria', 'agona', 'riche', 'ቄራ', 'ቡልጋሪያ', 'አጎና', 'ሪቼ'],
  },
  {
    id: 'meskel-square',
    name: 'Meskel Square',
    amharic: 'መስቀል አደባባይ',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'Addis Ababa Stadium, St. Estifanos Church, Red Terror Memorial',
    aliases: ['meskel square', 'meskel', 'stadium', 'estifanos', 'መስቀል አደባባይ', 'ስታዲየም'],
  },
  {
    id: 'olympia',
    name: 'Olympia',
    amharic: 'ኦሊምፒያ',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'Olympia Roundabout, Dembel City Center, Wollo Sefer gateway',
    aliases: ['olympia', 'dembel', 'ኦሊምፒያ', 'ደምበል'],
  },
  {
    id: 'beherawi',
    name: 'Beherawi',
    amharic: 'ብሔራዊ',
    subCity: 'Kirkos',
    taxiDropOrLandmark: 'National Theatre, Commercial Bank head office, Ambassador Park',
    aliases: ['beherawi', 'national theatre', 'ambassador', 'ብሔራዊ', 'ብሄራዊ', 'ቲያትር'],
  },

  // ---------------------------------------------------------------------------
  // ARADA (አራዳ)
  // ---------------------------------------------------------------------------
  {
    id: '4-kilo',
    name: '4 Kilo (Arat Kilo)',
    amharic: 'አራት ኪሎ',
    subCity: 'Arada',
    taxiDropOrLandmark: 'AAU Natural Sciences Campus, Parliament, Kidist Selassie Cathedral',
    aliases: ['4 kilo', 'arat kilo', '4kilo', 'aau science', 'አራት ኪሎ', 'ፓርላማ', 'ቅድስት ሥላሴ'],
  },
  {
    id: '6-kilo',
    name: '6 Kilo (Sidist Kilo)',
    amharic: 'ስድስት ኪሎ',
    subCity: 'Arada',
    taxiDropOrLandmark: 'AAU Main Campus, Yekatit 12 Monument, Institute of Ethiopian Studies',
    aliases: ['6 kilo', 'sidist kilo', '6kilo', 'yekatit 12', 'aau main', 'ስድስት ኪሎ', 'የካቲት 12'],
  },
  {
    id: '5-kilo',
    name: '5 Kilo (Amist Kilo)',
    amharic: 'አምስት ኪሎ',
    subCity: 'Arada',
    taxiDropOrLandmark: 'AAU Technology & Engineering (AAiT), Russian Cultural Center',
    aliases: ['5 kilo', 'amist kilo', '5kilo', 'aait', 'engineering', 'አምስት ኪሎ', 'ቴክኖሎጂ'],
  },
  {
    id: 'piazza',
    name: 'Piazza (Piassa)',
    amharic: 'ፒያሳ',
    subCity: 'Arada',
    taxiDropOrLandmark: 'Churchill Road, Taitu Hotel, St. George Cathedral (Giorgis), Dejach Wube',
    aliases: ['piazza', 'piassa', 'churchill', 'taitu', 'giorgis', 'ፒያሳ', 'ጊዮርጊስ', 'ጣይቱ'],
  },
  {
    id: 'aware',
    name: 'Aware',
    amharic: 'አዋሬ',
    subCity: 'Arada',
    taxiDropOrLandmark: 'Aware Market, Menelik Hospital area, Russian Embassy junction',
    aliases: ['aware', 'menelik hospital', 'አዋሬ', 'ዳግማዊ ምኒልክ ሆስፒታል'],
  },
  {
    id: 'eri-bekentu',
    name: 'Eri Bekentu',
    amharic: 'እሪ በከንቱ',
    subCity: 'Arada',
    taxiDropOrLandmark: 'Old historic Arada, Degol Square, Ras Mekonnen Bridge',
    aliases: ['eri bekentu', 'degol', 'ras mekonnen', 'እሪ በከንቱ', 'ደጎል'],
  },

  // ---------------------------------------------------------------------------
  // BOLE (ቦሌ)
  // ---------------------------------------------------------------------------
  {
    id: 'bole-medhanialem',
    name: 'Bole Medhanialem',
    amharic: 'ቦሌ መድኃኔዓለም',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Medhane Alem Cathedral, Cameroon Street, Edna Mall, Brass Clinic',
    aliases: ['bole medhanialem', 'medhanialem', 'edna mall', 'cameroon', 'መድኃኔዓለም', 'ኤድና ሞል'],
  },
  {
    id: 'bole-atlas',
    name: 'Bole Atlas',
    amharic: 'ቦሌ አትላስ',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Atlas Hotel junction, Shala Park, Desalegn Hotel, Chane Tower',
    aliases: ['bole atlas', 'atlas', 'shala park', 'desalegn', 'አትላስ', 'ቦሌ አትላስ'],
  },
  {
    id: 'bole-brass',
    name: 'Bole Brass',
    amharic: 'ቦሌ ብራስ',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Brass Hospital, Bole Clinic, Moenco residential quarter',
    aliases: ['bole brass', 'brass', 'moenco', 'ብራስ', 'ቦሌ ብራስ'],
  },
  {
    id: 'gerji',
    name: 'Gerji',
    amharic: 'ገርጂ',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Imperial Hotel, Gerji Mebrat Hail, Unity University, Alfoz',
    aliases: ['gerji', 'gerji mebrat', 'imperial', 'unity university', 'alfoz', 'ገርጂ', 'ኢምፔሪያል'],
  },
  {
    id: 'bulbula',
    name: 'Bulbula',
    amharic: 'ቡልቡላ',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Bulbula Mariam Church, 93 Mazoria, Bole Bulbula Condominiums',
    aliases: ['bulbula', 'bulbula 93', 'bulbula mariam', 'ቡልቡላ', 'ቡልቡላ 93'],
  },
  {
    id: 'rwanda-japan',
    name: 'Bole Rwanda / Japan',
    amharic: 'ቦሌ ሩዋንዳ / ጃፓን',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Rwanda Embassy, Japanese Embassy, Bole 24, Bole 18',
    aliases: ['rwanda', 'japan embassy', 'bole 24', 'bole 18', 'ጃፓን', 'ሩዋንዳ'],
  },
  {
    id: 'bole-michael',
    name: 'Bole Michael',
    amharic: 'ቦሌ ሚካኤል',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Bole Michael Church, Cargo Terminal, Ring Road south junction',
    aliases: ['bole michael', 'cargo', 'ቦሌ ሚካኤል', 'ካርጎ'],
  },
  {
    id: 'wollo-sefer',
    name: 'Wollo Sefer',
    amharic: 'ወሎ ሰፈር',
    subCity: 'Bole',
    taxiDropOrLandmark: 'Ethio-China Friendship Road, Gorgorios Church, Tebaber Berta',
    aliases: ['wollo sefer', 'wello sefer', 'ethio-china', 'tebaber berta', 'ወሎ ሰፈር', 'ቴባበር በርታ'],
  },

  // ---------------------------------------------------------------------------
  // LEMI KURA (ለሚ ኩራ)
  // ---------------------------------------------------------------------------
  {
    id: 'cmc-michael',
    name: 'CMC Michael',
    amharic: 'ሲኤምሲ ሚካኤል',
    subCity: 'Lemi Kura',
    taxiDropOrLandmark: 'CMC Michael Church, Tsehay Real Estate, Sunshine Luxury Homes',
    aliases: ['cmc', 'cmc michael', 'tsehay', 'sunshine', 'tsehay real estate', 'ሲኤምሲ', 'ፀሐይ', 'ሚካኤል'],
  },
  {
    id: 'ayat',
    name: 'Ayat',
    amharic: 'አያት',
    subCity: 'Lemi Kura',
    taxiDropOrLandmark: 'Ayat Grand Roundabout, Ayat Zones 1-8, Tafo Mazoria, Adebabay',
    aliases: ['ayat', 'ayat square', 'tafo', 'ayat zone', 'አያት', 'አያት አደባባይ', 'ጣፎ'],
  },
  {
    id: 'summit',
    name: 'Summit',
    amharic: 'ሰሚት',
    subCity: 'Lemi Kura',
    taxiDropOrLandmark: 'Summit Condominium, Pepsi Factory, Summit Safari, 72 Condominiums',
    aliases: ['summit', 'summit condo', 'safari', 'pepsi', 'ሰሚት', 'ሰሚት ሳፋሪ'],
  },
  {
    id: 'meri-luke',
    name: 'Meri Luke',
    amharic: 'መሪ ሉቄ',
    subCity: 'Lemi Kura',
    taxiDropOrLandmark: 'Meri Luke residential quarter, CMC border, St. Luke Church',
    aliases: ['meri luke', 'meri', 'st luke', 'መሪ ሉቄ', 'መሪ'],
  },
  {
    id: 'figa',
    name: 'Figa',
    amharic: 'ፊጋ',
    subCity: 'Lemi Kura',
    taxiDropOrLandmark: 'Figa Mazoria, Bole Arabsa turnoff, Goro connection',
    aliases: ['figa', 'figa mazoria', 'ፊጋ', 'ፊጋ ማዞሪያ'],
  },
  {
    id: 'goro',
    name: 'Goro',
    amharic: 'ጎሮ',
    subCity: 'Lemi Kura',
    taxiDropOrLandmark: 'Goro Interchange, Ring Road, Salite Mihret Church road',
    aliases: ['goro', 'salite mihret', 'goro interchange', 'ጎሮ', 'ጸሎተ ምሕረት'],
  },
  {
    id: 'bole-arabsa',
    name: 'Bole Arabsa',
    amharic: 'ቦሌ አራብሳ',
    subCity: 'Lemi Kura',
    taxiDropOrLandmark: 'Bole Arabsa Condominium Sites 1-6, New residential blocks',
    aliases: ['bole arabsa', 'arabsa', 'አራብሳ', 'ቦሌ አራብሳ'],
  },

  // ---------------------------------------------------------------------------
  // NIFAS SILK-LAFTO (ንፋስ ስልክ ላፍቶ)
  // ---------------------------------------------------------------------------
  {
    id: 'sarbet',
    name: 'Sarbet',
    amharic: 'ሳርቤት',
    subCity: 'Nifas Silk-Lafto',
    taxiDropOrLandmark: 'Karl Square, International Community School (ICS), Adams Pavilion',
    aliases: ['sarbet', 'sar bet', 'karl square', 'ics', 'adams pavilion', 'ሳርቤት', 'ካርል አደባባይ'],
  },
  {
    id: 'bisrate-gabriel',
    name: 'Bisrate Gabriel',
    amharic: 'ብሥራተ ገብርኤል',
    subCity: 'Nifas Silk-Lafto',
    taxiDropOrLandmark: 'Bisrate Gabriel Church, Laphto Mall, Home Depot, South Gate',
    aliases: ['bisrate gabriel', 'gabriel', 'laphto mall', 'south gate', 'ብሥራተ ገብርኤል', 'ላፍቶ ሞል'],
  },
  {
    id: 'lebu',
    name: 'Lebu',
    amharic: 'ለቡ',
    subCity: 'Nifas Silk-Lafto',
    taxiDropOrLandmark: 'Lebu Mebrat Hail, Lebu Varnero, Commercial Center, Haile Garment border',
    aliases: ['lebu', 'lebu mebrat', 'varnero', 'ለቡ', 'ቫርኔሮ', 'ለቡ መብራት'],
  },
  {
    id: 'jemo',
    name: 'Jemo (Jemo 1, 2, 3)',
    amharic: 'ጀሞ',
    subCity: 'Nifas Silk-Lafto',
    taxiDropOrLandmark: 'Jemo 1, Jemo 2, Jemo 3, Glass Factory, Michael Mazoria',
    aliases: ['jemo', 'jemo 1', 'jemo 2', 'jemo 3', 'glass factory', 'ጀሞ', 'ጀሞ 1', 'ጀሞ 2', 'ጀሞ 3'],
  },
  {
    id: 'mekanisa',
    name: 'Mekanisa',
    amharic: 'መካኒሳ',
    subCity: 'Nifas Silk-Lafto',
    taxiDropOrLandmark: 'Mekanisa Abo, Mekanisa Michael, Semmit, Kore',
    aliases: ['mekanisa', 'mekanisa abo', 'mekanisa michael', 'kore', 'መካኒሳ', 'መካኒሳ አቦ'],
  },
  {
    id: 'haile-garment',
    name: 'Haile Garment',
    amharic: 'ኃይሌ ጋርመንት',
    subCity: 'Nifas Silk-Lafto',
    taxiDropOrLandmark: 'Haile Garment Roundabout, Ring Road south, Industrial area',
    aliases: ['haile garment', 'garment', 'ኃይሌ ጋርመንት', 'ጋርመንት'],
  },

  // ---------------------------------------------------------------------------
  // YEKA (የካ)
  // ---------------------------------------------------------------------------
  {
    id: 'megenagna',
    name: 'Megenagna',
    amharic: 'መገናኛ',
    subCity: 'Yeka',
    taxiDropOrLandmark: 'Megenagna Roundabout, Zefmesh Grand Mall, Lem Hotel, Diaspora Square',
    aliases: ['megenagna', 'zefmesh', 'lem hotel', 'diaspora square', 'መገናኛ', 'ዘፍመሽ', 'ሌም ሆቴል'],
  },
  {
    id: 'hayahulet',
    name: 'Hayahulet / 22 (Golagol)',
    amharic: 'ሃያ ሁለት (ጎላጎል)',
    subCity: 'Yeka',
    taxiDropOrLandmark: '22 Mazoria, Golagol Tower, Lex Plaza, Zerihun Building',
    aliases: ['hayahulet', '22', 'golagol', '22 mazoria', 'lex plaza', 'ሃያ ሁለት', 'ጎላጎል', '22'],
  },
  {
    id: 'kotebe',
    name: 'Kotebe',
    amharic: 'ኮተቤ',
    subCity: 'Yeka',
    taxiDropOrLandmark: 'Kotebe Metropolitan University (KMU), Kotebe 02, Hana Mariam',
    aliases: ['kotebe', 'kmu', 'kotebe 02', 'hana mariam', 'ኮተቤ', 'ኮተቤ 02'],
  },
  {
    id: 'shola',
    name: 'Shola Gebeya',
    amharic: 'ሾላ ገበያ',
    subCity: 'Yeka',
    taxiDropOrLandmark: 'Shola Traditional Market, Yeka Sub-City Municipality, British Council route',
    aliases: ['shola', 'shola gebeya', 'ሾላ', 'ሾላ ገበያ'],
  },
  {
    id: 'gurd-shola',
    name: 'Gurd Shola',
    amharic: 'ጉርድ ሾላ',
    subCity: 'Yeka',
    taxiDropOrLandmark: 'Century Mall, Athletics Federation, Ethiopian Management Institute',
    aliases: ['gurd shola', 'century mall', 'ጉርድ ሾላ', 'ሴንቸሪ ሞል'],
  },
  {
    id: 'ferensay',
    name: 'Ferensay Legasion',
    amharic: 'ፈረንሳይ ሌጋሲዮን',
    subCity: 'Yeka',
    taxiDropOrLandmark: 'French Embassy, Belgian Embassy, Gurara, Basha Wolde Chilot',
    aliases: ['ferensay', 'french legation', 'gurara', 'ፈረንሳይ', 'ፈረንሳይ ሌጋሲዮን'],
  },
  {
    id: 'signal',
    name: 'Signal',
    amharic: 'ሲግናል',
    subCity: 'Yeka',
    taxiDropOrLandmark: 'Signal Armed Forces Institute, Megenagna north exit',
    aliases: ['signal', 'ሲግናል'],
  },

  // ---------------------------------------------------------------------------
  // GULLELE (ጉለሌ)
  // ---------------------------------------------------------------------------
  {
    id: 'shiro-meda',
    name: 'Shiro Meda',
    amharic: 'ሽሮ ሜዳ',
    subCity: 'Gullele',
    taxiDropOrLandmark: 'United States Embassy, Traditional Habesha dress market, Entoto foothill',
    aliases: ['shiro meda', 'shiromeda', 'us embassy', 'american embassy', 'ሽሮ ሜዳ', 'አሜሪካ ኤምባሲ'],
  },
  {
    id: 'addisu-gebeya',
    name: 'Addisu Gebeya',
    amharic: 'አዲሱ ገበያ',
    subCity: 'Gullele',
    taxiDropOrLandmark: 'Addisu Gebeya Market, Semen Mazegaja, Medhanealem Church',
    aliases: ['addisu gebeya', 'semen mazegaja', 'አዲሱ ገበያ', 'ስሜን ማዘጋጃ'],
  },
  {
    id: 'wingate',
    name: 'Wingate',
    amharic: 'ዊንጌት',
    subCity: 'Gullele',
    taxiDropOrLandmark: 'General Wingate Technical College, Pasteur Institute, Asko border',
    aliases: ['wingate', 'pasteur', 'ዊንጌት', 'ፓስተር'],
  },
  {
    id: 'kechene',
    name: 'Kechene',
    amharic: 'ቀጨኔ',
    subCity: 'Gullele',
    taxiDropOrLandmark: 'Kechene Medhanealem, Pottery & artisan village, Selam Children Village',
    aliases: ['kechene', 'ቀጨኔ', 'ቀጨኔ መድኃኔዓለም'],
  },
  {
    id: 'rufael',
    name: 'Rufael',
    amharic: 'ሩፋኤል',
    subCity: 'Gullele',
    taxiDropOrLandmark: 'Rufael Church, Kuskuam, Entoto mountain highway',
    aliases: ['rufael', 'kuskuam', 'ሩፋኤል', 'ቁስቋም'],
  },

  // ---------------------------------------------------------------------------
  // LIDETA (ልደታ)
  // ---------------------------------------------------------------------------
  {
    id: 'balcha',
    name: 'Balcha Hospital',
    amharic: 'ባልቻ ሆስፒታል',
    subCity: 'Lideta',
    taxiDropOrLandmark: 'Balcha Hospital, Lideta Catholic Cathedral, Torhailoch border',
    aliases: ['balcha', 'balcha hospital', 'ባልቻ', 'ባልቻ ሆስፒታል'],
  },
  {
    id: 'lideta-condo',
    name: 'Lideta Condominium',
    amharic: 'ልደታ ኮንዶሚኒየም',
    subCity: 'Lideta',
    taxiDropOrLandmark: 'Lideta site high-rises, near Federal High Court & Senga Tera',
    aliases: ['lideta condo', 'lideta condominium', 'ልደታ', 'ልደታ ኮንዶ'],
  },
  {
    id: 'senga-tera',
    name: 'Senga Tera',
    amharic: 'ሰንጋ ተራ',
    subCity: 'Lideta',
    taxiDropOrLandmark: 'Financial District, CBE Headquarters Tower, Nib Bank HQ, Wegagen HQ',
    aliases: ['senga tera', 'financial district', 'cbe tower', 'cbe hq', 'ሰንጋ ተራ', 'ፋይናንስ'],
  },
  {
    id: 'teklehaimanot',
    name: 'Teklehaimanot',
    amharic: 'ተክለሃይማኖት',
    subCity: 'Lideta',
    taxiDropOrLandmark: 'Teklehaimanot Church, General hospital, Somale Tera border',
    aliases: ['teklehaimanot', 'ተክለሃይማኖት', 'ተክለሃይማኖት ሆስፒታል'],
  },

  // ---------------------------------------------------------------------------
  // ADDIS KETEMA (አዲስ ከተማ)
  // ---------------------------------------------------------------------------
  {
    id: 'merkato',
    name: 'Merkato',
    amharic: 'መርካቶ',
    subCity: 'Addis Ketema',
    taxiDropOrLandmark: 'Tana Market, Dubai Tera, Military Tera, Bomb Tera, Grand Anwar Mosque',
    aliases: ['merkato', 'mercato', 'tana', 'dubai tera', 'anwar mosque', 'መርካቶ', 'ተክለሃይማኖት', 'አንዋር መስጊድ'],
  },
  {
    id: 'autobus-tera',
    name: 'Autobus Tera',
    amharic: 'አውቶቡስ ተራ',
    subCity: 'Addis Ketema',
    taxiDropOrLandmark: 'Inter-City Bus Terminal, Sebategna wholesale, Gojam Berenda',
    aliases: ['autobus tera', 'sebategna', 'gojam berenda', 'አውቶቡስ ተራ', 'ሰባተኛ'],
  },
  {
    id: 'mesalemia',
    name: 'Mesalemia',
    amharic: 'መሳለሚያ',
    subCity: 'Addis Ketema',
    taxiDropOrLandmark: 'Grain and cereals wholesale terminal, Amanuel Hospital area',
    aliases: ['mesalemia', 'amanuel', 'grain market', 'መሳለሚያ', 'አማኑኤል ሆስፒታል'],
  },
  {
    id: 'abenet',
    name: 'Abenet',
    amharic: 'አበነት',
    subCity: 'Addis Ketema',
    taxiDropOrLandmark: 'Abenet Square, Ras Abebe Aregay Street, Lideta boundary',
    aliases: ['abenet', 'አበነት', 'አበነት አደባባይ'],
  },

  // ---------------------------------------------------------------------------
  // KOLFE KERANIO (ኮልፌ ቀራኒዮ)
  // ---------------------------------------------------------------------------
  {
    id: 'tor-hailoch',
    name: 'Tor Hailoch',
    amharic: 'ጦር ኃይሎች',
    subCity: 'Kolfe Keranio',
    taxiDropOrLandmark: 'Armed Forces Comprehensive Hospital, Ring Road intersection, Total Torhailoch',
    aliases: ['tor hailoch', 'torhailoch', 'armed forces hospital', 'ጦር ኃይሎች', 'ጦር ሆስፒታል'],
  },
  {
    id: 'ayer-tena',
    name: 'Ayer Tena',
    amharic: 'አየር ጤና',
    subCity: 'Kolfe Keranio',
    taxiDropOrLandmark: 'Ayer Tena Square, Total Ayer Tena, St. Michael Ayer Tena',
    aliases: ['ayer tena', 'ayertena', 'አየር ጤና', 'አየርጤና'],
  },
  {
    id: 'bethel',
    name: 'Bethel',
    amharic: 'ቤተል',
    subCity: 'Kolfe Keranio',
    taxiDropOrLandmark: 'Bethel Teaching Hospital, Anfo Condominiums, Residential hills',
    aliases: ['bethel', 'bethel hospital', 'anfo', 'ቤተል', 'ቤተል ሆስፒታል'],
  },
  {
    id: 'zenebework',
    name: 'Zenebework (ALERT)',
    amharic: 'ዘነበወርቅ (አለርት)',
    subCity: 'Kolfe Keranio',
    taxiDropOrLandmark: 'ALERT Specialized Hospital, Leprosy & dermatology center',
    aliases: ['zenebework', 'alert', 'alert hospital', 'ዘነበወርቅ', 'አለርት'],
  },
  {
    id: 'asko',
    name: 'Asko',
    amharic: 'አስኮ',
    subCity: 'Kolfe Keranio',
    taxiDropOrLandmark: 'Asko Addisu Sefer, Asko Bus Station, Wingate border',
    aliases: ['asko', 'asko bus', 'አስኮ', 'አስኮ አዲሱ ሰፈር'],
  },

  // ---------------------------------------------------------------------------
  // AKAKI KALITY (አቃቂ ቃሊቲ)
  // ---------------------------------------------------------------------------
  {
    id: 'kality-total',
    name: 'Kality Total',
    amharic: 'ቃሊቲ ቶታል',
    subCity: 'Akaki Kality',
    taxiDropOrLandmark: 'Kality Dry Port, Total Kality, Customs Terminal, Ring Road south',
    aliases: ['kality', 'kality total', 'dry port', 'customs', 'ቃሊቲ', 'ቃሊቲ ቶታል', 'ጉምሩክ'],
  },
  {
    id: 'saris',
    name: 'Saris',
    amharic: 'ሳሪስ',
    subCity: 'Akaki Kality',
    taxiDropOrLandmark: 'Saris Abo Church, Dama Hotel, Kadisco, Saris Addis Sefer',
    aliases: ['saris', 'saris abo', 'kadisco', 'dama hotel', 'ሳሪስ', 'ሳሪስ አቦ', 'ካዲኮ'],
  },
  {
    id: 'tulu-dimtu',
    name: 'Tulu Dimtu',
    amharic: 'ቱሉ ዲምቱ',
    subCity: 'Akaki Kality',
    taxiDropOrLandmark: 'Toll expressway entrance, Tulu Dimtu Condominiums, Industry park',
    aliases: ['tulu dimtu', 'expressway', 'toll gate', 'ቱሉ ዲምቱ', 'ቶል ጌት'],
  },
  {
    id: 'akaki',
    name: 'Akaki',
    amharic: 'አቃቂ',
    subCity: 'Akaki Kality',
    taxiDropOrLandmark: 'St. Michael Akaki, Textile mill, River bridge',
    aliases: ['akaki', 'akaki michael', 'አቃቂ', 'አቃቂ ሚካኤል'],
  },

  // ---------------------------------------------------------------------------
  // FREQUENT COMMUTER SUBURBS / SPECIAL ZONES
  // ---------------------------------------------------------------------------
  {
    id: 'legetafo',
    name: 'Legetafo / Ropack',
    amharic: 'ለገጣፎ / ሮፓክ',
    subCity: 'Yeka',
    taxiDropOrLandmark: 'Ropack Real Estate, Legetafo Roundabout, Country Club homes',
    aliases: ['legetafo', 'ropack', 'country club', 'ለገጣፎ', 'ሮፓክ'],
  },
  {
    id: 'sebeta',
    name: 'Sebeta',
    amharic: 'ሰበታ',
    subCity: 'Kolfe Keranio',
    taxiDropOrLandmark: 'Sebeta railway station, Alemgena junction',
    aliases: ['sebeta', 'alemgena', 'ሰበታ', 'አለምገና'],
  },
  {
    id: 'burayu',
    name: 'Burayu',
    amharic: 'ቡራዩ',
    subCity: 'Kolfe Keranio',
    taxiDropOrLandmark: 'Asko-Burayu border, Gefersa reservoir route',
    aliases: ['burayu', 'gefersa', 'ቡራዩ', 'ገፈርሳ'],
  },
];

/**
 * Intelligent Sefer search engine.
 * Matches across English name, Amharic name, Sub-City, taxi landmark, and aliases.
 */
export function searchSefers(
  query: string,
  options?: { subCity?: string; limit?: number }
): SeferItem[] {
  const limit = options?.limit ?? 15;
  const q = query.trim().toLowerCase();

  let results = ADDIS_ABABA_SEFERS;

  if (options?.subCity) {
    const sc = options.subCity.toLowerCase();
    results = results.filter((item) => item.subCity.toLowerCase() === sc);
  }

  if (!q) {
    return results.slice(0, limit);
  }

  return results
    .filter((item) => {
      if (item.name.toLowerCase().includes(q)) return true;
      if (item.amharic.includes(q)) return true;
      if (item.subCity.toLowerCase().includes(q)) return true;
      if (item.taxiDropOrLandmark.toLowerCase().includes(q)) return true;
      if (item.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))) {
        return true;
      }
      return false;
    })
    .slice(0, limit);
}

/**
 * Resolves full SeferItem details for any search query.
 */
export function resolveSeferDetails(query: string): SeferItem | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  for (const sefer of ADDIS_ABABA_SEFERS) {
    if (sefer.name.toLowerCase() === q) return sefer;
    if (sefer.amharic === query.trim()) return sefer;
    if (sefer.aliases.some((a) => a.toLowerCase() === q || q.includes(a.toLowerCase()))) {
      return sefer;
    }
  }

  return null;
}

export const POPULAR_SEFER_CHIPS = [
  'Mexico',
  '4 Kilo',
  '6 Kilo',
  'Piazza',
  'CMC Michael',
  'Sarbet',
  'Ayat',
  'Summit',
  'Kazanchis',
  'Megenagna',
  '22 (Golagol)',
  'Lebu',
  'Jemo',
  'Bole Medhanialem',
  'Gerji',
  'Shiro Meda',
  'Tor Hailoch',
  'Merkato',
  'Kality Total',
] as const;
