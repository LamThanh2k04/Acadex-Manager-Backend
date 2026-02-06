import express from 'express'
import { buildingController } from '../../controllers/admin/buildingController.js'

const router = express.Router()

router.post('/createBuilding', buildingController.createBuilding)
router.put('/updateBuildingInfo/:buildingId', buildingController.updateBuildingInfo)
router.put('/updateBuildingStatus/:buildingId', buildingController.updateBuildingStatus)
router.get('/getAllBuildings',buildingController.getAllBuildings)
router.get('/getAllBuildingsSimple',buildingController.getAllBuildingsSimple)

export default router