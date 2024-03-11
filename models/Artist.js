const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
    artistName : {
        type : String,
        required : true,
        trim : true,
    },
    biography : {
        type : String,
        trim : true,
    },
    artistImage : {
        type : String,
    },
    songs : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "song",
        },
    ],
    albums : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "album",
        },
    ],
});

module.exports = mongoose.model("artist", artistSchema);