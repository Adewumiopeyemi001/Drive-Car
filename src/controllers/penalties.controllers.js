import { errorResMsg, successResMsg } from '../lib/response.js';
import Penalty from '../models/penalties.model.js';
import User from '../models/users.js';
import mongoose from 'mongoose';

export const createPenalty = async (req, res) => {
  const {
    userId,
    penaltyType,
    penaltyDescription,
    penaltyDate,
    penaltyAmount,
  } = req.body;
  const user = req.user;

  if (!user || user.role !== 2) {
    return errorResMsg(res, 403, 'Access Denied');
  }

  if (
    !userId ||
    !penaltyType ||
    !penaltyDescription ||
    !penaltyDate ||
    !penaltyAmount
  ) {
    return errorResMsg(res, 400, 'All fields are required');
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResMsg(res, 400, 'Invalid user ID format');
    }

    const userInfo = await User.findOne({ _id: userId });
    if (!userInfo) {
      return errorResMsg(res, 404, 'User not found');
    }

    const penalty = new Penalty({
      userId,
      penaltyType,
      penaltyDescription,
      penaltyDate,
      penaltyAmount,
      createdBy: user._id,
    });

    await penalty.save();

    // Update the user's hasPenalties field to true
    userInfo.hasPenalties = true;
    userInfo.penalties.push(penalty._id);
    await userInfo.save();

    return successResMsg(res, 201, {
      success: true,
      message: 'Penalty created successfully',
      data: penalty,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};
