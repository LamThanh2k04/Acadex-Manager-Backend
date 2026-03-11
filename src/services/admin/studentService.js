import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateEmail from "../../utils/validateEmail.js"
import validateMissingFields from "../../utils/validateFields.js"
import validatePassword from "../../utils/validatePassword.js"
import bcrypt from 'bcrypt'
export const studentService = {
    createStudent: async (data, avatarPath) => {
        validateMissingFields(data, ['fullName', 'email', 'password', 'studentCode', 'classId', 'programId', 'gender'])
        const { fullName, email, password, studentCode, classId, programId, gender } = data

        if (typeof fullName !== 'string' || fullName.trim() === '') {
            throw new BadrequestException("Tên không hợp lệ")
        }
        if (typeof email !== 'string' || email.trim() === '') {
            throw new BadrequestException("Email không hợp lệ")
        }
        if (typeof password !== 'string' || password.trim() === '') {
            throw new BadrequestException("Mật khẩu không hợp lệ")
        }
        if (typeof studentCode !== 'string' || studentCode.trim() === '') {
            throw new BadrequestException("Mã sinh viên không hợp lệ")
        }
        if (!Number.isInteger(Number(classId))) {
            throw new BadrequestException("classId không hợp lệ")
        }
        if (!Number.isInteger(Number(programId))) {
            throw new BadrequestException("programId không hợp lệ")
        }
        if (typeof gender !== 'string' || gender.trim() === '') {
            throw new BadrequestException("Giới tính không hợp lệ")
        }
        validateEmail(email, 'STUDENT')
        validatePassword(password)

        const [cls, program, existingStudentCode] = await Promise.all([
            prisma.class.findUnique({
                where: { id: Number(classId) }
            }),
            prisma.program.findUnique({
                where: { id: Number(programId) },
                include: {
                    major: true
                }
            }),
            prisma.student.findUnique({
                where: { studentCode: studentCode }
            })
        ])
        if (!cls) {
            throw new NotFoundException("Không tìm thấy lớp này")
        }
        if (!program) {
            throw new NotFoundException("Không tìm thấy chương trình này")
        }
        if (existingStudentCode) {
            throw new ConflictException("Mã sinh viên đã tồn tại")
        }
        if (program.majorId !== cls.majorId) {
            throw new BadrequestException("Chương trình không thuộc chuyên ngành của lớp")
        }
        const hashPasswrod = await bcrypt.hash(password, 10)
        const student = await prisma.user.create({
            data: {
                fullName: fullName.trim(),
                email: email.trim(),
                password: hashPasswrod,
                gender: gender,
                avatar: avatarPath ? avatarPath : null,
                role: 'STUDENT',
                student: {
                    create: {
                        studentCode: studentCode.trim(),
                        classId: Number(classId),
                        programId: Number(programId),
                        facultyId: program.major.facultyId,
                        majorId: program.majorId
                    }
                }
            }
        })
        return {
            student
        }
    },
    updateStudentInfo: async (studentId, data, avatarPath) => {
        const { fullName, email, gender, dateOfBirth, phoneNumber, address, studentCode, personalEmail, citizenId, placeOfBirth, ethnicity, admissionYear, graduateYear, status, classId } = data

        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            include: {
                user: true
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên này")
        }
        const updateUserData = {}
        const updateStudentData = {}
        if (fullName !== undefined) {
            if (typeof fullName !== 'string' || fullName.trim() === '') {
                throw new BadrequestException('Tên không hợp lệ')
            }
            updateUserData.fullName = fullName.trim()
        }
        if (email !== undefined) {
            const trimmedEmail = email.trim()
            if (!trimmedEmail) {
                throw new BadrequestException("Email không được để trống")
            }

            validateEmail(email, "STUDENT")
            const existingEmail = await prisma.user.findFirst({
                where: {
                    email: email.trim(),
                    NOT: { id: student.user.id }
                }
            })

            if (existingEmail) {
                throw new ConflictException("Email đã tồn tại")
            }

            updateUserData.email = email.trim()
        }
        if (gender !== undefined) {
            updateUserData.gender = gender
        }
        if (dateOfBirth !== undefined) {
            updateUserData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
        }
        if (phoneNumber !== undefined) {
            updateUserData.phoneNumber = phoneNumber?.trim() || null
        }
        if (address !== undefined) {
            updateUserData.address = address?.trim() || null
        }
        if (avatarPath) {
            updateUserData.avatar = avatarPath
        }

        if (studentCode !== undefined) {
            const existingCode = await prisma.student.findFirst({
                where: {
                    studentCode: studentCode.trim(),
                    NOT: { id: Number(studentId) }
                }
            })

            if (existingCode) {
                throw new ConflictException("Mã sinh viên đã tồn tại")
            }
            updateStudentData.studentCode = studentCode.trim()
        }
        if (classId !== undefined) {
            const cls = await prisma.class.findUnique({
                where: { id: Number(classId) }
            })
            if (!cls) {
                throw new NotFoundException("Không tìm thấy lớp học")
            }
            updateStudentData.classId = Number(classId)
        }
        if (personalEmail !== undefined) {
            const trimmedEmail = personalEmail?.trim()

            if (!trimmedEmail) {
                updateStudentData.personalEmail = null
            } else {
                if (!trimmedEmail.endsWith('@gmail.com')) {
                    throw new BadrequestException("Email cá nhân phải là gmail")
                }

                updateStudentData.personalEmail = trimmedEmail
            }
        }
        if (citizenId !== undefined) updateStudentData.citizenId = citizenId?.trim() || null
        if (placeOfBirth !== undefined) updateStudentData.placeOfBirth = placeOfBirth?.trim() || null
        if (ethnicity !== undefined) updateStudentData.ethnicity = ethnicity?.trim() || null
        if (admissionYear !== undefined) {
            if (!Number.isInteger(Number(admissionYear))) {
                throw new BadrequestException("Năm nhập học không hợp lệ")
            }
            updateStudentData.admissionYear = Number(admissionYear)
        }
        if (graduateYear !== undefined) {
            if (!Number.isInteger(Number(graduateYear))) {
                throw new BadrequestException("Năm tốt nghiệp không hợp lệ")
            }
            updateStudentData.graduateYear = Number(graduateYear)
        }
        if (status !== undefined) updateStudentData.status = status
        const updateStudentInfo = await prisma.user.update({
            where: { id: student.user.id },
            data: {
                ...updateUserData,
                student: {
                    update: {
                        ...updateStudentData
                    }
                }
            }
        })

        return { updateStudentInfo }
    },
    updateStudentStatusActive: async (studentId) => {
        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            include: {
                user: true
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên này")
        }
        const updateStudentStatusActive = await prisma.student.update({
            where: { id: Number(studentId) },
            data: {
                user: {
                    update: {
                        isActive: !student.user.isActive
                    }
                }
            },
            include: {
                user: {
                    select: {
                        isActive: true
                    }
                }
            }
        })
        return {
            updateStudentStatusActive
        }
    },
    getAllStudents: async (search, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            role: 'STUDENT',
            ...(search ? {
                OR: [
                    {
                        fullName: {
                            contains: search.toLowerCase()
                        }
                    },
                    {
                        student: {
                            studentCode: {
                                contains: search.toLowerCase()
                            }
                        }
                    }
                ]
            } : {})
        }
        const [students, totalStudents] = await Promise.all([
            prisma.user.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    fullName: true,
                    email: true,
                    avatar: true,
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
                            gpa: true,
                            creditsEarned: true,
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
                                    name: true,
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
                            }

                        }
                    }
                }
            }),
            prisma.user.count({
                where: whereCondition
            })
        ])
        return {
            students,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalStudents,
                totalPages: Math.ceil(totalStudents / limit)
            }
        }
    },
    resetPasswordStudent: async (studentId, data) => {
        const { newPassword } = data
        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            include: {
                user: true
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên này")
        }
        const hashPasswrod = await bcrypt.hash(newPassword, 10)
        const resetPassword = await prisma.user.update({
            where: { id: student.user.id },
            data: {
                password: hashPasswrod
            }
        })
        return {
            resetPassword
        }
    },
    getAllRequestCertificatesStudents: async (status, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(status ? {
                status: status
            } : {})
        }
        const [requestCertificates, totalRequestCertificates] = await Promise.all([
            prisma.certificate.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fileUrl: true,
                    issueDate: true,
                    description: true,
                    status: true,
                    student: {
                        select: {
                            studentCode: true,
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    },
                    template: {
                        select: {
                            code: true,
                            name: true,
                        }
                    }
                }
            }),
            prisma.certificate.count({
                where: whereCondition
            })
        ])
        return {
            requestCertificates,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalRequestCertificates,
                totalPages: Math.ceil(totalRequestCertificates / limit)
            }
        }
    },
    getInfoRequestCertificateStudent: async (certificateId) => {
        const certificateInfo = await prisma.certificate.findUnique({
            where: { id: Number(certificateId) },
            select: {
                id: true,
                fileUrl: true,
                issueDate: true,
                description: true,
                status: true,
                student: {
                    select: {
                        studentCode: true,
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                template: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return {
            certificateInfo
        }
    },
    approveRequestCertificateStudent: async (certificateId, adminId, data) => {
        const { note } = data
        const certificate = await prisma.certificate.findUnique({
            where: { id: Number(certificateId) }
        })
        if (!certificate) {
            throw new NotFoundException("Không tìm thấy yêu cầu cấp chứng chỉ này")
        }
        if (certificate.status !== "PENDING") {
            throw new BadrequestException("Yêu cầu cấp chứng chỉ đã được xử lý")
        }
        const approveCertificate = await prisma.certificate.update({
            where: { id: Number(certificateId) },
            data: {
                status: "ISSUED",
                checkedAt: new Date(),
                checkedBy: adminId,
                note: note?.trim() || null
            }
        })
        return {
            approveCertificate
        }
    },
    rejectRequestCertificateStudent: async (certificateId, adminId, data) => {
        const { note } = data
        const certificate = await prisma.certificate.findUnique({
            where: { id: Number(certificateId) }
        })
        if (!certificate) {
            throw new NotFoundException("Không tìm thấy yêu cầu cấp chứng chỉ này")
        }
        if (certificate.status !== "PENDING") {
            throw new BadrequestException("Yêu cầu cấp chứng chỉ đã được xử lý")
        }
        const rejectCertificate = await prisma.certificate.update({
            where: { id: Number(certificateId) },
            data: {
                status: "REVOKED",
                checkedAt: new Date(),
                checkedBy: adminId,
                note: note?.trim() || null
            }
        })
        return rejectCertificate
    },
    getStudentsTuitionStatus: async (semesterId, status, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit

        const students = await prisma.student.findMany({
            where: {
                enrollments: {
                    some: {
                        status: 'REGISTERED',
                        ...(semesterId && {
                            courseSection: {
                                semesterId: Number(semesterId)
                            }
                        })
                    }
                }
            },
            select: {
                studentCode: true,
                user: {
                    select: { fullName: true }
                },
                enrollments: {
                    where: {
                        status: 'REGISTERED',
                        ...(semesterId && {
                            courseSection: {
                                semesterId: Number(semesterId)
                            }
                        })
                    },
                    select: {
                        fee: true,
                        courseSection: {
                            select: {
                                semester: {
                                    select: {
                                        id: true,
                                        name: true,
                                        academicYear: true
                                    }
                                }
                            }
                        },
                        payments: {
                            select: {
                                payment: {
                                    select: {
                                        id: true,
                                        amount: true,
                                        status: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const results = []

        students.forEach(student => {

            const semesterMap = {}

            student.enrollments.forEach(enrollment => {

                const semester = enrollment.courseSection.semester
                const key = semester.id

                if (!semesterMap[key]) {
                    semesterMap[key] = {
                        semesterName: `${semester.name} ${semester.academicYear}`,
                        totalCourseFee: 0,
                        paymentMap: new Map()
                    }
                }

                semesterMap[key].totalCourseFee += enrollment.fee

                enrollment.payments.forEach(pe => {
                    const payment = pe.payment
                    if (payment && payment.status === "SUCCESS") {
                        semesterMap[key].paymentMap.set(payment.id, payment.amount)
                    }
                })
            })

            Object.values(semesterMap).forEach(sem => {

                const paidAmount = Array.from(sem.paymentMap.values())
                    .reduce((sum, amount) => sum + amount, 0)

                const remainingAmount = sem.totalCourseFee - paidAmount

                let statusResult = "PAID"

                if (sem.totalCourseFee === 0) {
                    statusResult = "NO_COURSE"
                } else if (remainingAmount > 0) {
                    statusResult = "UNPAID"
                }

                results.push({
                    studentCode: student.studentCode,
                    fullName: student.user.fullName,
                    semester: sem.semesterName,
                    totalCourseFee: sem.totalCourseFee,
                    paidAmount,
                    remainingAmount,
                    status: statusResult
                })
            })
        })

        const filtered = status
            ? results.filter(s => s.status === status)
            : results

        const total = filtered.length
        const studentsPaginated = filtered.slice(skip, skip + limit)

        return {
            students: studentsPaginated,
            pagination: {
                page: Number(page),
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    },
    getOverViewStudent: async () => {
        const [totalStudent, male, female, accountLooked] = await Promise.all([
            prisma.user.count({
                where: { role: 'STUDENT' }
            }),
            prisma.user.count({
                where: { role: 'STUDENT', gender: 'MALE' },

            }),
            prisma.user.count({
                where: { role: 'STUDENT', gender: 'FEMALE' }
            }),
            prisma.user.count({
                where: { role: 'STUDENT', isActive: false }
            }),
        ])
        return {
            totalStudent,
            male,
            female,
            accountLooked
        }
    }
}