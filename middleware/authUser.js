const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { NotFoundError, UnauthorizedError } = require('../helpers/api-errors');

exports.authUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) throw new UnauthorizedError("The token is not available")
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    if (!decoded) throw new UnauthorizedError("The token is invalid")
    const user = await User.findOne({ email: decoded.email })
    if (!user) throw new NotFoundError('We could not find any users with this email.')
    req.user = user;
    next();
}