import prisma from '../../db/prisma.js';

export const getSummary = async (requestUser, params = {}) => {
  if (requestUser.role === 'ANALYST' || requestUser.role === 'ADMIN') {
    if (params.userId) {
      const result = await prisma.record.groupBy({
        by: ['type'],
        where: {
          userId: params.userId,
          isDeleted: false,
        },
        _sum: { amount: true },
      });

      let income = 0;
      let expense = 0;

      result.forEach((r) => {
        if (r.type === 'income') income = r._sum.amount || 0;
        if (r.type === 'expense') expense = r._sum.amount || 0;
      });

      return {
        userId: params.userId,
        totalIncome: income,
        totalExpenses: expense,
        netBalance: income - expense,
      };
    }

    const grouped = await prisma.record.groupBy({
      by: ['userId', 'type'],
      where: { isDeleted: false },
      _sum: { amount: true },
    });

    const resultMap = {};

    grouped.forEach((r) => {
      if (!resultMap[r.userId]) {
        resultMap[r.userId] = {
          userId: r.userId,
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
        };
      }

      if (r.type === 'income') {
        resultMap[r.userId].totalIncome = r._sum.amount || 0;
      }

      if (r.type === 'expense') {
        resultMap[r.userId].totalExpenses = r._sum.amount || 0;
      }
    });

    Object.values(resultMap).forEach((u) => {
      u.netBalance = u.totalIncome - u.totalExpenses;
    });

    return Object.values(resultMap);
  }

  const result = await prisma.record.groupBy({
    by: ['type'],
    where: {
      userId: requestUser.id,
      isDeleted: false,
    },
    _sum: { amount: true },
  });

  let income = 0;
  let expense = 0;

  result.forEach((r) => {
    if (r.type === 'income') income = r._sum.amount || 0;
    if (r.type === 'expense') expense = r._sum.amount || 0;
  });

  return {
    totalIncome: income,
    totalExpenses: expense,
    netBalance: income - expense,
  };
};

export const getCategoryTotals = async (requestUser, params = {}) => {
  if (requestUser.role === 'ANALYST' || requestUser.role === 'ADMIN') {
    if (params.userId) {
      return prisma.record.groupBy({
        by: ['category'],
        where: {
          userId: params.userId,
          isDeleted: false,
        },
        _sum: { amount: true },
      });
    }

    return prisma.record.groupBy({
      by: ['userId', 'category'],
      where: { isDeleted: false },
      _sum: { amount: true },
    });
  }

  return prisma.record.groupBy({
    by: ['category'],
    where: {
      userId: requestUser.id,
      isDeleted: false,
    },
    _sum: { amount: true },
  });
};

export const getRecent = async (requestUser, params = {}) => {
  if (requestUser.role === 'ANALYST' || requestUser.role === 'ADMIN') {
    if (params.userId) {
      return prisma.record.findMany({
        where: {
          userId: params.userId,
          isDeleted: false,
        },
        orderBy: { date: 'desc' },
        take: 5,
      });
    }

    return prisma.record.findMany({
      where: { isDeleted: false },
      orderBy: { date: 'desc' },
      take: 10,
    });
  }

  return prisma.record.findMany({
    where: {
      userId: requestUser.id,
      isDeleted: false,
    },
    orderBy: { date: 'desc' },
    take: 5,
  });
};

export const getMonthlyTrends = async (requestUser, params = {}) => {
  if (requestUser.role === 'ANALYST' || requestUser.role === 'ADMIN') {
    if (params.userId) {
      return prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "date") AS month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
        FROM "Record"
        WHERE "userId" = ${params.userId}
          AND "isDeleted" = false
        GROUP BY month
        ORDER BY month;
      `;
    }

    return prisma.$queryRaw`
      SELECT 
        "userId",
        DATE_TRUNC('month', "date") AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
      FROM "Record"
      WHERE "isDeleted" = false
      GROUP BY "userId", month
      ORDER BY "userId", month;
    `;
  }

  return prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "date") AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM "Record"
    WHERE "userId" = ${requestUser.id}
      AND "isDeleted" = false
    GROUP BY month
    ORDER BY month;
  `;
};