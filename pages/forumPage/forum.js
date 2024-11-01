import firebase from '../../firebaseconfig.js';
const db = firebase.firestore();
import { createUsernameWindow } from '../../htmlElements/usernamewindow.js';
import { showNotification } from '../../htmlElements/alertNotification.js';
import { createNewPost } from '../../htmlElements/newPost.js';

firebase.auth().onAuthStateChanged(function(user) {
  // check if user is authenticated
  if (!user) {
    // redirect to the login page
    window.location.href = '../../index.html';
  }

  // check if user has a username
  if (user.displayName === null) {
    const usernameWindow = createUsernameWindow();
    $('.overlay').append(usernameWindow);
    usernameWindow.slideDown(300);
    usernameWindow.on('submit', function(event) {
      event.preventDefault();
      const username = $('#usernameInput')[0].value;
      // check that username is not empty
      if (username.trim().length < 1) {
        showNotification(usernameWindow, `Username Can't be empty`, 1000);
      } else {
        // add username to database
        db.collection('usernames')
          .doc(username)
          .get()
          .then((doc) => {
            if (doc.exists) {
              showNotification(usernameWindow, 'Username Already Taken', 1000);
            } else {
              db.collection('usernames').doc(username).set({
                userId: user.uid,
              });
              user.updateProfile({
                displayName: username,
              });
              usernameWindow.slideUp(300, function() {
                $('.overlay').fadeOut();
              });
            }
            loadUserPosts();
          });
      }
    });
  } else {
    $('.overlay').fadeOut(300);
    $('#welcomeHeading').append(`<br>${user.displayName}`);
    loadUserPosts();
  }
});

// define post creation textArea
let newPostForm = $('#newPostForm');
newPostForm.on('submit', async function(event) {
  event.preventDefault();
  let textContent = $('#newPostInput')[0].value.trim();
  if (!textContent) {
    showNotification($('html'), 'Empty posts not allowed :)', 2000);
    return;
  }

  let username = await firebase.auth().currentUser.displayName;
  if (!username) {
    return;
  }
  let date = new Date();
  let formattedDate =
    date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  const newPost = db.collection('posts').doc();
  createNewPost(newPost.id, username, formattedDate, textContent, true);
  let docData = {
    username: username,
    content: textContent,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  $('#newPostInput')[0].value = '';
  // todo figure out best db structure for data
  db.collection('posts').doc(newPost.id).set(docData);
  showNotification($('html'), 'New Post Created', 2000);
});

$('#newPostInput').on('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    newPostForm.submit();
  }
});

$('.signout').on('click', function(event) {
  event.preventDefault();
  console.log('toimii');
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = '../../index.html';
      showNotification($('html'), 'Signed Out', 2000);
    });
});

function loadUserPosts() {
  db.collection('posts')
    .orderBy('createdAt')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let postId = doc.id;
        let data = doc._delegate._document.data.value.mapValue.fields;
        let creator = data.username.stringValue;
        let content = data.content.stringValue;
        let date = data.createdAt.timestampValue;
        // format the date properly
        date = new Date(date);
        let formattedDate =
          date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        createNewPost(postId, creator, formattedDate, content);
      });
    });
}
