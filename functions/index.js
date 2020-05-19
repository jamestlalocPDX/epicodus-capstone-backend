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

// <-------- GET ROUTE -------->
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

// <------- CREATE ROUTE -------->
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

const isEmpty = (string) => {
  if(string.trim() == '') {
    return true;
  } else {
    return false;
  }
}
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(regEx)) {
    return true;
  } else {
    return false;
  }
}

// <-------- SIGN-UP ROUTE -------->
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let errors = {};
// <---- Checks to see if email string is empty or has valid chars ---->
  if(isEmpty(newUser.email)) {
    errors.email = 'Please provide an email.';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Please enter a valid email address.';
  }

// <---- Checks to see if password is empty ---->
  if(isEmpty(newUser.password)) {
    errors.password = 'Please enter a password.';
  }
  if(newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = 'Both passwords must be the same!';
  }

// <----Checks to see if the user handle is empty ---->
  if (isEmpty(newUser.handle)) {
    errors.handle = "Please enter a user handle."
  }

  if(Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
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
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err);
      if(err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' });
      } else {
        return res.status(500).json({ error: err.code });
      }
    })
})

// <---- LOG-IN ROUTE ---->
app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

// <---- Checks to see if email string is empty ---->
  if(isEmpty(user.email)) {
    errors.email = "Please enter an email."
  }

// <---- Checks to see if password is empty ---->
  if(isEmpty(user.password)) {
    errors.password = "Please enter a password."
  }

// <----Checks to see if the user handle is empty ---->
  if(Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

// <----- Authenticates User ------>
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token })
    })
    .catch((err) => {
      console.error(err);
      if(err.code === 'auth/wrong-password') {
        return res.status(403).json({ general: "Your email or password is incorrect" })
      } else {
      return res.status(500).json({ error: error.code })
      }
    })
})

exports.api = functions.https.onRequest(app);