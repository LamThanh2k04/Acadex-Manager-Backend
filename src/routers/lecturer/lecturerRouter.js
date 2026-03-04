import express from 'express'
import profileLecturerRouter from '../lecturer/profileLecturerRouter.js'
import scheduleRouter from '../lecturer/scheduleRouter.js'
import courseSectionRouter from '../lecturer/courseSectionRouter.js'
import gradeRouter from '../lecturer/gradeRouter.js'
import resetRouter from '../lecturer/resetRouter.js'
import homeroomClassRouter from '../lecturer/homeroomClassRouter.js'
const router = express.Router()

router.use('/profileLecturer',profileLecturerRouter)
router.use('/schedule',scheduleRouter)
router.use('/courseSection',courseSectionRouter)
router.use('/grade',gradeRouter)
router.use('/reset',resetRouter)
router.use('/homeroomClass',homeroomClassRouter)
export default router