require('dotenv').config();

const exp = require('constants');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
const {v4: uuidv4} = require('uuid');
const PORT = 9000;

const User = require('./models/user');

app.set('view engine', 'ejs');
app.set(path.resolve('./views'));

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

mongoose.connect('mongodb://127.0.0.1:27017/cafe')
    .then(() => console.log('MongoDB is connected'));

app.get('/', (req, res) => {
    res.render('homepage');
});

app.post('/booking', async(req, res) => {
    const {name, peoples, date, message, email} = req.body;
    const bookingId = uuidv4();
    const user = await User.create({
        name, peoples, message, date, email, bookingId
    });


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Table Reservation',
        text: message ? 
        `Hello ${name}, your confirmation for ${peoples} at ${date} has been confirmed and your message has also been sent to the chef. Thank you for your booking.` : 
        `Hello ${name}, your confirmation for ${peoples} at ${date} has been confirmed. Thank you for your booking.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.log(error);
            res.status(500).send('Error sending message');
        }   else{
            console.log('Email sent successfully with id : ' + info.response);
            res.redirect('/');
        }
    })
})

app.listen(PORT, () => {
    console.log('Server is running');
})