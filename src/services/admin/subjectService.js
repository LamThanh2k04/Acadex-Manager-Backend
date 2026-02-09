import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import generateSubjectCode from "../../common/helpers/generateSubjectCode.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"


export const subjectService = {
    createSubject: async (data) => {
        validateMissingFields(data, ['name', 'credits', 'theoryPeriods', 'practicePeriods', 'countToGpa'])
        const { name, credits, theoryPeriods, practicePeriods, countToGpa } = data

        if (typeof name !== 'string' || name.trim() === "") {
            throw new BadrequestException("Tên môn không hợp lệ")
        }
        if (!Number.isInteger(Number(credits))) {
            throw new BadrequestException("Số tín chỉ không hợp lệ")
        }
        if (!Number.isInteger(Number(theoryPeriods)) || Number(theoryPeriods) < 0) {
            throw new BadrequestException("Số tiết lý thuyết không hợp lệ")
        }
        if (!Number.isInteger(Number(practicePeriods)) || Number(practicePeriods) < 0) {
            throw new BadrequestException("Số tiết thực hành không hợp lệ")
        }
        if (typeof countToGpa !== 'boolean') {
            throw new BadrequestException("Trạng thái có tính điểm GPA không hợp lệ")
        }
        const periodTime = await prisma.periodSetting.findFirst()
        if (!periodTime) {
            throw new BadrequestException("Chưa cấu hình thời gian tiết")
        }
        const minutesPerPeriod = periodTime.endTime - periodTime.startTime
        if (minutesPerPeriod <= 0) {
            throw new BadrequestException("Cấu hình thời gian tiết không hợp lệ")
        }
        const theoryMinutes = Number(theoryPeriods) * minutesPerPeriod
        const practiceMinutes = Number(practicePeriods) * minutesPerPeriod
        const existingName = await prisma.subject.findFirst({
            where: { name: name.trim() }
        })
        if (existingName) {
            throw new ConflictException("Đã tồn tại tên môn học này")
        }
        const code = await generateSubjectCode()

        const newSubject = await prisma.subject.create({
            data: {
                code: code,
                name: name.trim(),
                credits: credits,
                theoryMinutes: theoryMinutes,
                practiceMinutes: practiceMinutes,
                countToGpa: countToGpa
            }
        })
        return {
            newSubject
        }
    },
    updateSubjectInfo: async (subjectId, data) => {
        validateMissingFields(data, ['name', 'credits', 'theoryPeriods', 'practicePeriods', 'countToGpa'])
        const { name, credits, theoryPeriods, practicePeriods, countToGpa } = data

        if (typeof name !== 'string' || name.trim() === "") {
            throw new BadrequestException("Tên môn không hợp lệ")
        }
        if (!Number.isInteger(Number(credits))) {
            throw new BadrequestException("Số tín chỉ không hợp lệ")
        }
        if (!Number.isInteger(Number(theoryPeriods)) || Number(theoryPeriods) < 0) {
            throw new BadrequestException("Số tiết lý thuyết không hợp lệ")
        }
        if (!Number.isInteger(Number(practicePeriods)) || Number(practicePeriods) < 0) {
            throw new BadrequestException("Số tiết thực hành không hợp lệ")
        }
        if (typeof countToGpa !== 'boolean') {
            throw new BadrequestException("Trạng thái có tính điểm GPA không hợp lệ")
        }
        const [subject, existingSubject, periodTime] = await Promise.all([
            prisma.subject.findUnique({ where: { id: Number(subjectId) } }),
            prisma.subject.findFirst({ where: { name: name.trim(), NOT: { id: Number(subjectId) } } }),
            prisma.periodSetting.findFirst()
        ])
        if (!subject) {
            throw new NotFoundException("Không tìm thấy môn học này")
        }

        if (existingSubject) {
            throw new ConflictException("Đã tồn tại tên môn học này")
        }
        if (!periodTime) {
            throw new BadrequestException("Chưa cấu hình thời gian tiết")
        }
        const minutesPerPeriod = periodTime.endTime - periodTime.startTime
        if (minutesPerPeriod <= 0) {
            throw new BadrequestException("Cấu hình thời gian tiết không hợp lệ")
        }
        const theoryMinutes = Number(theoryPeriods) * minutesPerPeriod
        const practiceMinutes = Number(practicePeriods) * minutesPerPeriod

        const updateSubjectInfo = await prisma.subject.update({
            where: { id: Number(subjectId) },
            data: {
                name: name.trim(),
                credits: credits,
                theoryMinutes: theoryMinutes,
                practiceMinutes: practiceMinutes,
                countToGpa : countToGpa
            }
        })
        return {
            updateSubjectInfo
        }
    },
    updateSubjectStatus: async (subjectId) => {
        const subject = await prisma.subject.findUnique({
            where: { id: Number(subjectId) }
        })
        if (!subject) {
            throw new NotFoundException("Không tìm thấy môn học này")
        }
        const updateSubjectStatus = await prisma.subject.update({
            where: { id: Number(subjectId) },
            data: {
                isActive: !subject.isActive
            }
        })
        return {
            updateSubjectStatus
        }
    },
    getAllSubjects: async (subjectName, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(subjectName ? { name: { contains: subjectName.toLowerCase() } } : {})
        }
        const [subjects, totalSubjects, periodTime] = await Promise.all([
            prisma.subject.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.subject.count({
                where: whereCondition
            }),
            prisma.periodSetting.findFirst()
        ])
        if (!periodTime) {
            throw new BadrequestException("Chưa cấu hình thời gian tiết")
        }
        const minutesPerPeriod = periodTime.endTime - periodTime.startTime
        if (minutesPerPeriod <= 0) {
            throw new BadrequestException("Cấu hình thời gian tiết không hợp lệ")
        }
        const formattedSubjects = subjects.map(s => ({
            ...s,
            theoryPeriods: s.theoryMinutes / minutesPerPeriod,
            practicePeriods: s.practiceMinutes / minutesPerPeriod,
            theoryHours: s.theoryMinutes / 60,
            practiceHours: s.practiceMinutes / 60
        }))
        return {
            subjects: formattedSubjects,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalSubjects,
                totalPages: Math.ceil(totalSubjects / limit)
            }
        }
    },
    getAllSubjectsSimple: async () => {
        const subjects = await prisma.subject.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
            }
        })
        return {
            subjects
        }
    }
}