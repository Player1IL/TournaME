import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema
const userSchema = new Schema({
    game_name: { type: String, required: true },
    game_tags: [{ type: String, required: true}],
});

// Create a model from the schema
const Game = model('games', userSchema);

// Export the model for use in other parts of your application
export default Game;