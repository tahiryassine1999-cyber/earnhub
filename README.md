# 🌟 EarnHub — Production-Ready GPT (Get-Paid-To) Web Application

EarnHub is a premium, high-converting Get-Paid-To (GPT) platform built with **Next.js**, **Prisma**, **PostgreSQL**, and **Vanilla CSS**. Users register, complete premium surveys, complete mobile tasks/offers from high-paying offerwalls, and instantly request cashouts.

Featuring a beautiful **Emerald Dark Theme** with a modern glassmorphic UI, responsive layouts, dynamic earning tracking, a fully audited transaction ledger, and a robust admin dashboard.

---

## 🚀 Key Features

*   **📊 CPX Research Surveys Integration**: Real, high-paying surveys targeted dynamically to user profiles.
*   **🎁 Lootably Offerwall Integration**: High-converting mobile app installs, sign-ups, and game tasks.
*   **🎮 Custom Internal Surveys & Tasks**: Built-in survey wizard and mock tasks with full credit simulation.
*   **🔒 Secure Postback Webhook Endpoint (`/api/postback`)**: Natively processes automated callback requests from CPX, Lootably, or any major offerwall provider with duplicate checks.
*   **💼 Auditable Ledger System**: Every single balance adjustment is logged to a `Transaction` model to prevent balance tampering.
*   **⚙️ Admin Dashboard (`/admin`)**: Complete platform administration to process cashouts, edit site settings (minimum withdrawal, daily rewards), view users, and adjust balances.
*   **👥 Referral & Daily Bonus System**: Viral loop mechanics with dynamic referral code linking, tracking, and daily check-ins.

---

## 🛠️ Technology Stack

1.  **Core**: Next.js 16 (App Router)
2.  **Styling**: Pure CSS (Variables, HSL tokens, premium layout rules)
3.  **Database**: Prisma ORM with **PostgreSQL** support (optimized for Neon/Supabase)
4.  **Authentication**: NextAuth.js (Session-based, securely hashed)

---

## 💻 Local Quick Start

### 1. Clone & Set Up Directory
Open your workspace in `C:\Users\HP\.gemini\antigravity\scratch\earnhub` and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` (or `.env.local`) file in the root directory:
```env
# Production PostgreSQL Connection (Neon or local postgres)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/earnhub?schema=public"

# NextAuth Config
NEXTAUTH_SECRET="change-this-to-a-random-secret-in-production-32chars"
NEXTAUTH_URL="http://localhost:3000"

# (Optional) Real Offer Wall Provider IDs
NEXT_PUBLIC_CPX_APP_ID="YOUR_CPX_APP_ID"
NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID="YOUR_LOOTABLY_PLACEMENT_ID"
```

### 3. Setup and Seed Database
Run Prisma migrations and seed default administrative and user accounts:
```bash
# Push database schema to your postgres database
npx prisma db push

# Seed the database
node prisma/seed.js
```

Seeded credentials for testing:
*   **Admin Account**: `admin@earnhub.com` (password: `admin123`)
*   **Standard User**: `user@earnhub.com` (password: `user123`)

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to start using the app.

---

## 🌍 Free Hosting Guide (Vercel & Neon PostgreSQL)

EarnHub is designed to run **100% free** in production on serverless infrastructure.

### Step 1: Provision a Free Neon Database
1.  Sign up for a free serverless PostgreSQL database at [Neon.tech](https://neon.tech/).
2.  Create a project named `earnhub` and select your nearest region.
3.  Copy the **Pooled Connection** string:
    ```text
    postgresql://earnhub_owner:AbC123xYz@ep-cool-butterfly-123456.us-east-2.aws.neon.tech/earnhub?sslmode=require
    ```

### Step 2: Push to GitHub
Create a private repository on [GitHub](https://github.com/) and push your code:
```bash
git init
git add .
git commit -m "EarnHub Production Release"
git branch -M main
git remote add origin https://github.com/your-username/earnhub.git
git push -u origin main
```

### Step 3: Deploy on Vercel
1.  Log in to [Vercel](https://vercel.com/) with your GitHub account.
2.  Click **Add New...** -> **Project** and import your repository.
3.  Add the following **Environment Variables** in the Vercel dashboard:
    *   `DATABASE_URL`: *Your Neon PostgreSQL connection string*
    *   `NEXTAUTH_SECRET`: *Any random 32-character security string*
    *   `NEXTAUTH_URL`: `https://your-domain.vercel.app` (your Vercel app link)
    *   `NEXT_PUBLIC_CPX_APP_ID`: *Your CPX App ID* (optional, sandbox loads if empty)
    *   `NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID`: *Your Lootably Placement ID* (optional, sandbox loads if empty)
4.  Click **Deploy**. Once built, Vercel will give you a public URL!

### Step 4: Run Prisma Setup on Production
Once your Vercel site is deployed, push the database structures and seed your Neon database locally:
```bash
# Replace DATABASE_URL in your local .env with your Neon string, then run:
npx prisma db push
node prisma/seed.js
```

---

## 🔗 How to Earn Real Money (Webhook Postbacks)

To get paid when users complete surveys and offers, configure postback webhooks:

1.  Log in to your **CPX Research** or **Lootably** publisher dashboard.
2.  Configure your **Postback / Callback URL** to:
    ```text
    https://your-domain.vercel.app/api/postback
    ```
3.  Set the HTTP method to **GET** (or POST).
4.  Map the publisher fields to these parameters:
    *   `userId` = `{user_id}` (matches the dynamic user ID parameter in your widget)
    *   `offerId` = `{offer_id}` (matches the survey/task identifier)
    *   `amount` = `{amount}` (the amount of USD credited to the user)

Whenever a user completes an offer, the ad network will instantly hit your webhook, update the user's wallet, and record a transaction in your ledger. You can review and complete user cashouts in your **Admin Dashboard**!
