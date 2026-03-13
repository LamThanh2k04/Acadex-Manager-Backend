import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const dashboardService = {
    getInfoStudent: async (studentId) => {
        const student = await prisma.user.findUnique({
            where: { id: Number(studentId) },
            select: {
                fullName: true,
                avatar: true,
                email: true,
                gender: true,
                dateOfBirth: true,
                phoneNumber: true,
                address: true,
                isActive: true,
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        personalEmail: true,
                        citizenId: true,
                        placeOfBirth: true,
                        ethnicity: true,
                        admissionYear: true,
                        graduateYear: true,
                        status: true,
                        class: {
                            select: {
                                homeroomLecturer: {
                                    select: {
                                        user: {
                                            select: {
                                                fullName: true
                                            }
                                        }
                                    }
                                },
                                name: true
                            }
                        },
                        program: {
                            select: {
                                code: true,
                                name: true
                            }
                        },
                        faculty: {
                            select: {
                                code: true,
                                name: true
                            }
                        },
                        major: {
                            select: {
                                code: true,
                                name: true
                            }
                        },
                    }
                },

            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy người dùng này")
        }
        return {
            student
        }
    },
    getAllSemestersSimple: async () => {
        const semesters = await prisma.semester.findMany({
            where: { isActive: true },
            select : {
                id : true,
                name : true,
                academicYear : true
            },
            orderBy : {id : 'desc'}

        })
        return {
            semesters
        }
    },
    getAllEnrollmentBySemester: async (studentId, semesterId) => {
        const student = await prisma.student.findUnique({
            where: { userId: studentId }
        })
        if (!student) {
            throw new NotFoundException('Không tìm thấy được sinh viên này')
        }
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                courseSection: {
                    semesterId: Number(semesterId)
                },
                status: 'REGISTERED'
            },
            select: {
                courseSection: {
                    select: {
                        sectionCode: true,
                        subject: {
                            select: {
                                name: true,
                                credits: true
                            }
                        }
                    }
                }
            }
        })
        return {
            enrollments
        }
    },
    getFinalScoresForChart: async (studentId, semesterId) => {

        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên")
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                isPaid: true,
                status: "REGISTERED",
                grades: { isNot: null },

                courseSection: {
                    semesterId: Number(semesterId)
                }
            },
            select: {
                courseSectionId: true,
                courseSection: {
                    select: {
                        subject: { select: { name: true } }
                    }
                },
                grades: {
                    select: {
                        components: {
                            where: { type: "FINAL" },
                            select: { score: true }
                        }
                    }
                }
            }
        })

        const chartData = await Promise.all(
            enrollments.map(async (e) => {
                const finalComponent = e.grades?.components?.[0]
                const score = finalComponent?.score

                if (score === null || score === undefined) return null
                const avgResult = await prisma.gradeComponent.aggregate({
                    _avg: { score: true },
                    where: {
                        type: "FINAL",
                        score: { not: null },
                        grade: {
                            enrollment: {
                                courseSectionId: e.courseSectionId,
                                isPaid: true,
                                status: "REGISTERED",
                                courseSection: {
                                    semesterId: Number(semesterId)
                                }
                            }
                        }
                    }
                })

                return {
                    subject: e.courseSection.subject.name,
                    finalScore: score,
                    classAverage: Number(avgResult._avg.score?.toFixed(2)) || 0
                }
            })
        )

        return chartData.filter(Boolean)
    },
     getResultsIsStudyCredits: async (studentId) => {
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


            if (item.type === "MANDATORY") {
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
            creditsIsStudy: student.creditsEarned,
            totalRequiredCredits
        }
    },


}