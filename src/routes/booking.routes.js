import express from 'express';
import {
  approveBooking,
  cancelBooking,
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from '../controllers/bookings.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/createbooking', authenticateUser, createBooking);
router.get('/getallbookings', authenticateUser, getAllBookings);
router.get('/getbooking/:bookingId', authenticateUser, getBookingById);
router.put('/updatebooking/:bookingId', authenticateUser, updateBooking);
router.patch('/cancelbooking/:bookingId', authenticateUser, cancelBooking);
router.patch('/approvebooking/:bookingId', authenticateUser, approveBooking);
router.delete('/deletebooking/:bookingId', authenticateUser, deleteBooking);


export default router;