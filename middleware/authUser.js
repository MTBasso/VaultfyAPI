const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "The token is not available" })
    jwt.verify(token, process.env.JWT_SECRETKEY, (err, decoded) => {
        if (err) return res.status(401).json('Token is wrong')
        User
            .findOne({ email: decoded.email })
            .then(user => {
                req.user = user
                next()
            })
            .catch(err => res.status(500).json({ message: "Internal Server Error While Fetching the User", error: err }))
    })
}