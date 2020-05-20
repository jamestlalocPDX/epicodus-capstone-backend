// <----Access Firebase Functions---->
const functions = require('firebase-functions');

//<-----Express Framework---->
const app = require('express')();

//<----Firebase Authentication----->
const FBAuth = require('./utility/fbAuth');

//<----Import Route Modules------>
const { getAllPosts, createPost, getPost, commentsOnPosts, likePost, unlikePost, deletePost } = require('./handlers/posts');
const { signup, login, uploadImage, addUserInfo, getUser } = require('./handlers/users');

// <-------- POST ROUTES -------->
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);
app.get('/post/:postId', getPost);
app.post('/post/:postId/comment', FBAuth, commentsOnPosts);
app.get('/post/:postId', FBAuth, deletePost)
app.get('/post/:postId/like', FBAuth, likePost);
app.get('/post/:postId/unlike', FBAuth, unlikePost);

// <-------- USERS ROUTES -------->
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserInfo);
app.get('/user', FBAuth, getUser);

exports.api = functions.https.onRequest(app);