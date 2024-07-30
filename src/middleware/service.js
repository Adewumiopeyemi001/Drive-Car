import { pool } from '../config/postgress-db.js';
import User from '../models/users.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const checkExistingUser = async (email) => {
  return User.findOne({ email });
};

export const checkExistingByemailOrUsername = async (emailOrUsername) => {
  return User.findOne({
    $or: [{ email: emailOrUsername }, { userName: emailOrUsername }],
  });
};

export const findUserById = async (id) => {
  return User.findById(id);
};

export const checkExistingPassword = async (password, user) => {
  return bcrypt.compare(password, user.password);
};

export const checkExistingUserToken = async ({ resetPasswordToken: token }) => {
  return User.findOne({ resetPasswordToken: token });
};

export const getUserByBookingId = async (bookingId) => {
  try {
    // Query PostgreSQL to get the userId from the booking
    const query = 'SELECT user_id FROM bookings WHERE id = $1';
    const values = [bookingId];
    const res = await pool.query(query, values);

    if (res.rows.length === 0) {
      throw new Error('No booking found for the given bookingId');
    }

    // Get userId and trim any extra quotes
    let userId = res.rows[0].user_id;
    userId = userId.replace(/^"|"$/g, ''); // Remove surrounding double quotes

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    // Query MongoDB to get the user details
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error('No user found with the given userId');
    }

    return user;
  } catch (err) {
    console.error('Error fetching user:', err);
    throw err;
  }
};

export const getCarByBookingId = async (bookingId) => {
  const query =
    'SELECT * FROM cars WHERE id IN (SELECT car_id FROM bookings WHERE id = $1)';
  const values = [bookingId];
  try {
    const res = await pool.query(query, values);
    return res.rows[0]; // Assuming there's one car per booking
  } catch (err) {
    console.error('Error fetching car:', err);
    throw err;
  }
};
export const getBooking = async (bookingId) => {
  const query = 'SELECT * FROM bookings WHERE id = $1';
  const values = [bookingId];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching booking:', err);
    throw err;
  }
};
export const getPaymentByBookingId = async (bookingId) => {
  const query = 'SELECT * FROM payments WHERE booking_id = $1';
  const values = [bookingId];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching payment:', err);
    throw err;
  }
};
