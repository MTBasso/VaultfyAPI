require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require("./routes/authRoutes")
const credentialRoutes = require("./routes/credentialRoutes");
const { errorMiddleware } = require('./middleware/error');

const app = express();
app.use(express.json());
// app.use(cors({
//     origin: [process.env.FRONTEND_URL],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
// }));
app.use(cookieParser())

mongoose.connect(process.env.MONGO_URL + '/authtemplate')

app.use(authRoutes);
app.use(credentialRoutes);
app.use(errorMiddleware)

module.exports = app;