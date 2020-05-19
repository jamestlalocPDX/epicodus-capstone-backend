// ----Access Firebase Functions----
const firebase = require('firebase');
const functions = require('firebase-functions');
// ----Software Development Kit (SDK)----
const admin = require('firebase-admin');
//----Express Framework----
const app = require('express')();

var serviceAccount = require("./../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://newco-5aacb.firebaseio.com"
});

const firebaseConfig = {
  apiKey: "AIzaSyADYr4zfxyYESkb574cznc0Njw4Drs82dY",
  authDomain: "newco-5aacb.firebaseapp.com",
  databaseURL: "https://newco-5aacb.firebaseio.com",
  projectId: "newco-5aacb",
  storageBucket: "newco-5aacb.appspot.com",
  messagingSenderId: "946708994083",
  appId: "1:946708994083:web:1be770fa0245de0a0cf996"
};

firebase.initializeApp(firebaseConfig)

const db = admin.firestore();

// ----Route that grabs posts data from firestore database collections----
app.get('/posts', (req, res) => {
  db
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

  db
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

  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if(doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: error.code });
    })

})

exports.api = functions.https.onRequest(app);