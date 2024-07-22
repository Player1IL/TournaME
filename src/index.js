import axios from "axios";
import express from "express";
import cors from 'cors';
import {initializeApp} from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import {getFirestore, doc, setDoc, getDoc} from "firebase/firestore";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////      EXPRESS CONFIGURATION          ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const app = express();
const port = process.env.PORT || 3124;

app.use(cors());
app.use(express.json());

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////        FIREBASE CONFIGURATION        ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const firebaseConfig = {
    apiKey: "AIzaSyD5UZjwHNl3W86hHcvLDXFqx2o3Cij80YM",
    authDomain: "tourname-c6584.firebaseapp.com",
    databaseURL: "https://tourname-c6584-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tourname-c6584",
    storageBucket: "tourname-c6584.appspot.com",
    messagingSenderId: "1072484854764",
    appId: "1:1072484854764:web:9cfea4a36e706f313aeec9",
    measurementId: "G-WEKGQSCR34"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getFirestore();
const auth = getAuth(firebaseApp)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////      ENDPOINTS       //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.send("SERVER UP");
})
app.post('/signin', (req, res) => {
    const {email, password} = req.body;
    const OK = true;

    signInWithEmailAndPassword(auth, email, password)
        .then(async (credential) => {
            const ref = doc(database, "users", credential.user.uid)
            const docSnap = await getDoc(ref);
            /*
            if (docSnap.exists()) {
                sessionStorage.setItem("user-info", JSON.stringify({
                    email: docSnap.data().email,
                    username: docSnap.data().username,
                    dob: docSnap.data().dob,
                }));
                sessionStorage.setItem("user-creds", JSON.stringify(credential.user));
            }
            */
            if (docSnap.exists()) {
                console.log("Account logged");
                res.status(200).json({ message: "Logged in", session: {
                        email: docSnap.data().email,
                        username: docSnap.data().username,
                        dob: docSnap.data().dob,
                    }
                })
            }
        }).catch((e) => {
        res.status(400).json({error: "Incorrect username or password" + e.message});
    })
    //console.log("Got new post message: ", JSON.stringify({email, password}));
    //res.json({massage: "Hey I got your message!", email: email, status: OK});
})
app.post('/signup', async (req, res) => {
    const {email, username, password, dob} = req.body;
    console.log("Got credentials: " + email + " " + username + " " + password + " " + dob);

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (credential) => {
            const ref = doc(database, "users", credential.user.uid);
            await setDoc(ref, {
                email: email,
                username: username,
                dob: dob,
                last_login: Date.now()
            });

            console.log("Account created successfully");
            res.status(201).json({message: "User created successfully", user: credential.user});
        }).catch((e) => {
        console.log("Account creation failed");
        res.status(400).json({error: "Error creating user with code:" + e.message});
    })

})
app.get('/ping', (req, res) => {
    res.send("Pong 10");
})
app.get('/about', async (req, res) => {
    try {
        const url = 'https://tourname-client.onrender.com/pages/about';
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
