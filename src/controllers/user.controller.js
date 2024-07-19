import { errorResMsg, successResMsg } from "../lib/response.js";
import { checkExistingByemailOrUsername, checkExistingPassword, checkExistingUser } from "../middleware/service.js";
import User from "../models/users.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import emailSenderTemplate from "../middleware/email.js";
import ejs from 'ejs';


export const register = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;
        
    if (!userName || !email || !password || !role) {
      return errorResMsg(res, 400, 'Please fill all the fields');
    }
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return errorResMsg(res, 400, 'User already exists');
    }
        
    const newUser = await User.create({
      userName,
      email,
      password,
      role,
    });
      
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFilePath);
    const templatePath = path.join(
      currentDir,
      '../public/emails/signup.ejs'
    );
      
    await ejs.renderFile(
      templatePath,
      {
        title: `Welcome to DriveCar Motor`,
        body: 'Welcome',
        userName: userName,
      },
      async (err, data) => {
        await emailSenderTemplate(
          data,
          'Account Created Successfully',
          email
        );
      }
    );
      
    return successResMsg(res, 201, {
      success: true,
      newUser: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return errorResMsg(
        res,
        400,
        'Please enter your email address or Username and password'
      );
    }

    const user = await checkExistingByemailOrUsername(emailOrUsername);

    if (!user) {
      return errorResMsg(res, 400, 'User not found');
    }

    const passwordMatch = await checkExistingPassword(password, user);
    if (!passwordMatch) {
      return errorResMsg(res, 400, 'Password Does Not Match');
    }

    const token = user.generateAuthToken();

     const currentFilePath = fileURLToPath(import.meta.url);
     const currentDir = dirname(currentFilePath);
     const templatePath = path.join(currentDir, '../public/emails/login.ejs');

     await ejs.renderFile(
       templatePath,
       {
         title: `Welcome to Back`,
         body: 'Welcome',
         emailOrUsername: user.userName || user.email,
         loginDate: new Date().toLocaleDateString(),
         loginTime: new Date().toLocaleTimeString(),
         loginIPAddress: req.ip || 'Unknown IP Address',
       },
       async (err, data) => {
         await emailSenderTemplate(data, 'Successfully Logged In!', user.email);
       }
     );

    return successResMsg(res, 200, {
      success: true,
      data: {
        token,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};

export const getAllUsers = async (req, res) => { 
  const user = req.user.id;
  if (user.role!== 2) {
    return errorResMsg(res, 401, 'Unauthorized');
  }
  try {
    const users = await User.find({});
    return successResMsg(res, 200, {
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role; // Assuming user role is stored in the `req.user` object

    // Check if the requesting user is either the user themselves or an admin
    if (requestingUserId !== userId && requestingUserRole !== 'admin') {
      return errorResMsg(
        res,
        403,
        'Forbidden: You do not have permission to access this resource'
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResMsg(res, 404, 'User not found');
    }

    return successResMsg(res, 200, {
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};

export const updateUser = async (req, res) => {
  const { userName, email } = req.body;

  // Validate required fields
  if (!userName || !email) {
    return errorResMsg(res, 400, 'Please fill all the fields');
  }

  const requestingUserId = req.user.id;

  // Ensure the user is authenticated
  if (!requestingUserId) {
    return errorResMsg(res, 401, 'Unauthorized');
  }

  try {
    // Find and update the user by ID
    const updatedUser = await User.findByIdAndUpdate(
      requestingUserId,
      { userName, email },
      { new: true, runValidators: true } // new: return the updated document; runValidators: apply schema validation
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      return errorResMsg(res, 404, 'User not found');
    }

    return successResMsg(res, 200, {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
};

