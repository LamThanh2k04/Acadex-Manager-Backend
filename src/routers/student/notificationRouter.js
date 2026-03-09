import express from 'express'
import { notificationController } from '../../controllers/student/notificationController.js'

const router = express.Router()

router.get('/getAllNotifications',notificationController.getAllNotifications)

export default router