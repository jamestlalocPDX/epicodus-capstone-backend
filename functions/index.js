// ----Access Firebase Functions----
const functions = require('firebase-functions');
// ----Software Development Kit (SDK)----
const admin = require('firebase-admin');
//----Express Framework----
const express = require('express');
const app = express();


var serviceAccount = require("./../serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://newco-5aacb.firebaseio.com"
// });

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
admin.initializeApp(adminConfig);

// ----Route that grabs posts data from firestore database collections----
app.get('/posts', (req, res) => {
  admin
  .firestore()
  .collection('posts')
  .orderBy('createdAt', 'desc')
  .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(posts);
    })
      .catch(err => console.error(err));
});

// ----Route that creates posts data to firestore database collections----
app.post('/post', (req, res) => {
  const newPost = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  admin
  .firestore()
  .collection('posts')
  .add(newPost)
  .then((doc) => {
    res.json({ message: `document ${doc.id} created successfully` })
  })
  .catch((err) => {
    res.status(500).json({ error: 'something went wrong' });
    console.error(err);
  })
})

// ----Sign-up route----
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
    return res
      .status(201)
      .json({ message: `user ${data.user.uid} signed up successfully` });
  })
  .catch((err) => {
    console.error(err);
    return res.status(500).json({ error: err.code });
  })
})

exports.api = functions.https.onRequest(app);