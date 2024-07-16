import express from 'express';
import {
  createBooking,
  getAllBookings,
} from '../controllers/bookings.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/createbooking', authenticateUser, createBooking);
router.get('/getallbookings', authenticateUser, getAllBookings);


export default router;