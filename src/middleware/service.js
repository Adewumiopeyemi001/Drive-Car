
import User from '../models/users.js';
import bcrypt from 'bcryptjs';

export const checkExistingUser = async (email) => {
  return User.findOne({ email });
};

export const checkExistingByemailOrUsername = async (emailOrUsername) => { 
  return User.findOne({
    $or: [{ email: emailOrUsername }, { userName: emailOrUsername }],
  });
};

export const findUserById = async (id) => {
  return User.findById(id);
};

export const checkExistingPassword = async (password, user) => {
  return bcrypt.compare(password, user.password);
};

export const checkExistingUserToken = async ({ resetPasswordToken: token }) => {
  return User.findOne({ resetPasswordToken: token });
};

