import prisma from '../../db/prisma.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { generateToken } from '../../utils/jwt.js';

export const registerUser = async ({ email, password }) => {
  email = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    const err = new Error('User already exists');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

    return { user: safeUser, token};
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  const safeUser = {
  id: user.id,
  email: user.email,
  role: user.role,
};

  return { user: safeUser, token};
};