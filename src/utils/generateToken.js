import jwt from 'jsonwebtoken';
const generateToken = (userId,role,user) => {
    const {password,...safeUser} = user

    const token = jwt.sign(
        {id : userId, role : role},
        process.env.JWT_SECRET,
        {expiresIn : process.env.JWT_EXPIRES_IN}
    );
    return {
        accessToken : token,
        user : safeUser
    }
}

export default generateToken;