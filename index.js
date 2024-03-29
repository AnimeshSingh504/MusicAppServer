const express = require("express");
const app = express();
const cookie_parser = require("cookie-parser");

require("dotenv").config();

// enlisting the cookie parser that the app will be using
app.use(cookie_parser());

// express middleware to parse json request sent by the user
app.use(express.json());

require("dotenv").config();
const PORT = process.env.PORT || 4000;

const mongoDB = require("./connections/database");
mongoDB.connect();

app.get("/", (req,res) => {
    return res.status(200).json({
        success:true,
        message:"Server is up and running fine",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at PORT : ${PORT}`);
})

