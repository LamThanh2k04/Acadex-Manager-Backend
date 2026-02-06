import { responseSuccess } from "../../common/helpers/response.helper.js";
import { facultyService } from "../../services/admin/facultyService.js"

export const facultyController = {
    createFaculty: async (req, res, next) => {
        try {
            const data = await facultyService.createFaculty(req.body);
            const response = responseSuccess(data, "Tạo khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo khoa thất bại", err)
            next(err)
        }
    },
    updateFacultyInfo: async (req, res, next) => {
        try {
            const facultyId = req.params.facultyId;
            const data = await facultyService.updateFacultyInfo(facultyId, req.body);
            const response = responseSuccess(data, "Cập nhật thông tin khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật thông tin khoa thất bại", err)
            next(err)
        }
    },
    updateFacultyStatus: async (req, res, next) => {
        try {
            const facultyId = req.params.facultyId;
            const data = await facultyService.updateFacultyStatus(facultyId);
            const response = responseSuccess(data, "Cập nhật trạng thái khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật trạng thái khoa thất bại", err)
            next(err)
        }
    },
    getAllFaculties: async (req, res, next) => {
        try {
            const facultyName = req.query.facultyName || "";
            const page = req.query.page || 1;
            const data = await facultyService.getAllFaculties(facultyName, page);
            const response = responseSuccess(data, "Lấy danh sách khoa có phân trang thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khoa có phân trang thất bại", err)
            next(err)
        }
    },
    getAllFacultiesSimple: async (req,res,next) => {
        try {
            const data = await facultyService.getAllFacultiesSimple();
             const response = responseSuccess(data, "Lấy danh sách khoa thành công")
        res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khoa thất bại", err)
            next(err)
        }
    }
}