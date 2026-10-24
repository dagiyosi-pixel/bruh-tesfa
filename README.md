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
   - Automated Telegram Bot API integration (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`) for direct channel broadcasting and webhook-driven interactive bot commands.
3. **Interactive Telegram Bot & Opt-In Vacancy Alerts**:
   - Official bot commands: `/start`, `/help`, `/find`, `/vacancies`, `/teach`, `/alerts`, `/contact`, `/stop`.
   - Real-time opt-in alert matching for tutors (filtered by subject, sub-city, and in-person vs. online format).
   - Timing-safe webhook verification using `crypto.timingSafeEqual` with secret tokens.
4. **Integrated Telegram Content Studio & Branded Graphic Generator**:
   - 12 pre-configured strategic marketing templates with English and Amharic draft support.
   - Client-rendered 1080x1080 high-resolution graphic poster generator (HTML5 Canvas) with one-click PNG download.
   - Built-in UTM campaign link tracking (`utm_source=telegram&utm_medium=channel|bot&utm_campaign=...`).
5. **Dual-Persistence Engine & Production Fail-Safe Guard**:
   - Connects to cloud **Supabase PostgreSQL** and **Supabase Storage** via sequential migrations `001`, `002`, `003`, `004`, and `005`.
   - Embeds an atomic, zero-credential local persistent storage engine (`data/bruh-tesfa-db.json`) allowing local development, testing, and offline trials immediately out-of-the-box.
   - In production (`NODE_ENV=production`), the application strictly demands valid Supabase credentials and throws a fail-safe `ProductionStorageConfigurationError` rather than silently degrading to local disk or memory.
6. **Schedule-Aware Matching & Mobile Availability Portal**:
   - High-precision matching evaluating tutor 24-hour weekly intervals against family preferred days and time windows into 4 honest states (`compatible`, `partially_compatible`, `unknown`, `conflict`).
   - Self-service tutor schedule portal at `/tutors/schedule` authenticated via Application Reference Number and registered phone.
7. **Transparent 60% Placement Economics**:
   - One-time 60% placement commission locked into the placement agreement for the first month/package.
   - 0% commission on subsequent months (months 2+ belong 100% to the tutor).
   - 14-day / 2-lesson replacement safeguard for families.

---

## 2. Directory Structure
```
bruh-tesfa/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Dynamic homepage with dual CTAs, trust signals, sub-city hubs
│   │   ├── layout.tsx                   # Global responsive layout with metadata
│   │   ├── globals.css                  # Tailwind styles with Ethiopian education theme
│   │   ├── tutors/
│   │   │   ├── page.tsx                 # Find a Tutor directory with live filters
│   │   │   ├── [slug]/page.tsx          # Public tutor portfolio
│   │   │   └── schedule/page.tsx        # Tutor self-service schedule & blackout dates portal
│   │   ├── become-a-tutor/              # Multi-step tutor registration & document intake
│   │   ├── request-tutor/               # 4-step progressive parent request wizard
│   │   ├── vacancies/
│   │   │   ├── page.tsx                 # Public vacancy board with sub-city & subject search
│   │   │   └── [code]/                  # Single vacancy detail, Telegram share & application form
│   │   ├── admin/
│   │   │   ├── page.tsx                 # Protected admin management console
│   │   │   └── login/page.tsx           # Administrator login with brute-force rate limiting
│   │   └── api/
│   │       ├── telegram/webhook/        # Official Telegram Bot HTTPS webhook handler
│   │       ├── admin/
│   │       │   ├── telegram/publish/    # Channel broadcast & subscriber alert dispatcher
│   │       │   ├── telegram/studio/     # Content Studio template engine & metrics
│   │       │   ├── telegram/webhook-setup/ # Webhook status & registration API
│   │       │   ├── matches/             # Algorithmic candidate matching & ranking
│   │       │   ├── tutors/[id]/availability/ # Weekly schedule inspector & coordinator verification
│   │       │   └── vacancies/           # Vacancy management & Telegram broadcast
│   │       └── tutors/portal/           # Tutor schedule portal status & availability API
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx       # Core admin console (Tutors, Requests, Vacancies, Placements)
│   │   │   ├── TelegramStudioPanel.tsx  # 12-template marketing studio & broadcast control
│   │   │   └── TelegramGraphicCanvas.tsx# 1080x1080 canvas graphic generator & PNG exporter
│   │   ├── ParentRequestForm.tsx        # 4-step wizard with schedule windows & safety agreement
│   │   ├── TutorAvailabilityEditor.tsx  # Mobile-first weekly schedule & blackout dates editor
│   │   └── Navbar.tsx                   # Header with quick links & Tutor Portal access
│   ├── db/migrations/
│   │   ├── 001_bruh_tesfa_schema.sql    # Core tables, RLS policies, and indexes
│   │   ├── 002_bruh_tesfa_vacancies.sql # Vacancies & Telegram tracking
│   │   ├── 003_bruh_tesfa_refinements.sql # View tracking & placement agreements
│   │   ├── 004_bruh_tesfa_availability.sql # JSONB weekly intervals & blackout dates
│   │   └── 005_bruh_tesfa_telegram.sql  # Telegram subscribers, alert preferences & broadcast logs
│   ├── lib/
│   │   ├── telegram.ts                  # Telegram Bot API client, webhook router & 12 templates
│   │   ├── availability.ts              # 24-hr time parsing, interval overlap & schedule scoring
│   │   ├── matching.ts                  # Algorithmic candidate matching engine
│   │   ├── fees.ts                      # 60% placement fee engine
│   │   └── db/storage.ts                # Unified persistent storage interface
├── scripts/
│   └── setup-telegram-webhook.mjs       # CLI tool for Telegram webhook inspection & registration
└── tests/
    ├── fees.test.mjs                    # Placement commission calculations
    ├── matching.test.mjs                # Subject, sub-city, and schedule matching
    ├── availability-and-scheduling.test.mjs # Schedule intervals, timezones, portal authentication
    ├── telegram-bot-and-studio.test.mjs # Webhook security, bot commands, alert engine, studio templates
    ├── vacancies.test.mjs               # Vacancy state transitions and duplicate prevention
    ├── security-and-validation.test.mjs # Timing-safe auth, rate limiting, persistence fail-safe
    └── storage-and-security.test.mjs    # Directory traversal prevention & RLS isolation
```

---

## 3. Quick Start & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env.local` using `.env.example` as a template:
```ini
# Local zero-credential storage mode
PERSISTENCE_MODE=local

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Administrator Security
ADMIN_INITIAL_PASSWORD=BruhTesfaAdmin2026!
ADMIN_JWT_SECRET=bruh-tesfa-secure-production-secret-addis-2026

# Telegram Bot API (Optional for automated broadcasting)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_secret_token_here
TELEGRAM_CHANNEL_ID=@bruhtesfa_announcements
TELEGRAM_CHANNEL_USERNAME=bruhtesfa_announcements
```

### 3. Running Automated Tests
```bash
npm test
```
Executes all **56 automated tests** across 8 test suites with zero failures:
- Telegram webhook signature verification with `crypto.timingSafeEqual`.
- Bot command routing (`/start`, `/help`, `/find`, `/vacancies`, `/teach`, `/alerts`, `/contact`, `/stop`).
- Interactive button callbacks (toggling subjects, sub-cities, and formats).
- Opt-in vacancy alert matching (matching subjects, sub-cities, and online formats).
- 12 strategic marketing templates in Content Studio (sanitized with zero private family data leaks).
- Broadcast idempotency and duplicate channel post prevention.
- Growth metrics and Telegram attribution tracking.
- Structured availability intervals, overlap resolution, and Africa/Addis_Ababa timezone handling.
- Tutor self-service portal authentication (by reference number and phone).
- Cryptographic HMAC-SHA256 session generation and brute-force rate limiting.
- 60% placement fee engine calculations.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Telegram Integration & Bot Setup Guide

### Step 1: Create Your Bot with @BotFather
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot`.
3. Choose a friendly name (e.g. `Bruh Tesfa Assistant`).
4. Choose a username ending in `bot` (e.g. `BruhTesfaBot`).
5. Copy the generated **HTTP API token**. Set it as `TELEGRAM_BOT_TOKEN` in your environment.
6. Send `/setprivacy` to `@BotFather` &rarr; select your bot &rarr; choose **Enable** (keeps group privacy mode enabled so the bot never scrapes unrelated group messages).

### Step 2: Configure Your Announcement Channel
1. Create a public Telegram channel (e.g. `@bruhtesfa_announcements`).
2. Go to **Channel Settings &rarr; Administrators &rarr; Add Administrator**.
3. Search for your bot and add it with **"Post Messages"** permission.
4. Set `TELEGRAM_CHANNEL_ID` in your environment (e.g. `@bruhtesfa_announcements` or numeric ID `-100...`).

### Step 3: Register the HTTPS Webhook
Once your application is deployed to HTTPS (e.g. on Vercel), register the webhook with Telegram using the included CLI tool:
```bash
# Check current webhook status
node scripts/setup-telegram-webhook.mjs status

# Register your deployed domain
node scripts/setup-telegram-webhook.mjs set https://your-domain.vercel.app

# Unregister webhook if needed
node scripts/setup-telegram-webhook.mjs delete
```
*(Alternatively, in the Admin Console under the **Telegram Studio** tab, click **"Register Webhook"**).*

---

## 5. Content Studio & Branded Graphic Generator
Inside the Admin Console (`/admin`) under the **Telegram Studio & Growth** tab:
1. **Choose a Template**: Select from 12 strategic marketing presets (Single Vacancy, Weekly Roundup, Tutor Recruitment, Parent Finding, SQ3R Study Tips, Safeguarding, FAQs, etc.).
2. **Select Real Vacancy**: Connect live vacancies from the database to automatically inject codes, subjects, and pay rates.
3. **Language Drafts**: Switch between English and optional Amharic promotional drafts.
4. **Edit Caption**: Customize the announcement text in real-time.
5. **Download Branded Graphic (PNG)**: Click the graphic export button to download a high-contrast 1080x1080 square poster ready for Telegram or Instagram.
6. **Publish / Alert**: Click **"Publish to Channel"** to dispatch the announcement, and check **"Notify Opt-in Subscribers"** to alert matching tutors automatically.

---

## 6. Safeguarding Commitment
In compliance with the **Ethiopian Personal Data Protection Proclamation (Proc. No. 1321/2024)**:
- Tutors must undergo national ID and academic credential verification before approval.
- In-person home tutoring must always take place with an adult parent or guardian present in the residence.
- Private family contact details and residence addresses are never published in public vacancies or Telegram broadcasts.
