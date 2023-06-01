const {verifyJwtToken} = require('../../db/jwt');

const User = require('../../db/models/User');


const requiredUserPrivileges = (req, res, next) => {

    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({message: "Unauthorized"});
    }

    else {
        const decoded = verifyJwtToken(token.split(' ')[1]);
        if (!decoded) {
            return res.status(401).json({message: "Unauthorized"});
        }
        else {
            User.findById(decoded.id)
                .then(user => {
                    if (!user) {
                        return res.status(401).json({message: "Unauthorized"});
                    }
                    res.locals.user = user;
                    next();
                })
                .catch(err => res.status(401).json({message: "Unauthorized"}));
        }
    }
}

module.exports = {
    requiredUserPrivileges
}