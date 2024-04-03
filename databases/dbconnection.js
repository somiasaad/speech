import mongoose from 'mongoose'

export const dbconnection = () => {
    mongoose.connect("mongodb+srv://graduated:graduated12@cluster0.xnavg3n.mongodb.net/graduatedproject", { useNewUrlParser: true })
        .then(() => {
            console.log("database connected .");
        }).catch((err) => {
            console.log("error in connect");
        })
}