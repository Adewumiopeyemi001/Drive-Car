import express from 'express';
import passport from 'passport';
import { successResMsg, errorResMsg } from '../lib/response.js';
import '../config/passport.js'; // Ensure this file is imported to configure passport

const router = express.Router();

// Google OAuth
 router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    const token = req.user.generateAuthToken();
    successResMsg(res, 200, {
      success: true,
      data: {
        token,
        role: req.user.role,
      },
    });
  }
);

export default router;
