// <----Access Firebase Functions---->
const functions = require('firebase-functions');

//<-----Express Framework---->
const app = require('express')();

//<----Firebase Authentication----->
const FBAuth = require('./utility/fbAuth');

//<----Import Route Modules------>
const { getAllPosts, createPost} = require('./handlers/posts');
const { signup, login } = require('./handlers/users');

// <-------- POST ROUTES -------->
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);

// <-------- USERS ROUTES -------->
app.post('/signup', signup)
app.post('/login', login)

exports.api = functions.https.onRequest(app);