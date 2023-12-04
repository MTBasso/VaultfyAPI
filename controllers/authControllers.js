const User = require('../models/User')
const { generateSecureString, isValidPassword } = require('../utils/utils')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            if (!isValidPassword(password)) {
                return res.status(400).json({ message: "Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character." });
            }
            bcrypt.hash(password, 10)
                .then(hash => {
                    User.create({
                        name: name,
                        email: email,
                        password: hash,
                        secret: generateSecureString(20)
                    })
                        .then(user => res.status(200).json({ message: "User Created Successfully", user: user }))
                        .catch(err => res.status(500).json({ message: "Internal Server Error While Creating the User", error: err }));
                })
                .catch(err => res.status(500).json({ message: "Internal Server Error While Hashing the User Password", error: err }));
        })
        .catch(err => res.status(500).json({ message: "Internal Server Error While Checking the Email", error: err }));
}

exports.login = (req, res) => {
    const { email, password } = req.body;
    User
        .findOne({ email: email })
        .then(user => {
            bcrypt.compare(password, user.password, (err, response) => {
                if (!response) res.status(401).json("The password is incorrect")
                const token = jwt.sign({ email: user.email }, process.env.JWT_SECRETKEY, { expiresIn: "30d" });
                req.user = user;
                res.cookie("token", token);
                res.status(200).json({ message: 'Logged Successfully', user: req.user })
            })
        })
        .catch(err => res.status(501).json({ message: "There is not an account with that email yet", error: err }))
}

exports.changePassword = (req, res) => {
    const { email, newPassword, secret } = req.body;
    User
        .findOne({ email: email })
        .then(user => {
            if (!user) return res.status(404).json({ message: "User not found" });
            if (user.secret !== secret) return res.status(401).json({ message: "Invalid secret" });
            if (!isValidPassword(newPassword)) return res.status(400).json({ message: "Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character." });
            bcrypt.hash(newPassword, 10)
                .then(hash => {
                    user.password = hash;
                    user.save()
                        .then(updatedUser => {
                            res.status(200).json({ message: "Password updated successfully", user: updatedUser });
                        })
                        .catch(err => {
                            res.status(500).json({ message: "Internal Server Error While Updating the Password", error: err });
                        });
                })
                .catch(err => {
                    res.status(500).json({ message: "Internal Server Error While Hashing the New Password", error: err });
                });
        })
        .catch(err => {
            res.status(500).json({ message: "Internal Server Error While Finding the User", error: err });
        });
};