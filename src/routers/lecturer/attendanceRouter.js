import express from 'express'
import { attendanceController } from '../../controllers/lecturer/attendanceController.js'

const router = express.Router()

router.get('/getAllSchedulesLecturer',attendanceController.getAllSchedulesLecturer)
router.get('/getStudentsOfSchedule/:scheduleId',attendanceController.getStudentsOfSchedule)
router.post('/startAttendance',attendanceController.startAttendance)
router.post('/stopAttendance/:sessionId',attendanceController.stopAttendance)
router.post('/sendAttendanceReport/:sessionId',attendanceController.sendAttendanceReport)
router.put('/updateAttendanceStatus/:attendanceId',attendanceController.updateAttendanceStatus)
export default router