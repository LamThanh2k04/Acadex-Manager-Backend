import express from 'express'
import { attendanceController } from '../../controllers/student/attendanceController.js'

const router = express.Router()

router.get('/studentCheckIn',attendanceController.studentCheckIn)
router.get('/getSchedulesStudent',attendanceController.getSchedulesStudent)
router.get('/getAllSemestersSimple',attendanceController.getAllSemestersSimple)
router.get('/getAbsentBySemester/:semesterId',attendanceController.getAbsentBySemester)
router.get('/getTotalabsent',attendanceController.getTotalabsent)

export default router