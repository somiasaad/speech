import { userModel } from "../../databases/modeles/user.js";
import { AppError } from "../utils/AppError.js";
import jwt from 'jsonwebtoken'

export const auth = async (req, res, next) => {
    const { token } = req.headers
    if (!token) return next(new AppError("Token Must Be Provided",403))
    const decoded = await jwt.verify(token, 'moracp57');
    const user =await userModel.findById(decoded.userId)
    if(!user) return next(new AppError("Invalid Token",403))
    if(user.logout){
        const userLogout = parseInt(user.logout.getTime()/1000)
        if(userLogout >decoded.iat) return next(new AppError("login frist",403))
    }
    req.user=user
    next()
}