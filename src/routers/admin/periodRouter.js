import express from 'express'
import { periodController } from '../../controllers/admin/periodController.js'

const router = express.Router()

router.post('/createPeriod',periodController.createPeriod)
router.put('/updatePeriodInfo/:periodId',periodController.updatePeriodInfo)
router.put('/updatePeriodStatus/:periodId',periodController.updatePeriodStatus)
router.get('/getAllPeriods',periodController.getAllPeriods)
router.get('/getAllPeriodsSimple',periodController.getAllPeriodsSimple)

export default router
