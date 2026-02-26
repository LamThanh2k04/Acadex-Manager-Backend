import express from 'express'
import { dashboardController } from '../../controllers/admin/dashboardController.js'

const router = express.Router()

router.get('/getOverView',dashboardController.getOverView)
router.get('/getGenders',dashboardController.getGenders)
router.get('/getPassFailStatus',dashboardController.getPassFailStatus)
router.get('/getTopStudentGpa',dashboardController.getTopStudentGpa)
router.get('/getLineChartRevenueLineChart',dashboardController.getLineChartRevenueLineChart)

export default router