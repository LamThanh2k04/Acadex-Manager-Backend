import { responseSuccess } from "../../common/helpers/response.helper.js"
import { roomService } from "../../services/admin/roomService.js"

export const roomController = {
    createRoom: async (req, res, next) => {
        try {
            const data = await roomService.createRoom(req.body)
            const response = responseSuccess(data, "Tạo phòng thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo phòng thất bại",err)
            next(err)
        }
    },
    updateRoomInfo: async (req, res, next) => {
        try {
            const roomId = req.params.roomId
            const data = await roomService.updateRoomInfo(roomId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin phòng thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin phòng thất bại",err)
            next(err)
        }
    },
    updateRoomStatus: async (req, res, next) => {
        try {
            const roomId = req.params.roomId
            const data = await roomService.updateRoomStatus(roomId)
            const response = responseSuccess(data, "Cập nhật trạng thái phòng thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái phòng thất bại",err)
            next(err)
        }
    },
    getAllRooms: async (req, res, next) => {
        try {
            const roomName = req.query.roomName || ""
            const buildingId = req.query.buildingId
            const page = req.query.page || 1
            const data = await roomService.getAllRooms(roomName, buildingId, page)
            const response = responseSuccess(data, "Lấy danh sách phòng có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách phòng có phân trang thất bại",err)
            next(err)
        }
    },
    getAllRoomsSimple: async (req, res, next) => {
        try {
            const data = await roomService.getAllRoomsSimple()
            const response = responseSuccess(data, "Lấy danh sách phòng thành công",err)
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách phòng thất bại")
            next(err)
        }
    },
}