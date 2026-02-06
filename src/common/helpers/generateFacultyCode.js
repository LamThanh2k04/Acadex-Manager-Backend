import slugify from "slugify";

const generateFacultyCode = (name) => {
    const facultyCode = slugify(name, {
        replacement: ' ',
        lower: false,
        upper: true,
        strict: true,
        locale: 'vi'
    });
    const shortFacultyCode = facultyCode.split(' ').filter(Boolean).map(word => word[0]).join('').toUpperCase();
    return `K-${shortFacultyCode}`;
}
export default generateFacultyCode;