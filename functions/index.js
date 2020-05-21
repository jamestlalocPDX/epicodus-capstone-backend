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
    return db
    .doc(`/posts/${snapshot.data().postId}`)
    .get()
    .then((doc) => {
      if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
    .catch((err) => 
      console.error(err));
  });

  exports.deleteNotificationOnUnlike = functions.firestore.document('likes/{id}')
    .onDelete((snapshot) => {
      return db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
    });

  exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    db.doc(`/posts/${snapshot.data().postId}`).get()
    .then((doc) => {
      if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
    .catch(err => {
      console.error(err);
      return;
    })
  });

  exports.onUserImageChange = functions
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if(change.before.data().imageUrl !== change.after.data().imageUrl) {
    console.log('image has changed');
    const batch = db.batch();
    return db
      .collection('posts')
      .wheree('userHandle', '==', change.before.data().handle)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          const post = db.doc(`/posts/${doc.id}`);
          batch.update(post, { userImage: change.after.data().imageUrl });
        });
        return batch.commit();
      });
    } else {
      return true;
    }
  });