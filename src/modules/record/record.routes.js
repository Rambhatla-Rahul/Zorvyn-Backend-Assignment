import express from 'express';
import * as controller from './record.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { allowRoles } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createRecordSchema,
  updateRecordSchema,
} from './record.validation.js';

const router = express.Router();

// Create → ADMIN only
router.post(
  '/',
  authenticate,
  allowRoles('ADMIN'),
  validate(createRecordSchema),
  controller.create
);

// Read → ALL roles
router.get(
  '/',
  authenticate,
  allowRoles('VIEWER', 'ANALYST', 'ADMIN'),
  controller.getAll
);

// Update → ADMIN only
router.put(
  '/:id',
  authenticate,
  allowRoles('ADMIN'),
  validate(updateRecordSchema),
  controller.update
);

// Delete → ADMIN only (soft delete)
router.delete(
  '/:id',
  authenticate,
  allowRoles('ADMIN'),
  controller.remove
);

export default router;