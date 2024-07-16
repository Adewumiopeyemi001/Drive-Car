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