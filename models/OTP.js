const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    otp : {
        type : String,
        required : true,
    },
    createdAt : {
        type: Date,
        default : Date.now(),
        required : true,
    },
    email : {
        type : String,
        required : true,
        trim : true,
    },
});

module.exports = mongoose.model("otp", OtpSchema);