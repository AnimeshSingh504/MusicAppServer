const { default: mongoose } = require("mongoose");
const mongo = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() =>  console.log("Database connected Successfully"))
    .catch((error) => {
        console.log("Error while connecting the DataBase");
        console.log(error);
        process.exit(1);
    })
}