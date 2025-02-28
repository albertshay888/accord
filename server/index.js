const express = require('express');
const cors = require('cors');

const authRoutes = require("./routes/auth.js");

const app = express();
const PORT = process.env.PORT || 8080;

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);

// const corsOptions = {
//     origin: [
//         'https://localhost:3000',  // Allow requests from the local dev frontend
//         'http://192.168.18.236:3000',  // Allow requests from your mobile device's local IP
//         'http://1d36-185-220-239-182.ngrok-free.app',  // Allow requests from Ngrok
//     ],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,  // If you are using cookies or authentication tokens
// };
const corsOptions = {
    origin: [
        // 'http://localhost:3000', // Allow the React app running locally
        // 'http://1d36-185-220-239-182.ngrok-free.app', // Allow the Ngrok URL
        // 'http://192.168.18.236:3000',  // Allow requests from your mobile device's local IP
        'https://client-sparkling-cherry-5683.fly.dev',  // React app's URL on Fly.io
        'https://accordchat.com',   // your production domain
        'http://localhost:3000',  // Allow requests from the local dev frontend
        'http://192.168.18.236:3000',  // Allow requests from your mobile device's local IP
        'https://01f3-2407-cdc0-b027-00-25.ngrok-free.app',  // Allow requests from Ngrok
        '*', // Optional, can be removed if security is a concern (allow all origins)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Make sure OPTIONS is allowed
    allowedHeaders: ['Content-Type', 'Authorization'], // Adjust headers if needed
    credentials: true, // If you're sending cookies, this is needed
    preflightContinue: false,  // Make sure CORS preflight is handled properly
    optionsSuccessStatus: 200, // For legacy browsers that don't support 204 response status for OPTIONS
};


app.use(cors(corsOptions));  // Enable CORS with multiple allowed origins
app.options('*', cors(corsOptions)); // Preflight response
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Set specific origin
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
});
// app.options('*', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.status(200).end();
// });
app.use(express.json());
app.use(express.urlencoded());  // Specify the extended options

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/', (req, res) => {
    const { message, user: sender, type, members } = req.body;

    if(type === 'message.new') {
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({ user }) => {
                if(!user.online) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: user.phoneNumber
                    })
                        .then(() => console.log('Message sent!'))
                        .catch((err) => console.log(err));
                }
            })

            return res.status(200).send('Message sent!');
    }

    return res.status(200).send('Not a new message request');
});

app.use('/auth', authRoutes);

// HTTPS configuration
// const options = {
//     key: fs.readFileSync('./private-key.pem'),  // Path to your private key file
//     cert: fs.readFileSync('./certificate.pem') // Path to your certificate file
// };

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

