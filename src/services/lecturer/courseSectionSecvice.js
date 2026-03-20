import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const courseSectionSecvice = {
    getAllSemestersSimple: async () => {
        const semesters = await prisma.semester.findMany({
            where: { isActive: true },
            orderBy: { id: 'desc' },
            select: {
                id: true,
                name: true,
                academicYear: true,
                startDate: true,
                endDate: true
            }
        })
        return {
            semesters
        }
    },
    getSubjectsBySemester: async (lecturerId, semesterId) => {
        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerId }
        })
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên này")
        }
        const subjects = await prisma.courseSection.findMany({
            where: {
                lecturerId: lecturer.id,
                semesterId: Number(semesterId)
            },
            select: {
                subject: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        credits: true
                    }
                }
            }
        })
        return {
            subjects
        }
    },
    getAllCourseSectionsBySubject: async (lecturerId, subjectId) => {
        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerId }
        })
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên này")
        }
        const courseSections = await prisma.courseSection.findMany({
            where: {
                lecturerId: lecturer.id,
                subjectId: Number(subjectId)
            },
            select: {
                id: true,
                sectionCode: true,
                subject: {
                    select: {
                        code: true,
                        name: true,
                        credits: true
                    }
                }
            }
        })
        return {
            courseSections
        }
    },
    getAllStudentEnrollmentIsPaid: async (courseSectionId, search, page) => {

        const limit = 10
        const skip = (Number(page) - 1) * limit

        const whereCondition = {
            courseSectionId: Number(courseSectionId),
            status: 'REGISTERED',
            isPaid: true,
            ...(search && {
                student: {
                    OR: [
                        {
                            studentCode: {
                                contains: search.toLowerCase()
                            }
                        },
                        {
                            user: {
                                fullName: {
                                    contains: search.toLowerCase()
                                }
                            }
                        }
                    ]
                }
            })
        }

        const [enrollments, totalStudent] = await Promise.all([

            prisma.enrollment.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { id: 'desc' },

                include: {
                    student: {
                        select: {
                            id: true,
                            studentCode: true,
                            user: {
                                select: {
                                    fullName: true,
                                    avatar: true
                                }
                            }
                        }
                    },
                    courseSection: {
                        select: {
                            sectionCode: true
                        }
                    },
                    grades: {
                        include: {
                            components: true
                        }
                    }
                }
            }),

            prisma.enrollment.count({
                where: whereCondition
            })
        ])
        const students = enrollments.map(enrollment => {

            const components = enrollment.grades?.components || []

            const getScore = (type) => {
                const comp = components.find(c => c.type === type)
                return comp?.score ?? null
            }

            return {
                enrollmentId: enrollment.id,
                sectionCode: enrollment.courseSection.sectionCode,
                studentCode: enrollment.student.studentCode,
                fullName: enrollment.student.user.fullName,
                avatar: enrollment.student.user.avatar,

                theory1: getScore("THEORY1"),
                theory2: getScore("THEORY2"),
                practice1: getScore("PRACTICE1"),
                practice2: getScore("PRACTICE2"),
                practice3: getScore("PRACTICE3"),
                midterm: getScore("MIDTERM"),
                final: getScore("FINAL"),

                totalScore: enrollment.grades?.totalScore ?? null
            }
        })

        return {
            students,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalStudent,
                totalPages: Math.ceil(totalStudent / limit)
            }
        }
    },
    getAllCourseSectionLecturer: async (lecturerId, semesterId, search, page) => {
        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerId }
        })
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên này")
        }
        const limit = 10
        const skip = (Number(page) - 1) * limit

        const whereCondition = {
            lecturerId: lecturer.id,

            ...(semesterId && {
                semesterId: Number(semesterId)
            }),

            ...(search && {
                OR: [
                    {
                        sectionCode: {
                            contains: search.toLowerCase()
                        }
                    },
                    {
                        subject: {
                            code: {
                                contains: search.toLowerCase()
                            }
                        }
                    },
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
                    }
                ]
            })
        }
        const [courseSections, totalCourseSections] = await Promise.all([
            prisma.courseSection.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    sectionCode: true,
                    maxStudents: true,
                    isActive: true,
                    subject: {
                        select: {
                            name: true,
                            credits: true
                        }
                    },
                    plannedClass: {
                        select: {
                            name: true
                        }
                    },
                    semester : {
                        select : {
                            id : true,
                            name : true,
                            academicYear : true
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
                total: totalCourseSections,
                totalPages: Math.ceil(totalCourseSections / limit)
            }
        }
    }
}