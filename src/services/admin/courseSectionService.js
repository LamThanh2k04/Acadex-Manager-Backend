import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import generateCourseSectionCode from "../../common/helpers/generateCourseSectionCode.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const courseSectionService = {
    createCourseSection: async (data) => {
        validateMissingFields(data, ['maxStudents', 'subjectId', 'lecturerId', 'semesterId', 'plannedClassId'])
        const { maxStudents, subjectId, lecturerId, semesterId, plannedClassId } = data

        if (!Number.isInteger(Number(maxStudents)) || Number(maxStudents) <= 0) {
            throw new BadrequestException("Số lượng sinh viên không hợp lệ")
        }
        if (!Number.isInteger(Number(subjectId))) {
            throw new BadrequestException("SubjectId không hợp lệ")
        }
        if (!Number.isInteger(Number(lecturerId))) {
            throw new BadrequestException("lecturerId không hợp lệ")
        }
        if (!Number.isInteger(Number(semesterId))) {
            throw new BadrequestException("semesterId không hợp lệ")
        }
        if (!Number.isInteger(Number(plannedClassId))) {
            throw new BadrequestException("plannedClassId không hợp lệ")
        }

        const [subject, lecturer, semester, plannedClass] = await prisma.$transaction([
            prisma.subject.findUnique({ where: { id: Number(subjectId) } }),
            prisma.lecturer.findUnique({ where: { id: Number(lecturerId) } }),
            prisma.semester.findUnique({ where: { id: Number(semesterId) } }),
            prisma.class.findUnique({
                where: { id: Number(plannedClassId) },
                include: {
                    major: true
                }

            })
        ])
        if (!subject) {
            throw new NotFoundException("Không tìm thấy môn học")
        }
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên")
        }
        if (!semester) {
            throw new NotFoundException("Không tìm thấy học kì thực tế")
        }
        if (!plannedClass) {
            throw new NotFoundException("Không tìm thấy lớp học dự kiến")
        }
        const code = await generateCourseSectionCode()
        const courseSection = await prisma.courseSection.create({
            data: {
                sectionCode: code,
                maxStudents: Number(maxStudents),
                subjectId: Number(subjectId),
                lecturerId: Number(lecturerId),
                semesterId: Number(semesterId),
                plannedClassId: Number(plannedClassId)
            }
        })
        return {
            courseSection
        }
    },
    updateCourseSectionInfo: async (courseSectionId, data) => {
        const { maxStudents, lecturerId, plannedClassId } = data
        const newMax = Number(maxStudents)
        if (!Number.isInteger(Number(newMax)) || Number(newMax) <= 0) {
            throw new BadrequestException("Số lượng sinh viên không hợp lệ")
        }
        if (!Number.isInteger(Number(lecturerId))) {
            throw new BadrequestException("lecturerId không hợp lệ")
        }
        if (!Number.isInteger(Number(plannedClassId))) {
            throw new BadrequestException("plannedClassId không hợp lệ")
        }
        const [lecturer, plannedClass, courseSection] = await prisma.$transaction([
            prisma.lecturer.findUnique({ where: { id: Number(lecturerId) } }),
            prisma.class.findUnique({ where: { id: Number(plannedClassId) } }),
            prisma.courseSection.findUnique({ where: { id: Number(courseSectionId) } })
        ])
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên")
        }
        if (!plannedClass) {
            throw new NotFoundException("Không tìm thấy lớp học dự kiến")
        }
        if (!courseSection) {
            throw new NotFoundException("Không tìm thấy học phần này")
        }
        const enrolledCount = await prisma.enrollment.count({
            where: { courseSectionId: Number(courseSectionId) }
        })

        if (newMax < enrolledCount) {
            throw new BadrequestException(
                "Số lượng tối đa không được nhỏ hơn số sinh viên đã đăng ký"
            )
        }


        const updateCourseSectionInfo = await prisma.courseSection.update({
            where: { id: Number(courseSectionId) },
            data: {
                lecturerId: Number(lecturerId),
                plannedClassId: Number(plannedClassId),
                maxStudents: Number(maxStudents)
            }
        })
        return {
            updateCourseSectionInfo
        }
    },
    updateCourseSectionStatus: async (courseSectionId) => {
        const [courseSection, enrollments] = await prisma.$transaction([
            prisma.courseSection.findUnique({ where: { id: Number(courseSectionId) } }),
            prisma.enrollment.count({ where: { courseSectionId: Number(courseSectionId) } })
        ])
        if (!courseSection) {
            throw new NotFoundException("Không tìm thấy học phần này")
        }

        if (enrollments > 0) {
            throw new BadrequestException("KHông được khóa học phần này vì có sinh viên đăng kí")
        }
        const updateCourseSectionStatus = await prisma.courseSection.update({
            where: { id: Number(courseSectionId) },
            data: {
                isActive: !courseSection.isActive
            }
        })
        return {
            updateCourseSectionStatus
        }
    },
    getAllCourseSections: async (search, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit

        const whereCondition = search ? {
            OR: [
                {
                    subject: {
                        name: {
                            contains: search.toLowerCase()
                        }
                    }
                },
                {
                    plannedClass: {
                        name: {
                            contains: search.toLowerCase()
                        }
                    }
                },
                {
                    lecturer: {
                        user: {
                            fullName: {
                                contains: search.toLowerCase()
                            }
                        }
                    }
                }
            ]
        } : {}
        const [courseSections, totalCourseSection] = await prisma.$transaction([
            prisma.courseSection.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { id: 'desc' },
                select: {
                    id: true,
                    sectionCode: true,
                    maxStudents: true,
                    isActive: true,
                    subject: {
                        select: {
                            name: true
                        }
                    },
                    plannedClass: {
                        select: {
                            name: true
                        }
                    },
                    lecturer: {
                        select: {
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    },
                    semester: {
                        select: {
                            name: true,
                            academicYear: true
                        }
                    }
                }
            }),
            prisma.courseSection.count({
                where: whereCondition
            })
        ])
        return {
            courseSections,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalCourseSection,
                totalPages: Math.ceil(totalCourseSection / limit)
            }
        }
    },
    getCourseSectionBySemester: async (semesterId) => {
        const semester = await prisma.semester.findUnique({
            where: { id: Number(semesterId) }
        })
        if (!semester) {
            throw new NotFoundException("Không tìm thấy học kì này")
        }
        const courseSections = await prisma.courseSection.findMany({
            where: { isActive: true, semesterId: Number(semesterId) },
            orderBy: { id: 'desc' },
            select: {
                id: true,
                sectionCode: true,
                maxStudents: true,
                isActive: true,
                subject: {
                    select: {
                        name: true
                    }
                },
                plannedClass: {
                    select: {
                        name: true
                    }
                },
                lecturer: {
                    select: {
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
            }
        })
        return {
            courseSections
        }
    }
}