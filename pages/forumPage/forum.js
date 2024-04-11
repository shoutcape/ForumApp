import firebase from '../../firebaseconfig.js';
let db = firebase.firestore();

firebase.auth().onAuthStateChanged(function (user) {
    // check if user is authenticated
    if (!user) {
        // redirect to the login page
        window.location.href = '../../index.html';
        console.log('You are not a user');
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
    let textContent = $('#newPostInput')[0].value
    let user = firebase.auth().currentUser
    let username = user.displayName
    let newPost = $(`
    <div class="text-container">
        <h5>${username}</h5>
        <p>${textContent}</p>
        <button class="replyButton" id="replyButton" type="button">Reply</button>
    </div>
            `);
    $('#userPosts').prepend(newPost)
    let docData = {
        username: username,
        content: textContent,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }

    // todo figure out best db structure for data
    db.collection('posts').add(docData)
});

function loadUserPosts() {
    db.collection("posts").orderBy('createdAt').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let fields = doc._delegate._document.data.value.mapValue.fields
            let creator = fields.username.stringValue 
            let content = fields.content.stringValue
            let date = fields.createdAt.timestampValue
            // format the date properly
            date = new Date(date)
            let formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            let newPost = $(`
            <div class="text-container">
                <h5>${creator}</h5>
                <p>${content}</p>
                <div class="actions">
                <button class="replyButton" id="replyButton" type="button">Reply</button>
                <button class="removeButton" id="removeButton" type="button" style="display: none;">Remove</button>
                <span>${formattedDate}</span>
                </div>
            </div>
                    `);
            if (creator == firebase.auth().currentUser.displayName) {
                newPost.find('.removeButton').show()
            }
            $('#userPosts').prepend(newPost)
                // console.log(information)
            // })
        })
    })
}

function showNotification(element, message, displayTime) {
    if ($('.notification').length === 0) {
        let speed = 300;
        let notification = $(`<div class="notification">${message}</div>`);
        element.append(notification);
        notification.slideDown(speed);
        // timer for the removal of the notification
        setTimeout(() => {
            notification.slideUp(speed, function () {
                notification.remove();
            });
        }, displayTime);
    }
}

loadUserPosts()