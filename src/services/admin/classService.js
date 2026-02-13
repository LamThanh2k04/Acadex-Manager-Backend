import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const classService = {
    createClass: async (data) => {
        validateMissingFields(data, ['name', 'majorId'])
        const { name, majorId, homeroomLecturerId } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên lớp không hợp lệ")
        }
        if (!Number.isInteger(Number(majorId))) {
            throw new BadrequestException('MajorId không hợp lệ')
        }
        if (homeroomLecturerId !== null && homeroomLecturerId !== undefined) {

            if (!Number.isInteger(Number(homeroomLecturerId))) {
                throw new BadrequestException("Giảng viên không hợp lệ")
            }

            const lecturer = await prisma.lecturer.findUnique({
                where: { id: Number(homeroomLecturerId) }
            })

            if (!lecturer) {
                throw new NotFoundException("Không tìm thấy giảng viên")
            }

            if (lecturer.majorId && lecturer.majorId !== Number(majorId)) {
                throw new BadrequestException(
                    "Giảng viên không thuộc ngành này"
                )
            }
        }
        const existingClassName = await prisma.class.findFirst({
            where: { name: name.trim(), majorId: Number(majorId) }
        })
        if (existingClassName) {
            throw new ConflictException("Đã tồn tại lớp học ở ngành này")
        }
        const createClass = await prisma.class.create({
            data: {
                name: name.trim(),
                majorId: Number(majorId),
                homeroomLecturerId: homeroomLecturerId ? Number(homeroomLecturerId) : null
            }
        })
        return {
            createClass
        }
    },
    updateClassInfo: async (classId, data) => {
        validateMissingFields(data, ['name', 'majorId'])
        const { name, majorId, homeroomLecturerId } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên lớp không hợp lệ")
        }
        if (!Number.isInteger(Number(majorId))) {
            throw new BadrequestException('MajorId không hợp lệ')
        }
        const major = await prisma.major.findUnique({
            where: { id: Number(majorId) }
        })
        if (!major) {
            throw new NotFoundException("Không tìm thấy ngành")
        }
        if (homeroomLecturerId !== null && homeroomLecturerId !== undefined) {

            if (!Number.isInteger(Number(homeroomLecturerId))) {
                throw new BadrequestException("Giảng viên không hợp lệ")
            }

            const lecturer = await prisma.lecturer.findUnique({
                where: { id: Number(homeroomLecturerId) }
            })

            if (!lecturer) {
                throw new NotFoundException("Không tìm thấy giảng viên")
            }

            if (lecturer.majorId && lecturer.majorId !== Number(majorId)) {
                throw new BadrequestException(
                    "Giảng viên không thuộc ngành này"
                )
            }
        }
        const existingClassName = await prisma.class.findFirst({
            where: { name: name.trim(), majorId: Number(majorId), NOT: { id: Number(classId) } }
        })
        if (existingClassName) {
            throw new ConflictException("Đã tồn tại lớp học ở ngành này")
        }

        const updateClassInfo = await prisma.class.update({
            where: { id: Number(classId) },
            data: {
                name: name.trim(),
                majorId: Number(majorId),
                homeroomLecturerId: homeroomLecturerId ? Number(homeroomLecturerId) : null
            }
        })
        return {
            updateClassInfo
        }
    },
    updateClassStatus: async (classId) => {
        const [cls, hasStudent] = await Promise.all([
            prisma.class.findUnique({ where: { id: Number(classId) } }),
            prisma.student.findFirst({ where: { classId: Number(classId) } })
        ])
        if (!cls) {
            throw new NotFoundException("Không tìm thấy lớp học")
        }
        if (hasStudent) {
            throw new BadrequestException("Không thể tắt vì lớp còn sinh viên")
        }
        const updateClassStatus = await prisma.class.update({
            where: { id: Number(classId) },
            data: {
                isActive: !cls.isActive
            }
        })
        return {
            updateClassStatus
        }
    },
    getAllClasses: async (className, majorName, homeroomLecturerName, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(className ? { name: { contains: className.toLowerCase() } } : {}),
            ...(majorName ? {
                major: {
                    name: { contains: majorName.toLowerCase() }
                }
            } : {}),
            ...(homeroomLecturerName ? {
                lecturer: {
                    user: {
                        fullName: { contains: homeroomLecturerName.toLowerCase() }
                    }
                }
            } : {}),
        }
        const [classes, totalClasses] = await Promise.all([
            prisma.class.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                    major: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    homeroomLecturer: {
                        id: true,
                        select: {
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    }
                },
            }),
            prisma.class.count({
                where: whereCondition
            })
        ])
        return {
            classes,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalClasses,
                totalPage: Math.ceil(totalClasses / limit)
            }
        }

    },
    getAllClassesSimple: async () => {
        const classes = await prisma.class.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                major: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                homeroomLecturer: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            },
        })
        return {
            classes
        }
    }
}