import express from 'express'
import { dashboardController } from '../../controllers/student/dashboardController.js'

const router = express.Router()

router.get('/getInfoStudent',dashboardController.getInfoStudent)
router.get('/getAllSemestersSimple',dashboardController.getAllSemestersSimple)
router.get('/getAllEnrollmentBySemester/:semesterId',dashboardController.getAllEnrollmentBySemester)
router.get('/getTotalScoresForChart/:semesterId',dashboardController.getTotalScoresForChart)
router.get('/getResultsIsStudyCredits',dashboardController.getResultsIsStudyCredits)

export default router
