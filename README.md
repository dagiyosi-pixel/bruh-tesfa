# BRUH TESFA (ብሩህ ተስፋ)

> **Empowering Ethiopian Families with Trustworthy, Screened Private Tutors & Organized Tutoring Vacancies**  
> Built with Next.js App Router (v16), TypeScript, Tailwind CSS, and Supabase PostgreSQL.

---

## 1. System Overview & Core Architecture
BRUH TESFA is a genuinely functional, mobile-first Ethiopian tutor-matching platform operating across all 11 sub-cities of Addis Ababa. It connects parents with vetted educators for the Ethiopian National Curriculum (Grade 8 Ministry & Grade 12 EUEE prep), Cambridge IGCSE, and IB Diploma.

### Key Architectural Highlights:
1. **Public/Private Data Isolation & Privacy Compliance**:
   - Public visitors only see approved display profiles (`/tutors`, `/tutors/[slug]`) and sanitized job postings (`/vacancies`, `/vacancies/[code]`).
   - Private phone numbers, legal names, Fayda/Kebele national IDs, and exact residence locations are strictly isolated behind server authorization.
   - Adheres to the Ethiopian Personal Data Protection Proclamation (Proc. No. 1321/2024).
2. **Tutoring Vacancy & Telegram Distribution System**:
   - Organized alternative to unstructured Telegram tutoring channels with verified statuses (`open`, `closing_soon`, `filled`, `closed`).
   - One-click sanitized conversion from genuine parent requests into public vacancy drafts (automatically stripping private phone numbers, family names, and exact house addresses).
   - Copy-ready, attractive Telegram announcement generator designed specifically for Ethiopian tutoring audiences (works 100% offline without API tokens).
   - Optional Telegram Bot API integration (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`) for automated channel broadcasting when configured.
   - Duplicate active application prevention per applicant phone number or tutor profile.
3. **Dual-Persistence Engine**:
   - Seamlessly connects to cloud **Supabase PostgreSQL** and **Supabase Storage** via `001_bruh_tesfa_schema.sql` and `002_bruh_tesfa_vacancies.sql`.
   - Embeds an atomic, zero-credential local persistent storage engine (`data/bruh-tesfa-db.json`) allowing all core flows to run immediately out-of-the-box.
4. **Algorithmic Candidate Matcher**:
   - Scores compatibility (0–100%) based on subject fit, grade level, teaching modality, sub-city proximity, language overlap, and budget fit with explainable rationale strings.
5. **Transparent 60% Placement Economics**:
   - One-time 60% placement commission locked into the placement agreement for the first month/package.
   - 0% commission on subsequent months (months 2+ belong 100% to the tutor).
   - 14-day / 2-lesson replacement safeguard for families.

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
│   │   ├── vacancies/
│   │   │   ├── page.tsx                 # Public Tutoring Vacancy Board with filters
│   │   │   └── [code]/
│   │   │       ├── page.tsx             # Single vacancy detail, Telegram share & application form
│   │   │       └── confirmation/page.tsx # Vacancy application confirmation page
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
│   │       ├── vacancies/               # Public active vacancies API with filters
│   │       │   └── [code]/
│   │       │       ├── route.ts         # Single vacancy endpoint (view counter)
│   │       │       └── apply/route.ts   # Public vacancy application endpoint (duplicate prevention)
│   │       ├── tutor-apply/             # Public tutor application submission
│   │       ├── request-tutor/           # Public parent request submission
│   │       ├── complaints/              # Public safeguarding incident reporting
│   │       ├── privacy-request/         # Public data deletion/rectification requests
│   │       └── admin/
│   │           ├── metrics/             # Real platform KPIs and vacancy view metrics
│   │           ├── vacancies/           # Admin vacancy CRUD, status changes
│   │           │   ├── convert-request/ # 1-click sanitized conversion from parent requests
│   │           │   └── [id]/
│   │           │       ├── applications/# Vacancy applicant review & status update
│   │           │       └── telegram/    # Copy-ready text & bot broadcast dispatcher
│   │           └── placements/          # 60% fee agreements & CBE/Telebirr reconciliation
│   ├── components/
│   │   ├── Navbar.tsx                   # Responsive navigation with Vacancies link & mobile drawer
│   │   ├── Footer.tsx                   # Footer with legal links & Telegram channels
│   │   ├── Icons.tsx                    # Lightweight accessible SVG icons
│   │   ├── TutorCard.tsx                # Verified tutor card component
│   │   ├── VacancyCard.tsx              # Responsive vacancy card with specs and status badges
│   │   ├── VacancyApplicationForm.tsx   # Interactive client application form with validation
│   │   ├── TutorApplicationForm.tsx     # 5-step form with draft auto-save
│   │   ├── ParentRequestForm.tsx        # Guided parent request form
│   │   └── admin/
│   │       └── AdminDashboard.tsx       # Operator command center (Tutors, Requests, Vacancies, Placements)
│   ├── lib/
│   │   ├── types.ts                     # TypeScript domain models & schemas
│   │   ├── constants.ts                 # Taxonomies (sub-cities, subjects, curricula, grades)
│   │   ├── auth.ts                      # Session token creation & cryptographic verification
│   │   ├── telegram.ts                  # Telegram announcement generator & Bot API publisher
│   │   ├── matching.ts                  # Algorithmic candidate match engine
│   │   ├── fees.ts                      # 60% placement commission calculation
│   │   └── db/
│   │       ├── seed.ts                  # Realistic Addis Ababa seed data (Tutors & Vacancies)
│   │       └── storage.ts               # Unified Data Access Layer (Atomic local + Supabase)
│   └── db/
│       └── migrations/
│           ├── 001_bruh_tesfa_schema.sql     # Core platform schema (Tutors, Requests, Placements)
│           └── 002_bruh_tesfa_vacancies.sql  # Vacancies and vacancy applications schema
├── tests/
│   ├── fees.test.mjs                    # Placement fee math & edge cases
│   ├── matching.test.mjs                # Match scoring & unapproved tutor exclusion
│   ├── storage-and-security.test.mjs    # Public/private isolation & status transitions
│   ├── security-and-validation.test.mjs # Malformed input & boundary tests
│   └── vacancies.test.mjs               # Vacancy CRUD, sanitization, duplicate prevention, Telegram text
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
Verify that `.env.local` contains the configuration values:
```env
# Administration
ADMIN_INITIAL_PASSWORD=BruhTesfaAdmin2026!
ADMIN_JWT_SECRET=bruh-tesfa-secure-production-secret-addis-2026

# Brand & Community URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/bruhtesfa_community
NEXT_PUBLIC_TELEGRAM_CHANNEL_URL=https://t.me/bruhtesfa_announcements
NEXT_PUBLIC_SUPPORT_PHONE=+251 91 123 4567
NEXT_PUBLIC_SUPPORT_EMAIL=contact@bruhtesfa.com

# Optional Telegram Channel Bot Publishing (Leave unset for manual copy-paste workflow)
# TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
# TELEGRAM_CHANNEL_ID=@bruhtesfa_announcements
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
Runs all **17 unit, integration, and security tests** across fees, candidate matching, security, vacancies, and Telegram formatting.

### 6. Building for Production
```bash
npm run build
```
Compiles all 35+ routes with Next.js Turbopack, verifies TypeScript types, and creates optimized production bundles.

---

## 4. Operator Console & Vacancy Workflows

1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Enter the administrator key: `BruhTesfaAdmin2026!`
3. You will enter the **Staff Management Console**:
   - **KPI Overview**: Live operational metrics including total vacancies, active open vacancies, total vacancy applicants, and tracked views.
   - **Tutor Applications**: Review private documents, qualifications, phone numbers, and update status.
   - **Parent Requests**: Inspect incoming tutoring requests. Use the **"Draft Vacancy"** button on any genuine request to automatically strip sensitive family identifiers and generate a moderated vacancy draft.
   - **Tutoring Vacancies**:
     - Filter vacancies by status (`all`, `open`, `closing_soon`, `filled`, `closed`, `draft`, `archived`) or search by subject/sub-city.
     - Click **"Telegram"** to open the copy-ready announcement generator. Click "Copy Announcement Text" to paste directly into your Telegram channel, or use the "Bot Auto-Publish" button if API credentials are configured.
     - Click **"Applicants ({count})"** to view all tutor submissions for that specific vacancy, inspect their qualifications, experience, and cover notes, and transition their stage (`submitted` → `under_review` → `shortlisted` → `interview_discussion` → `selected`).
     - Selecting a candidate automatically marks the vacancy as `filled`.
   - **Candidate Matcher**: Algorithmic 0–100% match scoring engine against approved tutors.
   - **Placements & 60% Fees**: Create official placement agreements, view locked 60% first-month commission calculations, and reconcile Telebirr / CBE payments.
   - **Safeguarding**: Review and resolve confidential incident reports.
   - **Data Exports**: Download sanitized CSV files of placements, requests, and tutors.

---

## 5. Telegram Distribution Guide

### Manual Copy-Ready Workflow (Zero API Token Required)
1. In the Admin Console under the **Tutoring Vacancies** tab, click **Telegram** next to any vacancy.
2. The modal generates a beautifully structured announcement complying with Ethiopian tutoring conventions:
   - Emojis, Vacancy Code, Grade & Level, Curriculum, Subjects, Sub-City.
   - Session duration, hours per lesson, pay rate in ETB, and minimum qualifications.
   - Mandatory Safeguarding notice citing Ethiopian Proclamation No. 1321/2024.
   - Trackable application URL with campaign tags (`?utm_source=telegram&utm_campaign=vacancy_alert`).
3. Click **"Copy Announcement Text"** and paste directly into your Telegram channel or group.

### Automated Telegram Bot API Broadcast (Optional)
To enable one-click publishing directly from the dashboard:
1. Create a bot with [@BotFather](https://t.me/BotFather) and copy the HTTP API token.
2. Add your bot as an Administrator with "Post Messages" permission to your public Telegram channel (e.g. `@bruhtesfa_announcements`).
3. Set in `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN="your_bot_token_here"
   TELEGRAM_CHANNEL_ID="@your_channel_username"
   ```
4. Click **"Bot Auto-Publish"** in the announcement modal. The system will broadcast the announcement, store the Telegram message ID, and update publication status in the database.

---

## 6. Database Migrations (Supabase PostgreSQL)

If deploying to cloud Supabase:
1. Create a Supabase project.
2. In the SQL Editor, execute in order:
   - `src/db/migrations/001_bruh_tesfa_schema.sql` (Creates core tables: `tutor_applications`, `parent_requests`, `candidate_matches`, `placements`, `complaints`, `fee_configurations`, `audit_logs`).
   - `src/db/migrations/002_bruh_tesfa_vacancies.sql` (Creates `tutoring_vacancies` and `vacancy_applications` tables with Row Level Security policies, indexes, and duplicate active application constraints).
3. Create private Supabase storage bucket `tutor-documents` and public bucket `tutor-public-avatars`.
4. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 7. Child Safeguarding & Legal Notice
- **Parent Presence Requirement**: Under Ethiopian Child Rights and Protection standards (Proc. No. 1321/2024), all in-person tutoring sessions arranged through Bruh Tesfa must take place with an adult parent or guardian present in the residence.
- **Data Minimization**: Bruh Tesfa never publicly displays a student's full name, telephone number, or specific residential house address.
