const User = require('../models/User')
const Credential = require('../models/Credential');
const mongoose = require('mongoose')
const { encrypt, decrypt } = require('../utils/utils')

exports.createCredential = async (req, res) => {
    const { service, username, password, notes } = req.body;
    const user = req.user;
    const hashedPassword = encrypt(password, user.secret);
    Credential
        .create({
            service: service,
            username: username,
            password: hashedPassword,
            notes: notes,
            owner: user._id
        })
        .then(cred => {
            User
                .findByIdAndUpdate(
                    user._id,
                    { $push: { credentials: cred._id } },
                    { new: true, useFindAndModify: false }
                )
                .then(user => res.status(200).json({ message: "Credential Created and User Updated Successfully", user: user }))
                .catch(err => res.status(501).json({ message: "Internal Server Error While Fetching User", error: err }))
        })
        .catch(err => res.status(500).json({ message: "Internal Server Error While Creating the Credential", error: err }))
}

exports.fetchCredential = async (req, res) => {
    const { credId } = req.body;
    const user = req.user;
    Credential
        .findById(credId)
        .then(cred => {
            let dispCred = {
                service: cred.service,
                username: cred.username,
                password: decrypt(cred.password, user.secret),
                notes: cred.notes,
            }
            return res.status(200).json(dispCred)
        })
        .catch(err => res.status(500).json({ message: "Internal Server Error While Fetching the Credential", error: err }))
}

exports.updateCredential = async (req, res) => {
    const { credId, service, username, password, notes } = req.body;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(credId)) return res.status(400).json({ message: "Invalid Credential Id" })
    Credential
        .findById(credId)
        .then(oldCred => {
            if (!oldCred) return res.status(404).json({ message: "Credential not Found" })
            const updatedFields = {
                service: service,
                username: username,
                notes: notes
            };

            if (password) {
                updatedFields.password = encrypt(password, user.secret);
            }

            Credential
                .findByIdAndUpdate(credId, updatedFields, { new: true, useFindAndModify: false })
                .then(updatedCred => res.status(200).json({ message: "Credential Updated Successfully", credential: updatedCred }))
                .catch(err => res.status(500).json({ message: "Internal Server Error While Updating the Credential", error: err }))
        })
        .catch(err => res.status(500).json({ message: "Internal Server Error While Validating the Credential Id", error: err }))
}

exports.deleteCredential = async (req, res) => {
    const { credId } = req.body;
    const user = req.user;
    if (!credId) return res.status(400).json({ message: "Credential Id is required" })
    if (!mongoose.Types.ObjectId.isValid(credId)) return res.status(400).json({ message: "Invalid Credential Id" })
    const deleteQuery = Credential.findByIdAndDelete(credId);
    deleteQuery
        .exec()
        .then(deletedCredential => {
            if (!deletedCredential) return res.status(404).json({ message: "Credential Not Found" })
            User
                .findByIdAndUpdate(
                    user._id,
                    { $pull: { credentials: credId } },
                    { new: true, useFindAndModify: false }
                )
                .then(updatedUser => res.status(200).json({ message: "Credential Deleted Successfully", user: updatedUser }))
                .catch(err => res.status(500).json({ message: "Internal Server Error While Updating User", error: err }))
        })
        .catch(err => res.status(500).json({ message: "Internal Server Error While Deleting the Credential", error: err }))
}
