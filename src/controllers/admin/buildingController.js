import { responseSuccess } from "../../common/helpers/response.helper.js"
import { buildingService } from "../../services/admin/buildingService.js"

export const buildingController = {
    createBuilding: async (req, res, next) => {
        try {
            const data = await buildingService.createBuilding(req.body)
            const response = responseSuccess(data, "Tạo cơ sở thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo cơ sở thất bại",err)
            next(err)
        }
    },
    updateBuildingInfo: async (req, res, next) => {
        try {
            const buildingId = req.params.buildingId
            const data = await buildingService.updateBuildingInfo(buildingId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin cơ sở thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin cơ sở thất bại",err)
            next(err)
        }
    },
    updateBuildingStatus: async (req, res, next) => {
        try {
            const buildingId = req.params.buildingId
            const data = await buildingService.updateBuildingStatus(buildingId)
            const response = responseSuccess(data, "Cập nhật trạng thái cơ sở thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái cơ sở thất bại",err)
            next(err)
        }
    },
    getAllBuildings: async (req, res, next) => {
        try {
            const buildingName = req.query.buildingName || ""
            const buildingLocation = req.query.buildingLocation || ""
            const page = req.query.page || 1
            const data = await buildingService.getAllBuildings(buildingName, buildingLocation, page)
            const response = responseSuccess(data, "Lấy danh sách cơ sở có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách cơ sở có phân trang thất bại",err)
            next(err)
        }
    },
    getAllBuildingsSimple: async (req, res, next) => {
        try {
            const data = await buildingService.getAllBuildingsSimple()
            const response = responseSuccess(data, "Lấy danh sách cơ sở thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách cơ sở thất bại",err)
            next(err)
        }
    }

}