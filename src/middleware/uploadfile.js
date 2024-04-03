import multer from "multer"
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../utils/AppError.js";


let options =(folderName)=>{
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `uploads/${folderName}`)
        },
        filename: function (req, file, cb) {

            cb(null, uuidv4() + '-' + file.originalname)
        }
    })
    return multer({ storage  })
}
export const uploadFile = (fieldName, folderName) =>options(folderName).single(fieldName)