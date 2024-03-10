const mongoose = require("mongoose");

const GenreSchema = new mongoose.Schema({
    genreType : {
        type : String,
        required : true,
        trim : true,
    },
    artists : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "artist",
        },
    ],
    albums : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "album",
        },
    ],
    songs : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "song",
        },
    ],

});

module.exports = mongoose.model("genre",GenreSchema);