import express from 'express'
import { gradeController } from '../../controllers/lecturer/gradeController.js'

const router = express.Router()

router.post('/confirmGrades',gradeController.confirmGrades)

export default router