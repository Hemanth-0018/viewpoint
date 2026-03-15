import express from 'express';
const router = express.Router();
import {register,login,logout,getCurrentUser} from '../controllers/auth.controller.js';
import verifyJWT from '../middleware/auth.middleware.js'

router.post("/register",register);
router.post("/login",login);

router.post("/logout",verifyJWT,logout);
router.get("/me",verifyJWT,getCurrentUser);

export default router;