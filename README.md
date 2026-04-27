# Content Broadcasting System

Backend API for school content broadcasting.

## Tech Stack
- Node.js + Express
- PostgreSQL
- JWT, bcrypt
- Multer

## API Endpoints

### Auth
- `POST /api/auth/register` - Teacher registration
- `POST /api/auth/login` - Login

### Content (Teacher)
- `POST /api/content/upload` - Upload file (jpg/png/gif)
- `GET /api/content/my-content` - My uploads

### Approval (Principal)
- `GET /api/approval/pending` - Pending approvals
- `PUT /api/approval/:id/approve` - Approve
- `PUT /api/approval/:id/reject` - Reject

### Public
- `GET /api/public/live/:teacherId` - Live content
- `GET /api/public/live/:teacherId?subject=Maths` - Filter by subject

## Setup

```bash
npm install
cp .env.example .env
# Add DATABASE_URL
npm run dev