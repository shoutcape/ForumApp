import firebase from "../../firebaseconfig.js"


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log(user.email)
        console.log('welcome to the app')
    } else {
        // redirect to the login page
        window.location.href = "../loginPage/login.html"
        console.log('You are not a user')
    }

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
        `)
        $('.overlay').append(usernameWindow)
        usernameWindow.slideDown(300)
        usernameWindow.on('submit', function(event) {
            event.preventDefault()
            let db = firebase.firestore()
            let username = $('#usernameInput')[0].value
            db.collection('usernames')
            .doc(username)
            .get()
            .then((docSnapshot) => {
                if (docSnapshot.exists) {
                    showNotification(usernameWindow,'Username Already Taken', 2000)
                } else {
                    db.collection('usernames').doc(username).set({
                        userId: firebase.auth().currentUser.uid
                    })
                    user.updateProfile({
                        displayName: username
                    })
                    usernameWindow.slideUp(300, function() {
                        $('.overlay').remove()
                    })
                    console.log('user added to database')
                }
            })

        })
    } else {
        $('.overlay').remove()
    }
})




function showNotification(element, message, displayTime) {
    if ($('.notification').length === 0) {
        let speed = 300;
        let notification = $(`<div class="notification">${message}</div>`);
        if (message == 'Login Successful') {
           notification.css('background-color', 'lightgreen') 
        }
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
