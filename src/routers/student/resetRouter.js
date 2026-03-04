import express from 'express'
import { resetController } from '../../controllers/student/resetController.js'

const router = express.Router()

router.put('/resetPassword',resetController.resetPassword)
export default router