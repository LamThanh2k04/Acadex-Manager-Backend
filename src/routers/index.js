import express from 'express';
import authRouter from '../routers/auth/authRouter.js'
import adminRouter from '../routers/admin/adminRouter.js'
import studentRouter from '../routers/student/studentRouter.js'
import lecturerRouter from '../routers/lecturer/lecturerRouter.js'
import authMiddleware from '../common/middlewares/authMiddleware.js';
import { validateAdmin, validateLecturer, validateStudent } from '../common/middlewares/validateRole.js';
const router = express.Router();

router.use('/api/auth',authRouter)
router.use('/api/admin',authMiddleware,validateAdmin,adminRouter)
router.use('/api/student',authMiddleware,validateStudent,studentRouter)
router.use('/api/lecturer',authMiddleware,validateLecturer,lecturerRouter)
export default router;