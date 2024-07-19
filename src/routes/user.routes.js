import express from 'express';
import { register, login, getAllUsers, getUserById, updateUser } from '../controllers/user.controller.js';
import { forgetPassword, resetPassword } from '../controllers/userPassword.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgetPassword);
router.post('/resetpassword/:token', resetPassword);
router.get('/getallusers', authenticateUser, getAllUsers);
router.get('/getuser', authenticateUser, getUserById);
router.put('/updateuser', authenticateUser, updateUser);

export default router;