import { BadrequestException,NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const semesterService = {
    createSemester: async (data) => {
        validateMissingFields(data, ['name', 'academicYear', 'startDate', 'endDate'])
        const { name, academicYear, startDate, endDate } = data
        const parsedStartDate = new Date(startDate)
        const parsedEndDate = new Date(endDate)
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên học kì không hợp lệ")
        }
        if (typeof academicYear !== 'string' || academicYear.trim() === '') {
            throw new BadrequestException("Tên niên khóa không hợp lệ")
        }
        if (isNaN(parsedStartDate.getTime())) {
            throw new BadrequestException("Thời gian bắt đầu không hợp lệ")
        }
        if (isNaN(parsedEndDate.getTime())) {
            throw new BadrequestException("Thời gian kết thúc không hợp lệ")
        }
        if (parsedStartDate >= parsedEndDate) {
            throw new BadrequestException('Ngày kết thúc phải sau ngày bắt đầu')
        }
        const overlappingSemester = await prisma.semester.findFirst({
            where: {
                AND: [
                    { startDate: { lt: parsedEndDate } },
                    { endDate: { gt: parsedStartDate } }
                ],
            }
        })
        if (overlappingSemester) {
            throw new BadrequestException("Thời gian học kì này trùng với học kì khác")
        }
        const newSemester = await prisma.semester.create({
            data: {
                name: name.trim(),
                academicYear: academicYear.trim(),
                startDate: parsedStartDate,
                endDate: parsedEndDate
            }
        })
        return {
            newSemester
        }
    },

    updateSemesterInfo: async (semesterId, data) => {
        validateMissingFields(data, ['name', 'academicYear', 'startDate', 'endDate'])
        const { name, academicYear, startDate, endDate } = data
        const parsedStartDate = new Date(startDate)
        const parsedEndDate = new Date(endDate)

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên học kì không hợp lệ")
        }
        if (typeof academicYear !== 'string' || academicYear.trim() === '') {
            throw new BadrequestException("Tên niên khóa không hợp lệ")
        }
        if (isNaN(parsedStartDate.getTime())) {
            throw new BadrequestException("Thời gian bắt đầu không hợp lệ")
        }
        if (isNaN(parsedEndDate.getTime())) {
            throw new BadrequestException("Thời gian kết thúc không hợp lệ")
        }
        if (parsedStartDate >= parsedEndDate) {
            throw new BadrequestException('Ngày kết thúc phải sau ngày bắt đầu')
        }

        const [semester, overlappingSemester] = await Promise.all([
            prisma.semester.findUnique({ where: { id: Number(semesterId) } }),
            prisma.semester.findFirst({
                where: {
                    NOT: { id: Number(semesterId) },
                    AND: [
                        { startDate: { lt: parsedEndDate } },
                        { endDate: { gt: parsedStartDate } },
                    ]
                },
            })
        ])
        if (!semester) {
            throw new NotFoundException("Không tìm thấy học kì này")
        }
        if (overlappingSemester) {
            throw new BadrequestException("Thời gian học kì này trùng với học kì khác")
        }

        const updateSemesterInfo = await prisma.semester.update({
            where: { id: Number(semesterId) },
            data: {
                name: name.trim(),
                academicYear: academicYear.trim(),
                startDate: parsedStartDate,
                endDate: parsedEndDate
            }
        })
        return {
            updateSemesterInfo
        }
    },
    updateSemesterStatus: async (semesterId) => {
        const semester = await prisma.semester.findUnique({
            where: { id: Number(semesterId) }
        })
        if (!semester) {
            throw new NotFoundException("Không tìm thấy học kì này")
        }
        const updateSemesterStatus = await prisma.semester.update({
            where: { id: Number(semesterId) },
            data: {
                isActive: !semester.isActive
            }
        })
        return {
            updateSemesterStatus
        }
    },
    getAllSemesters: async (semesterName, semesterYear, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(semesterName ? { name: { contains: semesterName.toLowerCase() } } : {}),
            ...(semesterYear ? { academicYear: { contains: semesterYear.toLowerCase() } } : {})
        }

        const [semesters, totalSemesters] = await Promise.all([
            prisma.semester.findMany({
                where : whereCondition,
                take : limit,
                skip : skip,
                orderBy : {createdAt : 'desc'}
            }),
            prisma.semester.count({
                where : whereCondition
            })
        ])
        return {
            semesters,
            pagination : {
                page : Number(page),
                limit : limit,
                total : totalSemesters,
                totalPages: Math.ceil(totalSemesters/limit)
            }
        }
    },
    getAllSemestersSimple : async () => {
        const semesters = await prisma.semester.findMany({
            where : {isActive : true},
            orderBy : {createdAt : 'desc'},
            select : {
                id : true,
                name: true,
                academicYear : true,
            }
        })
        return {
            semesters
        }
    }


}