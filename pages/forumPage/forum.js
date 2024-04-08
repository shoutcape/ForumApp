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
})