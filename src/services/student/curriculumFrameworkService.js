import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const curriculumFrameworkService = {
    getSemesterOrderProgram: async (studentId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            include: { program: true }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên này")
        }

        const subjects = await prisma.programSubject.findMany({
            where: { programId: student.program.id },
            select: {
                semesterOrder: true,
                type: true,
                subject: {
                    select: {
                        credits: true,
                        countToGpa: true
                    }
                }
            },
            orderBy: {
                semesterOrder: 'asc'
            }
        })

        if (!subjects.length) {
            throw new NotFoundException(
                "Không tìm thấy các học kì của các môn trong chương trình này"
            )
        }

        const semesterMap = {}

        let totalMandatoryCredits = 0
        let totalElectiveCredits = 0
        const countedElectiveSemester = new Set()

        subjects.forEach(item => {
            const semester = item.semesterOrder
            const credits = item.subject?.credits || 0


            if (!semesterMap[semester]) {
                semesterMap[semester] = {
                    semesterOrder: semester,
                    totalCredits: 0
                }
            }

            semesterMap[semester].totalCredits += credits


            if (item.type === "MANDATORY" && item.subject.countToGpa === true) {
                totalMandatoryCredits += credits
            }


            if (item.type === "ELECTIVE" && item.subject.countToGpa === true) {
                if (!countedElectiveSemester.has(semester)) {
                    totalElectiveCredits += credits
                    countedElectiveSemester.add(semester)
                }
            }
        })

        const totalRequiredCredits =
            totalMandatoryCredits + totalElectiveCredits

        return {
            semesters: Object.values(semesterMap),
            summary: {
                totalRequiredCredits,
                totalMandatoryCredits,
                totalElectiveCredits
            }
        }
    },
    getSubjectsBySemesterOrderProgram: async (studentId, semesterOrder) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            include: { program: true }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên này")
        }
        const subjects = await prisma.programSubject.findMany({
            where: { programId: student.program.id, semesterOrder: Number(semesterOrder) },
            select: {
                type: true,
                subject: {
                    select: {
                        code: true,
                        name: true,
                        credits: true,
                        theoryMinutes: true,
                        practiceMinutes: true,
                        countToGpa: true
                    }
                }
            }
        })
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id
            },
            select: {
                status: true,
                courseSection: {
                    select: {
                        subjectId: true
                    }
                },
                grades: {
                    where: { isActive: true },
                    select: {
                        isPassed: true
                    },
                    take: 1
                }
            }
        })
        const enrollmentMap = new Map()

        enrollments.forEach(e => {
            const subjectId = e.courseSection.subjectId
            enrollmentMap.set(subjectId, e)
        })
        const periodTime = await prisma.periodSetting.findFirst()
        if (!periodTime) {
            throw new BadrequestException("Chưa cấu hình thời gian tiết")
        }
        const minutesPerPeriod = periodTime.endTime - periodTime.startTime
        if (minutesPerPeriod <= 0) {
            throw new BadrequestException("Cấu hình thời gian tiết không hợp lệ")
        }
        const formatSubjects = subjects.map(s => {
            const enrollment = enrollmentMap.get(s.subject.id)

            let enrollmentStatus = "NOT_REGISTERED"
            let isPassed  = null
            if (enrollment) {
                if (enrollment.status === "REGISTERED") {
                    enrollmentStatus = "REGISTERED"
                }

                const grade = enrollment.grades[0]

                if (grade) {
                    isPassed = grade.isPassed
                }
            }

            return {
                type: s.type,
                subject: {
                    ...s.subject,
                    theoryPeriods: s.subject.theoryMinutes / minutesPerPeriod,
                    practicePeriods: s.subject.practiceMinutes / minutesPerPeriod,
                    enrollmentStatus,
                    isPassed
                }
            }
        })
        const groupedSubjects = {
            mandatorySubjects: [],
            electiveSubjects: []
        }

        formatSubjects.forEach(item => {
            if (item.type === "MANDATORY") {
                groupedSubjects.mandatorySubjects.push(item.subject)
            }

            if (item.type === "ELECTIVE") {
                groupedSubjects.electiveSubjects.push(item.subject)
            }
        })
        return {
            subjects: groupedSubjects
        }
    }
}