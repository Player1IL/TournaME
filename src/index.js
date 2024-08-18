import axios from "axios";
import express from "express";
import cors from 'cors';
import {initializeApp} from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updatePassword,
    deleteUser,
} from "firebase/auth";
import {getFirestore, doc, setDoc, getDoc, deleteDoc} from "firebase/firestore";
import {
    create_new_user,
    create_new_tournament,
    comment_on_tournament,
    edit_tournament,
    edit_user,
    reply_to_comment,
    delete_tournament,
    add_or_remove_friend,
    delete_comment,
    like_or_unlike,
    get_all_tournaments,
    get_user_details, get_specific_tournament,
    return_games, delete_user, join_tournament, leave_tournament,
} from "./database/connect.js"
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////      ENDPOINTS       //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.send("SERVER UP");
})
app.post('/signin', (req, res) => {
    const {email, password} = req.body;

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
                //res.status(200).json(JSON.stringify(userDetails));
                res.status(200).json(userDetails);
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
app.post('/user/edit/password', async (req, res) => {
    const {email, password, new_password} = req.body;
    console.log("Got credentials: " + email + " " + password, + " " + new_password);

    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            updatePassword(user, new_password).then(() => {
                res.status(200).json({message: "Password changed"});
            }).catch((error) => {
                console.error("Error updating password:", error);
                res.status(400).json({message: "Password change failed"});
            })
        })
        .then(() => {})
        .catch((error) => {
            console.error("Error updating password:", error);
            res.status(400).json({message: "Password change failed"});
        });

})
app.post('/user/remove', async (req, res) => {
    const { email, password } = req.body;
    console.log("Got credentials: " + email + " " + password);

    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            const userDocRef = doc(database, "users", user.uid);
            await deleteDoc(userDocRef);

            deleteUser(user).then(async () => {
                const result = await delete_user(email)
                if (result) {
                    console.log("User with email: " + email + " deleted!");
                    res.status(200).json({message: "User delete"});
                } else {
                    console.log("Failed to delete");
                    res.status(400).json({message: "Failed to delete"});
                }
            }).catch((error) => {
                console.error("Error deleting:", error);
                res.status(400).json({message: "Failed to delete"});
            })
        })
        .then(() => {})
        .catch((error) => {
            console.error("Error deleting:", error);
            res.status(400).json({message: "Failed to delete"});
        });
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
app.post('/user/get', async (req, res) => {
    const {email} = req.body;
    console.log(email)
    const array = await get_user_details(email)
    console.log(array);
    res.status(200).json(array);
})
app.post('/user/edit/fields', async (req, res) => {
    const {user, update} = req.body;
    console.log(user, update);
    /* Example of update structure ->
    {
        full_name: "Same",
        date_of_birth: "1991-01-01",
    }
    */
    const result = await edit_user(
        new mongoose.Types.ObjectId(user),
        update);
    if (result) {
        res.status(200).json({status: "Changes made!"});
    } else {
        res.status(400).json({status: "Failed to create!"});
    }
})
app.post('/user/edit/friend', async (req, res) => {
    const {user, friend, add} = req.body;
    console.log(user, friend, add);
    // if add is add: Add new friend, Else remove: Remove friend
    const result = await add_or_remove_friend(
        new mongoose.Types.ObjectId(user),
        friend,
        add);
    if (result) {
        res.status(200).json({status: "Changes made!"});
    } else {
        res.status(400).json({status: "Failed to change!"});
    }
})
app.post('/comment/add', async (req, res) => {
    const {tournament, user, text} = req.body;
    console.log(tournament, user, text);
    const result = await comment_on_tournament(new mongoose.Types.ObjectId(tournament), new mongoose.Types.ObjectId(user), text);
    if (result) {
        res.status(200).json({status: "Comment created!"});
    } else {
        res.status(400).json({status: "Failed to create!"});
    }
})
app.post('/comment/reply', async (req, res) => {
    const {comment, owner, text} = req.body;
    console.log(comment, owner, text);
    const result = await reply_to_comment(new mongoose.Types.ObjectId(comment), new mongoose.Types.ObjectId(owner), text);
    if (result) {
        res.status(200).json({status: "Replied successfully!"});
    } else {
        res.status(400).json({status: "Failed to reply!"});
    }
})
app.post('/comment/delete', async (req, res) => {
    const {comment, owner, tournament} = req.body;
    console.log(comment, owner, tournament);
    const result = await delete_comment(
        new mongoose.Types.ObjectId(comment),
        new mongoose.Types.ObjectId(owner),
        new mongoose.Types.ObjectId(tournament));
    if (result) {
        res.status(200).json({status: "Replied successfully!"});
    } else {
        res.status(400).json({status: "Failed to reply!"});
    }
})
app.post('/comment/like', async (req, res) => {
    const {comment, user, like} = req.body;
    console.log(comment, user, like);
    // if Like is like: Like comment, Else Like is unlike: unlike comment
    const result = await like_or_unlike(new mongoose.Types.ObjectId(comment), new mongoose.Types.ObjectId(user), like)
    if (result) {
        res.status(200).json({status: "Changes made!"});
    } else {
        res.status(400).json({status: "Failed to create!"});
    }
})
app.post('/tournament/new', async (req, res) => {
    const {game, tournament_name, tournament_description, owner, tournament_size} = req.body;
    console.log(game, tournament_name, tournament_description, owner);
    const result = await create_new_tournament(
        new mongoose.Types.ObjectId(game),
        tournament_name,
        tournament_description,
        new mongoose.Types.ObjectId(owner),
        tournament_size,
    );
    if (result) {
        res.status(200).json({status: "Tournament created!"});
    } else {
        res.status(400).json({status: "Failed to create!"});
    }
})
app.post('/tournament/edit', async (req, res) => {
    const {tournament, changes} = req.body;
    console.log(tournament, changes);
    /* Example of changes structure ->
    {
        status: "CLOSED",
        tournament_description: "World Cup CSGO ECG 2025 first bracket",
        tournament_name: "ECG World Cup 2025"
    }
    */
    const result = await edit_tournament(
        new mongoose.Types.ObjectId(tournament),
        changes
    );
    if (result) {
        res.status(200).json({status: "Changes made!"});
    } else {
        res.status(400).json({status: "Failed to change!"});
    }
})
app.post('/tournament/join', async (req, res) => {
    const {user, tournament} = req.body;
    console.log(tournament, user);
    const result = await join_tournament(
        new mongoose.Types.ObjectId(tournament),
        new mongoose.Types.ObjectId(user),
    );
    if (result) {
        res.status(200).json({status: "Joined tournament"});
    } else {
        res.status(400).json({status: "Failed to join!"});
    }
})
app.post('/tournament/leave', async (req, res) => {
    const {user, tournament} = req.body;
    console.log(tournament, user);
    const result = await leave_tournament(
        new mongoose.Types.ObjectId(tournament),
        new mongoose.Types.ObjectId(user),
    );
    if (result) {
        res.status(200).json({status: "Left tournament"});
    } else {
        res.status(400).json({status: "Failed to leave!"});
    }
})
app.post('/tournament/delete', async (req, res) => {
    const {tournament, owner} = req.body;
    console.log(tournament, owner);
    const result = await delete_tournament(
        new mongoose.Types.ObjectId(tournament),
        new mongoose.Types.ObjectId(owner),
    );
    if (result) {
        res.status(200).json({status: "Tournament deleted!"});
    } else {
        res.status(400).json({status: "Failed to delete!"});
    }
})
app.post('/tournament/get/by-game', async (req, res) => {
    const { name } = req.body;
    console.log(name)
    const array = await get_all_tournaments(name)
    console.log(array);
    res.status(200).json(array);
})
app.post('/tournament/get/by-id', async (req, res) => {
    const {id} = req.body;
    console.log(id)
    const array = await get_specific_tournament(new mongoose.Types.ObjectId(id))
    console.log(array);
    res.status(200).json(array);
})
app.get('/game/get/all', async (req, res) => {
    const array = await return_games();
    console.log(array);
    res.status(200).json(array);
})
app.listen(port, () => {
    console.log("Server started on port " + port);
})