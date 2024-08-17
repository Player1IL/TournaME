import axios from "axios";
import express from "express";
import cors from 'cors';
import {initializeApp} from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import {getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import {
    create_new_user,
    create_new_tournament,
    findUID,
    comment_on_tournament,
    edit_tournament,
    edit_user,
    reply_to_comment,
    delete_tournament,
    add_or_remove_friend,
    delete_comment,
    like_or_unlike,
    get_tournaments,
    array_walk,
    get_all_tournaments,
    get_user_details,
} from "./database/connect.js"
import {ObjectId} from "mongodb";
import mongoose from "mongoose";


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

/*
const querySnapshot = await getDocs(collection(database, "CSGO"));
querySnapshot.forEach((document) => {
    const data = document.data();
    const comments = []

    data.comments.forEach(async comment => {
        const [collection_name, uid] = (comment.path).split("/");
        console.log("collection: ", collection_name, "UID: ", uid);

        const docRef = doc(database, collection_name, uid);
        const docSnap = await getDoc(docRef);

        console.log("data: ", docSnap.data());

        comments.push(docSnap.data());
    })

    console.log(document.id, "=>", {
        comments: comments,
        description: data.description,
        name: data.name,
        owner: data.owner.path,
    });

});


//run().catch(console.dir);

create_new_user("Collins Jhonson", "CollinsJH@Gamil.com", "1991-01-01")
    .then(user => console.log('New user:', user))
    .catch(err => console.error('Failed to create user:', err));


create_new_tournament("CSGO", "ECG 2024", "World Championship ", owner)
    .then(user => console.log('New tournament:', user))
    .catch(err => console.error('Failed to create tournament:', err));
*/
//findUID('Daniel Nekludov');
//comment_on_tournament(new mongoose.Types.ObjectId('66bf2e55af3e980d92a243ac'), new mongoose.Types.ObjectId('66bf2fb0af3e980d92a243b9'), 'Fuck yeah, lets go!');
//reply_to_comment(new mongoose.Types.ObjectId('66bf62ffd03612f2043cf729'), new mongoose.Types.ObjectId('66bf3087af3e980d92a243be'), "WOWIE LOOK IT WORKS");
//delete_tournament(new mongoose.Types.ObjectId('66bf68b3af3e980d92a24447'))
/*
edit_tournament(new mongoose.Types.ObjectId('66bf2e55af3e980d92a243ac'),
    {
        status: "CLOSED",
        tournament_description: "World Cup CSGO ECG 2025 first bracket",
        tournament_name: "ECG World Cup 2025"
    })
*/
/*
add_or_remove_friend(
    new mongoose.Types.ObjectId('66bf2fb0af3e980d92a243b9'),
    new mongoose.Types.ObjectId('66bf3087af3e980d92a243be'),
    false);
*/
/*
delete_comment(
    new mongoose.Types.ObjectId('66bf62ffd03612f2043cf729'),
    new mongoose.Types.ObjectId('66bf2fb0af3e980d92a243b9'),
    new mongoose.Types.ObjectId('66bf2e55af3e980d92a243ac'),
);
*/
/*
like_or_unlike(
    new mongoose.Types.ObjectId('66bf320eaf3e980d92a243cf'),
    new mongoose.Types.ObjectId('66bf4c3631ebce8cc85c9233'),
    false
);
*/
/*
let array = await get_tournaments(
    '66bf4cb6af3e980d92a24416');
//await array_walk(array)


async function processArray(array) {
    const results = await Promise.all(array.map(async item => {
        console.log(item.owner);
        item.owner = await get_document_by_id(item.owner);
        return item;
    }));

    return results;
}
const updatedArray = await processArray(array);
await console.log('New Array:', updatedArray);
*/

//const result = await get_all_tournaments()
//const result = await get_user_details('Rockknife@gmail.com')
//const result = await get_all_tournaments("CSGO");

//console.log('Result: ', result);

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
				const userDetails = await get_user_details(email);
				console.log("Details: ", userDetails);
                res.status(200).json(JSON.stringify(userDetails));
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
            await create_new_user(username, email, dob);
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
app.post('/getTournament', async (req, res) => {
    const { name } = req.body;
    console.log(name)
    const array = await get_all_tournaments(name)
    console.log(array);
    res.status(200).json(array);
})
app.post('/getUser', async (req, res) => {
    const { email } = req.body;
    console.log(email)
    const array = await get_user_details(email)
    console.log(array);
    res.status(200).json(array);
})
app.listen(port, () => {
    console.log("Server started on port " + port);
})
