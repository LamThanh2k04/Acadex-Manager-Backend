import express from 'express';
import facultyRouter from '../admin/facultyRouter.js'
import majorRouter from '../admin/majorRouter.js'
import buildingRouter from '../admin/buildingRouter.js'
import roomRouter from '../admin/roomRouter.js'
import subjectRouter from '../admin/subjectRouter.js'
import semesterRouter from '../admin/semesterRouter.js'
import periodRouter from '../admin/periodRouter.js'
const router = express.Router();

router.use('/faculty', facultyRouter);
router.use('/major',majorRouter)
router.use('/building',buildingRouter)
router.use('/room',roomRouter)
router.use('/subject',subjectRouter)
router.use('/semester', semesterRouter)
router.use('/period',periodRouter)
export default router;