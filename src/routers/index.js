import express from 'express';
import authRouter from '../routers/auth/authRouter.js'
import adminRouter from '../routers/admin/adminRouter.js'
import authMiddleware from '../common/middlewares/authMiddleware.js';
import { validateAdmin } from '../common/middlewares/validateRole.js';
const router = express.Router();

router.use('/api/auth',authRouter)
router.use('/api/admin',authMiddleware,validateAdmin,adminRouter)
export default router;