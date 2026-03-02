import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import { ProductCode, VnpLocale, dateFormat } from 'vnpay'
import vnpay from "../../common/vnpay/initVnpay.js"
export const paymentSecvice = {
    getUnpaidEnrollments: async (studentId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            include: {
                program: {
                    include: {
                        programSubjects: true
                    }
                }
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy học sinh này")
        }
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'REGISTERED',
                isPaid: false
            },
            select: {
                id: true,
                fee: true,
                courseSection: {
                    select: {
                        sectionCode: true,
                        plannedClass: {
                            select: {
                                name: true,
                            }
                        },
                        lecturer: {
                            select: {
                                lecturerCode: true,
                                user: {
                                    select: {
                                        fullName: true
                                    }
                                }
                            }
                        },
                        subject: {
                            select: {
                                name: true,
                                credits: true
                            }
                        }
                    }
                },
            }
        })

        return {
            enrollments
        }
    },
    createPayment: async (studentId, data) => {

        const { enrollmentIds } = data

        // ===============================
        // 1️⃣ Validate input
        // ===============================
        if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
            throw new BadrequestException("enrollmentIds phải là mảng và không được rỗng")
        }

        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên")
        }

        // ===============================
        // 2️⃣ Lấy enrollment hợp lệ
        // ===============================
        const enrollments = await prisma.enrollment.findMany({
            where: {
                id: { in: enrollmentIds.map(Number) },
                studentId: student.id,
                isPaid: false
            }
        })

        if (enrollments.length !== enrollmentIds.length) {
            throw new BadrequestException("Một số học phần không hợp lệ hoặc đã thanh toán")
        }

        const enrollmentIdList = enrollments.map(e => e.id)

        // ===============================
        // 3️⃣ Tính tổng tiền
        // ===============================
        const totalAmount = enrollments.reduce(
            (sum, e) => sum + e.fee,
            0
        )

        // ===============================
        // 4️⃣ Transaction xử lý payment
        // ===============================
        const payment = await prisma.$transaction(async (tx) => {

            // 🔥 HỦY TOÀN BỘ PENDING CŨ LIÊN QUAN
            await tx.payment.updateMany({
                where: {
                    status: "PENDING",
                    enrollments: {
                        some: {
                            enrollmentId: { in: enrollmentIdList }
                        }
                    }
                },
                data: {
                    status: "CANCELED"
                }
            })

            // 🔥 TẠO PAYMENT MỚI
            const newPayment = await tx.payment.create({
                data: {
                    amount: totalAmount,
                    status: "PENDING"
                }
            })

            await tx.paymentEnrollment.createMany({
                data: enrollmentIdList.map(id => ({
                    paymentId: newPayment.id,
                    enrollmentId: id
                }))
            })

            return newPayment
        })

        // ===============================
        // 5️⃣ Tạo link VNPay
        // ===============================
        const paymentUrl = await vnpay.buildPaymentUrl({
            vnp_Amount: payment.amount,
            vnp_IpAddr: "127.0.0.1",
            vnp_TxnRef: payment.id.toString(),
            vnp_OrderInfo: "Thanh toan hoc phi",
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: "http://localhost:8000/api/student/payment/vnpayReturn",
            vnp_Locale: VnpLocale.VN
        })

        return { paymentUrl }
    },
    vnpayReturn: async (query) => {
        const paymentId = Number(query.vnp_TxnRef)

        if (query.vnp_ResponseCode === "00") {
            // Thành công
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: "SUCCESS",
                    vnpTransactionNo: query.vnp_TransactionNo,
                    bankCode: query.vnp_BankCode,
                    payDate: new Date()
                }
            })

            const relations = await prisma.paymentEnrollment.findMany({
                where: { paymentId }
            })

            const enrollmentIds = relations.map(r => r.enrollmentId)

            await prisma.enrollment.updateMany({
                where: { id: { in: enrollmentIds } },
                data: { isPaid: true }
            })
            return "Thanh toán thành công"
        } else {
            // Thất bại hoặc hủy
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: "FAILED",
                    vnpTransactionNo: query.vnp_TransactionNo,
                    bankCode: query.vnp_BankCode,
                    payDate: new Date()
                }
            })
            return "Thanh toán thất bại hoặc đã hủy"
        }

    },
    getAllEnrollmentIsPaid: async (studentId, semesterId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            include: {
                program: {
                    include: {
                        programSubjects: true
                    }
                }
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy học sinh này")
        }
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: "REGISTERED",
                isPaid: true,

                ...(semesterId && {
                    courseSection: {
                        semesterId: Number(semesterId)
                    }
                })
            },
            select: {
                fee: true,
                isPaid: true,
                status: true,
                enrolledAt: true,
                payments: {
                    where: {
                        payment: {
                            status: "SUCCESS"
                        }
                    },
                    select: {
                        payment: {
                            select: {
                                payDate: true,
                            }
                        }
                    }
                },
                courseSection: {
                    select: {
                        sectionCode: true,
                        semester: {
                            select: {
                                name: true,
                                academicYear: true
                            },
                        },
                        subject: {
                            select: {
                                code: true,
                                name: true,
                                credits: true,
                            }
                        }
                    }
                }
            }
        })
        const total = enrollments.reduce((acc,curr) => (
            acc + curr.fee
        ),0)
        const result = {}

        for (const item of enrollments) {
            const semester = item.courseSection.semester
            const subject = item.courseSection.subject
            const key = semester.id

            if (!result[key]) {
                result[key] = {
                    semesterId: semester.id,
                    semesterName: semester.name,
                    academicYear: semester.academicYear,
                    enrollments: [],
                    totalCredits: 0,
                    totalFee: 0
                }
            }

            result[key].enrollments.push({
                sectionCode : item.courseSection.sectionCode,
                subjectCode: subject.code,
                subjectName: subject.name,
                credits: subject.credits,
                fee: item.fee,
                status : item.status,
                 payDate: item.payments[0]?.payment?.payDate || null
            })

            result[key].totalCredits += subject.credits || 0
            result[key].totalFee += item.fee || 0
        }

        const enrollment = Object.values(result)
        return {
            enrollment,
            total
        }
    }
}
