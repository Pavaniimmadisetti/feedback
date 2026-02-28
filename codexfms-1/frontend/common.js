const API_BASE = 'http://localhost:3000/api';

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
  } catch (error) {
    throw new Error('Unable to fetch data. Ensure backend is running on http://localhost:3000');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detailedErrors = Array.isArray(data.errors) && data.errors.length
      ? `: ${data.errors.join(', ')}`
      : '';
    throw new Error((data.message || 'Request failed') + detailedErrors);
  }
  return data;
}

function showMessage(el, message, isError = false) {
  el.textContent = message;
  el.style.color = isError ? '#b91c1c' : '#065f46';
}
