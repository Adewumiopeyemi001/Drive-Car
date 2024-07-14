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