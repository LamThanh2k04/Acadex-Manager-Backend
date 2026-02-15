import express from 'express'
import { programController } from '../../controllers/admin/programController.js'

const router = express.Router()

router.post('/createProgram',programController.createProgram)
router.put('/updateProgramInfo/:programId',programController.updateProgramInfo)
router.put('/updateProgramStatus/:programId',programController.updateProgramStatus)
router.get('/getAllPrograms',programController.getAllPrograms)
router.get('/getAllProgramsSimple',programController.getAllProgramsSimple)
router.get('/getProgramInfo/:programId',programController.getProgramInfo)
router.post('/addSubjectToProgram/:programId',programController.addSubjectToProgram)
router.put('/updateSubjectToProgram/:programSubjectId',programController.updateSubjectToProgram)
router.post('/addCertificateToProgram/:programId',programController.addCertificateToProgram)
router.put('/updateCertificateToProgram/:programCertificateId',programController.updateCertificateToProgram)
router.get('/getSemesterOrdersPrgram/:programId',programController.getSemesterOrdersPrgram)
router.get('/getSubjectsBySemesterOrder/:programId/semesterOrder/:semesterOrderId',programController.getSubjectsBySemesterOrder)
export default router