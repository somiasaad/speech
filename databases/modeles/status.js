import mongoose from "mongoose";
const userStatusSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: { type: String, enum: ["happy", "angry", "sad"], required: true },
  },
  {
    timestamps: true, // This enables createdAt and updatedAt fields automatically
  }
);

const UserStatus = mongoose.model("UserStatus", userStatusSchema);

export default UserStatus;
