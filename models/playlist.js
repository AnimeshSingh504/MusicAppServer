const mongoose = require("mongoose");

const playlistSchema = mongoose.Schema({
    playlistName : {
        type : String,
        required : true,
        trim : true,
    },
    createdOn : {
        default : Date.now(),
    },
    coverImage : {
        type : String,
    },
    songs : [
        {
            type : mongoose.Schema.Types.ObjectId, 
            ref : "song",
        },
    ],
});

module.exports = mongoose.model('Playlist', playlistSchema);