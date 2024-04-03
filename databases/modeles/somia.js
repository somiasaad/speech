import mongoose from "mongoose";
const statusSchema = mongoose.Schema({
    userId: { type: String, required: true },
    date: Date,
    feeling: String,
});

const Model = mongoose.model("feel_history", statusSchema);

export default Model