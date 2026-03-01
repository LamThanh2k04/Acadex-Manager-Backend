import express from 'express'
import { curriculumFrameworkController } from '../../controllers/student/curriculumFrameworkController.js'

const router = express.Router()

router.get('/getSemesterOrderProgram',curriculumFrameworkController.getSemesterOrderProgram)
router.get('/getSubjectsBySemesterOrderProgram/:semesterOrder',curriculumFrameworkController.getSubjectsBySemesterOrderProgram)
export default router