import express from 'express'
import { courseSectionController } from '../../controllers/student/courseSectionController.js'

const router = express.Router()

router.get('/getAllSemesters',courseSectionController.getAllSemesters)
router.get('/getSubjectsBySemester/:semesterId',courseSectionController.getSubjectsBySemester)
router.get('/getCourseSectionsBySubject/:subjectId/semester/:semesterId',courseSectionController.getCourseSectionsBySubject)
router.get('/getScheduleByCourseSection/:courseSectionId',courseSectionController.getScheduleByCourseSection)
router.post('/registerCourseSection',courseSectionController.registerCourseSection)
router.post('/cancelCourseSection/:enrollmentId',courseSectionController.cancelCourseSection)
router.get('/getAllEnrollmentCourseSection',courseSectionController.getAllEnrollmentCourseSection)
export default router