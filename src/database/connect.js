import mongoose from 'mongoose';
import User from "./models/user.js"
import Tournament from "./models/tournament.js"
import Comment from "./models/comment.js"
import {MongoClient} from "mongodb";

const uri = "mongodb+srv://site_admin:u51M8fdy6SC59JsN@cluster0.ylk6bpw.mongodb.net/MAIN?retryWrites=true&w=majority&appName=Cluster0";
const database = "MAIN"

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
await mongoose.connect(uri, clientOptions)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

export async function run() {
    try {
        // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await mongoose.disconnect();
    }
}
export async function create_new_user(full_name, email, date_of_birth) {
    const newUser = new User({
        full_name,
        email,
        date_of_birth,
        comments: [],
        friends: [],
        likes: [],
        tournaments: []
    });
    try {
        const savedUser = await newUser.save();
        console.log('User created:', savedUser);
        //return savedUser;
    } catch (err) {
        console.error('Error creating user:', err);
        //throw err;
    }
}
export async function edit_user(user_id, updated_fields) {
    try {
        const updated_tournament = await User.findOneAndUpdate(
            user_id,
            updated_fields,
            {new: true, runValidators: true}
        );
        if (updated_tournament) {
            console.log('User updated:', updated_tournament);
            //return updated_tournament;
        } else {
            console.log('User not found');
            //return null;
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}
export async function create_new_tournament(game, tournament_name, tournament_description, owner) {
    const newTournament = new Tournament({
        game,
        tournament_name,
        tournament_description,
        status: "OPEN",
        owner,
        comments: [],
        participants: []
    });
    try {
        const savedTournament = await newTournament.save();
        console.log('User created:', savedTournament);
        //return savedTournament;
    } catch (err) {
        console.error('Error creating user:', err);
        //throw err;
    }
}
export async function edit_tournament(tournament_id, updated_fields) {
    try {
        const updated_tournament = await Tournament.findOneAndUpdate(
            tournament_id,
            updated_fields,
            { new: true, runValidators: true }
        );
        if (updated_tournament) {
            console.log('Tournament updated:', updated_tournament);
            //return updated_tournament;
        } else {
            console.log('Tournament not found');
            //return null;
        }
    } catch (error) {
        console.error('Error updating tournament:', error);
    }
}
export async function delete_tournament(tournament_id, owner) {
    try {
        const deletedTournament = await Tournament.findByIdAndDelete(tournament_id);

        if (deletedTournament) {
            console.log('Tournament deleted:', deletedTournament);
            //return deletedTournament;
        } else {
            console.log('Tournament not found');
            //return null;
        }
    } catch (error) {
        console.error('Error deleting tournament:', error);
    }
    try {
        const updated_user = await User.findOneAndUpdate(
            owner,
            { $pull: { tournaments: tournament_id } },
            { new: true, runValidators: true }
        )
    } catch (error) {
        console.error('Error deleting tournament from user:', error);
    }
}
export async function findUID(fullname) {
    try {
        const user = await User.findOne({ full_name: fullname });

        if (user) {
            console.log('ObjectID:', user._id);
            //return user._id;
        } else {
            console.log('Game not found');
            //return null;
        }
    } catch (err) {
        console.error('Error finding game:', err);
        //throw err;
    }
}
export async function comment_on_tournament(tournament_id, comment_owner, comment_text) {
    const newComment = new Comment({
        comment_text,
        comment_owner,
        replies: [],
        likes: [],
    });
    let savedComment
    try {
        savedComment = await newComment.save();
        console.log('User created:', savedComment);
    } catch (error) {
        console.error('Error creating user:', error);
    }
    try {
        const updated_tournament = await Tournament.findOneAndUpdate(
            tournament_id,
            { $push: { comments: savedComment._id } },
            { new: true, runValidators: true }
        );
        if (updated_tournament) {
            console.log('Tournament updated with new comment:', updated_tournament);
        } else {
            console.log('Tournament not found');
        }
    } catch (error) {
        console.error('Error updating tournament:', error);
    }
    try {
        const updated_user = await User.findOneAndUpdate(
            comment_owner,
            { $push: { comments: savedComment._id } },
            { new: true, runValidators: true }
        );
        if (updated_user) {
            console.log('User updated with new comment:', updated_user);
            //return updated_user;
        } else {
            console.log('User not found');
            //return null;
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}
export async function reply_to_comment(comment_id, comment_owner, comment_text) {
    const newComment = new Comment({
        comment_text,
        comment_owner,
        replies: [],
        likes: [],
    });
    let savedComment
    try {
        savedComment = await newComment.save();
        console.log('Comment created:', savedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
    }
    try {
        const update_comment = await Comment.findOneAndUpdate(
            comment_id,
            { $push: { replies: savedComment._id } },
            { new: true, runValidators: true }
        );
        if (update_comment) {
            console.log('Comment updated with new reply:', update_comment);
        } else {
            console.log('Comment not found');
        }
    } catch (error) {
        console.error('Error updating comment:', error);
    }
    try {
        const updated_user = await User.findOneAndUpdate(
            comment_owner,
            { $push: { comments: savedComment._id } },
            { new: true, runValidators: true }
        );
        if (updated_user) {
            console.log('User updated with new comment:', updated_user);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}
export async function delete_comment(comment_id, comment_owner, tournament_id) {
    try {
        const deleted_comment = await Comment.findOneAndDelete(comment_id);

        if (deleted_comment) {
            console.log('Comment deleted:', deleted_comment);
        } else {
            console.log('Comment not found');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
    try {
        const updated_user = await User.findOneAndUpdate(
            comment_owner,
            { $pull: {comments: comment_id}},
            {new: true, runValidators: true}
        )
    } catch (error) {
        console.log('User not found')
    }
    try {
        const updated_tournament = await Tournament.findOneAndUpdate(
            tournament_id,
            { $pull: {comments: comment_id}},
            {new: true, runValidators: true}
        )
    } catch (error) {
        console.log('FAILED')
    }
}
export async function add_or_remove_friend(user_id, friend_id, remove) {
    if (!remove) {
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                {$push: {friends: friend_id}},
                {new: true, runValidators: true}
            )
        } catch (error) {
            console.log('User not found')
        }
    }
    else {
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                {$pull: {friends: friend_id}},
                {new: true, runValidators: true}
            )
        } catch (error) {
            console.log('User not found')
        }
    }
}
export async function like_or_unlike(comment_id, user_id, like) {
    if (like) {
        try {
            const updated_comment = await Comment.findOneAndUpdate(
                comment_id,
                { $push: { likes: user_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('Comment not found', error)
        }
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                { $push: { likes: comment_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('User not found', error)
        }
    }
    else {
        try {
            const updated_comment = await Comment.findOneAndUpdate(
                comment_id,
                { $pull: { likes: user_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('Comment not found', error)
        }
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                { $pull: { likes: comment_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('User not found', error)
        }
    }
}
export async function get_tournaments(game_id) {
    try {
        const games = await Tournament.find(
            { game: game_id }
        );
        if (games) {
            console.log('Tournaments found: ', games);
            return games;
        } else {
            console.log('No tournaments found');
        }
    } catch (error) {
        console.error('Tournament not found');
    }
}
export async function array_walk(array) {
    const userModel = mongoose.model('User', User.schema);

    for (const obj of array) {
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            console.log(`Checking key: ${key}, Value:`, value);

            // Check if the value is an ObjectId instance
            if (value instanceof mongoose.Types.ObjectId) {
                if (key === 'owner') {
                    console.log('Value before:', value);
                    try {
                        obj[key] = await get_document_by_id(value);
                        console.log('Value after:', obj[key]);
                    } catch (error) {
                        console.error('Error fetching document:', error);
                    }
                }
            } else {
                console.log(`Value is not an ObjectId:`, value);
            }
        }
    }
}
export async function get_all_tournaments(name) {
    const agg = [
        {
            '$lookup': {
                'from': 'comments',
                'localField': 'comments',
                'foreignField': '_id',
                'as': 'commentsDetails'
            }
        }, {
            '$unwind': '$commentsDetails'
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'commentsDetails.comment_owner',
                'foreignField': '_id',
                'as': 'commentsDetails.ownerDetails',
                'pipeline': [
                    {
                        '$project': {
                            'full_name': 1
                        }
                    }
                ]
            }
        }, {
            '$unwind': '$commentsDetails.ownerDetails'
        }, {
            '$set': {
                'commentsDetails.comment_owner_full_name': '$commentsDetails.ownerDetails.full_name'
            }
        }, {
            '$lookup': {
                'from': 'comments',
                'localField': 'commentsDetails.replies',
                'foreignField': '_id',
                'as': 'commentsDetails.repliesDetails'
            }
        }, {
            '$unwind': '$commentsDetails.repliesDetails'
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'commentsDetails.repliesDetails.comment_owner',
                'foreignField': '_id',
                'as': 'commentsDetails.repliesDetails.ownerDetails',
                'pipeline': [
                    {
                        '$project': {
                            'full_name': 1
                        }
                    }
                ]
            }
        }, {
            '$unwind': '$commentsDetails.repliesDetails.ownerDetails'
        }, {
            '$set': {
                'commentsDetails.repliesDetails.comment_owner_full_name': '$commentsDetails.repliesDetails.ownerDetails.full_name'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'owner',
                'foreignField': '_id',
                'as': 'ownerDetails',
                'pipeline': [
                    {
                        '$project': {
                            'full_name': 1
                        }
                    }
                ]
            }
        }, {
            '$unwind': '$ownerDetails'
        }, {
            '$set': {
                'owner_full_name': '$ownerDetails.full_name'
            }
        }, {
            '$lookup': {
                'from': 'games',
                'localField': 'game',
                'foreignField': '_id',
                'as': 'gameDetails',
                'pipeline': [
                    {
                        '$project': {
                            'game_name': 1
                        }
                    }
                ]
            }
        }, {
            '$unwind': '$gameDetails'
        }, {
            '$set': {
                'game_name': '$gameDetails.game_name'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'participants',
                'foreignField': '_id',
                'as': 'participantDetails',
                'pipeline': [
                    {
                        '$project': {
                            'full_name': 1
                        }
                    }
                ]
            }
        }, {
            '$set': {
                'participantDetails': {
                    '$map': {
                        'input': '$participantDetails',
                        'as': 'participant',
                        'in': {
                            '_id': '$$participant._id',
                            'full_name': '$$participant.full_name'
                        }
                    }
                }
            }
        },
        {
            '$match': {
                'game_name': name
            }
        },
    ];
    const client = await MongoClient.connect(uri);
    const coll = client.db('MAIN').collection('tournaments');

    const cursor = coll.aggregate(agg);
    const result = await cursor.toArray();
    await client.close();
    return result
}
export async function get_user_details(email) {
    const agg = [
        {
            '$match': {
                'email': email
            }
        },
        {
            '$lookup': {
                'from': 'comments',
                'localField': 'comments',
                'foreignField': '_id',
                'as': 'comments'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'friends',
                'foreignField': '_id',
                'as': 'friends'
            }
        }, {
            '$lookup': {
                'from': 'tournaments',
                'localField': 'tournaments',
                'foreignField': '_id',
                'as': 'tournaments'
            }
        }
    ];
    const client = await MongoClient.connect(uri);
    const coll = client.db('MAIN').collection('users');

    const cursor = coll.aggregate(agg);
    const result = await cursor.toArray();
    await client.close();
    return result
}