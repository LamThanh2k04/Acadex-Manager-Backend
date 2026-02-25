import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js";
import prisma from "../../common/prisma/initPrisma.js";
import validateEmail from "../../utils/validateEmail.js";
import validateMissingFields from "../../utils/validateFields.js";
import validatePassword from "../../utils/validatePassword.js";
import bcrypt from 'bcrypt'
import generateToken from "../../utils/generateToken.js";


export const authService = {
    registerAdmin: async (data) => {
        validateMissingFields(data, ['fullName', 'email', 'password'])
        const { fullName, email, password } = data;
        validateEmail(email, 'ADMIN')
        validatePassword(password)
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            throw new ConflictException("Email này đã tồn tại. Vui lòng sử dụng email khác");
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.user.create({
            data: {
                fullName: fullName,
                email: email,
                password: hashpassword
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                password: true,
                role: true
            }
        })
        return {
            newAdmin
        };
    },
    login: async (data) => {
        validateMissingFields(data, ['identifier', 'password'])
        const { identifier, password } = data;

        let user = null

        user = await prisma.user.findUnique({ where: { email: identifier } })

        if (!user) {
            const student = await prisma.student.findUnique({ where: { studentCode: identifier }, include: { user: true } })
            if (student) {
                user = student.user
                console.log(user)
            }
        }
        if (!user) {
            const lecturer = await prisma.lecturer.findUnique({ where: { lecturerCode: identifier }, include: { user: true } })
            if (lecturer) {
                user = lecturer.user
            }
        }
        if (!user) {
            throw new NotFoundException("Không tìm thấy người dùng này")
        }

        if (!user.isActive) {
            let roleText = '';
            switch (user.role) {
                case 'ADMIN':
                    roleText = "quản trị viên";
                    break;
                case 'STUDENT':
                    roleText = "sinh viên";
                    break;
                case 'LECTURER':
                    roleText = "giảng viên";
                    break;
                default:
                    roleText = "người dùng";
            }
            throw new BadrequestException(`Tài khoản ${roleText} này đã bị khóa.`);
        }

        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            throw new BadrequestException("Mật khẩu không đúng");
        }
        const token = generateToken(user.id, user.role, user);
        return {
            token
        };
    }
}