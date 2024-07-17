import { pool } from '../config/postgress-db.js';
import { errorResMsg, successResMsg } from '../lib/response.js';
import { v4 as uuidv4 } from 'uuid';


export const createBooking = async (req, res) => { 
    const { carId, startDate, returnDate } = req.body;
    const userId = req.user._id; 
    const bookingReference = uuidv4();
// console.log(userId);
    if (!userId) {
        return errorResMsg(res, 401, 'Unauthorized');
    }

    if (!carId || !startDate || !returnDate) {
        return errorResMsg(res, 400, 'All fields are required');
    }

    try {
        const carResult = await pool.query(`SELECT * FROM cars WHERE id =$1`, [carId]);
        const car = carResult.rows[0];

        if (!car) { 
            return errorResMsg(res, 404, 'Car not found');
        }
        if (car.isBooked) {
            return errorResMsg(res, 409, 'Car already booked');
        }

        const days =
          (new Date(returnDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

        const totalAmount = days * car.amount_per_day;

        // console.log(`Days: ${days}`);
        // console.log(`Amount per day: ${car.amount_per_day}`);
        // console.log(`Total amount: ${totalAmount}`);

        const bookingResult = await pool.query(
          `INSERT INTO bookings (user_id, car_id, start_date, return_date, total_amount, booking_reference, is_approved, payment_status, is_cancelled)
       VALUES ($1, $2, $3, $4, $5, $6, false, 'pending', false) RETURNING *`,
          [userId, carId, startDate, returnDate, totalAmount, bookingReference]
        );

        await pool.query(`UPDATE cars SET isBooked = true WHERE id = $1`, [carId]);

        return successResMsg(res, 200, {
            success: true,
            message: 'Booking created successfully',
            data: bookingResult.rows[0],
        });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: 'Internal Server Error',
        });
        
    }
};

export const getAllBookings = async (req, res) => { 
    try {
        const userId = req.user._id;
        
        if (!userId || req.user.role !== 2) {
            return errorResMsg(res, 403, 'Access denied');
        }
        const bookedResults = await pool.query(`SELECT * FROM bookings`);
        const bookings = bookedResults.rows;
        
        return successResMsg(res, 200, {
            success: true,
            message: 'Bookings fetched successfully',
            data: bookings,
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: 'Internal Server Error',
        });
        
    }
};

export const getBookingById = async (req, res) => { 
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;

        if (!userId) { 
            return errorResMsg(res, 401, 'Unauthorized');
        }
        
        if (!bookingId) {
            return errorResMsg(res, 400, 'Booking not found');
        }
        const query = `SELECT * FROM bookings WHERE id = $1`;
        const values = [bookingId];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return errorResMsg(res, 404, 'Booking not found');
        }
        return successResMsg(res, 200, {
            success: true,
            message: 'Booking fetched successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: 'Internal Server Error',
        });
    }
};

export const updateBooking = async (req, res) => { 
    const { carId, startDate, returnDate } = req.body;
    const { bookingId } = req.params;
    const userId = req.user._id;

    if (!userId) { 
        return errorResMsg(res, 401, 'Unauthorized');
    }
    
    if (!bookingId) {
        return errorResMsg(res, 400, 'Booking not found');
    }
    
    if (!carId ||!startDate ||!returnDate) {
        return errorResMsg(res, 400, 'All fields are required');
    }
    try {

        const carQuery = `SELECT amount_per_day FROM cars WHERE id = $1`;
        const carResult = await pool.query(carQuery, [carId]);

        if (carResult.rows.length === 0) {
            return errorResMsg(res, 404, 'Car not found');
        }
        const dailyRate = carResult.rows[0].amount_per_day;

        const start = new Date(startDate);
        const end = new Date(returnDate);
        const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

         const totalAmount = numberOfDays * dailyRate;

        const query = `UPDATE bookings 
                             SET car_id = $1, start_date = $2, return_date = $3, total_amount = $4 
                             WHERE id = $5 AND user_id = $6 
                             RETURNING *`;
        const values = [carId, startDate, returnDate, totalAmount, bookingId, userId];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return errorResMsg(res, 404, 'Booking not found');
        }
        return successResMsg(res, 200, {
            success: true,
            message: 'Booking updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: 'Internal Server Error',
        }); 
    }
};

export const cancelBooking = async (req, res) => { 
    const { bookingId } = req.params;
    const userId = req.user._id;
    
    if (!userId) { 
        return errorResMsg(res, 401, 'Unauthorized');
    }
    
    if (!bookingId) {
        return errorResMsg(res, 400, 'Booking not found');
    }
    try {
        const query = `UPDATE bookings 
                             SET is_cancelled = true 
                             WHERE id = $1 AND user_id = $2 
                             RETURNING *`;
        const values = [bookingId, userId];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return errorResMsg(res, 404, 'Booking not found');
        }
        return successResMsg(res, 200, {
            success: true,
            message: 'Booking cancelled successfully',
            data: result.rows[0],
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: 'Internal Server Error',
        });
    }
};

export const approveBooking = async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user._id;
    
    if (!userId) {
        return errorResMsg(res, 401, 'Unauthorized');
    }
    
    if (!bookingId) {
        return errorResMsg(res, 400, 'Booking not found');
    }
    try {
        const query = `UPDATE bookings 
                             SET is_approved = true 
                             WHERE id = $1 AND user_id = $2 AND payment_status = 'successful'
                             RETURNING *`;
        const values = [bookingId, userId];
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return errorResMsg(
              res,
              404,
              'Payment not successful'
            );
        }
        return successResMsg(res, 200, {
            success: true,
            message: 'Booking approved successfully',
            data: result.rows
        })
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: 'Internal Server Error',
        });
    }
};