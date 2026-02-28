# API Routes

## Auth
- POST /api/auth/student/login
- POST /api/auth/admin/login
- POST /api/auth/logout

## Student
- POST /api/students/me/password
- GET /api/student/forms
- GET /api/student/forms/:id
- POST /api/student/forms/:id/submit

## Admin - Students
- GET /api/admin/students
- POST /api/admin/students
- POST /api/admin/students/bulk-upload (multipart file field: file)
- PUT /api/admin/students/:id
- DELETE /api/admin/students/:id

## Admin - Faculty
- GET /api/admin/faculty
- POST /api/admin/faculty
- PUT /api/admin/faculty/:id
- DELETE /api/admin/faculty/:id

## Admin - Courses
- GET /api/admin/courses
- GET /api/admin/courses/filter/options?semester=5&subject_type=core
- POST /api/admin/courses
- PUT /api/admin/courses/:id
- DELETE /api/admin/courses/:id

## Admin - Forms
- GET /api/admin/forms/ordered
- GET /api/admin/forms/sequence
- POST /api/admin/forms/single
- POST /api/admin/forms/bulk-by-section
- GET /api/admin/forms/:id/response-count
- DELETE /api/admin/forms/:id

## Health
- GET /health
