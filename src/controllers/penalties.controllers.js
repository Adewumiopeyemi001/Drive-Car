import { errorResMsg, successResMsg } from '../lib/response.js';
import Penalty from '../models/penalties.model.js';
import User from '../models/users.js';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import emailSenderTemplate from '../middleware/email.js';
import ejs from 'ejs';

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

      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFilePath);
      const templatePath = path.join(currentDir, '../public/emails/penaltyNotification.ejs');

      const emailContent = await ejs.renderFile(templatePath, {
        title: 'Penalty Notification',
        emailOrUsername: userInfo.userName, // Assuming you want to display the user's email or username
        penaltyId: penalty._id,
        penaltyType,
        penaltyDescription,
        penaltyDate,
        penaltyAmount,
      });

      await emailSenderTemplate(
        emailContent,
        'Penalty Notification',
        userInfo.email
      );

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

export const getAllPenalties = async (req, res) => { 
  const user = req.user;
  if (!user || user.role !== 2) {
    return errorResMsg(res, 401, 'Unauthorized');
  }
  try {
    const penalties = await Penalty.find({});
    return successResMsg(res, 200, {
      success: true,
      message: 'Penalties retrieved successfully',
      data: penalties,
    });
    
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
    
  }
};

export const getPenaltyByUserId = async (req, res) => {
  const { userId } = req.params;
  const user = req.user;

  if (!user) {
    return errorResMsg(res, 401, 'Unauthorized');
  }
  
  if (!userId) {
    return errorResMsg(res, 400, 'User ID is required');
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResMsg(res, 400, 'Invalid user ID format');
    }
    const userInfo = await User.findOne({ _id: userId });
    if (!userInfo) {
      return errorResMsg(res, 404, 'User not found');
    }
    const penalties = await Penalty.find({ userId })
    return successResMsg(res, 200, {
      success: true,
      message: 'Penalties retrieved successfully',
      data: penalties,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};
 
export const updatePenalty = async (req, res) => {
  const { penaltyDescription, penaltyAmount } = req.body;
  const { penaltyId } = req.params;
  const user = req.user;

  if (!user || user.role !== 2) {
    return errorResMsg(res, 401, 'Unauthorized');
  }

  if (!penaltyId) {
    return errorResMsg(res, 400, 'Penalty ID is required');
  }

  if (!penaltyDescription && !penaltyAmount) {
    return errorResMsg(
      res,
      400,
      'At least one of penalty description or amount is required'
    );
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(penaltyId)) {
      return errorResMsg(res, 400, 'Invalid penalty ID format');
    }

    const penaltyInfo = await Penalty.findOne({ _id: penaltyId });
    if (!penaltyInfo) {
      return errorResMsg(res, 404, 'Penalty not found');
    }
    // Find the user associated with the penalty
    const userInfo = await User.findById(penaltyInfo.userId);
    if (!userInfo) {
      return errorResMsg(res, 404, 'User not found');
    }

    // Prepare update object based on provided fields
    const updateFields = {};
    if (penaltyDescription)
      updateFields.penaltyDescription = penaltyDescription;
    if (penaltyAmount) updateFields.penaltyAmount = penaltyAmount;

    const updatedPenalty = await Penalty.findByIdAndUpdate(
      penaltyId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedPenalty) {
      return errorResMsg(res, 404, 'Penalty not found');
    }
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFilePath);
    const templatePath = path.join(
      currentDir,
      '../public/emails/penaltyUpdate.ejs'
    );

    const emailContent = await ejs.renderFile(templatePath, {
      title: 'Penalty Notification Update',
      penaltyDescription,
      penaltyAmount,
    });

    await emailSenderTemplate(
      emailContent,
      'Penalty Notification Update',
      userInfo.email
    );

    return successResMsg(res, 200, {
      success: true,
      message: 'Penalty updated successfully',
      data: updatedPenalty,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};

export const deletePenalty = async (req, res) => {
  const { penaltyId } = req.params;
  const user = req.user;

  if (!user || user.role !== 2) {
    return errorResMsg(res, 401, 'Unauthorized');
  }

  if (!penaltyId) {
    return errorResMsg(res, 400, 'Penalty ID is required');
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(penaltyId)) {
      return errorResMsg(res, 400, 'Invalid penalty ID format');
    }

    const penaltyInfo = await Penalty.findByIdAndDelete(penaltyId);
    if (!penaltyInfo) {
      return errorResMsg(res, 404, 'Penalty not found');
    }

    // Update the user's penalty status
    const userInfo = await User.findById(penaltyInfo.userId);
    if (!userInfo) {
      return errorResMsg(res, 404, 'User not found');
    }

    userInfo.hasPenalties = false;
    userInfo.penalties = [];
    await userInfo.save();

    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFilePath);
    const templatePath = path.join(
      currentDir,
      '../public/emails/deletePenalty.ejs'
    );

    const emailContent = await ejs.renderFile(templatePath, {
      title: 'Penalty Deleted Successfully',
    
    });

    await emailSenderTemplate(
      emailContent,
      'Penalty Deleted Successfully',
      userInfo.email
    );

    return successResMsg(res, 200, {
      success: true,
      message: 'Penalty deleted and user updated successfully',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};