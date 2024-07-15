import express from 'express';
import {
  createCar,
  updateCar,
  deleteCar,
  getCarById,
  getAllCars,
  filterCar,
} from '../controllers/cars.controllers.js';
import upload from '../public/images/multer.js';
import { authenticateUser } from '../middleware/auth.js';


const router = express.Router();

router.post('/register', authenticateUser, upload.array('files', 10), createCar);
router.put('/updatecar/:carId', authenticateUser, updateCar);
router.delete('/deletecar/:carId', authenticateUser, deleteCar);
router.get('/getcar/:carId', getCarById);
router.get('/getallcars', getAllCars);
router.get('/filter', filterCar);

export default router;