import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const homeroomClassService = {
    getAllStudents: async (lecturerId, search, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerId },
            include: {
                user: true,
                faculty: true,
                major: true
            }
        })
        if (!lecturer) {
            throw new NotFoundException('Không tìm thấy giảng viên này')
        }
        const classInfo = await prisma.class.findFirst({
            where: {
                homeroomLecturerId: lecturer.id
            }
        });

        // if (!classInfo) {
        //     throw new NotFoundException("Giảng viên chưa được phân công chủ nhiệm lớp");
        // }
        const whereCondition = {
            classId: classInfo.id,
            ...(search && {
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
            })
        }
        const [students, totalStudents] = await Promise.all([
            prisma.student.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    studentCode: true,
                    faculty: {
                        select: {
                            name: true,
                        }
                    },
                    major: {
                        select: {
                            name: true
                        }
                    },
                    user: {
                        select: {
                            fullName: true,
                            avatar: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.student.count({
                where: whereCondition
            })
        ])
        return {
            lecturerName: lecturer.user.fullName,
            lecturerCode: lecturer.lecturerCode,
            avatarLecturer: lecturer.user.avatar,
            lecturerFaculty: lecturer.faculty.name,
            lecturerMajor: lecturer.major.name,
            students,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalStudents,
                totalPage: Math.ceil(totalStudents / limit)
            }
        }
    }
}