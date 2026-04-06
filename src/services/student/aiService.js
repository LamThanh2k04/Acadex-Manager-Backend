import OpenAI from "openai";
import prisma from "../../common/prisma/initPrisma.js";


const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
Bạn là trợ lý ảo cho hệ thống quản lý sinh viên.

Phân tích câu hỏi tiếng Việt và trả về JSON duy nhất.

Format JSON:

{
  "intent": "schedule" | "exam" | "tuition" | "tuition_guide" | "grade" | "profile" | "general",
  "subjectName": string hoặc null,
  "semesterName": string hoặc null,
  "paymentStatus": "paid" | "unpaid" | "all" | null,
  "date": "YYYY-MM-DD" hoặc null
}

Quy tắc:

- Hỏi lịch học → schedule
- Hỏi lịch thi → exam
- Hỏi học phí → tuition
- Hỏi cách đóng học phí → tuition_guide
- Hỏi điểm → grade
- Hỏi thông tin cá nhân → profile

Nếu có nhắc ngày cụ thể → convert sang format YYYY-MM-DD và điền vào "date".

Riêng học phí:
- Nếu hỏi "đã đóng" → paymentStatus = "paid"
- Nếu hỏi "còn thiếu" → paymentStatus = "unpaid"
- Nếu không nói rõ → paymentStatus = "all"

Chỉ trả về JSON.
`;

export const aiService = {
    aiMessage: async (user, data) => {
        const { ask } = data;

       
        if (!user || user.role !== "STUDENT") {
            return {
                data: {
                    text: "Chỉ sinh viên mới được sử dụng chatbot.",
                    data: []
                }
            };
        }

      
        const student = await prisma.student.findUnique({
            where: { userId: user.id }
        });

        if (!student) {
            return {
                data: {
                    text: "Không tìm thấy thông tin sinh viên.",
                    data: []
                }
            };
        }

        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 0,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: ask }
            ]
        });

        let aiResult;

        try {
            aiResult = JSON.parse(
                completion.choices[0].message.content.trim()
            );
        } catch {
            aiResult = {
                intent: "general",
                subjectName: null,
                semesterName: null,
                paymentStatus: null
            };
        }

        const {
            intent,
            subjectName,
            semesterName,
            paymentStatus
        } = aiResult;

        if (intent === "schedule") {

            let whereCondition = {
                courseSection: {
                    enrollments: {
                        some: {
                            studentId: student.id,
                            status: "REGISTERED"
                        }
                    }
                }
            };

            if (aiResult.date) {

                
                const queryDate = new Date(aiResult.date + "T00:00:00");

                
                const jsDay = queryDate.getDay();

                
                const dbDay = jsDay === 0 ? 8 : jsDay + 1;

                
                const startOfDay = new Date(queryDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(queryDate);
                endOfDay.setHours(23, 59, 59, 999);

                whereCondition = {
                    ...whereCondition,
                    dayOfWeek: dbDay,
                    startDate: { lte: endOfDay },
                    endDate: { gte: startOfDay }
                };
            }

            const schedules = await prisma.schedule.findMany({
                where: whereCondition,
                include: {
                    courseSection: {
                        include: {
                            subject: true,
                            semester: true
                        }
                    },
                    room: true
                }
            });

            if (schedules.length === 0) {
                return {
                    data: {
                        text: aiResult.date
                            ? "Không có lịch học vào ngày này."
                            : "Bạn chưa có lịch học.",
                        data: []
                    }
                };
            }

            return {
                data: {
                    text: aiResult.date
                        ? `Đây là lịch học ngày ${aiResult.date}.`
                        : "Đây là toàn bộ lịch học của bạn.",
                    data: schedules
                }
            };
        }
       
        if (intent === "exam") {

            let examCondition = {
                courseSection: {
                    enrollments: {
                        some: {
                            studentId: student.id,
                            status: "REGISTERED"
                        }
                    }
                }
            };

            if (aiResult.date) {

                const queryDate = new Date(aiResult.date + "T00:00:00");

                const startOfDay = new Date(queryDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(queryDate);
                endOfDay.setHours(23, 59, 59, 999);

                examCondition = {
                    ...examCondition,
                    examDate: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                };
            }

            const exams = await prisma.examSchedule.findMany({
                where: examCondition,
                include: {
                    courseSection: {
                        include: {
                            subject: true,
                            semester: true
                        }
                    },
                    room: true
                }
            });

            if (exams.length === 0) {
                return {
                    data: {
                        text: aiResult.date
                            ? "Không có lịch thi vào ngày này."
                            : "Bạn chưa có lịch thi.",
                        data: []
                    }
                };
            }

            return {
                data: {
                    text: aiResult.date
                        ? `Đây là lịch thi ngày ${aiResult.date}.`
                        : "Đây là toàn bộ lịch thi của bạn.",
                    data: exams
                }
            };
        }

      
        if (intent === "tuition") {

            const enrollments = await prisma.enrollment.findMany({
                where: {
                    studentId: student.id,
                    status: "REGISTERED",

                    ...(paymentStatus === "paid" && { isPaid: true }),
                    ...(paymentStatus === "unpaid" && { isPaid: false }),

                    ...(semesterName && {
                        courseSection: {
                            semester: {
                                name: {
                                    contains: semesterName,
                                    mode: "insensitive"
                                }
                            }
                        }
                    })
                },
                include: {
                    courseSection: {
                        include: {
                            semester: true,
                            subject: true
                        }
                    }
                }
            });

            if (enrollments.length === 0) {
                return {
                    data: {
                        text: "Không tìm thấy dữ liệu học phí.",
                        data: []
                    }
                };
            }

            const total = enrollments.reduce((sum, e) => sum + e.fee, 0);

            let message = "";

            if (paymentStatus === "paid") {
                message = "Tổng học phí đã đóng";
            } else if (paymentStatus === "unpaid") {
                message = "Tổng học phí còn thiếu";
            } else {
                message = "Tổng học phí";
            }

            if (semesterName) {
                message += ` trong ${semesterName}`;
            }

            message += ` là ${total.toLocaleString()} VND.`;

            return {
                data: {
                    text: message,
                    data: enrollments
                }
            };
        }

       
        if (intent === "tuition_guide") {
            return {
                data: {
                    text: `
Bạn có thể đóng học phí bằng:

1. Chuyển khoản ngân hàng (ghi MSSV + Họ tên).
2. Đóng trực tiếp tại phòng tài chính.
3. Thanh toán online trên cổng sinh viên.
`,
                    data: []
                }
            };
        }

     
        if (intent === "grade") {
            const grades = await prisma.grade.findMany({
                where: {
                    enrollment: {
                        studentId: student.id,

                        ...(subjectName && {
                            courseSection: {
                                subject: {
                                    name: {
                                        contains: subjectName,
                                      
                                    }
                                }
                            }
                        })
                    }
                },
                include: {
                    enrollment: {
                        include: {
                            courseSection: {
                                include: { subject: true }
                            }
                        }
                    }
                }
            });

            if (grades.length === 0) {
                return {
                    data: {
                        text: "Không tìm thấy điểm phù hợp.",
                        data: []
                    }
                };
            }

            return {
                data: {
                    text: subjectName
                        ? `Đây là điểm môn ${subjectName} của bạn.`
                        : "Đây là toàn bộ điểm của bạn.",
                    data: grades
                }
            };
        }

        if (intent === "profile") {
            const profile = await prisma.student.findUnique({
                where: { id: student.id },
                include: {
                    user: true,
                    major: true,
                    class: true
                }
            });

            return {
                data: {
                    text: `
Thông tin của bạn:
- Họ tên: ${profile.user.fullName}
- MSSV: ${profile.studentCode}
- Email: ${profile.user.email}
- Ngành: ${profile.major?.name}
- Lớp: ${profile.class?.name}
`,
                    data: profile
                }
            };
        }

   
        return {
            data: {
                text: "Xin lỗi, mình chưa hiểu câu hỏi của bạn.",
                data: []
            }
        };
    }
};
