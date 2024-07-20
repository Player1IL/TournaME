import express from "express";
import cors from 'cors';
import axios from "axios";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////      EXPRESS CONFIGURATION          ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const app = express();
const port= process.env.PORT || 3124

app.use(cors());
app.use(express.json())

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////      ENDPOINTS       //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.send("SERVER UP");
})
app.post('/login', (req, res) => {
    const {username, password } = req.body;
    const OK = true;

    console.log("Got new post message: ", JSON.stringify({ username, password}));
    res.json({ massage: "Hey I got your message!", username: username, status: OK});
})
app.post('/signup', (req, res) => {
})
app.get('/ping', (req, res) => {
    res.send("Pong 10");
})
app.get('/about', async (req, res) => {
    try {
        const url = 'https://tourname-client.onrender.com/pages/about'; // Replace with your target URL
        const response = await axios.get(url);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching the webpage:', error);
        res.status(500).send('Error fetching the webpage content');
    }
});
app.listen(port, () => {
    console.log("Server started on port " + port);
})
