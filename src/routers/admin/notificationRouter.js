import express from 'express'
import { notificationController } from '../../controllers/admin/notificationController.js'

const router = express.Router()

router.get('/getStudentsBySearch',notificationController.getStudentsBySearch)
router.post('/sendNotification',notificationController.sendNotification)
router.put('/updateNotification/:notificationId',notificationController.updateNotification)
router.get('/getAllNotifications',notificationController.getAllNotifications)
router.delete('/removeNotification/:notificationId',notificationController.removeNotification)
export default router