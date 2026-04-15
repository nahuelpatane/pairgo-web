# Pairgo

**Job swap platform for backpackers & employers.**

Workers in different cities swap positions — both travel with a guaranteed job on day one. Managers approve every swap with full visibility into verified skills and ratings.

Website: pairgo.io

---

## What is Pairgo?

Pairgo connects workers (backpackers, temporary workers) who want to relocate with workers in their target city doing the same role. Instead of quitting and job hunting, they swap — and both managers approve the exchange based on verified profiles.

### Core concept

1. Worker A (Cairns, kitchen hand) wants to move to Melbourne
2. Worker B (Melbourne, kitchen hand) wants to move to Cairns
3. They match on Pairgo, review each other's profiles
4. Both managers approve the swap based on verified skills and ratings
5. They travel and start working from day one

### Key differentiator

- Skills are verified by managers, not self-declared
- Managers must approve before any swap happens
- Ratings and reviews create trust and accountability

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Google + email/password) |
| File Storage | Cloudflare R2 or AWS S3 (profile photos, ID docs) |
| Email | Resend |
| Hosting | Vercel |

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  WORKER
  MANAGER
  ADMIN
}

enum SkillLevel {
  BEGINNER
  COMPETENT
  EXPERT
}

enum SwapStatus {
  SEARCHING        // Worker posted intent, no match yet
  INTERESTED       // Both workers expressed interest
  PENDING_APPROVAL // Sent to managers for approval
  MANAGER_A_APPROVED
  MANAGER_B_APPROVED
  CONFIRMED        // Both managers approved
  ACTIVE           // Workers are currently in swapped positions
  COMPLETED        // Swap finished, reviews pending
  CANCELLED
  REJECTED
}

enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  avatar            String?
  passwordHash      String?
  role              UserRole @default(WORKER)
  nationality       String?
  visaType          String?
  currentCity       String?
  currentCountry    String?  @default("Australia")
  bio               String?
  phone             String?
  idVerification    VerificationStatus @default(PENDING)

  // Relations
  business          Business?          @relation("ManagedBusiness")
  skills            Skill[]
  reviewsGiven      Review[]           @relation("ReviewAuthor")
  reviewsReceived   Review[]           @relation("ReviewSubject")
  swapRequestsFrom  SwapRequest[]      @relation("SwapFrom")
  swapRequestsTo    SwapRequest[]      @relation("SwapTo")
  positions         Position[]         @relation("CurrentWorker")
  messages          Message[]
  notifications     Notification[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Business {
  id          String   @id @default(cuid())
  name        String
  type        String   // restaurant, hotel, farm, retail, etc.
  city        String
  country     String   @default("Australia")
  address     String?
  abn         String?  // Australian Business Number
  verified    VerificationStatus @default(PENDING)
  managerId   String   @unique
  manager     User     @relation("ManagedBusiness", fields: [managerId], references: [id])

  positions   Position[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Position {
  id              String   @id @default(cuid())
  businessId      String
  business        Business @relation(fields: [businessId], references: [id])
  roleTitle       String   // "Kitchen Hand", "Barista", etc.
  description     String?
  requiredSkills  String[] // skill names required
  isAvailableForSwap Boolean @default(false)
  startDate       DateTime?
  endDate         DateTime?
  currentWorkerId String?
  currentWorker   User?    @relation("CurrentWorker", fields: [currentWorkerId], references: [id])

  swapRequestsAs1 SwapRequest[] @relation("Position1")
  swapRequestsAs2 SwapRequest[] @relation("Position2")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Skill {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  name        String     // "Kitchen Hand", "Barista", "Housekeeping"
  level       SkillLevel @default(BEGINNER)
  verifiedBy  String?    // manager user ID who verified
  verifiedAt  DateTime?

  createdAt   DateTime   @default(now())

  @@unique([userId, name])
}

model SwapRequest {
  id            String     @id @default(cuid())
  status        SwapStatus @default(SEARCHING)

  // Worker A (initiator)
  workerFromId  String
  workerFrom    User       @relation("SwapFrom", fields: [workerFromId], references: [id])
  positionFromId String
  positionFrom  Position   @relation("Position1", fields: [positionFromId], references: [id])

  // Worker B (match)
  workerToId    String?
  workerTo      User?      @relation("SwapTo", fields: [workerToId], references: [id])
  positionToId  String?
  positionTo    Position?  @relation("Position2", fields: [positionToId], references: [id])

  // Desired destination (before match)
  desiredCity   String?
  desiredRole   String?
  availableFrom DateTime?
  availableTo   DateTime?

  // Approval tracking
  managerAApproved Boolean @default(false)
  managerBApproved Boolean @default(false)
  managerAApprovedAt DateTime?
  managerBApprovedAt DateTime?

  // Completion
  startedAt     DateTime?
  completedAt   DateTime?

  reviews       Review[]
  messages      Message[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Review {
  id            String   @id @default(cuid())
  swapRequestId String
  swapRequest   SwapRequest @relation(fields: [swapRequestId], references: [id])
  authorId      String
  author        User     @relation("ReviewAuthor", fields: [authorId], references: [id])
  subjectId     String
  subject       User     @relation("ReviewSubject", fields: [subjectId], references: [id])

  reliability   Int      // 1-5
  skillRating   Int      // 1-5
  attitude      Int      // 1-5
  comment       String?

  createdAt     DateTime @default(now())

  @@unique([swapRequestId, authorId])
}

model Message {
  id            String   @id @default(cuid())
  swapRequestId String
  swapRequest   SwapRequest @relation(fields: [swapRequestId], references: [id])
  senderId      String
  sender        User     @relation(fields: [senderId], references: [id])
  content       String
  read          Boolean  @default(false)

  createdAt     DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // swap_request, approval, review, message
  title     String
  body      String
  read      Boolean  @default(false)
  link      String?

  createdAt DateTime @default(now())
}
```

---

## Project Structure

```
pairgo/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Worker dashboard
│   │   │   ├── profile/page.tsx    # Edit profile
│   │   │   └── swaps/
│   │   │       ├── page.tsx        # My swaps list
│   │   │       ├── search/page.tsx # Find swaps
│   │   │       └── [id]/page.tsx   # Swap detail
│   │   ├── manager/
│   │   │   ├── page.tsx            # Manager dashboard
│   │   │   ├── approvals/page.tsx  # Pending approvals
│   │   │   ├── workers/page.tsx    # Current workers
│   │   │   └── verify/page.tsx     # Verify skills
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── users/route.ts
│   │       ├── swaps/route.ts
│   │       ├── reviews/route.ts
│   │       ├── skills/route.ts
│   │       └── messages/route.ts
│   ├── components/
│   │   ├── ui/                     # Reusable UI (buttons, cards, inputs)
│   │   ├── layout/                 # Nav, Footer, Sidebar
│   │   ├── swap/                   # Swap-specific components
│   │   ├── profile/                # Profile components
│   │   └── review/                 # Review components
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # NextAuth config
│   │   └── utils.ts                # Helpers
│   └── types/
│       └── index.ts                # TypeScript types
├── public/
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## MVP Build Order

Build in this exact order. Each phase should be fully working before moving to the next.

### Phase 1: Project Setup
- [ ] Initialize Next.js with TypeScript and Tailwind
- [ ] Set up Prisma with PostgreSQL
- [ ] Run initial migration
- [ ] Configure NextAuth (Google + credentials)
- [ ] Create Prisma client singleton
- [ ] Basic layout (nav, footer)

### Phase 2: Auth & Profiles
- [ ] Registration page (worker vs manager role selection)
- [ ] Login page
- [ ] Worker profile page (view + edit)
- [ ] Manager profile + business registration
- [ ] ABN field for business verification (manual for MVP)
- [ ] Profile photo upload

### Phase 3: Positions & Skills
- [ ] Manager: create/edit positions in their business
- [ ] Manager: assign current workers to positions
- [ ] Manager: verify worker skills (name + level)
- [ ] Worker: view their verified skills on profile

### Phase 4: Swap Matching
- [ ] Worker: post swap intent (current position, desired city, dates)
- [ ] Swap search page with filters (role, city, dates)
- [ ] Swap match cards (showing profile, skills, rating, route)
- [ ] Express interest flow (both workers)
- [ ] Swap detail page (side-by-side comparison)

### Phase 5: Manager Approval
- [ ] Manager dashboard with pending approvals
- [ ] Review candidate profile before approving
- [ ] Approve/reject swap
- [ ] Status updates (pending → approved → confirmed)
- [ ] Email notifications on status changes

### Phase 6: Reviews & Ratings
- [ ] Post-swap review form (reliability, skill, attitude + comment)
- [ ] Skill verification during review
- [ ] Display reviews on worker profile
- [ ] Calculate average rating

### Phase 7: Messaging (simple)
- [ ] Basic messaging between matched workers
- [ ] Message notifications

---

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pairgo"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
RESEND_API_KEY=""
```

---

## Design Guidelines

- Primary color: #E8654A (coral)
- Dark: #1A1A18
- Sand background: #FAFAF7
- Display font: Fraunces (serif)
- Body font: DM Sans (sans-serif)
- Border radius: 14-20px for cards, 100px for pills/badges
- Use Tailwind CSS for all styling
- Mobile-first responsive design

---

## Commands Reference

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Prisma commands
npx prisma generate        # Generate client
npx prisma migrate dev     # Run migrations
npx prisma studio          # Visual DB browser
npx prisma db seed         # Seed data (if configured)
```

---

## Notes

- This is an MVP. Keep it simple. Ship fast, validate, iterate.
- The landing page (already built) goes in src/app/page.tsx
- All swaps are 1-to-1 but a worker can search for multiple matches
- Once a swap is completed, the worker can search for another
- Managers must approve BOTH sides before a swap is confirmed
- Skills are ONLY valid when verified by a manager
