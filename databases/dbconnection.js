import mongoose from 'mongoose'

export const dbconnection = () => {
    mongoose.connect("mongodb+srv://somiasaad012:AT6qx36UmejSCFmc@cluster0.wdsvst1.mongodb.net/", { useNewUrlParser: true })
        .then(() => {
            console.log("database connected .");
        }).catch((err) => {
            console.log("error in connect");
        })
}
