import express from 'express'
import { attendanceController } from '../../controllers/admin/attendanceController.js'

const router = express.Router()

router.get('/getAllAttendances',attendanceController.getAllAttendances)
router.get('/getInfoAttendancesSession/:attendanceId',attendanceController.getInfoAttendancesSession)
export default router