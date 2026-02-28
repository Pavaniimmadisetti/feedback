function isValidAcademicYear(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) return false;
  const start = Number(value.slice(0, 4));
  const end = Number(value.slice(5, 7));
  return ((start + 1) % 100) === end;
}

function isValidSemester(value) {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 8;
}

function isValidSection(value) {
  return ['A', 'B', 'C', 'MIXED'].includes(value);
}

module.exports = {
  isValidAcademicYear,
  isValidSemester,
  isValidSection
};
