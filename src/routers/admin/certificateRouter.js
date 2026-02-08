import express from 'express'
import { certificateController } from '../../controllers/admin/certificateController.js'

const router = express.Router()

router.post("/createCertificate", certificateController.createCertificate)
router.put('/updateCertificateInfo/:certificateId', certificateController.updateCertificateInfo)
router.put('/updateCertificateStatus/:certificateId', certificateController.updateCertificateStatus)
router.get('/getAllCertificates', certificateController.getAllCertificates)
router.get('/getAllCertificatesSimples', certificateController.getAllCertificatesSimple)

export default router