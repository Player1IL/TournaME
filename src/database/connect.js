import mongoose from 'mongoose';
import User from "./models/user.js"
import Tournament from "./models/tournament.js"
import Comment from "./models/comment.js"
import Game from "./models/game.js"
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
            return true;
        } else {
            console.log('User not found');
            return false;
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}
export async function create_new_tournament(game, tournament_name, tournament_description, owner, tournament_size) {
    const newTournament = new Tournament({
        game,
        tournament_name,
        tournament_description,
        status: "OPEN",
        owner,
        comments: [],
        participants: [],
        tournament_size,
    });
    let savedTournament;
    try {
        savedTournament = await newTournament.save();
        console.log('Tournament created:', savedTournament);
    } catch (err) {
        console.error('Error creating tournament:', err);
        return false;
    }
    try {
        const updated_user = await User.findOneAndUpdate(
            owner,
            { $push: { tournaments: savedTournament._id } },
            { new: true, runValidators: true }
        )
    } catch (error) {
        console.error('Error creating tournament:', error);
        return false;
    }
    return true;
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
            return true;
        } else {
            console.log('Tournament not found');
            return false;
        }
    } catch (error) {
        console.error('Error updating tournament:', error);
        return false;
    }
}
export async function delete_tournament(tournament_id, owner) {
    try {
        const deletedTournament = await Tournament.findByIdAndDelete(tournament_id);

        if (deletedTournament) {
            console.log('Tournament deleted:', deletedTournament);
        } else {
            console.log('Tournament not found');
            return false;
        }
    } catch (error) {
        console.error('Error deleting tournament:', error);
        return false;
    }
    try {
        const updated_user = await User.findOneAndUpdate(
            owner,
            { $pull: { tournaments: tournament_id } },
            { new: true, runValidators: true }
        )
    } catch (error) {
        console.error('Error deleting tournament from user:', error);
        return false;
    }
    return true;
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
        console.log('Comment created:', savedComment);
    } catch (error) {
        console.error('Error creating user:', error);
        return false;
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
            return false;
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
            return false;
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
    return true;
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
        return false;
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
            return false;
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
            return false;
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
    return true;
}
export async function delete_comment(comment_id, comment_owner, tournament_id) {
    try {
        const deleted_comment = await Comment.findOneAndDelete(comment_id);

        if (deleted_comment) {
            console.log('Comment deleted:', deleted_comment);
        } else {
            console.log('Comment not found');
            return false;
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
    }
    try {
        const updated_user = await User.findOneAndUpdate(
            comment_owner,
            { $pull: {comments: comment_id}},
            {new: true, runValidators: true}
        )
    } catch (error) {
        console.log('User not found')
        return false;
    }
    try {
        const updated_tournament = await Tournament.findOneAndUpdate(
            tournament_id,
            { $pull: {comments: comment_id}},
            {new: true, runValidators: true}
        )
    } catch (error) {
        console.log('FAILED')
        return false;
    }
    return true;
}
export async function add_or_remove_friend(user_id, friend_email, add) {
    let user;
    try {
        user = await User.findOne({ email: friend_email})
    } catch (error) {
        console.log('User not found')
        return false;
    }
    if (add === "add") {
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                {$push: {friends: user._id}},
                {new: true, runValidators: true}
            )
        } catch (error) {
            console.log('User not found')
            return false;
        }
        return true;
    }
    else if (add === "remove") {
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                {$pull: {friends: user._id}},
                {new: true, runValidators: true}
            )
        } catch (error) {
            console.log('User not found')
            return false;
        }
        return true;
    }
    return false;
}
export async function like_or_unlike(comment_id, user_id, like) {
    if (like === "like") {
        try {
            const updated_comment = await Comment.findOneAndUpdate(
                comment_id,
                { $push: { likes: user_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('Comment not found', error)
            return false;
        }
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                { $push: { likes: comment_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('User not found', error)
            return false;
        }
    }
    else if (like === "unlike"){
        try {
            const updated_comment = await Comment.findOneAndUpdate(
                comment_id,
                { $pull: { likes: user_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('Comment not found', error)
            return false;
        }
        try {
            const updated_user = await User.findOneAndUpdate(
                user_id,
                { $pull: { likes: comment_id } },
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('User not found', error)
            return false;
        }
    }
    return true;
}
export async function get_all_tournaments(name) {
    const agg = [
        {
            '$lookup': {
                'from': 'games',
                'localField': 'game',
                'foreignField': '_id',
                'as': 'game_details'
            }
        }, {
            '$unwind': '$game_details'
        },         {
            '$match': {
                'game_details.game_name': name
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'owner',
                'foreignField': '_id',
                'as': 'owner_details'
            }
        }, {
            '$unwind': '$owner_details'
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'participants',
                'foreignField': '_id',
                'as': 'participant_details'
            }
        }, {
            '$lookup': {
                'from': 'comments',
                'localField': 'comments',
                'foreignField': '_id',
                'as': 'comments_details'
            }
        }, {
            '$lookup': {
                'from': 'comments',
                'localField': 'comments_details.replies',
                'foreignField': '_id',
                'as': 'comments_replies_details'
            }
        }, {
            '$project': {
                'tournament_size': 1,
                'tournament_description': 1,
                'createdAt': 1,
                'tournament_name': 1,
                'status': 1,
                'game_details': 1,
                'owner_details': {
                    '_id': 1,
                    'full_name': 1
                },
                'participant_details': 1,
                'comments_details': {
                    '$map': {
                        'input': '$comments_details',
                        'as': 'comment',
                        'in': {
                            '$mergeObjects': [
                                '$$comment', {
                                    'replies_details': '$comments_replies_details'
                                }
                            ]
                        }
                    }
                }
            }
        }
    ];


    const client = await MongoClient.connect(uri);
    const coll = client.db('MAIN').collection('tournaments');

    const cursor = coll.aggregate(agg);
    const result = await cursor.toArray();
    await client.close();
    return result
}
export async function get_specific_tournament(id) {
    const agg = [
        {
            '$match': {
                '_id': id
            }
        },
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
        }
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
export async function user_cleanup_missing_comments() {
    const agg = [
        {
            '$lookup': {
                'from': 'comments',
                'localField': 'comments',
                'foreignField': '_id',
                'as': 'comment_details'
            }
        }, {
            '$project': {
                'missing_comments': {
                    '$filter': {
                        'input': '$comments',
                        'as': 'commentId',
                        'cond': {
                            '$not': {
                                '$in': [
                                    '$$commentId', '$comment_details._id'
                                ]
                            }
                        }
                    }
                },
                'full_name': 1,
                'email': 1
            }
        }, {
            '$match': {
                'missing_comments': {
                    '$ne': []
                }
            }
        }
    ];
    const client = await MongoClient.connect(uri);
    const coll = client.db('MAIN').collection('users');

    const cursor = coll.aggregate(agg);
    const result = await cursor.toArray();

    console.log(result)

    await client.close();
    return result
}
export async function return_games() {
    try {
        return await Game.find({});
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}
export async function delete_user(email) {
    try {
        const user = await User.findOne({ email: email });
        await clean_up(user._id);

        await User.findOneAndDelete({ email: email })
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}
export async function clean_up(id) {
    try {
        await Comment.deleteMany({ comment_owner: id });
        await Tournament.deleteMany({owner: id});
    } catch (error) {

    }
}
export async function join_tournament(tournament, user) {
    try {
        const updated_tournament = await Tournament.findByIdAndUpdate(
            tournament,
            { $push: { participants: user } },
            { new: true, runValidators: true }
        )
        return true;
    } catch (error) {
        return false;
    }
}
export async function leave_tournament(tournament, user) {
    try {
        const updated_tournament = await Tournament.findByIdAndUpdate(
            tournament,
            { $pull: { participants: user } },
            { new: true, runValidators: true }
        )
        return true;
    } catch (error) {
        return false;
    }
}