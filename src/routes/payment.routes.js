import express from 'express';
import { payment, verify } from '../controllers/payment.js';

const router = express.Router();

router.post('/initialize', payment);
router.post('/verify', verify);

export default router;