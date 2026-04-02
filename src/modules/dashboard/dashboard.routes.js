import express from 'express';
import * as controller from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { allowRoles } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { userIdParamSchema } from '../record/record.validation.js';

const router = express.Router();

router.get(
  '/summary',
  authenticate,
  allowRoles('VIEWER', 'ANALYST', 'ADMIN'),
  controller.summary
);

router.get(
  '/categories',
  authenticate,
  allowRoles('VIEWER', 'ANALYST', 'ADMIN'),
  controller.categories
);

router.get(
  '/trends',
  authenticate,
  allowRoles('VIEWER', 'ANALYST', 'ADMIN'),
  controller.trends
);

router.get(
  '/user/:userId/summary',
  authenticate,
  allowRoles('ANALYST', 'ADMIN'),
  validate(userIdParamSchema, 'params'),
  controller.summary
);

router.get(
  '/user/:userId/categories',
  authenticate,
  allowRoles('ANALYST', 'ADMIN'),
  validate(userIdParamSchema, 'params'),
  controller.categories
);

router.get(
  '/user/:userId/trends',
  authenticate,
  allowRoles('ANALYST', 'ADMIN'),
  validate(userIdParamSchema, 'params'),
  controller.trends
);

router.get(
  '/user/:userId/recent',
  authenticate,
  allowRoles('ANALYST', 'ADMIN'),
  validate(userIdParamSchema, 'params'),
  controller.recent
);

export default router;