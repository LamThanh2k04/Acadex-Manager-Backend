import express from 'express'
import { courseSectionController } from '../../controllers/lecturer/courseSectionController.js'

const router = express.Router()

// router.get('/getAllSemestersSimple',courseSectionController.getAllSemestersSimple)
// router.get('/getSubjectsBySemester/:semesterId',courseSectionController.getSubjectsBySemester)
// router.get('/getAllCourseSectionsBySubject/:subjectId',courseSectionController.getAllCourseSectionsBySubject)
router.get('/getAllStudentEnrollmentIsPaid/:courseSectionId',courseSectionController.getAllStudentEnrollmentIsPaid)
router.get('/getAllCourseSectionLecturer',courseSectionController.getAllCourseSectionLecturer)
export default router