import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);

export default router;
