import express from 'express'
import { roomController } from '../../controllers/admin/roomController.js'

const router = express.Router()

router.post('/createRoom', roomController.createRoom)
router.put('/updateRoomInfo/:roomId', roomController.updateRoomInfo)
router.put('/updateRoomStatus/:roomId', roomController.updateRoomStatus)
router.get('/getAllRooms',roomController.getAllRooms)
router.get('/getAllRoomsSimple',roomController.getAllRoomsSimple)
export default router