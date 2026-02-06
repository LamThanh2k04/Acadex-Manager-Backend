import { BadrequestException } from "../common/helpers/exception.helper.js";


const validateMissingFields = (data, requiredFields, entityName = 'dữ liệu') => {
    const missing  = requiredFields.filter(field => !data[field]);
    if(missing.length > 0) {
        throw new BadrequestException(`Thiếu các trường bắt buộc: ${missing.join(', ')} trong ${entityName}`);
    }
}
export default validateMissingFields;