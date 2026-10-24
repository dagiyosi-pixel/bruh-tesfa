# BRUH TESFA (ብሩህ ተስፋ)

> **Empowering Ethiopian Families with Trustworthy, Screened Private Tutors**  
> Built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL.

---

## 1. System Overview & Core Architecture
BRUH TESFA is a genuinely functional, mobile-first Ethiopian tutor-matching platform operating across all 11 sub-cities of Addis Ababa. It connects parents with vetted educators for the Ethiopian National Curriculum (Grade 8 Ministry & Grade 12 EUEE prep), Cambridge IGCSE, and IB Diploma.

### Key Architectural Highlights:
1. **Separation of Public and Private Data**:
   - Public visitors only see approved display profiles (`/tutors`, `/tutors/[slug]`).
   - Private phone numbers, legal names, Fayda/Kebele national IDs, and degree certificates are never queried or leaked over public APIs.
2. **Dual-Persistence Engine**:
   - Seamlessly connects to cloud **Supabase PostgreSQL** and **Supabase Storage** via `001_bruh_tesfa_schema.sql`.
   - Embeds a local, zero-credential persistent storage engine (`data/bruh-tesfa-db.json`) allowing all core flows (tutor submission, parent request, admin review, candidate matching, 60% fee calculations, and safeguarding logs) to run immediately out-of-the-box.
3. **Algorithmic Candidate Matcher**:
   - Scores compatibility (0–100%) based on subject fit, grade level, teaching modality, sub-city proximity, language overlap, and budget fit.
   - Provides explainable rationale strings for administrative decision-making.
4. **Transparent 60% Placement Economics**:
   - One-time 60% placement commission locked into the placement agreement for the first month/package.
   - 0% commission on subsequent months (months 2+ belong 100% to the tutor).
   - 14-day / 2-lesson replacement safeguard for families.
5. **Safeguarding & Proclamation No. 1321/2024 Compliance**:
   - Adheres to the Ethiopian Personal Data Protection Proclamation.
   - Zero profiling of minors, no public child profiles, minimal data collection, and an interactive data deletion request mechanism.

---

## 2. Directory Structure
```
bruh-tesfa/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Homepage with dual CTAs, trust signals, sub-city hubs
│   │   ├── layout.tsx                   # Global responsive layout with metadata
│   │   ├── globals.css                  # Tailwind styles with Ethiopian education theme
│   │   ├── tutors/
│   │   │   ├── page.tsx                 # Find a Tutor directory with live filters
│   │   │   └── [slug]/page.tsx          # Single approved tutor public showcase
│   │   ├── become-a-tutor/
│   │   │   ├── page.tsx                 # Tutor recruitment & application page
│   │   │   └── confirmation/page.tsx    # Application confirmation with reference number
│   │   ├── request-tutor/
│   │   │   ├── page.tsx                 # Guided parent/guardian tutoring request
│   │   │   └── confirmation/page.tsx    # Request confirmation with tracking reference
│   │   ├── how-it-works/page.tsx        # 4-step process breakdown for parents & tutors
│   │   ├── safety/page.tsx              # Safeguarding rules & confidential incident form
│   │   ├── about/page.tsx               # Brand story, mission, and philosophy
│   │   ├── contact/page.tsx             # Service desk, Telegram channels, and phone
│   │   ├── privacy/page.tsx             # Privacy notice & Proclamation 1321/2024 deletion form
│   │   ├── terms/page.tsx               # Terms of service (flagged for local legal review)
│   │   ├── tutor-agreement/page.tsx     # Tutor Code of Conduct & child safeguarding protocol
│   │   ├── fee-policy/page.tsx          # Transparent 60% placement fee policy
│   │   ├── admin/
│   │   │   ├── page.tsx                 # Protected admin console (role verified on server)
│   │   │   └── login/page.tsx           # Admin authentication gate
│   │   └── api/
│   │       ├── tutors/                  # Public approved profiles API
│   │       ├── tutor-apply/             # Public tutor application submission
│   │       ├── request-tutor/           # Public parent request submission
│   │       ├── complaints/              # Public safeguarding incident reporting
│   │       ├── privacy-request/         # Public data deletion/rectification requests
│   │       └── admin/                   # Protected admin endpoints (metrics, matching, placements, export)
│   ├── components/
│   │   ├── Navbar.tsx                   # Responsive navigation & mobile drawer
│   │   ├── Footer.tsx                   # Footer with legal links & Telegram channels
│   │   ├── Icons.tsx                    # Lightweight accessible SVG icons
│   │   ├── TutorCard.tsx                # Verified tutor card component
│   │   ├── TutorApplicationForm.tsx     # 5-step form with draft auto-save
│   │   ├── ParentRequestForm.tsx        # Guided parent request form
│   │   └── admin/
│   │       └── AdminDashboard.tsx       # Multi-tab operator command center
│   ├── lib/
│   │   ├── types.ts                     # TypeScript domain models & schemas
│   │   ├── constants.ts                 # Taxonomies (sub-cities, subjects, curricula, grades)
│   │   ├── auth.ts                      # Session token creation & cryptographic verification
│   │   ├── matching.ts                  # Algorithmic candidate match engine
│   │   ├── fees.ts                      # 60% placement commission calculation
│   │   └── db/
│   │       ├── seed.ts                  # Realistic Addis Ababa seed data
│   │       └── storage.ts               # Unified Data Access Layer (Supabase + local fallback)
│   └── db/
│       └── migrations/
│           └── 001_bruh_tesfa_schema.sql # Complete PostgreSQL / Supabase RLS schema
├── tests/
│   ├── fees.test.mjs                    # Placement fee math & edge cases
│   ├── matching.test.mjs                # Match scoring & unapproved tutor exclusion
│   ├── storage-and-security.test.mjs    # Public/private isolation & status transitions
│   └── security-and-validation.test.mjs # Malformed input & boundary tests
├── docs/
│   └── 30-DAY-LAUNCH-PLAYBOOK.md        # Operator go-to-market plan
├── .env.example                         # Environment configuration template
├── .env.local                           # Local development configuration
└── package.json
```

---

## 3. Quick Start & Local Setup

### 1. Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm 10+

### 2. Installation
```bash
# Navigate to project workspace
cd "01_Active_Workspaces/bruh-tesfa"

# Install dependencies
npm install
```

### 3. Environment Configuration
Verify that `.env.local` contains the initial administration credentials:
```env
ADMIN_INITIAL_PASSWORD=BruhTesfaAdmin2026!
ADMIN_JWT_SECRET=bruh-tesfa-secure-production-secret-addis-2026
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/bruhtesfa_community
NEXT_PUBLIC_TELEGRAM_CHANNEL_URL=https://t.me/bruhtesfa_announcements
NEXT_PUBLIC_SUPPORT_PHONE=+251 91 123 4567
NEXT_PUBLIC_SUPPORT_EMAIL=contact@bruhtesfa.com
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Automated Tests
```bash
npm test
```
All 12 unit, integration, and security tests will run and report status.

### 6. Building for Production
```bash
npm run build
```

---

## 4. Operator Console Access
1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Enter the administrator key: `BruhTesfaAdmin2026!`
3. You will enter the **Staff Management Console**, with full access to:
   - **Tutor Applications**: Review private documents, phone numbers, and change status (`approved`, `under_review`, `needs_info`, `rejected`, `suspended`).
   - **Parent Requests**: Inspect incoming tutoring needs.
   - **Candidate Matcher**: Run the 0–100% explainable scoring engine against any request and propose matches with 1 click.
   - **Placements & 60% Fees**: Create official placement agreements, view locked fee calculations, and reconcile Telebirr / CBE payments.
   - **Safeguarding**: Review and resolve confidential incident reports.
   - **Data Exports**: Download sanitized CSV files of placements, requests, and tutors.

---

## 5. Cloud Supabase Deployment (Optional)
To deploy persistent records to Supabase PostgreSQL:
1. Create a project in [Supabase](https://supabase.com).
2. In the SQL Editor, execute the contents of `src/db/migrations/001_bruh_tesfa_schema.sql`.
3. Create two storage buckets:
   - `tutor-public-avatars` (Public bucket)
   - `tutor-documents` (Private bucket for national IDs and degree scans)
4. Update your deployment environment variables with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Server-only secret)
