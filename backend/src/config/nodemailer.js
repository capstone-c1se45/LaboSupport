import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'nguyennhat082004@gmail.com',
    pass: 'fyso swkl gwrc rnpe',
  },
});
