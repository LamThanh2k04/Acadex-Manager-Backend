import express from 'express'
import { classController } from '../../controllers/admin/classController.js'

const router = express.Router()

router.post('/createClass', classController.createClass)
router.put('/updateClassInfo/:classId', classController.updateClassInfo)
router.put('/updateClassStatus/:classId', classController.updateClassStatus)
router.get('/getAllClasses', classController.getAllClasses)
router.get('/getAllClassesSimple', classController.getAllClassesSimple)

export default router