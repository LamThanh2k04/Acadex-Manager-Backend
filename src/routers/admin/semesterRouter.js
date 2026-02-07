import express from 'express'
import { semesterController } from '../../controllers/admin/semesterController.js'

const router = express.Router()

router.post('/createSemester',semesterController.createSemester)
router.put('/updateSemesterInfo/:semesterId',semesterController.updateSemesterInfo)
router.put('/updateSemesterStatus/:semesterId',semesterController.updateSemesterStatus)
router.get('/getAllSemesters',semesterController.getAllSemesters)
router.get('/getAllSemestersSimple',semesterController.getAllSemestersSimple)
export default router