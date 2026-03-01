import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const profileStudentService = {
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
                                name: true
                            }
                        },
                        faculty: {
                            select: {
                                name: true
                            }
                        },
                        major: {
                            select: {
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
}