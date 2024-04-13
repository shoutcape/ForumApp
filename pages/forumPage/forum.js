import firebase from '../../firebaseconfig.js';
let db = firebase.firestore();

firebase.auth().onAuthStateChanged(function (user) {
    // check if user is authenticated
    if (!user) {
        // redirect to the login page
        window.location.href = '../../index.html';
    }

    // check if user has created a username
    if (user.displayName == null) {
        let usernameWindow = $(`
        <div class="usernameWindow">
        <form class="pure-form pure-form-stacked" id="usernameForm"> 
            <h1>Welcome<br>Enter your Username</h1>
            <label for="usernameInput"></label>
            <input type="text" id="usernameInput">
            <button id="usernameButton" class="pure-button" type="submit">Enter</button>
            </form>
        </div>
        `);
        $('.overlay').append(usernameWindow);
        usernameWindow.slideDown(300);
        usernameWindow.on('submit', function (event) {
            event.preventDefault();
            const username = $('#usernameInput')[0].value;
            db.collection('usernames')
                .doc(username)
                .get()
                .then((docSnapshot) => {
                    if (docSnapshot.exists) {
                        showNotification(
                            usernameWindow,
                            'Username Already Taken',
                            2000
                        );
                    } else {
                        db.collection('usernames').doc(username).set({
                            userId: firebase.auth().currentUser.uid,
                        });
                        user.updateProfile({
                            displayName: username,
                        });
                        usernameWindow.slideUp(300, function () {
                            $('.overlay').fadeOut();
                        });
                    }
                });
        });
    } else {
        $('.overlay').fadeOut(300);
        $('#welcomeHeading').append(`<br>${user.displayName}`);
    }
});


let newPostForm = $('#newPostForm');
newPostForm.on('submit', function (event) {
    event.preventDefault();
    let textContent = $('#newPostInput')[0].value.trim();
    if (!textContent) {
        showNotification($('html'), 'Empty posts not allowed :)', 3000)
        return
    }
    let user = firebase.auth().currentUser;
    let username = user.displayName;
    let date = new Date();
    let formattedDate =
        date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    const newPost = db.collection('posts').doc()
    createNewPost(newPost.id, username, formattedDate, textContent, true);
    let docData = {
        username: username,
        content: textContent,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    $('#newPostInput')[0].value = '';
    // todo figure out best db structure for data
    db.collection('posts').doc(newPost.id).set(docData);
    showNotification($('html'), 'New Post Created', 3000)
});

$('#newPostInput').on('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        newPostForm.submit()
    }
})

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

function showNotification(element, message, displayTime) {
    if ($('.notification').length === 0) {
        let speed = 300;
        let notification = $(`<div class="notification">${message}</div>`);
        element.append(notification);
        notification.fadeIn(speed);
        // timer for the removal of the notification
        setTimeout(() => {
            notification.slideUp(speed, function () {
                notification.remove();
            });
        }, displayTime);
    }
}

function createNewPost(
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
                        <div>
                        <button class="pure-button pure-button-active replyButton" id="replyButton" type="button">Reply</button>
                        <button class="pure-button pure-button-active removeButton" id="removeButton" type="button" style="display: none;">Remove</button>
                        </div>
                    </div>
                <p>${content}</p>
            </div>
                    `);
    let currentUser = firebase.auth().currentUser.displayName;
    let removeButton = newPost.find('.removeButton');
    if (creator == currentUser) {
        removeButton.show();
    }
    removeButton.on('click', () => deletePost(newPost, postId));

    let replyButton = newPost.find('.replyButton');
    replyButton.on('click', () =>
        showReplyWindow(postId, newPost, currentUser, formattedDate)
    );

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
                        doc._delegate._document.data.value.mapValue.fields;
                    let creator = data.username.stringValue;
                    let content = data.content.stringValue;
                    let date = data.createdAt.timestampValue;
                    // format the date properly
                    date = new Date(date);
                    let formattedDate =
                        date.toLocaleDateString() +
                        ' ' +
                        date.toLocaleTimeString();
                    createNewReply(newPost, creator, content, formattedDate, postId, doc.id);
                });
            });
    } 
    $('#userPosts').prepend(newPost);
}

function deletePost(currenPost, postId) {
    db.collection('posts').doc(postId).delete()
        .then(() => {
            showNotification($('html'), 'Post removed Successfully', 3000)
        })

    currenPost.css('visibility', 'hidden');
    currenPost.slideUp(500);
}

function deleteReply(postId, replyId) {
    db.collection('posts').doc(postId).collection('replies').doc(replyId).delete()
        .then(() => {
            showNotification($('html'), 'Reply removed Successfully', 3000)
        })
        .catch((error) => {
            console.error("Error removing reply: ", error);
        });
}

function showReplyWindow(postId, targetElement, user, formattedDate) {
    $('.overlay').show();
    let replyWindow = $(`
                <div class="pure-form pure-form-stacked replyWindow">
                    <h1>Reply</h1>
                    <p>here you can write your reply.</p>
                    <form class="replyForm">
                        <textarea type="text" name="replyInput" id="replyInput"></textarea>
                        <div>
                            <button class="pure-button" id="sendButton" type="submit">Send</button>
                            <button class="pure-button" id="cancelButton" type="submit">Cancel</button>
                        </div>
                    </form>
                </div>
    `);

    replyWindow.find('#sendButton').on('click', function (event) {
        event.preventDefault();
        let replyContent = replyWindow.find('textarea')[0].value;
        const newReply = db.collection('posts').doc(postId).collection('replies').doc()
        createNewReply(targetElement, user, replyContent, formattedDate, postId, newReply.id);

        let docData = {
            username: user,
            content: replyContent,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        db.collection('posts').doc(postId).collection('replies').doc(newReply.id).set(docData);
        $('.overlay').fadeOut();
        replyWindow.remove();
        showNotification($('html'),'New Reply Created', 3000)
    });

    replyWindow.find('#cancelButton').on('click', function (event) {
        event.preventDefault();
        $('.overlay').fadeOut();
        replyWindow.remove();
    });

    $('.overlay').append(replyWindow);
}

function createNewReply(targetElement, user, content, formattedDate, postId, replyId) {
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
                `);
                let currentUser = firebase.auth().currentUser.displayName;
                let removeButton = replyMessage.find('.removeButton');
                if (user == currentUser) {
                    removeButton.show();
                }
                removeButton.on('click', function() {
                    deleteReply(postId, replyId);
                    replyMessage.css('visibility', 'hidden');
                    replyMessage.slideUp(500);
                })

    targetElement.append(replyMessage);
}

loadUserPosts();
