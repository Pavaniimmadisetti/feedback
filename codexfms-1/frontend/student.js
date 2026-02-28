let studentForms = [];
let filter = 'pending';
let feedbackTypeFilter = 'all';

const loginSection = document.getElementById('student-login');
const appSection = document.getElementById('student-app');
const loginMsg = document.getElementById('s-login-msg');
const formsEl = document.getElementById('student-forms');
const filledFormsListEl = document.getElementById('filled-forms-list');
const COURSE_QUESTION_FALLBACK = [
  { key: 'q1', index: 1, type: 'rating', label: 'This course is completely related to the Program' },
  { key: 'q2', index: 2, type: 'rating', label: 'Course importance for program and employment' },
  { key: 'q3', index: 3, type: 'rating', label: 'Course contents are up-to-date and adequate' },
  { key: 'q4', index: 4, type: 'rating', label: 'Course objectives are contemporary and enhance skills' },
  { key: 'q5', index: 5, type: 'rating', label: 'Course Input learning outcomes are understandable and completely achievable' },
  { key: 'q6', index: 6, type: 'rating', label: 'Course Input learning outcomes are completely related to the course objectives' },
  { key: 'q7', index: 7, type: 'rating', label: 'Teaching methods used in the course are highly useful to gain mastery in the subject' },
  { key: 'q8', index: 8, type: 'rating', label: 'Assessment methods prescribed by course outline are highly appropriate to its contents' },
  { key: 'q9', index: 9, type: 'rating', label: "Exams' & quizzes' questions are clear and completely related to course contents" },
  { key: 'q10', index: 10, type: 'rating', label: 'Text book used is highly suitable and current edition' },
  { key: 'q33', index: 33, type: 'text', label: 'Strengths', maxLength: 100 },
  { key: 'q34', index: 34, type: 'text', label: 'Weaknesses', maxLength: 100 },
  { key: 'q35', index: 35, type: 'text', label: 'Suggestions', maxLength: 100 }
];

function withDefaultOptions(question) {
  if (question.type !== 'rating') return question;
  if (Array.isArray(question.options) && question.options.length) return question;
  return {
    ...question,
    options: [
      { value: '1', text: 'Strongly Agree' },
      { value: '2', text: 'Agree' },
      { value: '3', text: 'Neutral' },
      { value: '4', text: 'Disagree' },
      { value: '5', text: 'Strongly Disagree' }
    ]
  };
}

function resolveQuestions(form) {
  const incoming = Array.isArray(form.questions) ? form.questions : [];
  if (form.feedback_for !== 'course') return incoming;
  if (!incoming.length) return COURSE_QUESTION_FALLBACK.map(withDefaultOptions);
  const hasCourseContext = incoming.some((q) =>
    String(q.label || '').toLowerCase().includes('course')
  );
  if (hasCourseContext) return incoming.map(withDefaultOptions);
  return COURSE_QUESTION_FALLBACK.map(withDefaultOptions);
}

function setStudentProfile(user) {
  document.getElementById('student-name').textContent = user.name;
  document.getElementById('student-meta').textContent =
    `${user.registration_no} | Sem ${user.semester} | Sec ${user.section}`;

  document.getElementById('detail-name').textContent = user.name || '-';
  document.getElementById('detail-regno').textContent = user.registration_no || '-';
  document.getElementById('detail-email').textContent = user.email || '-';
  document.getElementById('detail-semester').textContent = user.semester ?? '-';
  document.getElementById('detail-section').textContent = user.section || '-';
}

function renderSummary() {
  const total = studentForms.length;
  const completed = studentForms.filter((item) => item.completion_status === 'completed').length;
  const pending = total - completed;

  document.getElementById('summary-total').textContent = String(total);
  document.getElementById('summary-completed').textContent = String(completed);
  document.getElementById('summary-pending').textContent = String(pending);
}

function renderFilledForms() {
  const completedForms = studentForms.filter((item) => item.completion_status === 'completed');
  filledFormsListEl.innerHTML = '';

  if (!completedForms.length) {
    filledFormsListEl.innerHTML = '<small class="muted">No forms submitted yet.</small>';
    return;
  }

  completedForms.forEach((form) => {
    const item = document.createElement('div');
    item.className = 'card panel';
    item.innerHTML = `
      <strong>${form.form_title}</strong>
      <small>${form.course_name} | ${form.faculty_name} | ${form.academic_year}</small>
      <details style="margin-top:8px;">
        <summary>View submitted feedback details</summary>
        <div style="margin-top:8px;">
          <small>Semester: ${form.semester}</small><br/>
          <small>Section: ${form.section || 'Elective'}</small><br/>
          <small>Status: ${form.completion_status}</small><br/>
          <small>Submitted At: ${form.submitted_at_utc ? new Date(form.submitted_at_utc).toLocaleString() : 'N/A'}</small>
        </div>
      </details>
    `;
    filledFormsListEl.appendChild(item);
  });
}

function renderForms() {
  renderSummary();
  renderFilledForms();
  formsEl.innerHTML = '';

  const filtered = studentForms.filter((item) => {
    const statusMatch = item.completion_status === filter;
    const typeMatch = feedbackTypeFilter === 'all' || (item.feedback_for || 'faculty') === feedbackTypeFilter;
    return statusMatch && typeMatch;
  });
  if (!filtered.length) {
    formsEl.innerHTML = '<div class="card panel">No forms in this view. Try changing Feedback Type filter.</div>';
    return;
  }

  filtered.forEach((form) => {
    const card = document.createElement('div');
    card.className = 'card list-card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <div>
          <h3>${form.form_title}</h3>
          <small>${form.course_name} | ${form.faculty_name} | ${form.academic_year} | Sem ${form.semester} | ${form.section || 'Elective'}</small>
        </div>
        <div>
          <span class="status active">${form.feedback_for === 'course' ? 'Course Feedback' : 'Faculty Feedback'}</span>
          <span class="status ${form.completion_status}">${form.completion_status}</span>
          <span class="status ${form.form_status}">${form.form_status}</span>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;justify-content:flex-end;">
        <button class="btn primary" ${form.completion_status === 'completed' || form.form_status === 'closed' ? 'disabled' : ''} data-id="${form.id}">Fill Form</button>
      </div>
    `;

    card.querySelector('button')?.addEventListener('click', () => openFeedback(form.id));
    formsEl.appendChild(card);
  });
}

async function openFeedback(formId) {
  try {
    const response = await api(`/student/forms/${formId}`);
    const form = response.data;
    const resolvedQuestions = resolveQuestions(form);
    const feedbackHeader = form.feedback_for === 'course' ? 'Course Feedback Form' : 'Faculty Feedback Form';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.45);overflow:auto;padding:20px;z-index:1000;';

    const formInputs = resolvedQuestions.map((q) => {
      const label = q.label || q.key.toUpperCase();
      if (q.type === 'rating') {
        const options = Array.isArray(q.options) && q.options.length
          ? q.options
          : [1, 2, 3, 4, 5].map((value) => ({ value: String(value), text: String(value) }));
        return `
          <label>
            <strong>Q${q.index}. ${label}</strong>
            <select name="${q.key}" required>
              ${options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                return `<option value="${opt.value}">${letter}) ${opt.text}</option>`;
              }).join('')}
            </select>
          </label>
        `;
      }
      return `
        <label>
          <strong>${label}</strong>
          <textarea name="${q.key}" maxlength="${q.maxLength || 100}" placeholder="Your answer" required></textarea>
        </label>
      `;
    }).join('');

    overlay.innerHTML = `
      <div class="card panel" style="max-width:900px;margin:10px auto;">
        <h2>${feedbackHeader}</h2>
        <h3>${form.form_title}</h3>
        <small>${form.course_name} | ${form.faculty_name}</small>
        <form id="feedback-submit-form" class="grid" style="margin-top:10px;">
          <div class="form-grid">${formInputs}</div>
          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button type="button" class="btn ghost" id="close-overlay">Cancel</button>
            <button type="submit" class="btn primary">Submit</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#close-overlay').addEventListener('click', () => overlay.remove());

    overlay.querySelector('#feedback-submit-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const payload = Object.fromEntries(formData.entries());
      await api(`/student/forms/${formId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      overlay.remove();
      await loadForms();
      alert('Feedback submitted successfully');
    });
  } catch (error) {
    alert(error.message);
  }
}

async function loadForms() {
  const response = await api('/student/forms');
  studentForms = response.data;
  renderForms();
}

async function bootstrapStudentSession() {
  try {
    const response = await api('/students/me');
    setStudentProfile(response.data);
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    await loadForms();
  } catch (error) {
    loginSection.classList.remove('hidden');
    appSection.classList.add('hidden');
  }
}

document.getElementById('s-login-btn').addEventListener('click', async () => {
  try {
    const username = document.getElementById('s-username').value.trim();
    const password = document.getElementById('s-password').value;
    const response = await api('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    showMessage(loginMsg, response.message);
    setStudentProfile(response.user);

    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    await loadForms();
  } catch (error) {
    showMessage(loginMsg, error.message, true);
  }
});

document.getElementById('s-logout-btn').addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' });
  location.reload();
});

document.getElementById('load-student-forms').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Refreshing...';
  try {
    await loadForms();
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    filter = tab.dataset.filter;
    renderForms();
  });
});

document.getElementById('feedback-type-filter').addEventListener('change', (event) => {
  feedbackTypeFilter = event.target.value;
  renderForms();
});

document.getElementById('change-pass-btn').addEventListener('click', async () => {
  const current_password = document.getElementById('current-password').value;
  const new_password = document.getElementById('new-password').value;
  const msgEl = document.getElementById('pass-msg');
  try {
    const response = await api('/students/me/password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    });
    showMessage(msgEl, response.message);
  } catch (error) {
    showMessage(msgEl, error.message, true);
  }
});

bootstrapStudentSession();
