import { pool } from '../config/postgress-db.js';
import { initializePayment, verifyPayment } from '../middleware/paystack.js';
import { errorResMsg, successResMsg } from '../lib/response.js';
import User from '../models/users.js';

// export const payment = async (req, res) => {
//   const { bookingId } = req.body;
//   const paymentReference = `PAY_${Date.now()}`;

//   try {
//     // Ensure req.user.id is defined
//     if (!req.user || !req.user.id) {
//       return errorResMsg(res, 401, {
//         success: false,
//         message: 'Unauthorized',
//       });
//     }

//     // Fetch user from MongoDB
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return errorResMsg(res, 404, {
//         success: false,
//         message: 'User not found',
//       });
//     }

//     // Fetch booking details from PostgreSQL
//     const bookingQuery = `SELECT * FROM bookings WHERE id = $1`;
//     const bookingResult = await pool.query(bookingQuery, [bookingId]);
//     if (bookingResult.rows.length === 0) {
//       return errorResMsg(res, 404, {
//         success: false,
//         message: 'Booking not found',
//       });
//     }
//     const booking = bookingResult.rows[0];
//     const amount = booking.total_amount; // Use total amount from booking

//     // Initialize payment
//     const paymentData = await initializePayment(
//       user.email,
//       amount,
//       paymentReference
//     );
//     if (!paymentData.authorization_url) {
//       return errorResMsg(res, 500, {
//         success: false,
//         message: 'Failed to initialize payment',
//       });
//     }

//     // Store payment data in PostgreSQL database
//     const query = `
//       INSERT INTO payments (booking_id, amount, payment_reference, payment_date)
//       VALUES ($1, $2, $3, $4)
//       RETURNING *
//     `;
//     const values = [
//       bookingId,
//       amount,
//       paymentReference,
//       new Date(), // Use current date for payment date
//     ];
//     const result = await pool.query(query, values);

//     return successResMsg(res, 200, {
//       success: true,
//       message: 'Payment initialized successfully',
//       data: {
//         payment: result.rows[0],
//         paymentUrl: paymentData.authorization_url, // URL to redirect user for payment
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return errorResMsg(res, 500, {
//       success: false,
//       message: 'Internal Server Error',
//     });
//   }
// };

export const payment = async (req, res) => {
  const { bookingId } = req.body;

  try {
    // Ensure req.user.id is defined
    if (!req.user || !req.user.id) {
      return errorResMsg(res, 401, {
        success: false,
        message: 'Unauthorized',
      });
    }

    // Fetch user from MongoDB
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResMsg(res, 404, {
        success: false,
        message: 'User not found',
      });
    }

    // Fetch booking details from PostgreSQL
    const bookingQuery = `SELECT * FROM bookings WHERE id = $1`;
    const bookingResult = await pool.query(bookingQuery, [bookingId]);
    if (bookingResult.rows.length === 0) {
      return errorResMsg(res, 404, {
        success: false,
        message: 'Booking not found',
      });
    }
    const booking = bookingResult.rows[0];
    const amount = booking.total_amount; // Use total amount from booking

    // Initialize payment
    const paymentReference = `PAY_${Date.now()}`;
    const paymentData = await initializePayment(
      user.email,
      amount,
      paymentReference
    );
    if (!paymentData.authorization_url || !paymentData.reference) {
      return errorResMsg(res, 500, {
        success: false,
        message: 'Failed to initialize payment',
      });
    }

    // Store payment data in PostgreSQL database
    const query = `
      INSERT INTO payments (booking_id, amount, payment_reference, paystack_reference, payment_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      bookingId,
      amount,
      paymentReference,
      paymentData.reference,
      new Date(), // Use current date for payment date
    ];
    const result = await pool.query(query, values);

    return successResMsg(res, 200, {
      success: true,
      message: 'Payment initialized successfully',
      data: {
        payment: result.rows[0],
        paymentUrl: paymentData.authorization_url, // URL to redirect user for payment
      },
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      success: false,
      message: 'Internal Server Error',
    });
  }
};


// export const verify = async (req, res) => {
//   const { paymentReference } = req.body;

//   if (!paymentReference) {
//     return errorResMsg(res, 400, {
//       success: false,
//       message: 'paymentReference is required',
//     });
//   }

//   try {
//     const paymentData = await verifyPayment(paymentReference);

//     if (!paymentData) {
//       return errorResMsg(res, 400, {
//         success: false,
//         message: 'Payment data not found',
//       });
//     }

//     let paymentStatus;
//     let isApproved = false;

//     switch (paymentData.status) {
//       case 'success':
//         paymentStatus = 'successful';
//         isApproved = true;
//         break;
//       case 'failed':
//         paymentStatus = 'failed';
//         break;
//       case 'abandoned':
//         paymentStatus = 'abandoned';
//         break;
//       default:
//         paymentStatus = 'unknown';
//         break;
//     }

//     const updatePaymentQuery = `
//       UPDATE payments
//       SET status = $1, updated_at = CURRENT_TIMESTAMP
//       WHERE payment_reference = $2
//       RETURNING *
//     `;

//     const updateBookingQuery = `
//       UPDATE bookings
//       SET payment_status = $1, is_approved = $2
//       WHERE id = $3
//       RETURNING *
//     `;

//     const paymentResult = await pool.query(updatePaymentQuery, [
//       paymentStatus,
//       paymentReference,
//     ]);

//     const bookingResult = await pool.query(updateBookingQuery, [
//       paymentStatus,
//       isApproved,
//       paymentData.metadata.booking_id,
//     ]);

//     return successResMsg(res, 200, {
//       success: true,
//       message: 'Payment verification completed',
//       data: {
//         payment: paymentResult.rows[0],
//         booking: bookingResult.rows[0],
//       },
//     });
//   } catch (error) {
//     console.error('Error verifying payment:', error);
//     return errorResMsg(res, 500, {
//       success: false,
//       message: 'Internal Server Error',
//     });
//   }
// };

export const verify = async (req, res) => {
  const { paymentReference } = req.body;

  if (!paymentReference) {
    return errorResMsg(res, 400, {
      success: false,
      message: 'paymentReference is required',
    });
  }

  try {
    const paymentQuery = `SELECT * FROM payments WHERE payment_reference = $1`;
    const paymentResult = await pool.query(paymentQuery, [paymentReference]);
    if (paymentResult.rows.length === 0) {
      return errorResMsg(res, 404, {
        success: false,
        message: 'Payment not found',
      });
    }

    const payment = paymentResult.rows[0];
    const paystackReference = payment.paystack_reference;

    const paymentData = await verifyPayment(paystackReference);

    if (!paymentData) {
      return errorResMsg(res, 400, {
        success: false,
        message: 'Payment data not found',
      });
    }

    let paymentStatus;
    let isApproved = false;

    switch (paymentData.status) {
      case 'success':
        paymentStatus = 'successful';
        isApproved = true;
        break;
      case 'failed':
        paymentStatus = 'failed';
        break;
      case 'abandoned':
        paymentStatus = 'abandoned';
        break;
      default:
        paymentStatus = 'unknown';
        break;
    }

    const updatePaymentQuery = `
      UPDATE payments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $2
      RETURNING *
    `;

    const updateBookingQuery = `
      UPDATE bookings
      SET payment_status = $1, is_approved = $2
      WHERE id = $3
      RETURNING *
    `;

    const updatedPaymentResult = await pool.query(updatePaymentQuery, [
      paymentStatus,
      paymentReference,
    ]);

    const updatedBookingResult = await pool.query(updateBookingQuery, [
      paymentStatus,
      isApproved,
      payment.booking_id,
    ]);

    return successResMsg(res, 200, {
      success: true,
      message: 'Payment verification completed',
      data: {
        payment: updatedPaymentResult.rows[0],
        booking: updatedBookingResult.rows[0],
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return errorResMsg(res, 500, {
      success: false,
      message: 'Internal Server Error',
    });
  }
};
