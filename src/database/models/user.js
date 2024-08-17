import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema
const userSchema = new Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    date_of_birth: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
    tournaments : [{ type: Schema.Types.ObjectId, ref: 'tournaments' }],
    createdAt: { type: Date, default: Date.now }
});

// Create a model from the schema
const User = model('users', userSchema);

// Export the model for use in other parts of your application
export default User;