const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const generateJwtToken = (idUser) => {
    if (!idUser) return null;

    const payload = {
        id: idUser
    };
    const options = {
        expiresIn: "30d"
    };

    return jwt.sign(payload, jwtSecret, options);

}


const verifyJwtToken = (token) => {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (e) {
        return null;
    }
}

module.exports = {
    generateJwtToken,
    verifyJwtToken
}