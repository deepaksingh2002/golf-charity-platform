const isSecureRequest = (req) => {
  if (req?.secure) return true;
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  return String(forwardedProto || '').includes('https');
};

export const getAccessTokenCookieOptions = (req) => {
  const secure = isSecureRequest(req);

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const getRefreshTokenCookieOptions = (req) => {
  const secure = isSecureRequest(req);

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
};

export const getClearAuthCookieOptions = (req) => {
  const secure = isSecureRequest(req);

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
  };
};
