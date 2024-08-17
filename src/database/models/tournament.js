import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema
const userSchema = new Schema({
    game: { type: Schema.Types.ObjectId, ref: 'games' },
    tournament_name: { type: String, required: true },
    tournament_description: { type: String, required: true },
    status: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'users' },
    comments: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
    participants: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    createdAt: { type: Date, default: Date.now },
    tournament_size: { type: Number, default: 8 },
});

// Create a model from the schema
const Tournament = model('tournaments', userSchema);

// Export the model for use in other parts of your application
export default Tournament;