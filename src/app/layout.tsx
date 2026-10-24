import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BRUH TESFA (ብሩህ ተስፋ) | Vetted Private Tutors in Addis Ababa',
  description:
    'Ethiopian tutor-matching service connecting parents with screened, qualified, and trustworthy private tutors for National Curriculum, Cambridge IGCSE, and exam preparation.',
  keywords: [
    'Ethiopian private tutors',
    'Addis Ababa tutors',
    'Bruh Tesfa',
    'EUEE exam prep',
    'Grade 8 ministry exam',
    'SQ3R tutoring',
    'Cambridge IGCSE Ethiopia',
    'Physics Mathematics tutors Addis Ababa',
  ],
  authors: [{ name: 'Bruh Tesfa Education Services' }],
  metadataBase: new URL('https://bruhtesfa.et'),
  openGraph: {
    title: 'BRUH TESFA (ብሩህ ተስፋ) | Vetted Private Tutors in Addis Ababa',
    description:
      'Connecting parents with screened, qualified, and trustworthy private tutors across Addis Ababa.',
    siteName: 'BRUH TESFA',
    locale: 'en_ET',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
