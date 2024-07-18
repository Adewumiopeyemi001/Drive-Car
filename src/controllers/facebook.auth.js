import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import express from 'express';
import dotenv from 'dotenv';
import User from '../models/users.js';
import { successResMsg, errorResMsg } from '../lib/response.js'; // Assuming you have response utility functions

const router = express.Router();
dotenv.config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      // profileFields: ['id', 'emails', 'name'], // Adjust the fields as needed
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          accountId: profile.id,
          provider: 'facebook',
        });

        if (!user) {
          console.log('Adding new user to DB...');
          user = new User({
            accountId: profile.id,
            provider: 'facebook',
            name: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        } else {
          console.log('User already exists in DB...');
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

router.get('/', passport.authenticate('facebook', { scope: 'email' }));

router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
  }),
  function (req, res) {
    res.redirect('/auth/facebook/success');
  }
);

router.get('/success', async (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    const userInfo = {
      id: req.session.passport.user.id,
      name: req.session.passport.user.name,
      email: req.session.passport.user.email,
      provider: req.session.passport.user.provider,
    };
    return successResMsg(res, 200, {
      success: true,
      data: userInfo,
    });
  } else {
    return errorResMsg(res, 403, 'User not authenticated');
  }
});

router.get('/error', (req, res) => {
  return errorResMsg(res, 403, 'Authentication failed');
});

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (error) {
      if (error) {
        console.log('session destroy error', error);
      }
    });
    return successResMsg(res, 200, {
      success: true,
      message: 'User signed out successfully',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: 'Internal Server Error',
    });
  }
});

export default router;
