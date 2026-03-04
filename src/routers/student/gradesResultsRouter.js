import express from 'express'
import { gradesResultsController } from '../../controllers/student/gradesResultsController.js'

const router = express.Router()

router.get('/getDetailedStudyResults',gradesResultsController.getDetailedStudyResults)

export default router