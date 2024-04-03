import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { html } from './html.js';


export const sendToEmail = async (options) => {
 const   transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: "mohamedahmed893@outlook.com",
            pass: "mo7$@4321",
        },
    });
    let token = jwt.sign({ email: options.email }, 'email123456')
    const info = await transporter.sendMail({
        from: '"Mohamed 👻" <mohamedahmed893@outlook.com>', // sender address
        to: options.email, // list of receivers
        subject: "Confirm Your Email ✔", // Subject line
        html: html(token), // html body
    });
}
