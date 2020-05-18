const functions = require('firebase-functions');
// --- Software Development Kit (SDK) ---
const admin = require ('firebase-admin');

exports.getPosts = functions.https.onRequest((req, res) => {
  admin.firestore().collection('posts').get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push(doc.data());
      });
      return res.json(posts);
    })
      .catch(err => console.error(err));
});

exports.createPost = functions.https.onRequest((req, res) => {
  const newPost = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };

  admin
  .firestore()
  .collection('posts')
  .add(newPost)
  .then(doc => {
    res.json({ message: `document ${doc.id} created successfully` })
  })
  .catch((err) => {
    res.status(500).json({ error: 'something went wrong' });
    console.error(err);
  })
})