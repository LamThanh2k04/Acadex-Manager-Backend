import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import generateSubjectCode from "../../common/helpers/generateSubjectCode.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"


export const subjectService = {
    createSubject: async (data) => {
        validateMissingFields(data, ['name', 'credits', 'theoryHours', 'practiceHours'])
        const { name, credits, theoryHours, practiceHours } = data

        if (typeof name !== 'string' || name.trim() === "") {
            throw new BadrequestException("Tên môn không hợp lệ")
        }
        if (!Number.isInteger(Number(credits))) {
            throw new BadrequestException("Số tín chỉ không hợp lệ")
        }
        if (!Number.isInteger(Number(theoryHours))) {
            throw new BadrequestException("Số giờ lý thuyết không hợp lệ")
        }
        if (!Number.isInteger(Number(practiceHours))) {
            throw new BadrequestException("Số giờ thực hành không hợp lệ")
        }

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
                theoryHours: Number(theoryHours),
                practiceHours: Number(practiceHours)
            }
        })
        return {
            newSubject
        }
    },
    updateSubjectInfo: async (subjectId, data) => {
        validateMissingFields(data, ['name', 'credits', 'theoryHours', 'practiceHours'])
        const { name, credits, theoryHours, practiceHours } = data

        if (typeof name !== 'string' || name.trim() === "") {
            throw new BadrequestException("Tên môn không hợp lệ")
        }
        if (!Number.isInteger(Number(credits))) {
            throw new BadrequestException("Số tín chỉ không hợp lệ")
        }
        if (!Number.isInteger(Number(theoryHours))) {
            throw new BadrequestException("Số giờ lý thuyết không hợp lệ")
        }
        if (!Number.isInteger(Number(practiceHours))) {
            throw new BadrequestException("Số giờ thực hành không hợp lệ")
        }

        const [subject, existingSubject] = await Promise.all([
            prisma.subject.findUnique({ where: { id: Number(subjectId) } }),
            prisma.subject.findFirst({ where: { name: name.trim(), NOT: { id: Number(subjectId) } } }),
        ])
        if (!subject) {
            throw new NotFoundException("Không tìm thấy môn học này")
        }

        if (existingSubject) {
            throw new ConflictException("Đã tồn tại tên môn học này")
        }
        const updateSubjectInfo = await prisma.subject.update({
            where: { id: Number(subjectId) },
            data: {
                name: name.trim(),
                credits: credits,
                theoryHours: Number(theoryHours),
                practiceHours: Number(practiceHours)
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
        const [subjects, totalSubjects] = await Promise.all([
            prisma.subject.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.subject.count({
                where: whereCondition
            })
        ])
        return {
            subjects,
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