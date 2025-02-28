const { connect } = require('getstream');
const bcrypt = require('bcrypt');
const StreamChat = require('stream-chat').StreamChat;
const crypto = require('crypto');

require('dotenv').config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

// const signup = async (req, res) => {
//     try {
//         const { fullName, username, password, phoneNumber } = req.body;

//         const userId = crypto.randomBytes(16).toString('hex');

//         const serverClient = connect(api_key, api_secret, app_id);

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const token = serverClient.createUserToken(userId);

//         res.status(200).json({ token, fullName, username, userId, hashedPassword, phoneNumber });
//     } catch (error) {
//         console.log(error);

//         res.status(500).json({ message: error });
//     }
// };
const signup = async (req, res) => {
    try {
        const { fullName, username, password, phoneNumber } = req.body;

        const userId = crypto.randomBytes(16).toString('hex');

        const serverClient = connect(api_key, api_secret, app_id);
        const client = StreamChat.getInstance(api_key, api_secret);

        // Create user in Stream-Chat
        const streamUser = {
            id: userId,
            name: username,
            fullName,
            phoneNumber,
        };

        const user = await client.upsertUser(streamUser);

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = serverClient.createUserToken(userId);

        // Return the response with user data and token
        res.status(200).json({ token, fullName, username, userId, hashedPassword, phoneNumber });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// const login = async (req, res) => {
//     try {
//         const { username, password } = req.body;
        
//         const serverClient = connect(api_key, api_secret, app_id);
//         const client = StreamChat.getInstance(api_key, api_secret);

//         const { users } = await client.queryUsers({ name: username });

//         if(!users.length) return res.status(400).json({ message: 'User not found' });

//         const success = await bcrypt.compare(password, users[0].hashedPassword);

//         const token = serverClient.createUserToken(users[0].id);

//         if(success) {
//             res.status(200).json({ token, fullName: users[0].fullName, username, userId: users[0].id});
//         } else {
//             res.status(500).json({ message: 'Incorrect password' });
//         }
//     } catch (error) {
//         console.log(error);

//         res.status(500).json({ message: error });
//     }
// };

// const login = async (req, res) => {
//     try {
//         const { username, password } = req.body;
        
//         const serverClient = connect(api_key, api_secret, app_id);
//         const client = StreamChat.getInstance(api_key, api_secret);

//         // Query user in Stream-Chat
//         const { users } = await client.queryUsers({ name: username });

//         if (!users.length) return res.status(400).json({ message: 'User not found' });

//         // Compare password with the stored hashed password (if stored manually)
//         const success = await bcrypt.compare(password, users[0].hashedPassword);

//         // If login is successful, generate the token
//         if (success) {
//             const token = serverClient.createUserToken(users[0].id);
//             res.status(200).json({ token, fullName: users[0].fullName, username, userId: users[0].id });
//         } else {
//             res.status(500).json({ message: 'Incorrect password' });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: error.message });
//     }
// };

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const serverClient = connect(api_key, api_secret, app_id);
        const client = StreamChat.getInstance(api_key, api_secret);

        // Query users with proper filtering
        const { users } = await client.queryUsers({ name: username });

        if (!users.length) return res.status(400).json({ message: 'User not found' });

        const userId = users[0].id; // Ensure userId is defined
        const success = await bcrypt.compare(password, users[0].hashedPassword);

        if (success) {
            const token = serverClient.createUserToken(userId);
            res.status(200).json({ token, fullName: users[0].fullName, username, userId });
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    } catch (error) {
        console.log('Stream-Chat API error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { signup, login }