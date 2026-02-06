import { BadrequestException } from "../common/helpers/exception.helper.js";

const validatePassword = (password) => {
    const regex = /^[A-Za-z0-9]{6,}$/
    if (!regex.test(password)) {
        throw new BadrequestException("Mật khẩu phải có ít nhất 6 ký tự và chỉ bao gồm chữ cái và số");
    }
}
export default validatePassword;    