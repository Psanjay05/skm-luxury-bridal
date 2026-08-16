# SKM Luxury Bridal Studio 👑

Production-grade, full-stack luxury bridal web application and booking platform for **SKM Luxury Bridal Studio** in Salem, Tamil Nadu, led by certified principal makeup artist **Maha Shree** ([@maha_unique_brides_23](https://www.instagram.com/maha_unique_brides_23)).

---

## 🌟 Key Features

- **Masterpieces Portfolio & HD Makeover Gallery (`/gallery`)**: High-resolution client transformations with filterable category tabs and interactive before/after split image comparison slider.
- **Bespoke Services & Hairdo Catalog (`/services`)**: Alternating visual layout with real South Indian hairdo styles (Mogra Gajra Jada, French Bubble Braid, Butterfly Accented Braid).
- **Antique Jewellery Rental (`/jewellery-rental`)**: 10-piece high-definition temple gold, Lakshmi haram, and Ottiyanam catalog with interactive modal inspector.
- **Bridal Packages & Custom Quote Estimator (`/bridal-packages`)**: Multi-function combo calculator with live pricing and 1-click WhatsApp quotation generator.
- **Smart Booking Portal (`/booking`)**: Real-time Muhurtham date availability indicator, time-slot presets, and prominent cancellation policy terms.
- **Salem Studio Location & Contact (`/contact`)**: Interactive Google Maps embed of Salem Steel Plant location with 1-tap driving directions, WhatsApp direct link, and hotline.
- **Bilingual Experience**: Built-in English (`EN`) and Tamil (`தமிழ்`) language toggle with persistent client memory.
- **Protected Admin Portal (`/admin/*`)**: Complete management dashboard for appointments, bookings with 1-click WhatsApp action templates (including instant UPI deep links), gallery, services, FAQ, testimonials, and contact inquiries.
- **Security & Performance**: In-memory sliding window IP rate limiting on public write endpoints, honeypot anti-spam protection, server-side session checks, and Google Analytics 4 conversion tracking.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19, TypeScript)
- **Styling**: Tailwind CSS + Vanilla CSS (Luxury Gold & Royal Glassmorphism palette)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose ORM
- **Authentication**: [NextAuth.js](https://authjs.dev/)
- **Forms & Validation**: React Hook Form + Zod
- **Analytics**: Google Analytics 4 (GA4)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd skm-luxury-bridal
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/skm_luxury_bridal?retryWrites=true&w=majority"
AUTH_SECRET="your-32-character-random-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="YourSecureAdminPassword2026!"
NEXT_PUBLIC_SITE_URL="https://skmluxurybridal.com"
NEXT_PUBLIC_STUDIO_UPI_VPA="8608194233@upi"
NEXT_PUBLIC_GA_ID="G-SKMBRIDAL26"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Production Deployment

### Option A: Deploy on Vercel (Recommended)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into [Vercel](https://vercel.com/new).
3. In the **Environment Variables** section, add:
   - `MONGODB_URI` (from MongoDB Atlas)
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `ADMIN_USERNAME` & `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
   - `NEXT_PUBLIC_STUDIO_UPI_VPA`
   - `NEXT_PUBLIC_GA_ID`
4. Click **Deploy**. Vercel will build and launch with Turbopack.

### Option B: Deploy via Docker or Node Server
```bash
npm run build
npm run start
```

---

## 🔐 Admin Dashboard Access

- **URL**: `/admin/login`
- **Default Username**: Configured in `ADMIN_USERNAME` (`admin`)
- **Default Password**: Configured in `ADMIN_PASSWORD`
- **Features**: Real-time booking management, 1-tap WhatsApp response templates with UPI deep payment links, gallery management, and client inquiries.

---

## 📍 Studio & Business Details

- **Studio**: SKM Luxury Bridal Studio
- **Founder & Lead MUA**: Maha Shree
- **Location**: 4/39 Alagusamuthiram, Near Steel Plant, Salem, Tamil Nadu, PIN 636013
- **Hotline & WhatsApp**: +91 8608194233 / +91 8973587806
- **Email**: Mahashreesanjeevi48@gmail.com
- **Instagram**: [@maha_unique_brides_23](https://www.instagram.com/maha_unique_brides_23)
