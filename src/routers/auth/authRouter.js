import express from 'express'
import { authController } from '../../controllers/auth/authController.js';

const router = express.Router();

router.post('/resgisterAdmin',authController.registerAdmin)
router.post('/login',authController.login)

export default router;