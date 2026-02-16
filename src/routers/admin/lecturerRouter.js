import express from 'express'
import { upload } from '../../common/cloudinary/initCloudinary.js'
import { lecturerController } from '../../controllers/admin/lecturerController.js'
const router = express.Router()

router.post('/createLecturer', upload.single('avatar'), lecturerController.createLecturer)
router.put('/updateLecturerInfo/:lecturerId', upload.single('avatar'), lecturerController.updateLecturerInfo)
router.put('/updateLecturerStatus/:lecturerId', lecturerController.updateLecturerStatus)
router.get('/getAllLecturers', lecturerController.getAllLecturers)
router.get('/getAllLecturersSimple', lecturerController.getAllLecturersSimple)
export default router