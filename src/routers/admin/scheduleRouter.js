import express from 'express'
import { scheduleController } from '../../controllers/admin/scheduleController.js'

const router = express.Router()

router.post('/createSchedule',scheduleController.createSchedule)
router.put('/updateScheduleInfo/:scheduleId',scheduleController.updateScheduleInfo)
router.put('/updateScheduleStatus/:scheduleId',scheduleController.updateScheduleStatus)
router.get('/getAllSchedules',scheduleController.getAllSchedules)

export default router