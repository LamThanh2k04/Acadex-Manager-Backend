import express from 'express'
import { courseSectionController } from '../../controllers/student/courseSectionController.js'

const router = express.Router()

router.get('/getAllSemestersSimple',courseSectionController.getAllSemestersSimple)
router.get('/getSubjectsBySemester/:semesterId',courseSectionController.getSubjectsBySemester)
router.get('/getCourseSectionsBySubject/:subjectId/semester/:semesterId',courseSectionController.getCourseSectionsBySubject)
router.get('/getScheduleByCourseSection/:courseSectionId',courseSectionController.getScheduleByCourseSection)
router.post('/registerCourseSection',courseSectionController.registerCourseSection)
router.post('/cancelCourseSection/:enrollmentId',courseSectionController.cancelCourseSection)
router.get('/getAllEnrollmentCourseSection/:semesterId',courseSectionController.getAllEnrollmentCourseSection)
router.get('/getAllSchedulesByCourseSectionRegister/:courseSectionId',courseSectionController.getAllSchedulesByCourseSectionRegister)
export default router