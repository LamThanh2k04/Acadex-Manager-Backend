import express from 'express'
import { scheduleController } from '../../controllers/lecturer/scheduleController.js'

const router = express.Router()

router.get('/getAllScheduleLecturer',scheduleController.getAllScheduleLecturer)

export default router