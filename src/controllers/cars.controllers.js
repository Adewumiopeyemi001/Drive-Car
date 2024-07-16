
import { pool } from '../config/postgress-db.js';
import { errorResMsg, successResMsg } from '../lib/response.js';
import cloudinary from '../public/images/cloudinary.js';


export const createCar = async (req, res) => {
  const { name, year, manufacturer, numberOfDays, amountPerDay } = req.body;
  const files = req.files;
  const userId = req.user._id; // Assuming the user ID is stored here
  const isBooked = false; // By default

  // Validate that the user is authenticated and has the admin role
  if (!userId || req.user.role !== 2) {
    return errorResMsg(res, 403, 'Access denied');
  }

  if (!name || !year || !manufacturer || !numberOfDays || !amountPerDay) {
    return errorResMsg(res, 400, 'All fields are required');
  }

  // Validate that at least 4 images are uploaded
  if (!files || files.length < 4) {
    return errorResMsg(res, 400, 'At least 4 images are required');
  }

  try {
    // Upload images to Cloudinary and get secure URLs for each image
    const uploadPromises = files.map((file) =>
      cloudinary.v2.uploader.upload(file.path)
    );
    const uploadResults = await Promise.all(uploadPromises);
    const images = uploadResults.map((result) => result.secure_url);

    const query = `
      INSERT INTO cars (name, year, manufacturer, images, number_of_days, amount_per_day, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      name,
      year,
      manufacturer,
      images,
      numberOfDays,
      amountPerDay,
      userId, // Include userId in the values array
      isBooked,
    ];

    const result = await pool.query(query, values);
    return successResMsg(res, 201, {
      success: true,
      message: 'Car created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    return errorResMsg(res, 500, {
      error: err.message,
      message: 'Internal Server Error',
    });
  }
};

export const updateCar = async (req, res) => {
  const { carId } = req.params;
  const { numberOfDays, amountPerDay } = req.body;
  const userId = req.user._id; // Assuming the user ID is stored here

  if (!userId || req.user.role !== 2) {
    return errorResMsg(res, 403, 'Access denied');
  }

  if (!carId) {
    return errorResMsg(res, 400, 'Car ID is required');
  }

  if (!numberOfDays || !amountPerDay) {
    return errorResMsg(
      res,
      400,
      'Number of days and amount per day are required'
    );
  }

  try {
    const query = `
      UPDATE cars
      SET number_of_days = $1, amount_per_day = $2
      WHERE id = $3 AND user_id = $4
      RETURNING *;
    `;
    const values = [numberOfDays, amountPerDay, carId, userId]; // Include userId in the values array
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return errorResMsg(res, 404, 'Car not found');
    }

    return successResMsg(res, 200, {
      success: true,
      message: 'Car updated successfully',
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

export const deleteCar = async (req, res) => { 
  const { carId } = req.params;
  const userId = req.user._id; // Assuming the user ID is stored here
  
  if (!userId || req.user.role !== 2) {

    return errorResMsg(res, 403, 'Access denied');
  }
  
  if (!carId) {
    return errorResMsg(res, 400, 'Car ID is required');
  }

  try {
    const query = `
      DELETE FROM cars
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const values = [carId, userId]; // Include userId in the values array
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return errorResMsg(res, 404, 'Car not found');
    }
    
    return successResMsg(res, 200, {
      success: true,
      message: 'Car deleted successfully',
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

export const getCarById = async (req, res) => { 
 try {
   const { carId } = req.params;
   if (!carId) {
     return errorResMsg(res, 404, 'Car not found');
   }

   const query = `SELECT * FROM cars WHERE id = $1`;
   const values = [carId];

   const result = await pool.query(query, values);

   if (result.rows.length === 0) {
     return errorResMsg(res, 404, 'No car found');
   }
   return successResMsg(res, 200, {
     success: true,
     message: 'Car retrieved successfully',
     data: result.rows[0],
   });
 } catch (error) {
   console.error(error);
   return errorResMsg(res, 500, {
     error: error.message,
     message: 'Internal Server Error',
   });
 }
}

export const getAllCars = async(req, res) => {
  try {
    const query = `SELECT * FROM cars `;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return errorResMsg(res, 404, 'No car found');
    }
    return successResMsg(res, 200, {
      success: true,
      message: 'Cars retrieved successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};

export const filterCar = async (req, res) => {
  const { manufacturer, name, year, isBooked, minPrice, maxPrice } = req.query;
  let query = `SELECT * FROM cars WHERE 1=1 `;
  const values = [];
  let paramIndex = 1;

  if (manufacturer) {
    query += `AND manufacturer ILIKE $${paramIndex++} `;
    values.push(`%${manufacturer}%`);
  }

  if (name) {
    query += `AND name ILIKE $${paramIndex++} `;
    values.push(`%${name}%`);
  }

  if (year) {
    query += `AND year = $${paramIndex++} `;
    values.push(year); // Use = instead of ILIKE for year
  }

  if (isBooked === 'true' || isBooked === 'false') {
    query += `AND isBooked = $${paramIndex++} `;
    values.push(isBooked === 'true');
  }
   if (minPrice) {
     query += `AND amount_per_day >= $${paramIndex++} `;
     values.push(minPrice);
   }

   if (maxPrice) {
     query += `AND amount_per_day <= $${paramIndex++} `;
     values.push(maxPrice);
   }

  try {
    const result = await pool.query(query, values);
    return successResMsg(res, 200, {
      success: true,
      message: 'Cars retrieved successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};

export const searchAndSortCars = async (req, res) => {
  const { name, manufacturer, year, isBooked, sortBy, sortOrder } =
    req.query;
  let query = `SELECT * FROM cars WHERE 1=1 `;
  const values = [];
  let paramIndex = 1;

  if (manufacturer) {
    query += `AND manufacturer ILIKE $${paramIndex++} `;
    values.push(`%${manufacturer}%`);
  }

  if (name) {
    query += `AND name ILIKE $${paramIndex++} `;
    values.push(`%${name}%`);
  }

  if (year) {
    query += `AND year = $${paramIndex++} `;
    values.push(year);
  }

  if (isBooked === 'true' || isBooked === 'false') {
    query += `AND isBooked = $${paramIndex++} `;
    values.push(isBooked === 'true');
  }

  // Sorting logic
  const validSortFields = [
    'name',
    'manufacturer',
    'year',
    'amount_per_day',
    'isBooked',
  ];
  const validSortOrders = ['asc', 'desc'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'name'; // Default sort field
  const order = validSortOrders.includes(sortOrder) ? sortOrder : 'asc'; // Default sort order

  query += ` ORDER BY ${sortField} ${order}`;

  try {
    const result = await pool.query(query, values);
    return successResMsg(res, 200, {
      success: true,
      message: 'Cars retrieved and sorted successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};




