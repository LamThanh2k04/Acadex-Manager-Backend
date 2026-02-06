import express from 'express';
import { facultyController } from '../../controllers/admin/facultyController.js';

const router = express.Router();

router.post('/createFaculty', facultyController.createFaculty);
router.put('/updateFacultyInfo/:facultyId',facultyController.updateFacultyInfo);
router.put('/updateFacultyStatus/:facultyId',facultyController.updateFacultyStatus);
router.get('/getAllFaculties',facultyController.getAllFaculties)
router.get('/getAllFacultiesSimple',facultyController.getAllFacultiesSimple)

export default router;
