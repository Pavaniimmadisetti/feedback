const { isValidAcademicYear, isValidSection, isValidSemester } = require('../src/utils/validators');

describe('validators', () => {
  test('academic year validation', () => {
    expect(isValidAcademicYear('2025-26')).toBe(true);
    expect(isValidAcademicYear('2025-27')).toBe(false);
    expect(isValidAcademicYear('abc')).toBe(false);
  });

  test('semester validation', () => {
    expect(isValidSemester(1)).toBe(true);
    expect(isValidSemester(8)).toBe(true);
    expect(isValidSemester(0)).toBe(false);
    expect(isValidSemester(9)).toBe(false);
  });

  test('section validation', () => {
    expect(isValidSection('A')).toBe(true);
    expect(isValidSection('D')).toBe(false);
  });
});
