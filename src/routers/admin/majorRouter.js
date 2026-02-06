import express from 'express'
import { majorController } from '../../controllers/admin/majorController.js'
const router = express.Router()

router.post('/createMajor', majorController.createMajor);
router.put('/updateMajorInfo/:majorId', majorController.updateMajorInfo)
router.put('/updateMajorStatus/:majorId', majorController.updateMajorStatus)
router.get('/getAllMajors', majorController.getAllMajors)
router.get('/getAllMajorsSimple', majorController.getAllMajorsSimple)

export default router;