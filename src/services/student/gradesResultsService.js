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
                studentId: student.id,
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
                grades: {
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


        const flatResults = enrollments.map(e => {
            const grade = e.grades
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


        const semesterMap = {}

        flatResults.forEach(item => {
            const key = `${item.semester.name}_${item.semester.academicYear}`

            if (!semesterMap[key]) {
                semesterMap[key] = {
                    semester: item.semester,
                    subjects: []
                }
            }

            semesterMap[key].subjects.push({
                sectionCode: item.sectionCode,
                subjectName: item.subjectName,
                credits: item.credits,

                midterm: item.midterm,
                final: item.final,
                theory1: item.theory1,
                theory2: item.theory2,
                practice1: item.practice1,
                practice2: item.practice2,
                practice3: item.practice3,

                totalScore: item.totalScore,
                gpaScale4: item.gpaScale4,
                letterGrade: item.letterGrade,
                classification: item.classification,
                isPassed: item.isPassed
            })
        })


        let groupedResults = Object.values(semesterMap)


        groupedResults.sort((a, b) => {

            if (a.semester.academicYear !== b.semester.academicYear) {
                return a.semester.academicYear.localeCompare(b.semester.academicYear)
            }


            const getSemesterNumber = name => Number(name.replace(/\D/g, ''))
            return getSemesterNumber(a.semester.name) - getSemesterNumber(b.semester.name)
        })

        return { studyResults: groupedResults }
    }
}