import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controllers.js';
import verifyJWT from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyJWT, logout);
router.get('/me', verifyJWT, getCurrentUser);

export default router;