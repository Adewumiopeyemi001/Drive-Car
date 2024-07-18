import { pool } from '../config/postgress-db.js';
import { initializePayment } from '../middleware/paystack.js';


export const payment = async (req, res) => {
  const { userId, carId, bookingId, amount, email } = req.body;
  const bookingReference = `BOOK_${Date.now()}`;

  try {
    const paymentData = await initializePayment(email, amount, bookingReference);

    const query = `
      INSERT INTO payments (user_id, car_id, booking_id, amount, booking_reference, payment_reference, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [userId, carId, bookingId, amount, bookingReference, paymentData.reference, 'pending'];

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
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
        WHERE booking_reference = $1
        RETURNING *
      `;
      await pool.query(updatePaymentQuery, [reference]);
      await pool.query(updateBookingQuery, [paymentData.reference]);
    } else {
      const updatePaymentQuery = `
        UPDATE payments
        SET status = 'failed', updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
        RETURNING *
      `;
      await pool.query(updatePaymentQuery, [reference]);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: paymentData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};