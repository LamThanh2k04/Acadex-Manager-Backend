import express from 'express'
import { courseSectionController } from '../../controllers/admin/courseSectionController.js'

const router = express.Router()

router.post('/createCourseSection',courseSectionController.createCourseSection)
router.put('/updateCourseSectionInfo/:courseSectionId',courseSectionController.updateCourseSectionInfo)
router.put('/updateCourseSectionStatus/:courseSectionId',courseSectionController.updateCourseSectionStatus)
router.get('/getAllCourseSections',courseSectionController.getAllCourseSections)
router.get('/getCourseSectionBySemester/:semesterId',courseSectionController.getCourseSectionBySemester)
export default router