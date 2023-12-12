const User = require('../models/User')
const { generateSecureString, isValidPassword } = require('../helpers/utils')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ApiError, BadRequestError, NotFoundError, UnauthorizedError } = require('../helpers/api-errors');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new NotFoundError('Erro bad request')
    if (!isValidPassword(password)) return res.status(400).json({ message: "Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        secret: generateSecureString(20)
    })
    res.status(200).json(
        {
            message: "User Created Successfully",
            user: {
                name: newUser.name,
                email: newUser.email,
                secret: newUser.secret
            }
        })
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email })
    if (!user) throw new NotFoundError('We could not find any users with this email.')
    const success = await bcrypt.compare(password, user.password)
    if (!success) throw new UnauthorizedError("The password is incorrect")
    const token = jwt.sign({ email }, process.env.JWT_SECRETKEY, { expiresIn: "30d" });
    req.user = user;
    res.cookie("token", token);
    res.status(200).json(
        {
            message: 'Logged In Successfully',
            user: {
                name: user.name,
                email: user.email,
            }
        })
}

exports.changePassword = async (req, res) => {
    const { email, newPassword, secret } = req.body;
    const user = await User.findOne({ email: email })
    if (!user) throw new NotFoundError('We could not find any users with this email.')
    if (user.secret !== secret) throw new UnauthorizedError('Invalid secret');
    if (!isValidPassword(newPassword)) throw new BadRequestError("Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    if (!newHashedPassword) throw new ApiError("Error While Hashing the New Password")
    user.password = newHashedPassword;
    const updatedUser = await user.save();
    if (!updatedUser) throw new ApiError("Error While Updating the User");
    res.status(200).json(
        {
            message: "Password updated successfully",
            user: {
                name: user.name,
                email: user.email,
            }
        });
};