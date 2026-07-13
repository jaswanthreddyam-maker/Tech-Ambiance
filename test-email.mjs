import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "hello.techambiance@gmail.com",
    pass: "cbzdxaqgvxzmzolz",
  },
});

transporter.sendMail({
  from: "hello.techambiance@gmail.com",
  to: "jaswanthreddyam@gmail.com",
  subject: "Test from local",
  text: "Hello world"
}).then(console.log).catch(console.error);
