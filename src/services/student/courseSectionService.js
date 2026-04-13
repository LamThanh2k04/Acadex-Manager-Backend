import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const courseSectionSecvice = {
    getAllSemestersSimple: async () => {
        const semesters = await prisma.semester.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                academicYear: true
            },
            orderBy: { id: 'desc' }
        })
        return {
            semesters
        }
    },
    getSubjectsBySemester: async (studentId, semesterId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            include: {
                program: true
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy học sinh này")
        }
        const subjects = await prisma.courseSection.findMany({
            where: {
                semesterId: Number(semesterId),
                subject: {
                    programSubjects: {
                        some: {
                            programId: student.programId,
                            isActive: true
                        }
                    },
                },
                NOT: {
                    subject: {
                        courseSections: {
                            some: {
                                enrollments: {
                                    some: {
                                        studentId: student.id,
                                        status: "REGISTERED"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            distinct: ['subjectId'],
            select: {
                subject: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        theoryMinutes: true,
                        practiceMinutes: true,
                        credits: true,
                        countToGpa: true
                    }
                }
            }
        })
        return {
            subjects
        }
    },
    getCourseSectionsBySubject: async (semesterId, subjectId) => {
        const courseSections = await prisma.courseSection.findMany({
            where: { semesterId: Number(semesterId), subjectId: Number(subjectId) },
            select: {
                id: true,
                sectionCode: true,
                maxStudents: true,
                _count: {
                    select: {
                        enrollments: {
                            where: {
                                status: 'REGISTERED'
                            }
                        }
                    }
                },
                subject: {
                    select: {
                        name: true,
                        credits: true
                    }
                },
                lecturer: {
                    select: {
                        lecturerCode: true,
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                plannedClass: {
                    select: {
                        name: true
                    }
                }

            }
        })
        const newCourseSection = courseSections.map(section => ({
            ...section,
            slot: `${section._count.enrollments}/${section.maxStudents}`
        }))
        return {
            newCourseSection

        }
    },
    getScheduleByCourseSection: async (courseSectionId) => {
        const schedules = await prisma.schedule.findMany({
            where: { courseSectionId: Number(courseSectionId) },
            orderBy: [
                { dayOfWeek: "asc" },
                { startTimeMinutes: "asc" }
            ],
            select: {
                id: true,
                dayOfWeek: true,
                startTimeMinutes: true,
                endTimeMinutes: true,
                startDate: true,
                endDate: true,
                type: true,
                practiceGroup: true,
                maxStudents: true,
                meetingLink: true,
                room: {
                    select: {
                        name: true,
                        building: {
                            select: {
                                name: true,
                                symbol: true
                            }
                        }
                    }
                },
                courseSection: {
                    select: {
                        id: true,
                        enrollments: {
                            where: {
                                status: 'REGISTERED'
                            },
                            select: {
                                practiceGroup: true
                            }
                        },
                        lecturer: {
                            select: {
                                user: {
                                    select: { fullName: true }
                                }
                            }
                        },
                        plannedClass: {
                            select: { name: true }
                        }
                    }
                }
            }
        })

        if (!schedules.length) {
            return { theory: [], online: [], practices: [] }
        }

        const enrollments = schedules[0].courseSection.enrollments
        const totalEnrollment = enrollments.length



        const practiceCountMap = {}

        enrollments.forEach(e => {
            const key = e.practiceGroup ?? 0
            practiceCountMap[key] = (practiceCountMap[key] || 0) + 1
        })



        const theorySchedules = schedules.filter(s => s.type === "THEORY")
        const onlineSchedules = schedules.filter(s => s.type === "ONLINE")
        const practiceSchedules = schedules.filter(s => s.type === "PRACTICE")

        const lecturer = schedules[0].courseSection.lecturer.user.fullName
        const plannedClass = schedules[0].courseSection.plannedClass.name

        const formatSchedule = (schedule) => ({
            id: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            startTimeMinutes: schedule.startTimeMinutes,
            endTimeMinutes: schedule.endTimeMinutes,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            room: schedule.meetingLink
                ? "Online"
                : `${schedule.room.building.symbol}.${schedule.room.name}`,
            meetingLink: schedule.meetingLink
        })



        const theory = theorySchedules.length
            ? [{
                slot: `${totalEnrollment}/${theorySchedules[0].maxStudents}`,
                lecturer,
                plannedClass,
                schedules: theorySchedules.map(formatSchedule)
            }]
            : []



        const online = onlineSchedules.length
            ? [{
                slot: `${totalEnrollment}/${onlineSchedules[0].maxStudents}`,
                lecturer,
                plannedClass,
                schedules: onlineSchedules.map(formatSchedule)
            }]
            : []



        const practiceMap = {}

        practiceSchedules.forEach(schedule => {

            const groupKey = schedule.practiceGroup ?? 0
            const current = practiceCountMap[groupKey] || 0

            if (!practiceMap[groupKey]) {
                practiceMap[groupKey] = {
                    group: schedule.practiceGroup,
                    slot: `${current}/${schedule.maxStudents}`,
                    lecturer,
                    plannedClass,
                    schedules: []
                }
            }

            practiceMap[groupKey].schedules.push(formatSchedule(schedule))
        })

        return {
            theory,
            online,
            practices: Object.values(practiceMap)
        }
    },
    registerCourseSection: async (studentId, data) => {
        const { courseSectionId, practiceGroup = null } = data
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy học sinh này")
        }
        const courseSection = await prisma.courseSection.findUnique({
            where: { id: Number(courseSectionId) },
            select: {
                subject: {
                    select: { id: true, credits: true }
                }
            }
        })

        const program = await prisma.program.findUnique({
            where: { id: student.programId },
            select: {
                feePerCredit: true
            }
        })

        const programSubject = await prisma.programSubject.findUnique({
            where: {
                programId_subjectId: {
                    programId: student.programId,
                    subjectId: courseSection.subject.id
                }
            },
            select: {
                feePerCredit: true
            }
        })
        const feePerCredit =
            programSubject?.feePerCredit
            ?? program?.feePerCredit
            ?? 0

        const totalFee = courseSection.subject.credits * feePerCredit
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: student.id,
                courseSectionId: Number(courseSectionId),
                status: "REGISTERED"
            }
        })
        if (existingEnrollment) {
            throw new ConflictException("Bạn đã đăng kí học phần này rồi")
        }
        const schedules = await prisma.schedule.findMany({
            where: {
                courseSectionId: Number(courseSectionId)
            },
            select: {
                type: true,
                maxStudents: true,
                practiceGroup: true
            }
        })
        if (!schedules.length) {
            throw new NotFoundException("Không tìm thấy lịch của học phần này")
        }
        const totalEnrollment = await prisma.enrollment.count({
            where: { courseSectionId: Number(courseSectionId), status: 'REGISTERED' }
        })

        const theoryOrOnline = schedules.find(
            s => s.type === 'THEORY' || s.type === 'ONLINE'
        )
        if (theoryOrOnline) {
            if (totalEnrollment >= theoryOrOnline.maxStudents) {
                throw new BadrequestException('Lớp lý thuyết này đã đủ số lượng')
            }
        }
        const hasPractice = schedules.some(s => s.type === "PRACTICE")
        if (hasPractice) {
            const practiceSchedules = schedules.filter(s => s.type === "PRACTICE")
            const isGrouped = practiceSchedules.some(s => s.practiceGroup !== null)

            if (isGrouped) {
                if (practiceGroup == null) {
                    throw new BadrequestException("Vui lòng chọn nhóm thực hành")
                }
                const groupCount = await prisma.enrollment.count({
                    where: {
                        courseSectionId: Number(courseSectionId),
                        practiceGroup: Number(practiceGroup),
                        status: 'REGISTERED'
                    }
                })
                const groupSchedule = practiceSchedules.find(
                    s => s.practiceGroup === practiceGroup
                )
                if (!groupSchedule) {
                    throw new NotFoundException("Nhóm thực hành không tồn tại")
                }

                if (groupCount >= groupSchedule.maxStudents) {
                    throw new BadrequestException("Nhóm thực hành đã đủ số lượng")
                }
            } else {
                const practiceMax = practiceSchedules[0].maxStudents

                if (totalEnrollment >= practiceMax) {
                    throw new Error("Lớp thực hành đã đủ số lượng")
                }
            }
        }
        const canceledEnrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: student.id,
                courseSectionId: Number(courseSectionId),
                status: 'CANCELED'
            }
        })
        if (canceledEnrollment) {
            await prisma.enrollment.update({
                where: { id: canceledEnrollment.id },
                data: {
                    status: 'REGISTERED',
                    practiceGroup: practiceGroup
                }
            })
        } else {
            await prisma.enrollment.create({
                data: {
                    studentId: student.id,
                    courseSectionId: Number(courseSectionId),
                    practiceGroup: practiceGroup,
                    fee: totalFee
                }
            })
        }
    },
    cancelCourseSection: async (studentId, enrollmentId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy học sinh này")
        }
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                id: Number(enrollmentId),
                studentId: student.id,
                status: 'REGISTERED'
            }
        })
        if (!enrollment) {
            throw new NotFoundException("Không tìm thấy id của đăng kí học phần này")
        }
        if (enrollment.isPaid === true) {
            throw new BadrequestException("Học phần đã thanh toán không thể hủy"
            )
        }

        const cancelCourseSection = await prisma.enrollment.update({
            where: { id: Number(enrollmentId) },
            data: {
                status: "CANCELED"
            }
        })
        return {
            cancelCourseSection
        }
    },
    getAllEnrollmentCourseSection: async (studentId, semesterId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            include: {
                program: {
                    include: {
                        programSubjects: true
                    }
                }
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy học sinh này")
        }
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'REGISTERED',
                courseSection: {
                    semesterId: Number(semesterId)
                }
            },
            select: {
                id: true,
                courseSection: {
                    select: {
                        id: true,
                        sectionCode: true,
                        plannedClass: {
                            select: {
                                name: true,
                            }
                        },
                        lecturer: {
                            select: {
                                lecturerCode: true,
                                user: {
                                    select: {
                                        fullName: true
                                    }
                                }
                            }
                        },
                        subject: {
                            select: {
                                name: true,
                                credits: true
                            }
                        }
                    }
                },
                practiceGroup: true,
                fee: true,
                enrolledAt: true,
                isPaid: true,
                status: true
            }
        })
        const totalEnrollment = enrollments.reduce(
            (acc, cur) => {
                return acc + cur.fee
            }, 0)
        const totalCredit = enrollments.reduce(
            (acc, cur) => {
                return acc + cur.courseSection.subject.credits
            }, 0)
        return {
            enrollments,
            totalCredit,
            totalEnrollment
        }
    },
    getAllSchedulesByCourseSectionRegister: async (courseSectionId) => {
        const courseSection = await prisma.enrollment.findFirst({
            where: {
                courseSectionId: Number(courseSectionId),
                status: 'REGISTERED'
            }
        })
        if (!courseSection) {
            throw new NotFoundException('Không tìm thấy học phần đã đăng kí này')
        }
        const schedules = await prisma.schedule.findMany({
            where: {
                courseSectionId: Number(courseSectionId)
            },
            select: {
                id: true,
                dayOfWeek: true,
                startTimeMinutes: true,
                endTimeMinutes: true,
                startDate: true,
                endDate: true,
                type: true,
                practiceGroup: true,
                meetingLink: true,
                isActive: true,
                room: {
                    select: {
                        name: true,
                        building: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })
        return {
            schedules
        }
    }
}