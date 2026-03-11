import prisma from "../../common/prisma/initPrisma"

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
                isActive : true,
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
                                code : true,
                                name: true
                            }
                        },
                        faculty: {
                            select: {
                                code : true,
                                name: true
                            }
                        },
                        major: {
                            select: {
                                code : true,
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
    getAllSemestersSimple : async () => {
        const semesters = await prisma.semester.findMany({
            where : {isActive : true}
        })
        return {
            se
        }
    }
    // getAllCourseSeci
}