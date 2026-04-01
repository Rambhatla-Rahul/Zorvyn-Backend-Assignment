import * as service from './record.service.js';

export const create = async (req, res, next) => {
  try {
    const record = await service.createRecord(req.user.id, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await service.getRecords(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const record = await service.updateRecord(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await service.deleteRecord(req.user.id, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};