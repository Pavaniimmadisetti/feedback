USE cfms;

INSERT INTO faculty (faculty_code, name, email, department, designation)
VALUES
  ('FAC001', 'Dr. Sunita Verma', 'sunita@college.edu', 'Computer Science', 'Associate Professor'),
  ('FAC002', 'Mr. Anil Kumar', 'anil@college.edu', 'Computer Science', 'Assistant Professor')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  department = VALUES(department),
  designation = VALUES(designation),
  is_active = 1;

INSERT INTO courses (code, course_name, short_name, credits, semester, subject_type)
VALUES
  ('CS501', 'Database Management Systems', 'DBMS', 4.0, 5, 'core'),
  ('CS503', 'Computer Networks', 'CN', 3.0, 5, 'core'),
  ('CS504', 'Machine Learning', 'ML', 3.0, 5, 'elective')
ON DUPLICATE KEY UPDATE
  course_name = VALUES(course_name),
  short_name = VALUES(short_name),
  credits = VALUES(credits),
  semester = VALUES(semester),
  subject_type = VALUES(subject_type),
  is_active = 1;

INSERT INTO students (registration_no, name, email, dob, password_hash, semester, section)
VALUES
  ('21CS001', 'Rahul Kumar', 'rahul@college.edu', '2004-01-10', '$2b$10$yQ8y2udZgu.OZATpSyPcN.9NeVLC0yRYQcxRDvHPMDBG.v7uMaiRu', 5, 'A'),
  ('21CS002', 'Priya Sharma', 'priya@college.edu', '2004-03-17', '$2b$10$VYSCbli4CcvRwzxSiIqB7eWqnx.fQ6ecP8Ewf8z6Uh5hpoEV3qY76', 5, 'A'),
  ('21CS003', 'Amit Singh', 'amit@college.edu', '2003-12-05', '$2b$10$jBqsYBQXTA9Psyckzt32jeBtnRv.u5qen12v8PA1OcBcjwCSPQwCi', 5, 'B')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  dob = VALUES(dob),
  semester = VALUES(semester),
  section = VALUES(section),
  is_active = 1;
