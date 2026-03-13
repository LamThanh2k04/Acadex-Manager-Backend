import express from 'express'
import { reportController } from '../../controllers/admin/reportController.js'

const router = express.Router()

router.get('/exportDashboard',reportController.exportDashboard)

export default router