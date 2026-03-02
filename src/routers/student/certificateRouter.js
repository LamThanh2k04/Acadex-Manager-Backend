import express from 'express'
import { certificateController } from '../../controllers/student/certificateController.js'
import { upload } from '../../common/cloudinary/initCloudinary.js'

const router = express.Router()

router.get('/getAllCertificatesSimpleProgram',certificateController.getAllCertificatesSimpleProgram)
router.get('/getCertificatesProgram',certificateController.getCertificatesProgram)
router.post('/submitCertificate',upload.single('imageCertificate'),certificateController.submitCertificate)
router.get('/getAllCertificatesStudent',certificateController.getAllCertificatesStudent)

export default router