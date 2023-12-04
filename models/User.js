const mongoose = require('mongoose');

const User = mongoose.model(
    "User",
    {
        name: String,
        email: String,
        password: String,
        secret: String,
        credentials: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Credential"
            }
        ]
    }
)

module.exports = User
