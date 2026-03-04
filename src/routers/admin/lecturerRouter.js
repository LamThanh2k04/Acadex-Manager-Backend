import express from 'express'
import { upload } from '../../common/cloudinary/initCloudinary.js'
import { lecturerController } from '../../controllers/admin/lecturerController.js'
const router = express.Router()

router.post('/createLecturer', upload.single('avatar'), lecturerController.createLecturer)
router.put('/updateLecturerInfo/:lecturerId', upload.single('avatar'), lecturerController.updateLecturerInfo)
router.put('/updateLecturerStatusActive/:lecturerId', lecturerController.updateLecturerStatusActive)
router.get('/getAllLecturers', lecturerController.getAllLecturers)
router.get('/getAllLecturersSimple', lecturerController.getAllLecturersSimple)
router.put('/resetPasswordLecturer/:lecturerId', lecturerController.resetPasswordLecturer)
router.get('/getlecturersByFaculty/:facultyId', lecturerController.getlecturersByFaculty)
router.get('/getAllRequestPauseLecturers', lecturerController.getAllRequestPauseLecturers)
router.get('/getInfoPauseLecturer/:requestLecturerId', lecturerController.getInfoPauseLecturer)
router.put('/approveRequestPauseLecturer/:requestLecturerId', lecturerController.approveRequestPauseLecturer)
router.put('/rejectRequestPauseLecturer/:requestLecturerId', lecturerController.rejectRequestPauseLecturer)
router.get('/getAllRequestChangeGradeLecturers', lecturerController.getAllRequestChangeGradeLecturers)
router.get('/getInfoRequestChangeGradeLecturer/:requestLecturerId', lecturerController.getInfoRequestChangeGradeLecturer)
router.put('/approveRequestChangeGradeLecturer/:requestLecturerId', lecturerController.approveRequestChangeGradeLecturer)
router.put('/rejectRequestChangeGradeLecturer/:requestLecturerId', lecturerController.rejectRequestChangeGradeLecturer)
router.get('/getOverViewLecturer', lecturerController.getOverViewLecturer)
export default router