import jwt from 'jsonwebtoken';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const generateToken = (userId, role) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '7d';

  return jwt.sign(
    { _id: userId, id: userId, role: normalizeRole(role) },
    accessTokenSecret,
    { expiresIn: accessTokenExpiry }
  );
};
