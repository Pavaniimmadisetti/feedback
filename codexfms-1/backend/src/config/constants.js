const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'sid';
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 12);

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_TTL_HOURS
};
