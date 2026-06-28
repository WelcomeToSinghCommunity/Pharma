# Backend Migration Setup Instructions

## Overview
Your React frontend has been migrated to use a Node.js + Express + PostgreSQL + Prisma backend with Cloudflare R2 (for files) and Cloudflare Stream (for videos). All existing UI, styling, and navigation are preserved.

## What You Need to Do

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
- Install PostgreSQL on your machine
- Create a database: `createdb pharma_training`
- Get your database URL (usually: `postgresql://username:password@localhost:5432/pharma_training`)

**Option B: Cloud PostgreSQL (Recommended)**
- Use Supabase, Neon, or Railway
- Get your database connection string

### 3. Set Up Cloudflare R2 (for thumbnails, PDFs, images)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **R2** → **Create Bucket**
3. Name it (e.g., `pharma-training-assets`)
4. Enable public access for the bucket
5. Go to **R2** → **Manage R2 API Tokens**
6. Create an API token with **Admin Read & Write** permissions
7. Save these credentials:
   - Account ID (from dashboard home)
   - Access Key ID
   - Secret Access Key
   - Bucket Name
   - Public URL (format: `https://pub-xxxxx.r2.dev`)

### 4. Set Up Cloudflare Stream (for videos)

1. In Cloudflare Dashboard, go to **Stream**
2. Enable Stream (may require adding a payment method)
3. Go to **Stream** → **Get API Token**
4. Save:
   - Account ID (same as R2)
   - API Token

### 5. Configure Backend Environment Variables

Create `backend/.env` file with:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pharma_training

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=pharma-training-assets
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Cloudflare Stream
CLOUDFLARE_STREAM_ACCOUNT_ID=your_account_id
CLOUDFLARE_STREAM_API_TOKEN=your_stream_api_token

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Admin Email (for authorization)
ADMIN_EMAIL=harideepsingh13@gmail.com

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_here
```

### 6. Initialize Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 7. Seed Existing Course Data

```bash
cd backend
node prisma/seed.js
```

This will migrate your existing courses from `src/data/courses.js` to the database.

### 8. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

### 9. Install Frontend Dependencies

```bash
cd ..
npm install
```

This will install the new `socket.io-client` dependency.

### 10. Configure Frontend Environment

Your `.env.example` already has `VITE_API_URL=http://localhost:3001/api`. Create `.env.local` if needed:

```env
VITE_API_URL=http://localhost:3001/api
```

### 11. Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## What's New

### Admin Dashboard
- **File Upload UI**: Upload thumbnails, videos, and materials directly from the course form
- **Real-time Updates**: Changes save immediately to the database
- **Course CRUD**: Full create, edit, delete functionality

### Video Player
- **Like/Dislike**: Users can like or dislike videos
- **Real-time Counts**: Like/dislike counts update instantly

### Comments Section
- **Real-time Comments**: Comments appear instantly via Socket.IO
- **Replies**: Nested replies to comments
- **Likes**: Like comments
- **Pinning**: Instructors can pin important comments
- **Instructor Badges**: Visual indicator for instructor comments

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma client
│   │   ├── r2.js             # Cloudflare R2 config
│   │   └── stream.js         # Cloudflare Stream config
│   ├── routes/
│   │   ├── courseRoutes.js   # Course CRUD APIs
│   │   ├── uploadRoutes.js   # File upload APIs
│   │   ├── commentRoutes.js  # Comment APIs
│   │   └── reactionRoutes.js # Like/dislike APIs
│   ├── services/
│   │   ├── r2Service.js      # R2 upload service
│   │   └── streamService.js  # Stream upload service
│   └── server.js             # Express server + Socket.IO
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Data migration script
├── .env.example             # Environment template
└── package.json

src/
├── lib/
│   └── api.js               # Frontend API client
├── components/
│   ├── CommentsSection.jsx  # Comments UI with Socket.IO
│   └── VideoPlayer.jsx      # Updated with like/dislike
└── App.jsx                  # Updated admin dashboard
```

## Troubleshooting

**Backend won't start**
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run `npx prisma generate` again

**File uploads fail**
- Verify Cloudflare R2 credentials
- Check bucket has public access enabled
- Ensure API token has correct permissions

**Video uploads fail**
- Verify Cloudflare Stream is enabled
- Check payment method is added to Cloudflare
- Ensure API token is valid

**Comments not real-time**
- Check Socket.IO is running on backend
- Verify frontend can connect to `http://localhost:3001`
- Check browser console for WebSocket errors

## Next Steps After Setup

1. Test creating a new course in admin dashboard
2. Upload a thumbnail, video, and material
3. Test the video player like/dislike feature
4. Test real-time comments (open two browser windows)
5. Publish the course and verify it appears on the frontend
