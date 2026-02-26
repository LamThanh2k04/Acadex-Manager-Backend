import prisma from "../../common/prisma/initPrisma.js"

export const dashboardService = {
    getOverView: async () => {
        const [totalRevenue, totalStudents, totalLecturers, totalCourses] = await Promise.all([
            prisma.payment.aggregate({
                where: {
                    status: 'SUCCESS'
                },
                _sum: {
                    amount: true
                }
            }),
            prisma.student.count(),
            prisma.lecturer.count(),
            prisma.courseSection.count({
                where: { isActive: true }
            })
        ])
        return {
            totalRevenue: totalRevenue._sum.amount || 0,
            totalStudents,
            totalLecturers,
            totalCourses
        }
    },
    getGenders: async (role) => {
        const whereRole = role ? { role: role.toUpperCase() } : {}
        const [males, females, total] = await Promise.all([
            prisma.user.count({
                where: {
                    gender: "MALE",
                    ...whereRole
                }
            }),
            prisma.user.count({
                where: {
                    gender: 'FEMALE',
                    ...whereRole
                }
            }),
            prisma.user.count({
                where: {
                    ...whereRole
                }
            })
        ])
        return {
            males,
            females,
            total
        }
    },
    getPassFailStatus: async (subjectId) => {

        const [passed, failed] = await Promise.all([
            prisma.grade.count({
                where: {
                    isActive: true,
                    isPassed: true,
                    enrollment: {
                        courseSection: {
                            ...(subjectId && { subjectId: Number(subjectId) })
                        }
                    }
                },


            }),
            prisma.grade.count({
                where: {
                    isActive: true,
                    isPassed: false,
                    enrollment: {
                        courseSection: {
                            ...(subjectId && { subjectId: Number(subjectId) })
                        }
                    }
                },
            })
        ])
        const total = passed + failed
        return {
            passed,
            failed,
            total
        }
    },
    getTopStudentGpa: async () => {
        const limit = 5
        const students = await prisma.student.findMany({
            orderBy: { gpa: 'desc' },
            take: limit,
            select: {
                studentCode: true,
                user: {
                    select: {
                        fullName: true
                    }
                }
            }
        })
        return {
            students
        }
    },
    getLineChartRevenueLineChart: async (year) => {
        const startDate = new Date(`${year}-01-01`)
        const endDate = new Date(`${year}-12-31T23:59:59`)

        const payments = await prisma.payment.findMany({
            where: {
                status: 'SUCCESS',
                payDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                amount: true,
                payDate: true
            }
        })
        const revenueMap = {}
        for (let i = 1; i <= 12; i++) {
            const monthKey = `${year}-${String(i).padStart(2, "0")}`
            revenueMap[monthKey] = 0
        }

        payments.forEach(p => {
            const date = new Date(p.payDate)
            const month = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`

            revenueMap[month] += p.amount
        })

        const result = Object.entries(revenueMap).map(([month, total]) => ({
            month,
            total
        }))
        return {
            result
        }

    }
}