import express from 'express'
import { subjectController } from '../../controllers/admin/subjectController.js'

const router = express.Router()

router.post('/createSubject',subjectController.createSubject)
router.put('/updateSubjectInfo/:subjectId',subjectController.updateSubjectInfo)
router.put('/updateSubjectStatus/:subjectId',subjectController.updateSubjectStatus)
router.get('/getAllSubjects',subjectController.getAllSubjects)
router.get('/getAllSubjectsSimple',subjectController.getAllSubjectsSimple)

export default router