import express from "express";

const app = express();
const port= 3124

app.get("/", (req, res) => {
    res.send("SERVER UP");
})
app.listen(port, () => {
    console.log("Server started on port " + port);
})
