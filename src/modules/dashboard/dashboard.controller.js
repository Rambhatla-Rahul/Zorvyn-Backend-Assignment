import * as service from './dashboard.service.js';

export const summary = async (req, res, next) => {
  try {
    const data = await service.getSummary(req.user, req.params);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const categories = async (req, res, next) => {
  try {
    const data = await service.getCategoryTotals(req.user, req.params);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const recent = async (req, res, next) => {
  try {
    const data = await service.getRecent(req.user, req.params);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const trends = async (req, res, next) => {
  try {
    const data = await service.getMonthlyTrends(req.user, req.params);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};