# College Feedback Management System

## Project Structure
- backend/: Node + Express REST API (MVC)
- frontend/: Responsive web pages (student/admin)
- docs/: sample CSV + ER explanation

## Backend Setup
1. Install dependencies:
   - `cd backend`
   - `npm install`
2. Configure env:
   - copy `.env.example` -> `.env`
   - set MySQL credentials
3. Create schema and seed:
   - `mysql -u root -p < sql/schema.sql`
   - `mysql -u root -p < sql/seed.sql`
4. Start backend:
   - `npm run dev`

## Frontend Setup
1. Start static frontend server:
   - `cd frontend`
   - `npm install`
   - `npm start`
2. Open:
   - `http://localhost:5500/index.html`

## Default Login
- Admin:
  - username: value in `ADMIN_DEFAULT_USERNAME` (default `admin`)
  - password: value in `ADMIN_DEFAULT_PASSWORD` (default `admin@123`)
  - Created automatically at backend startup if not present.
- Student:
  - username: registration number
  - first password: date of birth (`YYYY-MM-DD`)

## Key Rules Enforced
- Session-based auth with DB sessions table
- BCrypt password hashing
- Students submit feedback once per form
- Form closes automatically after 48h (UTC)
- No student feedback history endpoint
- Form delete cascades targets + responses

## CSV Upload Format
`registration_no,name,email,date_of_birth,section,semester`

## Notes
- Bulk form endpoint: `/api/admin/forms/bulk-by-section`
- No form edit endpoint after publish (immutable by API design)
