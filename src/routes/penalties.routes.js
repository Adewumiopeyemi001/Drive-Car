import express from 'express';
const Router = express.Router();

import { createPenalty } from '../controllers/penalties.controllers.js';
import { authenticateUser } from '../middleware/auth.js';

Router.post('/createpenalty', authenticateUser , createPenalty);

export default Router;