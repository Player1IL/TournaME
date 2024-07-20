import express from "express";
import cors from 'cors';

const app = express();
const port= process.env.PORT || 3124

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send("SERVER UP");
})

app.post('/login', (req, res) => {
    const {username, password } = req.body;
    const OK = true;
    console.log("Got new post message: ", JSON.stringify({ username, password}));
    res.json({ massage: "Hey I got your message!", username: username, status: OK});
})

app.get('/ping', (req, res) => {
    res.send("Pong 10");
})

app.listen(port, () => {
    console.log("Server started on port " + port);
})
