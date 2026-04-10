# LeafLink 🌿

A forestry management platform built as part of my semester project. It covers sustainable forest management, services, job applications, and user authentication with email OTP.

## What it does

- Browse forestry services and products
- Like/favourite products (saved to your profile)
- Submit contact messages and job applications
- Register with email OTP verification
- Manage your user profile

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Bootstrap + custom CSS

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Nodemailer (email OTP)

**Security**
- Helmet, CORS, rate limiting
- NoSQL injection prevention (mongo-sanitize)
- Bcrypt password hashing
- Account lockout after failed login attempts

## Running locally

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values
node server.js
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000/api
npm run dev
```

Open `http://localhost:5173`

## Environment Variables

**Backend (`backend/.env`)**

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/leaflink
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

For Gmail, generate an App Password at myaccount.google.com/security (requires 2FA enabled).

**Frontend (`frontend/.env`)**

```
VITE_API_URL=http://localhost:3000/api
```

## Deployment

- **Frontend** → Vercel (auto-detects Vite)
- **Backend** → Render (set env vars in dashboard)
- **Database** → MongoDB Atlas (free tier)

Set `CLIENT_URL` on Render to your Vercel URL, and `VITE_API_URL` on Vercel to your Render URL.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register + send OTP |
| POST | `/api/auth/verify-otp` | No | Verify OTP, get JWT |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/profile/me` | JWT | Get profile |
| PUT | `/api/profile/me` | JWT | Update profile |
| POST | `/api/profile/favorites/toggle` | JWT | Like/unlike a product |
| POST | `/api/contact` | No | Submit contact message |
| POST | `/api/jobs/apply` | No | Submit job application |
| GET | `/api/health` | No | Health check |

## Project Structure

```
LeafLink/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── index.html
└── README.md
```
# LeafLink
