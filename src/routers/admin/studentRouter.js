import express from 'express'
import { studentController } from '../../controllers/admin/studentController.js'
import { upload } from '../../common/cloudinary/initCloudinary.js'

const router = express.Router()

router.post('/createStudent', upload.single('avatar'), studentController.createStudent)
router.post('/updateStudentInfo/:studentId', upload.single('avatar'), studentController.updateStudentInfo)
router.put('/updateStudentStatusActive/:studentId', studentController.updateStudentStatusActive)
router.get('/getAllStudents', studentController.getAllStudents)
router.put('/resetPasswordStudent/:studentId', studentController.resetPasswordStudent)
export default router