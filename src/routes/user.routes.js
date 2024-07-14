import express from 'express';
import { register, login } from '../controllers/user.controller.js';
import { forgetPassword, resetPassword } from '../controllers/userPassword.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgetPassword);
router.post('/resetpassword/:token', resetPassword);

export default router;