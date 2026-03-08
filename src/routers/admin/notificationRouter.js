import express from 'express'
import { notificationController } from '../../controllers/admin/notificationController.js'

const router = express.Router()

router.get('/getStudentsBySearch',notificationController.getStudentsBySearch)
router.post('/sendNotification',notificationController.sendNotification)

export default router