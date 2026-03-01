import express from 'express'
import profileStudentRouter from '../student/profileStudentRouter.js'
import curriculumFrameworkRouter from '../student/curriculumFrameworkRouter.js'
import courseSectionRouter from '../student/courseSectionRouter.js'
import paymentRouter from '../student/paymentRouter.js'
const router = express.Router()

router.use('/profileStudent',profileStudentRouter)
router.use('/curriculumFramework',curriculumFrameworkRouter)
router.use('/courseSection',courseSectionRouter)
router.use('/payment',paymentRouter)
export default router