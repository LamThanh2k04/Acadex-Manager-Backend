import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const profileLecturerSecvice = {
    getInfoLecturer: async (lecturerId) => {
        const lecturer = await prisma.user.findUnique({
            where: { id: Number(lecturerId) },
            select: {
                fullName: true,
                avatar: true,
                email: true,
                gender: true,
                dateOfBirth: true,
                phoneNumber: true,
                address: true,
                isActive: true,
                lecturer: {
                    select: {
                        lecturerCode: true,
                        personalEmail: true,
                        citizenId: true,
                        placeOfBirth: true,
                        ethnicity: true,
                        degree: true,
                        position: true,
                        status: true,
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
                        }
                    }
                }
            }
        })
        if (!lecturer) {
            throw new NotFoundException('Không tìm thấy giảng viên này')
        }
        return {
            lecturer
        }
    }
}