function nowUtcDate() {
  return new Date();
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

module.exports = {
  nowUtcDate,
  addHours
};
