import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import { connectDB } from './src/config/db.js';
import usersRouter from './src/routes/user.routes.js';
// import session from 'express-session';
// import passport from './src/config/passport.js';
import authRoutes from './src/routes/auth.js'; 
import carRoutes from './src/routes/car.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import facebookAuthRoute from './src/controllers/facebook.auth.js';
import paymentRoutes from './src/routes/payment.routes.js';

dotenv.config();

// app.use(
//   session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: false,
//   })
// );

const app = express();
app.use(morgan('dev'));
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use(
  session({ secret: 'your_secret_key', resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Welcome to DriveCar Motor');
});

app.use('/api/users', usersRouter);
app.use('/api', authRoutes);
app.use('/api/car', carRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/auth/facebook', facebookAuthRoute);
app.use('/api/payment', paymentRoutes);

const server = app.listen(PORT, async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log('Connected to database');
    console.log(`listening on http://localhost:${PORT}`);
  } catch (error) {
    console.log(error);
  }
});