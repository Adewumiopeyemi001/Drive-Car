import express from 'express';
import { payment, verify } from '../controllers/payment.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/initialize', authenticateUser, payment);
router.get('/verify', authenticateUser, verify);

export default router;