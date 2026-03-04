import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const gradesResultsService = {
    getDetailedStudyResults: async (studentId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy học sinh này")
        }
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,  // 👈 sửa luôn cái này (mình nói bên dưới)
                isPaid: true,
                status: "REGISTERED"
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
                        },
                        semester: {
                            select: {
                                name: true,
                                academicYear: true
                            }
                        }
                    }
                },
                grades: {   // 👈 đổi từ grades thành grade
                    select: {
                        totalScore: true,
                        gpaScale4: true,
                        letterGrade: true,
                        classification: true,
                        isPassed: true,
                        components: {
                            select: {
                                type: true,
                                score: true,
                                weight: true
                            }
                        }
                    }
                }
            }
        })

        const results = enrollments.map(e => {
           const grade = e.grades

            // chuyển component thành object dễ truy cập
            const componentMap = {}

            grade?.components.forEach(c => {
                componentMap[c.type] = c.score
            })

            return {
                sectionCode: e.courseSection.sectionCode,
                subjectName: e.courseSection.subject.name,
                credits: e.courseSection.subject.credits,
                semester: e.courseSection.semester,

                midterm: componentMap["MIDTERM"] ?? null,
                final: componentMap["FINAL"] ?? null,
                theory1: componentMap["THEORY1"] ?? null,
                theory2: componentMap["THEORY2"] ?? null,
                practice1: componentMap["PRACTICE1"] ?? null,
                practice2: componentMap["PRACTICE2"] ?? null,
                practice3: componentMap["PRACTICE3"] ?? null,

                totalScore: grade?.totalScore ?? null,
                gpaScale4: grade?.gpaScale4 ?? null,
                letterGrade: grade?.letterGrade ?? null,
                classification: grade?.classification ?? null,
                isPassed: grade?.isPassed ?? null
            }
        })

        return {
            studyResults: results
        }
    }
}