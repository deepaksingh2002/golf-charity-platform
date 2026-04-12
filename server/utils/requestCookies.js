const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const separatorIndex = item.indexOf('=');
      if (separatorIndex <= 0) return acc;

      const key = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
};

const readCookieToken = (req, key) => {
  if (req.cookies?.[key]) return req.cookies[key];
  const parsed = parseCookieHeader(req.headers?.cookie || '');
  return parsed[key] || null;
};

export { readCookieToken };
