import express from 'express';
import {
  createPenalty,
  deletePenalty,
  getAllPenalties,
  getPenaltyByUserId,
  updatePenalty,
} from '../controllers/penalties.controllers.js';
import { authenticateUser } from '../middleware/auth.js';
const Router = express.Router();

Router.post('/createpenalty', authenticateUser , createPenalty);
Router.get('/getallpenalty', authenticateUser , getAllPenalties);
Router.get('/getpenalty/user/:userId', authenticateUser, getPenaltyByUserId);
Router.put('/updatepenalty/:penaltyId', authenticateUser, updatePenalty);
Router.delete('/deletepenalty/:penaltyId', authenticateUser, deletePenalty);

export default Router;