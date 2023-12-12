const User = require('../models/User')
const Credential = require('../models/Credential');
const mongoose = require('mongoose')
const { encrypt, decrypt } = require('../utils/utils')
const { ApiError, BadRequestError, NotFoundError, UnauthorizedError } = require('../helpers/api-errors');


exports.createCredential = async (req, res) => {
    const { service, username, password, notes } = req.body;
    const user = req.user;
    const hashedPassword = encrypt(password, user.secret);
    const newCredential = await Credential.create({
        service,
        username,
        password: hashedPassword,
        notes,
        owner: user._id
    })
    if (!newCredential) throw new ApiError("Internal Server Error While Creating the Credential")
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $push: { credentials: newCredential._id } },
        { new: true, useFindAndModify: false }
    )
    if (!updatedUser) throw new ApiError("Internal Server Error While Fetching and Updating the User")
    res.status(200).json(
        {
            message: "Credential Created and User Updated Successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                credentials: updatedUser.credentials
            },
            newCredential: {
                credentialId: newCredential._id,
                service,
                username,
                notes
            }
        })
}

exports.fetchCredential = async (req, res) => {
    const { credId } = req.body;
    if (!credId || !mongoose.Types.ObjectId.isValid(credId)) throw new BadRequestError("Invalid Credential Id")
    const user = req.user;
    const credential = await Credential.findById(credId);
    if (!credential) throw new NotFoundError('Credential Not Found')
    res.status(200).json(
        {
            message: "Credential Fetched Successfully",
            credential: {
                service: credential.service,
                username: credential.username,
                password: decrypt(credential.password, user.secret),
                notes: credential.notes
            }
        })
}

exports.updateCredential = async (req, res) => {
    const { credId, service, username, password, notes } = req.body;
    const user = req.user;
    let encryptedNewPassword;
    if (!credId || !mongoose.Types.ObjectId.isValid(credId)) throw new BadRequestError("Invalid Credential Id")
    const credential = await Credential.findById(credId)
    if (!credential) throw new NotFoundError("Credential Not Found")
    if (password) encryptedNewPassword = encrypt(password, user.secret);
    credential.service = service;
    credential.username = username;
    credential.password = encryptedNewPassword;
    credential.notes = notes;
    const updatedCredential = await credential.save();
    if (!updatedCredential) throw new ApiError("Error While Updating the Credential");
    res.status(200).json(
        {
            message: "Credential Updated Successfully",
            credential: {
                service: updatedCredential.service,
                username: updatedCredential.username,
                password: decrypt(updatedCredential.password, user.secret),
                notes: updatedCredential.notes
            }
        })
}

exports.deleteCredential = async (req, res) => {
    const { credId } = req.body;
    const user = req.user;
    if (!credId || !mongoose.Types.ObjectId.isValid(credId)) throw new BadRequestError("Invalid Credential Id")
    const deleteQuery = Credential.findByIdAndDelete(credId);
    const deletedCredential = await deleteQuery.exec()
    if (!deletedCredential) throw new NotFoundError("Credential Not Found")
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $pull: { credentials: credId } },
        { new: true, useFindAndModify: false }
    )
    if (!updatedUser) throw new ApiError("Error While Updating the User");
    res.status(200).json(
        {
            message: "Credential Deleted Successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                credentials: updatedUser.credentials
            }
        })
}
