import firebase from "../../firebaseconfig.js"

const loginForm = $("#loginForm")
const registerButton = $("#registerButton")


// add submit listener to the loginform
loginForm.on("submit", function(e) {
    e.preventDefault()
    let email = $('#email')[0].value
    let password = $('#password')[0].value
    authenticateLogin(email, password)

})

registerButton.on('click', function() {
    window.location.href = "../registerPage/register.html"
})


async function authenticateLogin(email, password) {
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password)
        console.log('login successful')
        window.location.href = "../forumPage/forum.html"
    }
    catch(error) {
        console.log(error.message)
    }

}