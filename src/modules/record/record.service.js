import prisma from '../../db/prisma.js';

export const createRecord = async (userId, data) => {
  return prisma.record.create({
    data: {
      ...data,
      date: new Date(data.date),
      userId,
    },
  });
};

export const getRecords = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    search,
    startDate,
    endDate,
  } = query;

  const skip = (page - 1) * limit;

  const where = {
    userId,
    isDeleted: false,
  };

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
      take: Number(limit),
      orderBy: { date: 'desc' },
    }),
    prisma.record.count({ where }),
  ]);

  return {
    data: records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
  };
};

export const updateRecord = async (userId, id, data) => {
  return prisma.record.update({
    where: { id },
    data,
  });
};

export const deleteRecord = async (userId, id) => {
  return prisma.record.update({
    where: { id },
    data: { isDeleted: true },
  });
};