import express from 'express'
import { aiController } from '../../controllers/student/aiController.js'

const router = express.Router()

router.post('/aiMessage',aiController.aiMessage)

export default router
