const { validateFeedbackPayload } = require('../src/utils/questions');

function validPayload() {
  const payload = {};
  for (let i = 1; i <= 35; i += 1) {
    payload[`q${i}`] = [12, 13, 14, 33, 34, 35].includes(i) ? 'ok' : 5;
  }
  return payload;
}

describe('feedback validation', () => {
  test('accepts valid payload', () => {
    expect(validateFeedbackPayload(validPayload())).toHaveLength(0);
  });

  test('rejects invalid rating', () => {
    const payload = validPayload();
    payload.q1 = 7;
    expect(validateFeedbackPayload(payload).length).toBeGreaterThan(0);
  });

  test('rejects too long text', () => {
    const payload = validPayload();
    payload.q12 = 'x'.repeat(101);
    expect(validateFeedbackPayload(payload).length).toBeGreaterThan(0);
  });
});
