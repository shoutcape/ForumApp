import firebase from '../../firebaseconfig.js'
let db = firebase.firestore()
import { showReplyWindow } from './replyWindow.js'
import { showNotification } from './alertNotification.js'
import { createNewReply } from './replyWindow.js'

export function createNewPost(
  postId,
  creator,
  formattedDate,
  content,
  completelyNewPost = false
) {
  let newPost = $(`
            <div class="text-container">
                    <div class="infoBar">
                        <div>
                            <span>Post from user:</span>
                            <span class="username">${creator}</span>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="actionButtons">
                            <button class="pure-button pure-button-active replyButton" id="replyButton" type="button">Reply</button>
                            <button class="pure-button pure-button-active removeButton" id="removeButton" type="button" style="display: none;">Remove</button>
                        </div>
                    </div>
                <p>${content}</p>
            </div>
                    `)

  let displayName = firebase.auth().currentUser.displayName
  let removeButton = newPost.find('.removeButton')
  if (creator == displayName) {
    removeButton.show()
  }
  removeButton.on('click', () => deletePost(newPost, postId))

  let replyButton = newPost.find('.replyButton')
  replyButton.on('click', () =>
    showReplyWindow(postId, newPost, displayName, formattedDate)
  )

  // get the replies for the posts
  if (!completelyNewPost) {
    db.collection('posts')
      .doc(postId)
      .collection('replies')
      .orderBy('createdAt')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let data =
            doc._delegate._document.data.value.mapValue.fields
          let creator = data.username.stringValue
          let content = data.content.stringValue
          let date = data.createdAt.timestampValue
          // format the date properly
          date = new Date(date)
          let formattedDate =
            date.toLocaleDateString() +
            ' ' +
            date.toLocaleTimeString()
          createNewReply(
            newPost,
            creator,
            content,
            formattedDate,
            postId,
            doc.id
          )
        })
      })
  }
  $('#userPosts').prepend(newPost)
}

function deletePost(currenPost, postId) {
  // manually delete all the replies from the post before deleting the post
  db.collection('posts')
    .doc(postId)
    .collection('replies')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        db.collection('posts')
          .doc(postId)
          .collection('replies')
          .doc(doc.id)
          .delete()
          .then(() => { })
      })
    })

  db.collection('posts')
    .doc(postId)
    .delete()
    .then(() => {
      showNotification($('html'), 'Post removed Successfully', 3000)
    })

  currenPost.css('visibility', 'hidden')
  currenPost.slideUp(500)
}
