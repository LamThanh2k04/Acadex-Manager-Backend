import { BadrequestException } from "../common/helpers/exception.helper.js";

const validateEmail = (email, role) => {

    const baseRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!baseRegex.test(email)) {
        throw new BadrequestException(`Email không hợp lệ`);
    }

    switch (role) {
        case 'ADMIN':
            if (!email.endsWith("@admin.acadex")) {
                throw new BadrequestException("Email của ADMIN phải có đuôi @admin.acadex");
            }
            break;
        case 'STUDENT':
            if (!email.endsWith("@edu.acadex")) {
                throw new BadrequestException("Email của STUDENT phải có đuôi @edu.acadex");
            }
            break;
        case 'LECTURER':
            if (!email.endsWith("@lecturer.acadex")) {
                throw new BadrequestException("Email của LECTURER phải có đuôi @lecturer.acadex");
            }
            break;
        default:
            throw new BadrequestException("Vai trò không hợp lệ");
    }
}
export default validateEmail;