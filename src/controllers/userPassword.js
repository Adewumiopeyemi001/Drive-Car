import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import emailSenderTemplate from '../middleware/email.js';
import ejs from 'ejs';
import { errorResMsg, successResMsg } from '../lib/response.js';
import {checkExistingUser, checkExistingUserToken} from '../middleware/service.js';

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResMsg(res, 400, 'Please Input Your Email');
    }

    const user = await checkExistingUser(email);
    if (!user) {
      return errorResMsg(res, 400, 'User not found');
    }

    // Check if there's already an unexpired reset token
    if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
      return successResMsg(res, 200, {
        success: true,
        resetPasswordToken: user.resetPasswordToken,
        message: 'A reset token is already sent. Please check your email.',
      });
    }

    // Generate a new token for password reset
    const token = uuidv4(); // Generate UUID token

    // Save the new token and expiration time in the user document
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expiration time (1 hour)

    await user.save();

    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFilePath);
    const templatePath = path.join(
      currentDir,
      '../public/emails/forgotPassword.ejs'
    );

    await ejs.renderFile(
      templatePath,
      {
        title: 'Reset Your Password',
        body: 'You are trying to reset your password. Here is the token for resetting your password and this token expires after 1hr.',
        resetPasswordToken: token,
      },
      async (err, data) => {
        await emailSenderTemplate(data, 'Reset Your Password', email);
      }
    );

    return successResMsg(res, 200, {
      success: true,
      resetPasswordToken: token,
      message: 'Please check your email to reset your password',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Error resetting your password',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword, confirmPassword } = req.body;
    if (!token) {
      return errorResMsg(res, 400, 'Please Input Your Reset Token');
    }
    const user = await checkExistingUserToken({ resetPasswordToken: token });
    if (!user) {
      return errorResMsg(res, 400, 'User not found');
    }
    if (newPassword !== confirmPassword) {
      return errorResMsg(res, 400, 'Passwords do not match');
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFilePath);
    const templatePath = path.join(
      currentDir,
      '../public/emails/resetpassword.ejs'
    );

    await ejs.renderFile(
      templatePath,
      {
        title: `Hello ${user.userName},`,
        body: 'Password Reset Successfully, Please Login',
      },
      async (err, data) => {
        await emailSenderTemplate(
          data,
          'Password Reset Successfully',
          user.email
        );
      }
    );

    return successResMsg(res, 200, {
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Error resetting your password',
    });
  }
};
