const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Hello this is the Initial of Express Instance");
});

app.get("/nodemon",(req,res) => {
    res.send("This is being made run by nodemon");
});

app.get("/hello", (req,res) => {
    res.send("This is Hello from the express");
});

app.listen(4000, () => {
    console.log("Express has started");
});


