// <----Access Firebase Functions---->
const functions = require('firebase-functions');

//<-----Express Framework---->
const app = require('express')();

//<----Firebase Authentication----->
const FBAuth = require('./utility/fbAuth');

//<----Import Route Modules------>
const { db } = require('./utility/admin');
const { getAllPosts, createPost, getPost, commentsOnPosts, likePost, unlikePost, deletePost } = require('./handlers/posts');
const { signup, login, uploadImage, addUserInfo, getUser } = require('./handlers/users');

// <-------- POST ROUTES -------->
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);
app.get('/post/:postId', getPost);
app.post('/post/:postId/comment', FBAuth, commentsOnPosts);
app.delete('/post/:postId', FBAuth, deletePost)
app.get('/post/:postId/like', FBAuth, likePost);
app.get('/post/:postId/unlike', FBAuth, unlikePost);

// <-------- USERS ROUTES -------->
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserInfo);
app.get('/user', FBAuth, getUser);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
.firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    db.doc(`/posts/${snapshot.data().postId}`)
    .get()
    .then((doc) => {
      if(doc.exists) {
        return db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: 'like',
          read: false,
          postId: doc.id
        })
      }
    })
    .then(() => {
      return;
    })
    .catch(err => {
      console.error(err);
      return;
    })
  });

  exports.deleteNotificationOnUnlike = functions.firestore.document('likes/{id}')
    .onDelete((snapshot) => {
      db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
    });

  exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    db.doc(`/posts/${snapshot.data().postId}`).get()
    .then((doc) => {
      if(doc.exists) {
        return db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString,
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: 'comment',
          read: false,
          postId: doc.id
        })
      }
    })
    .then(() => {
      return;
    })
    .catch(err => {
      console.error(err);
      return;
    })
  });