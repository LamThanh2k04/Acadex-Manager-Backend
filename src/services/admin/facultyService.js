import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js";
import generateFacultyCode from "../../common/helpers/generateFacultyCode.js";
import prisma from "../../common/prisma/initPrisma.js";
import validateMissingFields from "../../utils/validateFields.js";

export const facultyService = {
    createFaculty: async (data) => {
        validateMissingFields(data, ['name'])
        const { name } = data;
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên khoa không hợp lệ")
        }

        const existingFaculty = await prisma.faculty.findFirst({ where: { name: name.trim() } })
        if (existingFaculty) {
            throw new ConflictException("Khoa này đã tồn tại")
        }
        const baseCode = generateFacultyCode(name.trim())
        let facultyCode = baseCode;
        let index = 1;
        while (await prisma.faculty.findUnique({ where: { code: facultyCode } })) {
            facultyCode = `${baseCode}-${index}`
            index++
        }
        const newFaculty = await prisma.faculty.create({
            data: {
                name: name.trim(),
                code: facultyCode
            }
        })
        return {
            newFaculty
        }
    },
    updateFacultyInfo: async (facultyId, data) => {
        validateMissingFields(data, ['name'])
        const { name } = data;
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên khoa không hợp lệ")
        }

        const [faculty,existingFaculty] = await Promise.all([
            prisma.faculty.findUnique({ where: { id: Number(facultyId) } }),
            prisma.faculty.findFirst({
                where: {
                    name: name.trim(),
                    NOT: {
                        id: Number(facultyId)
                    }
                }
            }),
        ])
        if (!faculty) {
            throw new NotFoundException("Khoa không tồn tại")
        }
        if (existingFaculty) {
            throw new ConflictException("Khoa này đã tồn tại")
        }
        const updateFacultyInfo = await prisma.faculty.update({
            where: { id: Number(facultyId) },
            data: {
                name: name.trim()
            }
        })
        return {
            updateFacultyInfo
        }
    },
    updateFacultyStatus: async (facultyId) => {
        const faculty = await prisma.faculty.findUnique({ where: { id: Number(facultyId) } })
        if (!faculty) {
            throw new NotFoundException("Khoa không tồn tại")
        }
        const updateFacultyStatus = await prisma.faculty.update({
            where: { id: Number(facultyId) },
            data: {
                isActive: !faculty.isActive
            }
        })
        return {
            updateFacultyStatus
        }

    },
    getAllFaculties: async (facultyName, page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit;
        const whereCondition = { ...(facultyName ? { name: { contains: facultyName.toLowerCase() } } : {}) }

        const [faculties, totalFaculties] = await Promise.all([
            prisma.faculty.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.faculty.count({
                where: whereCondition
            })
        ])
        return {
            faculties,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalFaculties,
                totalPages: Math.ceil(totalFaculties / limit)
            }
        }
    },
    getAllFacultiesSimple: async () => {
        const faculties = await prisma.faculty.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                code: true,
                name: true
            }
        })
        return {
            faculties
        }
    }
}
