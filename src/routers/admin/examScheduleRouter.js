import express from 'express'
import { examScheduleController } from '../../controllers/admin/examScheduleController.js'

const router = express.Router()

router.get('/getAvailableRooms', examScheduleController.getAvailableRooms)
router.get('/getCourseSectionHaveSchedule/:semesterId', examScheduleController.getCourseSectionHaveSchedule)
router.get('/suggestExamSchedule/:courseSectionId', examScheduleController.suggestExamSchedule)
router.post('/createExamSchedule', examScheduleController.createExamSchedule)
router.put('/updateExamScheduleInfo/:examScheduleId', examScheduleController.updateExamScheduleInfo)
router.put('/updateExamScheduleStatus/:examScheduleId', examScheduleController.updateExamScheduleStatus)
router.get('/getAllExamSchedules', examScheduleController.getAllExamSchedules)

export default router