const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName : {
        type : String,
        required : true,
    },
    mailAddress : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    dateOfRegistration : {
        type: Date,
        required : true,
    },
    firstName : {
        type : String,
        required : true,
        trim : true,
    },
    lastName : {
        type : String,
        trim : true,
    },
    gender : {
        type : String,
        trim : true,
    },
    contactNumber : {
        type : Number,
        trim : true,
    },
    profilePicture : {
        type : String,
        required : true,
    },
    token : {
        type : String,
    },
    active : {
        type : Boolean,
        default : true,
    },
    accountType : {
        type : String,
        enum : ["Admin","endUser"],
        required : true,
    },
    resetPasswordExpires : {
        type : Date,
    },
    playlists : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Playlist",
        },
    ],
    artists : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "artist",
        },
    ],
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "song",
        },
    ],
},
{
    timestamps : true
}
);

module.exports = mongoose.model("User", UserSchema);