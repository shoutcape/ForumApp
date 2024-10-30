import firebase from '../../firebaseconfig.js'
let db = firebase.firestore()
import { showNotification } from './alertNotification.js'

export function createNewReply(
    targetElement,
    user,
    content,
    formattedDate,
    postId,
    replyId
) {
    let replyMessage = $(`
                    <div class="reply">
                            <div class="infoBar">
                                <div>
                                    <span>Reply from user:</span>
                                    <span class="username">${user}</span>
                                    <span>${formattedDate}</span>
                                </div>
                                <div>
                                    <button class="pure-button pure-button-active removeButton" id="removeButton" type="button" style="display: none;">Remove</button>
                                </div>
                            </div>
                        <p>${content}</p>
                    </div>
                `)
    let currentUser = firebase.auth().currentUser.displayName
    let removeButton = replyMessage.find('.removeButton')
    if (user == currentUser) {
        removeButton.show()
    }
    removeButton.on('click', function () {
        deleteReply(postId, replyId)
        replyMessage.css('visibility', 'hidden')
        replyMessage.slideUp(500)
    })

    targetElement.append(replyMessage)
}

function deleteReply(postId, replyId) {
    db.collection('posts')
        .doc(postId)
        .collection('replies')
        .doc(replyId)
        .delete()
        .then(() => {
            showNotification($('html'), 'Reply removed Successfully', 3000)
        })
        .catch((error) => {
            console.error('Error removing reply: ', error)
        })
}

// prevent user from navigating the page with tab while using the replywindow
let preventNavigation = (event) => {
    if (event.keyCode === 9) {
        event.preventDefault()
    }
}

export function showReplyWindow(postId, targetElement, user, formattedDate) {
    $('.overlay').show()
    document.addEventListener('keydown', preventNavigation)
    let replyWindow = $(`
                <div class="pure-form pure-form-stacked replyWindow">
                    <h1>Reply</h1>
                    <p>here you can write your reply.</p>
                    <form class="replyForm">
                        <textarea type="text" name="replyInput" id="replyInput"></textarea>
                        <div>
                            <button class="pure-button" id="sendButton" type="submit">Send</button>
                            <button class="pure-button" id="cancelButton">Cancel</button>
                        </div>
                    </form>
                </div>
    `)

    let replyForm = replyWindow.find('.replyForm')

    replyWindow.find('#replyInput').on('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            replyForm.submit()
        }
    })

    replyForm.on('submit', async function (event) {
        event.preventDefault()
        let replyContent = replyWindow.find('textarea')[0].value.trim()
        if (!replyContent) {
            showNotification($('html'), 'Empty replies not allowed :)', 3000)
            return
        }
        const currentUser = await firebase.auth().currentUser.displayName
        const newReply = db
            .collection('posts')
            .doc(postId)
            .collection('replies')
            .doc()

        createNewReply(
            targetElement,
            currentUser,
            replyContent,
            formattedDate,
            postId,
            newReply.id
        )

        let docData = {
            username: user,
            content: replyContent,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
        db.collection('posts')
            .doc(postId)
            .collection('replies')
            .doc(newReply.id)
            .set(docData)
        $('.overlay').fadeOut()
        replyWindow.remove()
        showNotification($('html'), 'New Reply Created', 3000)
    })

    replyWindow.find('#cancelButton').on('click', function (event) {
        event.preventDefault()
        $('.overlay').fadeOut()
        replyWindow.remove()
    })

    $('html').append(replyWindow)
}
