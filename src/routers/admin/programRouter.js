import express from 'express'
import { programController } from '../../controllers/admin/programController.js'

const router = express.Router()

router.post('/createProgram',programController.createProgram)
router.put('/updateProgramInfo/:programId',programController.updateProgramInfo)
router.put('/updateProgramStatus/:programId',programController.updateProgramStatus)
router.get('/getAllPrograms',programController.getAllPrograms)
router.get('/getAllProgramsSimple',programController.getAllProgramsSimple)

export default router