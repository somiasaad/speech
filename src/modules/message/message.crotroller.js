import { messageModel } from "../../../databases/modeles/message.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";



const sendText =catchAsyncError(async (req,res,next)=>{

    const messages =new messageModel(req.body)
    messages.save()
    res.json({message:'Your note has been sent'})
})


export {sendText}