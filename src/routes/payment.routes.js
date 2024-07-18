import express from 'express';
import { payment, verifyPayment } from '../controllers/payment.js';

const router = express.Router();

router.post('/initialize', payment);
router.post('/verify', verifyPayment);

export default router;