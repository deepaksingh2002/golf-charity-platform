import jwt from 'jsonwebtoken';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: normalizeRole(role) }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
