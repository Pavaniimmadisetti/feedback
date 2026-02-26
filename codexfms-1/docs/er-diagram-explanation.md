# ER Diagram Explanation (Text)

## Entities
- admins: single admin credential (future-ready for multiple records).
- students: current student profile and login credentials.
- faculty: faculty master data.
- courses: course catalog by semester and type.
- forms: published feedback forms linked to one course and one faculty.
- form_student_targets: student assignment snapshot at publish time.
- feedback_responses: exactly one response per student per form (35 columns).
- sessions: DB-backed session store for student/admin login sessions.

## Relationships
- forms.course_id -> courses.id (many forms to one course)
- forms.faculty_id -> faculty.id (many forms to one faculty)
- forms.created_by_admin_id -> admins.id (many forms to one admin)
- form_student_targets.form_id -> forms.id (many targets to one form, cascade delete)
- form_student_targets.student_id -> students.id (many targets to one student)
- feedback_responses.form_id -> forms.id (many responses to one form, cascade delete)
- feedback_responses.student_id -> students.id (many responses to one student)

## Key Integrity Rules
- students.registration_no unique
- students.email unique
- courses.code unique
- faculty.faculty_code and faculty.email unique
- feedback_responses unique(form_id, student_id) ensures one-time submission
- forms.section must be NULL for elective, required for core
- forms.closes_at_utc is validated in API before submit
