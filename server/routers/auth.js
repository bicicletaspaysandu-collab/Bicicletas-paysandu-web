import express from 'express';
import { signup, login, getProfile } from '../controllers/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', getProfile);

export default router;
