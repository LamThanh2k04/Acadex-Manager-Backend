import express from 'express'
import { dashboardController } from '../../controllers/lecturer/dashboardController.js'

const router = express.Router()

router.get('/getOverView',dashboardController.getOverView)
router.get('/getAttendanceRate',dashboardController.getAttendanceRate)
router.get('/getAvgGradeClassByCourseSection',dashboardController.getAvgGradeClassByCourseSection)
router.get('/getAllCourseSectionLecturerSimple',dashboardController.getAllCourseSectionLecturerSimple)
router.get('/getTopStudentGradeByCourseSection',dashboardController.getTopStudentGradeByCourseSection)
export default router