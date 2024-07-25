import { pool } from '../config/postgress-db.js';
import { initializePayment, verifyPayment } from '../middleware/paystack.js';
import User from '../models/users.js'; // Ensure the path is correct

export const payment = async (req, res) => {
  const { bookingId } = req.body;
  const paymentReference = `PAY_${Date.now()}`;

  try {
    // Fetch user from MongoDB
    const user = await User.findById(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch booking details from PostgreSQL
    const bookingQuery = `SELECT * FROM bookings WHERE id = $1`;
    const bookingResult = await pool.query(bookingQuery, [bookingId]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    const booking = bookingResult.rows[0];
    const amount = booking.total_amount; // Use total amount from booking

    const email = user.email; // Get email from user data

    const paymentData = await initializePayment(
      email,
      amount,
      paymentReference
    );

    const query = `
      INSERT INTO payments (booking_id, amount, payment_reference, payment_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      bookingId,
      amount,
      paymentReference,
      new Date(), // Use current date for payment date
    ];

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message:
        'Payment initialized successfully. Please complete the payment process.',
      data: {
        payment: result.rows[0],
        paymentUrl: paymentData.authorization_url, // URL to redirect user for payment
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verify = async (req, res) => {
  const { reference } = req.body;

  try {
    const paymentData = await verifyPayment(reference);

    if (paymentData.status === 'success') {
      const updatePaymentQuery = `
        UPDATE payments
        SET status = 'successful', updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
        RETURNING *
      `;
      const updateBookingQuery = `
        UPDATE bookings
        SET payment_status = 'successful', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const paymentResult = await pool.query(updatePaymentQuery, [reference]);
      const bookingResult = await pool.query(updateBookingQuery, [
        paymentData.metadata.booking_id,
      ]);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment: paymentResult.rows[0],
          booking: bookingResult.rows[0],
        },
      });
    } else {
      const updatePaymentQuery = `
        UPDATE payments
        SET status = 'failed', updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
        RETURNING *
      `;
      const paymentResult = await pool.query(updatePaymentQuery, [reference]);

      res.status(200).json({
        success: true,
        message: 'Payment verification failed',
        data: paymentResult.rows[0],
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
