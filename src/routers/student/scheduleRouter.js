import express from 'express'

import { scheduleController } from '../../controllers/student/scheduleController.js'

const router = express.Router()

router.get('/getAllScheduleEnrollment',scheduleController.getAllScheduleEnrollment)

export default router