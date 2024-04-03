import express from 'express'
import { sendText } from './message.crotroller.js'

const messageRouter =express.Router()
messageRouter.post('/',sendText)

export default messageRouter