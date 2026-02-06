import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js";
import generateMajorCode from "../../common/helpers/generateMajorCode.js";
import prisma from "../../common/prisma/initPrisma.js";
import validateMissingFields from "../../utils/validateFields.js"

export const majorService = {
    createMajor: async (data) => {
        validateMissingFields(data, ['name', 'facultyId'])

        const { name, facultyId } = data;

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên ngành không hợp lệ")
        }
        if (!Number.isInteger(Number(facultyId))) {
            throw new BadrequestException("Khoa không hợp lệ")
        }

        const [existingMajor, existingFaculty] = await Promise.all([
            prisma.major.findFirst({ where: { name: name.trim(), facultyId: Number(facultyId) } }),
            prisma.faculty.findUnique({ where: { id: Number(facultyId) } })
        ])

        if (existingMajor) {
            throw new ConflictException("Ngành này đã tồn tại ở khoa này")
        }
        if (!existingFaculty) {
            throw new NotFoundException("Khoa không tồn tại")
        }
        const baseCode = generateMajorCode(name)
        let majorCode = baseCode;
        let index = 1;
        while (await prisma.major.findUnique({ where: { code: majorCode } })) {
            majorCode = `${baseCode}-${index}`
            index++
        }
        const newMajor = await prisma.major.create({
            data: {
                name: name.trim(),
                facultyId: Number(facultyId),
                code: majorCode
            }
        })
        return {
            newMajor
        }
    },
    updateMajorInfo: async (majorId, data) => {
        validateMissingFields(data, ['name', 'facultyId'])
        const { name, facultyId } = data;

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên ngành không hợp lệ")
        }
        if (!Number.isInteger(Number(facultyId))) {
            throw new BadrequestException("Khoa không hợp lệ")
        }
        const [major, existingMajor, faculty] = await Promise.all([
            prisma.major.findUnique({ where: { id: Number(majorId) } }),
            prisma.major.findFirst({ where: { name: name.trim(), facultyId: Number(facultyId), NOT: { id: Number(majorId) } } }),
            prisma.faculty.findUnique({ where: { id: Number(facultyId) } })
        ])
        if (!major) {
            throw new NotFoundException("Ngành không tồn tại")
        }
        if (existingMajor) {
            throw new ConflictException("Ngành này đã tồn tại trong khoa này")
        }
        if (!faculty) {
            throw new NotFoundException("Khoa không tồn tại")
        }
        const updateMajorInfo = await prisma.major.update({
            where: { id: Number(majorId) },
            data: {
                name: name.trim(),
                facultyId: Number(facultyId)
            },

        })
        return {
            updateMajorInfo
        }
    },
    updateMajorStatus: async (majorId) => {
        const major = await prisma.major.findUnique({ where: { id: Number(majorId) } })
        if (!major) {
            throw new NotFoundException("Ngành không tồn tại")
        }
        const updateMajorStatus = await prisma.major.update({
            where: { id: Number(majorId) },
            data: {
                isActive: !major.isActive
            }
        })
        return {
            updateMajorStatus
        }
    },
    getAllMajors: async (majorName, facultyId, page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit;
        const whereCondition = {
            ...(majorName ? { name: { contains: majorName.toLowerCase() } } : {}),
            ...(facultyId ? { facultyId: Number(facultyId) } : {})

        }

        const [majors, totalMajors] = await Promise.all([
            prisma.major.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                select: {
                    id : true,
                    code : true,
                    name : true,
                    isActive : true,
                    faculty: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            isActive : true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.major.count({
                where: whereCondition
            })
        ])
        return {
            majors,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalMajors,
                totalPages: Math.ceil(totalMajors / limit)
            }
        }
    },
    getAllMajorsSimple: async () => {
        const majors = await prisma.major.findMany({
            where: { isActive: true },
            select : {
                id : true,
                name : true,
                faculty : {
                    select : {
                        id : true,
                        name : true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return {
            majors
        }
    }
}