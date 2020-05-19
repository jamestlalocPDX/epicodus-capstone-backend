// <----Access Firebase Functions---->
const functions = require('firebase-functions');

//<-----Express Framework---->
const app = require('express')();

//<----Firebase Authentication----->
const FBAuth = require('./utility/fbAuth');

//<----Import Route Modules------>
const { getAllPosts, createPost} = require('./handlers/posts');
const { signup, login, uploadImage, addUserInfo, getUser } = require('./handlers/users');

// <-------- POST ROUTES -------->
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserInfo);
app.get('/user', FBAuth, getUser);

// <-------- USERS ROUTES -------->
app.post('/signup', signup)
app.post('/login', login)

exports.api = functions.https.onRequest(app);