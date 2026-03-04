import prisma from "../../common/prisma/initPrisma.js"

export const gradeService = {
  confirmGrades: async (gradeList) => {

    return await prisma.$transaction(async (tx) => {

      for (const item of gradeList) {

        const { enrollmentId, ...scores } = item

        const enrollment = await tx.enrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            grades: true,
            courseSection: { include: { subject: true } }
          }
        })

        if (!enrollment) continue

        const studentId = enrollment.studentId
        let grade = enrollment.grades

        // 1️⃣ Nếu chưa có grade → tạo mới
        if (!grade) {
          grade = await tx.grade.create({
            data: {
              enrollmentId,
              totalScore: 0,
              isConfirmed: false
            }
          })
        }

        // 2️⃣ Upsert component
        for (const [type, score] of Object.entries(scores)) {

          if (score === null || score === undefined) continue

          await tx.gradeComponent.upsert({
            where: {
              gradeId_type: {
                gradeId: grade.id,
                type: type.toUpperCase()
              }
            },
            update: { score: Number(score) },
            create: {
              gradeId: grade.id,
              type: type.toUpperCase(),
              score: Number(score)
            }
          })
        }

        // ===============================
        // 3️⃣ Lấy lại component
        // ===============================

        const components = await tx.gradeComponent.findMany({
          where: { gradeId: grade.id }
        })

        const getScore = (type) =>
          components.find(c => c.type === type)?.score ?? null

        let midterm = getScore("MIDTERM")
        let finalExam = getScore("FINAL")

        let isEligibleForExam = midterm !== null && midterm >= 1

        // ===============================
        // 🎯 CASE 1: Chỉ cập nhật giữa kỳ
        // ===============================

        if (!finalExam && finalExam !== 0) {

          // Nếu chỉ mới có midterm
          await tx.grade.update({
            where: { id: grade.id },
            data: {
              isEligibleForExam,
              isConfirmed: true,
              updatedAt: new Date()
            }
          })

          continue // bỏ qua phần tính total
        }

        // ===============================
        // 🎯 CASE 2: Có FINAL → mới tính điểm
        // ===============================

        let totalScore = 0
        let gpaScale4 = 0
        let letterGrade = "F"
        let classification = "YẾU"
        let isPassed = false

        if (!isEligibleForExam) {

          // Không đủ điều kiện thi
          totalScore = 0

        } else {

          // Tính trung bình 2 cột
          totalScore = (midterm + finalExam) / 2

          if (totalScore >= 8.5) {
            gpaScale4 = 4
            letterGrade = "A"
            classification = "GIỎI"
            isPassed = true
          } else if (totalScore >= 8) {
            gpaScale4 = 3.5
            letterGrade = "B+"
            classification = "KHÁ"
            isPassed = true
          } else if (totalScore >= 7) {
            gpaScale4 = 3
            letterGrade = "B"
            classification = "KHÁ"
            isPassed = true
          } else if (totalScore >= 5) {
            gpaScale4 = 2
            letterGrade = "C"
            classification = "TRUNG BÌNH"
            isPassed = true
          }
        }

        // Update full grade khi có FINAL
        await tx.grade.update({
          where: { id: grade.id },
          data: {
            totalScore,
            gpaScale4,
            letterGrade,
            classification,
            isPassed,
            isEligibleForExam,
            isConfirmed: true,
            updatedAt: new Date()
          }
        })
        

        const passedGrades = await tx.grade.findMany({
          where: {
            enrollment: { studentId },
            isPassed: true
          },
          include: {
            enrollment: {
              include: {
                courseSection: { include: { subject: true } }
              }
            }
          }
        })

        let totalWeighted = 0
        let totalCredits = 0

        for (const g of passedGrades) {
          const credits = g.enrollment.courseSection.subject.credits
          totalWeighted += (g.gpaScale4 || 0) * credits
          totalCredits += credits
        }

        const finalGpa =
          totalCredits === 0 ? 0 : totalWeighted / totalCredits

        await tx.student.update({
          where: { id: studentId },
          data: {
            gpa: finalGpa,
            creditsEarned: totalCredits
          }
        })
      }

      return true
    })
  }
}