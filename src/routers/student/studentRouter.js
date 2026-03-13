import express from 'express'
import profileStudentRouter from '../student/profileStudentRouter.js'
import curriculumFrameworkRouter from '../student/curriculumFrameworkRouter.js'
import courseSectionRouter from '../student/courseSectionRouter.js'
import paymentRouter from '../student/paymentRouter.js'
import scheduleRouter from '../student/scheduleRouter.js'
import certificateRouter from '../student/certificateRouter.js'
import gradesResultsRouter from '../student/gradesResultsRouter.js'
import aiRouter from '../student/aiRouter.js'
import resetRouter from '../student/resetRouter.js'
import notificationRouter from '../student/notificationRouter.js'
import dashboardRouter from '../student/dashboardRouter.js'
import attendanceRouter from '../student/attendanceRouter.js'
const router = express.Router()

router.use('/profileStudent',profileStudentRouter)
router.use('/curriculumFramework',curriculumFrameworkRouter)
router.use('/courseSection',courseSectionRouter)
router.use('/payment',paymentRouter)
router.use('/schedule',scheduleRouter)
router.use('/certificate',certificateRouter)
router.use('/grades',gradesResultsRouter)
router.use('/ai',aiRouter)
router.use('/reset',resetRouter)
router.use('/notification',notificationRouter)
router.use('/dashboard',dashboardRouter)
router.use('/attendance',attendanceRouter)
export default router