import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema
const userSchema = new Schema({
    comment_text: { type: String, required: true },
    comment_owner: { type: Schema.Types.ObjectId, ref: 'users' },
    replies: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'users' }],
});

// Create a model from the schema
const Comment = model('comments', userSchema);

// Export the model for use in other parts of your application
export default Comment;