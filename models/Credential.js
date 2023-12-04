const mongoose = require('mongoose');

const Credential = mongoose.model(
    "Credential",
    {
        service: String,
        username: String,
        password: String,
        notes: String,
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
)

module.exports = Credential
