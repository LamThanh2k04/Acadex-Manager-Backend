import { ForbiddenException } from "../helpers/exception.helper.js";

export const validateAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        throw new ForbiddenException("Chỉ ADMIN mới có quyền truy cập tài nguyên này");
    }
    next()
}

export const validateLecturer = (req, res, next) => {
    if (req.user.role !== 'LECTURER') {
        throw new ForbiddenException("Chỉ LECTURER mới có quyền truy cập tài nguyên này");
    }
    next()
}

export const validateStudent = (req, res, next) => {
    if (req.user.role !== 'STUDENT') {
        throw new ForbiddenException("Chỉ STUDENT mới có quyền truy cập tài nguyên này");
    }
    next()
}