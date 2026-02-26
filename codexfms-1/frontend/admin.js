let students = [];
let faculty = [];
let courses = [];
let formsOrdered = [];
let formsSequence = [];

function card(title, value) {
  return `<div class="card panel"><h2>${value}</h2><small>${title}</small></div>`;
}

function showTab(tabName) {
  ['students', 'faculty', 'courses', 'forms'].forEach((name) => {
    document.getElementById(`tab-${name}`).classList.toggle('hidden', name !== tabName);
  });
}

function renderSummary() {
  document.getElementById('summary-cards').innerHTML = [
    card('Students', students.length),
    card('Faculty', faculty.length),
    card('Courses', courses.length),
    card('Forms', formsSequence.length)
  ].join('');
}

async function addStudent(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  await api('/admin/students', { method: 'POST', body: JSON.stringify(payload) });
}

async function uploadStudentCsv(file) {
  const data = new FormData();
  data.append('file', file);
  const response = await fetch(`${API_BASE}/admin/students/bulk-upload`, {
    method: 'POST',
    credentials: 'include',
    body: data
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(json.errors) && json.errors.length
      ? `\n${json.errors.slice(0, 10).map((item) => `Line ${item.line}: ${item.message}`).join('\n')}`
      : '';
    throw new Error((json.message || 'CSV upload failed') + details);
  }
  return json;
}

function renderStudents() {
  const container = document.getElementById('tab-students');
  container.innerHTML = `
    <h3>Students</h3>
    <form id="student-add-form" class="form-grid" style="margin-bottom:10px;">
      <input name="registration_no" placeholder="Reg no" required />
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="dob" type="date" required />
      <select name="section"><option>A</option><option>B</option><option>C</option></select>
      <select name="semester">${[1,2,3,4,5,6,7,8].map((s) => `<option>${s}</option>`).join('')}</select>
      <button class="btn primary" type="submit">Add Student</button>
    </form>
    <div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;">
      <input type="file" id="student-csv" accept=".csv" />
      <button class="btn ghost" id="upload-student-csv">Bulk Upload CSV</button>
    </div>
    <table>
      <thead><tr><th>Reg No</th><th>Name</th><th>Email</th><th>Section</th><th>Semester</th><th>Actions</th></tr></thead>
      <tbody>${students.map((s) => `<tr>
        <td>${s.registration_no}</td><td>${s.name}</td><td>${s.email}</td><td>${s.section}</td><td>${s.semester}</td>
        <td>
          <button class="btn ghost" data-edit-student="${s.id}">Edit</button>
          <button class="btn danger" data-delete-student="${s.id}">Delete</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>
  `;

  container.querySelector('#student-add-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await addStudent(event.target);
    event.target.reset();
    await loadAll();
  });

  container.querySelector('#upload-student-csv').addEventListener('click', async () => {
    const file = container.querySelector('#student-csv').files[0];
    const button = container.querySelector('#upload-student-csv');
    if (!file) {
      alert('Choose a CSV file first.');
      return;
    }
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Uploading...';
    try {
      const result = await uploadStudentCsv(file);
      await loadAll();
      alert(result.message ? `${result.message}${result.count ? ` (${result.count})` : ''}` : 'CSV uploaded successfully.');
    } catch (error) {
      alert(error.message || 'CSV upload failed');
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  container.querySelectorAll('[data-delete-student]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this student?')) return;
      await api(`/admin/students/${button.dataset.deleteStudent}`, { method: 'DELETE' });
      await loadAll();
    });
  });

  container.querySelectorAll('[data-edit-student]').forEach((button) => {
    button.addEventListener('click', async () => {
      const student = students.find((s) => s.id === Number(button.dataset.editStudent));
      const name = prompt('Name', student.name);
      if (name === null) return;
      const email = prompt('Email', student.email);
      if (email === null) return;
      const dob = prompt('DOB (YYYY-MM-DD)', String(student.dob).slice(0, 10));
      if (dob === null) return;
      const section = prompt('Section (A/B/C)', student.section);
      if (section === null) return;
      const semester = prompt('Semester (1-8)', String(student.semester));
      if (semester === null) return;

      await api(`/admin/students/${student.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          dob,
          section,
          semester: Number(semester),
          is_active: true
        })
      });

      await loadAll();
    });
  });
}

function renderFaculty() {
  const container = document.getElementById('tab-faculty');
  container.innerHTML = `
    <h3>Faculty</h3>
    <form id="faculty-add-form" class="form-grid" style="margin-bottom:10px;">
      <input name="faculty_code" placeholder="Faculty code" required />
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="department" placeholder="Department" required />
      <input name="designation" placeholder="Designation" required />
      <button class="btn primary" type="submit">Add Faculty</button>
    </form>
    <table>
      <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Actions</th></tr></thead>
      <tbody>${faculty.map((f) => `<tr>
        <td>${f.faculty_code}</td><td>${f.name}</td><td>${f.email}</td><td>${f.department}</td><td>${f.designation}</td>
        <td>
          <button class="btn ghost" data-edit-faculty="${f.id}">Edit</button>
          <button class="btn danger" data-delete-faculty="${f.id}">Delete</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>
  `;

  container.querySelector('#faculty-add-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    await api('/admin/faculty', { method: 'POST', body: JSON.stringify(payload) });
    event.target.reset();
    await loadAll();
  });

  container.querySelectorAll('[data-delete-faculty]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this faculty record?')) return;
      await api(`/admin/faculty/${button.dataset.deleteFaculty}`, { method: 'DELETE' });
      await loadAll();
    });
  });

  container.querySelectorAll('[data-edit-faculty]').forEach((button) => {
    button.addEventListener('click', async () => {
      const item = faculty.find((f) => f.id === Number(button.dataset.editFaculty));
      const faculty_code = prompt('Faculty code', item.faculty_code);
      if (faculty_code === null) return;
      const name = prompt('Name', item.name);
      if (name === null) return;
      const email = prompt('Email', item.email);
      if (email === null) return;
      const department = prompt('Department', item.department);
      if (department === null) return;
      const designation = prompt('Designation', item.designation);
      if (designation === null) return;

      await api(`/admin/faculty/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ faculty_code, name, email, department, designation, is_active: true })
      });
      await loadAll();
    });
  });
}

function renderCourses() {
  const container = document.getElementById('tab-courses');
  container.innerHTML = `
    <h3>Courses</h3>
    <form id="course-add-form" class="form-grid" style="margin-bottom:10px;">
      <input name="code" placeholder="Code" required />
      <input name="course_name" placeholder="Course name" required />
      <input name="short_name" placeholder="Short name" required />
      <input name="credits" type="number" step="0.5" placeholder="Credits" required />
      <select name="semester">${[1,2,3,4,5,6,7,8].map((s) => `<option>${s}</option>`).join('')}</select>
      <select name="subject_type"><option value="core">core</option><option value="elective">elective</option></select>
      <button class="btn primary" type="submit">Add Course</button>
    </form>
    <table>
      <thead><tr><th>Code</th><th>Name</th><th>Credits</th><th>Semester</th><th>Type</th><th>Actions</th></tr></thead>
      <tbody>${courses.map((c) => `<tr>
        <td>${c.code}</td><td>${c.course_name}</td><td>${c.credits}</td><td>${c.semester}</td><td>${c.subject_type}</td>
        <td>
          <button class="btn ghost" data-edit-course="${c.id}">Edit</button>
          <button class="btn danger" data-delete-course="${c.id}">Delete</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>
  `;

  container.querySelector('#course-add-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    await api('/admin/courses', { method: 'POST', body: JSON.stringify(payload) });
    event.target.reset();
    await loadAll();
  });

  container.querySelectorAll('[data-delete-course]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this course?')) return;
      await api(`/admin/courses/${button.dataset.deleteCourse}`, { method: 'DELETE' });
      await loadAll();
    });
  });

  container.querySelectorAll('[data-edit-course]').forEach((button) => {
    button.addEventListener('click', async () => {
      const item = courses.find((c) => c.id === Number(button.dataset.editCourse));
      const code = prompt('Code', item.code);
      if (code === null) return;
      const course_name = prompt('Course name', item.course_name);
      if (course_name === null) return;
      const short_name = prompt('Short name', item.short_name);
      if (short_name === null) return;
      const credits = prompt('Credits', String(item.credits));
      if (credits === null) return;
      const semester = prompt('Semester', String(item.semester));
      if (semester === null) return;
      const subject_type = prompt('Type (core/elective)', item.subject_type);
      if (subject_type === null) return;

      await api(`/admin/courses/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ code, course_name, short_name, credits, semester, subject_type, is_active: true })
      });
      await loadAll();
    });
  });
}

function groupOrderedForms(data) {
  const grouped = {};
  data.forEach((item) => {
    grouped[item.academic_year] ||= {};
    grouped[item.academic_year][`Semester ${item.semester}`] ||= {};
    const key = item.subject_type === 'elective' ? 'Elective' : `Section ${item.section_label}`;
    grouped[item.academic_year][`Semester ${item.semester}`][key] ||= [];
    grouped[item.academic_year][`Semester ${item.semester}`][key].push(item);
  });
  return grouped;
}

function buildCourseFacultyAssignments(semester, subjectType) {
  const scoped = getCoursesBySemesterType(semester, subjectType);
  const facultyOptions = faculty.map((f) => `<option value="${f.id}">${f.name}</option>`).join('');
  if (!scoped.length) {
    return '<small class="muted">No courses available for selected semester/type.</small>';
  }

  return scoped.map((c) => `
    <div class="card panel" style="margin-bottom:8px;">
      <b>${c.code} - ${c.course_name}</b>
      <select data-bulk-course="${c.id}" style="margin-top:6px;">
        <option value="">Select faculty</option>
        ${facultyOptions}
      </select>
    </div>
  `).join('');
}

function getCoursesBySemesterType(semester, subjectType) {
  return courses
    .filter((c) => Number(c.semester) === Number(semester) && c.subject_type === subjectType)
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));
}

function syncSingleFormInputs(container) {
  const form = container.querySelector('#single-form-create');
  if (!form) return;

  const subjectType = form.querySelector('[name="subject_type"]').value;
  const semester = Number(form.querySelector('[name="semester"]').value);
  const sectionWrap = form.querySelector('#single-form-section-wrap');
  const sectionSelect = form.querySelector('[name="section"]');
  const courseSelect = form.querySelector('[name="course_id"]');
  const scopedCourses = getCoursesBySemesterType(semester, subjectType);

  if (subjectType === 'core') {
    sectionWrap.classList.remove('hidden');
  } else {
    sectionWrap.classList.add('hidden');
    sectionSelect.value = '';
  }

  if (!scopedCourses.length) {
    courseSelect.innerHTML = '<option value="">No matching courses</option>';
    return;
  }

  courseSelect.innerHTML = scopedCourses
    .map((c) => `<option value="${c.id}">${c.code} - ${c.course_name}</option>`)
    .join('');
}

function updateBulkCreateButtonState(container) {
  const createBtn = container.querySelector('#bulk-create-btn');
  const selects = [...container.querySelectorAll('[data-bulk-course]')];
  createBtn.disabled = selects.length === 0;
}

function updateBulkEnrollmentNote(container) {
  const form = container.querySelector('#bulk-form-meta');
  if (!form) return;

  const subjectType = form.querySelector('[name="subject_type"]').value;
  const semester = Number(form.querySelector('[name="semester"]').value);
  const sectionSelect = form.querySelector('[name="section"]');
  const summary = container.querySelector('#bulk-enrollment-note');

  if (subjectType === 'core') {
    const sectionText = sectionSelect.value || 'A';
    summary.textContent = `All students from Semester ${semester}, Section ${sectionText} will be automatically enrolled.`;
  } else {
    summary.textContent = `All students from Semester ${semester} will be automatically enrolled.`;
  }

}

function syncBulkFormInputs(container) {
  const form = container.querySelector('#bulk-form-meta');
  if (!form) return;

  const subjectType = form.querySelector('[name="subject_type"]').value;
  const semester = Number(form.querySelector('[name="semester"]').value);
  const sectionWrap = form.querySelector('#bulk-form-section-wrap');
  const sectionSelect = form.querySelector('[name="section"]');
  const coursesWrap = container.querySelector('#bulk-courses-wrap');

  if (subjectType === 'core') {
    sectionWrap.classList.remove('hidden');
    if (!sectionSelect.value) sectionSelect.value = 'A';
  } else {
    sectionWrap.classList.add('hidden');
    sectionSelect.value = '';
  }

  coursesWrap.innerHTML = buildCourseFacultyAssignments(semester, subjectType);
  container.querySelectorAll('[data-bulk-course]').forEach((select) => {
    select.addEventListener('change', () => updateBulkCreateButtonState(container));
  });
  updateBulkEnrollmentNote(container);
  updateBulkCreateButtonState(container);
}

function renderForms() {
  const container = document.getElementById('tab-forms');
  const grouped = groupOrderedForms(formsOrdered);

  const orderedHtml = Object.entries(grouped).map(([year, semData]) => {
    const totalInYear = Object.values(semData)
      .flatMap((secData) => Object.values(secData))
      .reduce((sum, forms) => sum + forms.length, 0);

    const semHtml = Object.entries(semData).map(([sem, secData]) => {
      const secHtml = Object.entries(secData).map(([sec, forms]) => {
        const cards = forms.map((f) => `
          <div class="card list-card">
            <h3>${f.form_title}</h3>
            <small>${f.course_name} | ${f.faculty_name} | ${f.feedback_period} | Responses: ${f.response_count}</small>
            <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
              <span class="status ${new Date(f.closes_at_utc) < new Date() ? 'closed' : 'active'}">${new Date(f.closes_at_utc) < new Date() ? 'Closed' : 'Active'}</span>
              <button class="btn danger" data-delete-form="${f.id}">Delete</button>
            </div>
          </div>
        `).join('');
        return `<h4>${sec}</h4>${cards}`;
      }).join('');
      return `<div class="card panel"><h4>${sem}</h4>${secHtml}</div>`;
    }).join('');
    return `
      <details class="card panel" open>
        <summary><strong>${year}</strong> (${totalInYear} forms)</summary>
        <div style="margin-top:10px;">${semHtml}</div>
      </details>
    `;
  }).join('');

  const sequencedForms = [...formsSequence].sort((a, b) => {
    if (a.academic_year !== b.academic_year) return String(b.academic_year).localeCompare(String(a.academic_year));
    if (Number(a.semester) !== Number(b.semester)) return Number(a.semester) - Number(b.semester);
    if (String(a.section_label) !== String(b.section_label)) return String(a.section_label).localeCompare(String(b.section_label));
    return String(a.short_name || a.course_name).localeCompare(String(b.short_name || b.course_name));
  });

  const sequenceByYear = {};
  sequencedForms.forEach((form) => {
    sequenceByYear[form.academic_year] ||= [];
    sequenceByYear[form.academic_year].push(form);
  });

  const sequenceHtml = Object.entries(sequenceByYear).map(([year, forms]) => {
    const cards = forms.map((f) => {
      const status = (new Date(f.closes_at_utc) < new Date() || f.status_override === 'closed') ? 'Closed' : 'Active';
      return `
        <div class="card list-card">
          <h3>${f.short_name || f.course_name} feedback form</h3>
          <div style="margin:6px 0;">
            <span class="status ${status.toLowerCase()}">${status}</span>
          </div>
          <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
            <small><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:-2px;margin-right:6px;"><path fill="currentColor" d="M4 3h13a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H4V3Zm13 14a2 2 0 1 1 0 4H5a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2v14a2 2 0 0 0 2 2h11Z"/></svg>${f.short_name || f.course_name}</small>
            <small><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:-2px;margin-right:6px;"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10Zm-9 9a9 9 0 1 1 18 0H3Z"/></svg>${f.faculty_name}</small>
            <small><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:-2px;margin-right:6px;"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h3V2Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></svg>${f.academic_year} | Sem ${f.semester}</small>
          </div>
          <div style="margin-top:10px;display:flex;justify-content:flex-end;">
            <button class="btn danger" data-delete-form="${f.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <details class="card panel" open>
        <summary><strong>${year}</strong> (${forms.length} feedback forms)</summary>
        <div style="margin-top:10px;">${cards}</div>
      </details>
    `;
  }).join('');

  const facultyOptions = faculty.map((f) => `<option value="${f.id}">${f.name}</option>`).join('');

  container.innerHTML = `
    <h3>Forms</h3>
    <div class="tabs">
      <button class="tab active" id="ordered-view-btn">Ordered Display</button>
      <button class="tab" id="sequence-view-btn">Sequence Display</button>
    </div>

    <div id="forms-create-sections">
      <section class="card panel" style="margin:10px 0;">
        <h3>Create Single Form</h3>
        <form id="single-form-create" class="grid">
          <div class="form-grid">
            <input name="form_title" placeholder="Form title" required />
            <select name="feedback_for" required>
              <option value="both">Both (Faculty + Course)</option>
              <option value="faculty">Faculty Feedback Form</option>
              <option value="course">Course Feedback Form</option>
            </select>
            <input name="academic_year" placeholder="2025-26" required />
            <select name="subject_type" required>
              <option value="core">core</option>
              <option value="elective">elective</option>
            </select>
            <select name="semester" required>${[1,2,3,4,5,6,7,8].map((s) => `<option value="${s}">${s}</option>`).join('')}</select>
            <div id="single-form-section-wrap">
              <select name="section">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <select name="feedback_period" required><option value="mid-semester">mid-semester</option><option value="end-semester">end-semester</option></select>
            <select name="course_id" required></select>
            <select name="faculty_id" required>${facultyOptions}</select>
          </div>
          <button class="btn primary" type="submit">Create Form</button>
        </form>
      </section>

      <section class="card panel" style="margin:10px 0;">
        <h3>Create Bulk Forms By Section</h3>
        <p class="muted">Select faculty for each course below. Forms will be created for all courses with assigned faculty.</p>
        <form id="bulk-form-meta" class="grid">
          <div class="form-grid">
            <input name="form_title" placeholder="Form title" required />
            <select name="feedback_for" required>
              <option value="both">Both (Faculty + Course)</option>
              <option value="faculty">Faculty Feedback Form</option>
              <option value="course">Course Feedback Form</option>
            </select>
            <input name="academic_year" placeholder="2025-26" required />
            <select name="subject_type" required>
              <option value="core">core</option>
              <option value="elective">elective</option>
            </select>
            <select name="semester" required>${[1,2,3,4,5,6,7,8].map((s) => `<option value="${s}" ${s === 1 ? 'selected' : ''}>${s}</option>`).join('')}</select>
            <div id="bulk-form-section-wrap">
              <select name="section">
                <option value="A" selected>A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <select name="feedback_period" required><option value="mid-semester">mid-semester</option><option value="end-semester">end-semester</option></select>
          </div>
        </form>
        <small id="bulk-enrollment-note" class="muted">All students from Semester 1, Section A will be automatically enrolled.</small>
        <div id="bulk-courses-wrap" style="margin-top:10px;"></div>
        <div style="margin-top:10px;display:flex;gap:8px;">
          <button class="btn primary" id="bulk-create-btn">Generate Bulk Forms</button>
        </div>
      </section>
    </div>

    <div id="ordered-view">${orderedHtml || '<small>No forms found</small>'}</div>
    <div id="sequence-view" class="hidden">${sequenceHtml || '<small>No forms found</small>'}</div>
  `;

  container.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-form]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    const formId = button.dataset.deleteForm;
    if (!formId) return;
    if (!confirm('Delete form and all associated feedback?')) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Deleting...';
    try {
      const response = await api(`/admin/forms/${formId}`, { method: 'DELETE' });
      alert(response.message || 'Form deleted');
      await loadAll();
    } catch (error) {
      alert(error.message || 'Unable to delete form');
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  const setFormsView = (view) => {
    const isSequence = view === 'sequence';
    container.querySelector('#forms-create-sections').classList.toggle('hidden', isSequence);
    container.querySelector('#ordered-view').classList.toggle('hidden', isSequence);
    container.querySelector('#sequence-view').classList.toggle('hidden', !isSequence);
    container.querySelector('#ordered-view-btn').classList.toggle('active', !isSequence);
    container.querySelector('#sequence-view-btn').classList.toggle('active', isSequence);
  };

  container.querySelector('#ordered-view-btn').addEventListener('click', () => {
    setFormsView('ordered');
  });

  container.querySelector('#sequence-view-btn').addEventListener('click', () => {
    setFormsView('sequence');
  });

  container.querySelector('#single-form-create').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    if (!payload.course_id) {
      alert('Select a course before creating form.');
      return;
    }
    if (payload.subject_type === 'core' && !payload.section) {
      alert('Select section for core form.');
      return;
    }
    try {
      const result = await api('/admin/forms/single', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const generated = Array.isArray(result.forms) ? result.forms.length : 1;
      alert(`Form generated successfully. Created forms: ${generated}. Enrolled students: ${result.targetCount ?? 0}`);
      event.target.reset();
      await loadAll();
    } catch (error) {
      alert(error.message || 'Unable to generate form.');
    }
  });

  const singleForm = container.querySelector('#single-form-create');
  singleForm.querySelector('[name="subject_type"]').addEventListener('change', () => syncSingleFormInputs(container));
  singleForm.querySelector('[name="semester"]').addEventListener('change', () => syncSingleFormInputs(container));
  syncSingleFormInputs(container);

  const bulkForm = container.querySelector('#bulk-form-meta');
  bulkForm.querySelector('[name="subject_type"]').addEventListener('change', () => syncBulkFormInputs(container));
  bulkForm.querySelector('[name="semester"]').addEventListener('change', () => syncBulkFormInputs(container));
  bulkForm.querySelector('[name="section"]').addEventListener('change', () => updateBulkEnrollmentNote(container));
  syncBulkFormInputs(container);

  container.querySelector('#bulk-create-btn').addEventListener('click', async () => {
    const meta = Object.fromEntries(new FormData(container.querySelector('#bulk-form-meta')).entries());
    const assignmentSelects = [...container.querySelectorAll('[data-bulk-course]')];
    if (!assignmentSelects.length) {
      alert('No courses available for selected semester/type.');
      return;
    }
    const unassigned = assignmentSelects.filter((select) => !select.value);
    if (unassigned.length) {
      alert('Select faculty for each course before generating bulk forms.');
      return;
    }
    const assignments = assignmentSelects.map((select) => ({
      course_id: Number(select.dataset.bulkCourse),
      faculty_id: Number(select.value)
    }));

    try {
      const result = await api('/admin/forms/bulk-by-section', {
        method: 'POST',
        body: JSON.stringify({ ...meta, assignments })
      });
      const enrolled = Array.isArray(result.forms)
        ? result.forms.reduce((sum, item) => sum + Number(item.targetCount || 0), 0)
        : 0;
      alert(`Bulk forms generated successfully. Total enrolled students: ${enrolled}`);
      await loadAll();
    } catch (error) {
      alert(error.message || 'Unable to generate bulk forms.');
    }
  });

  setFormsView('ordered');
}

async function loadAll() {
  const [s, f, c, ordered, sequence] = await Promise.all([
    api('/admin/students'),
    api('/admin/faculty'),
    api('/admin/courses'),
    api('/admin/forms/ordered'),
    api('/admin/forms/sequence')
  ]);

  students = s.data;
  faculty = f.data;
  courses = c.data;
  formsOrdered = ordered.data;
  formsSequence = sequence.data;

  renderSummary();
  renderStudents();
  renderFaculty();
  renderCourses();
  renderForms();
}

document.getElementById('a-login-btn').addEventListener('click', async () => {
  const msg = document.getElementById('a-login-msg');
  try {
    const username = document.getElementById('a-username').value.trim();
    const password = document.getElementById('a-password').value;
    await api('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-app').classList.remove('hidden');
    await loadAll();
    showMessage(msg, '');
  } catch (error) {
    showMessage(msg, error.message, true);
  }
});

document.getElementById('admin-refresh').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Refreshing...';
  try {
    await loadAll();
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
});

document.getElementById('a-logout-btn').addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' });
  location.reload();
});

document.querySelectorAll('.tab[data-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab[data-tab]').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    showTab(tab.dataset.tab);
  });
});

async function bootstrapAdminSession() {
  try {
    await loadAll();
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-app').classList.remove('hidden');
  } catch (error) {
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-app').classList.add('hidden');
  }
}

bootstrapAdminSession();
