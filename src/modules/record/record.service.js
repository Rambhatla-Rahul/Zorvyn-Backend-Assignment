import prisma from '../../db/prisma.js';

export const createRecord = async (requestUser, data) => {
  let targetUserId = requestUser.id;

  if (data.email && requestUser.role === 'ADMIN') {
    const targetUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!targetUser) {
      throw new Error('Target user not found');
    }

    targetUserId = targetUser.id;
  }

  return prisma.record.create({
    data: {
      amount: data.amount,
      type: data.type.toLowerCase(),
      category: data.category,
      date: new Date(data.date),
      notes: data.notes,
      userId: targetUserId,
    },
  });
};

export const getRecords = async (requestUser, query, params = {}) => {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    search,
    startDate,
    endDate,
  } = query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  let where = {
    isDeleted: false,
  };

  if (requestUser.role === 'VIEWER') {
    where.userId = requestUser.id;
  }

  if (requestUser.role === 'ANALYST') {
    if (params.userId) {
      where.userId = params.userId;
    }
  }

  if (requestUser.role === 'ADMIN') {
    if (params.userId) {
      where.userId = params.userId;
    }
  }

  if (type) where.type = type;
  if (category) where.category = category;

  if (search) {
    where.notes = {
      contains: search,
      mode: 'insensitive',
    };
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { date: 'desc' },
    }),
    prisma.record.count({ where }),
  ]);

  return {
    data: records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
    },
  };
};

export const updateRecord = async (requestUser, id, data) => {
  
  const record = await prisma.record.findUnique({
    where: { id },
  });

  if (!record || record.isDeleted) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }

  
  if (requestUser.role !== 'ADMIN' && record.userId !== requestUser.id) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  
  return prisma.record.update({
    where: { id },
    data: {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
      ...(data.type ? { type: data.type.toLowerCase() } : {}),
    },
  });
};

export const deleteRecord = async (requestUser, id) => {
  const record = await prisma.record.findUnique({
    where: { id },
  });

  if (requestUser.role !== 'ADMIN' && record.userId !== requestUser.id) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (requestUser.role !== 'ADMIN' && record.userId !== requestUser.id) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return prisma.record.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const getRecordById = async (requestUser, id) => {
  const record = await prisma.record.findUnique({
    where: { id },
  });

  if (!record || record.isDeleted) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }

  if (record.userId !== requestUser.id && requestUser.role !== 'ADMIN') {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return record;
};