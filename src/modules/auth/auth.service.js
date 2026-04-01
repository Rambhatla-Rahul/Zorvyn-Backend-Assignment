import prisma from '../../db/prisma.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { generateToken } from '../../utils/jwt.js';

export const registerUser = async ({ email, password }) => {
  email = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error('User already exists');
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
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    throw new Error('User is inactive');
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
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