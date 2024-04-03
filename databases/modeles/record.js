import mongoose from "mongoose";

// تعريف نموذج Record
const RecordSchema = new mongoose.Schema({
    userId: String,
    emotion: String,
    date: Date,
});




const Record = mongoose.model("Record", RecordSchema);

export default Record;
