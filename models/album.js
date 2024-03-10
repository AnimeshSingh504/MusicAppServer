const mongoose = require("mongoose");

const albumSchema = mongoose.Schema({
    albumTitle : {
        type : String,
        trim : true,
        required : true,
    },
    releaseDate : {
        type : String,
        trim : true,
        required : true,
    },
    artist : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "artist",
            required : true,
        },
    ],
    songs : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "song",
        },
    ],
    coverImage : {
        type : String,
        trim : true,
    },
});

module.exports = mongoose.model("album", albumSchema);