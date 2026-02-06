import slugify from "slugify";

const generateMajorCode = (name) => {
    const majorCode = slugify(name, {
        replacement: ' ',
        lower: false,
        upper: true,
        strict: true,
        locale: 'vi'
    });
    const shortMajorCode = majorCode.split(' ').filter(Boolean).map(word => word[0]).join('').toUpperCase();
    return `N-${shortMajorCode}`;
}
export default generateMajorCode;