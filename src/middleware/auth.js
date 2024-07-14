import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import { errorResMsg } from '../lib/response.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return errorResMsg(res, 401, 'Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = await User.findById(decoded._id).select('-password');

    if (!req.user) {
      return errorResMsg(res, 401, 'User not found');
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error);
    // return errorResMsg(res, 401, "Not Authorized, token failed");
  }
};
