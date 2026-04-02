import express from 'express';
import * as controller from './record.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { allowRoles } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  userIdParamSchema,
} from './record.validation.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  allowRoles('ADMIN'),
  validate(createRecordSchema),
  controller.create
);

router.get(
  '/',
  authenticate,
  allowRoles('VIEWER', 'ANALYST', 'ADMIN'),
  controller.getAll
);

router.get(
  '/user/:userId',
  authenticate,
  allowRoles('ANALYST', 'ADMIN'),
  validate(userIdParamSchema, 'params'),
  controller.getAll
);

router.get(
  '/:id',
  authenticate,
  allowRoles('ANALYST', 'ADMIN'),
  validate(recordIdParamSchema, 'params'),
  controller.getOne
);

router.put(
  '/:id',
  authenticate,
  allowRoles('ADMIN'),
  validate(recordIdParamSchema, 'params'),
  validate(updateRecordSchema),
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  allowRoles('ADMIN'),
  validate(recordIdParamSchema, 'params'),
  controller.remove
);

export default router;