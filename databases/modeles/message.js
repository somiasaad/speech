import mongoose from "mongoose";

const messageSchema =mongoose.Schema({
    message:String
},{timestamps:true})


export const messageModel =mongoose.model('message',messageSchema)