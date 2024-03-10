const mongoose = require("mongoose");

const songSchema = mongoose.Schema({
    songTitle : {
        type : String,
        required : true,
        trim : true,
    },
    duration : {
        type : String,
        required : true,
    },
    releaseDate : {
        type : String,
        required : true,
    },
    artistID : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "artist",
        },
    ],
    albumID : 
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "album",
    },
    lyrics : {
        type : String,
        trim : true,
    },
    filePath : {
        type : String,
        required : true,
        trim : true,
    },
});

module.exports = mongoose.model("song", songSchema);