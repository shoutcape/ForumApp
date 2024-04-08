import firebase from "../../firebaseconfig.js"

const registerForm = $('#registerForm')
const loginButton = $('#loginButton')

registerForm.on('submit', function(e) {
    e.preventDefault()
    let email = $('#email')[0].value
    let password = $('#password')[0].value
    let cpassword = $('#cpassword')[0].value
    authenticate(email,password,cpassword)
})

loginButton.on('click', function() {
    window.location.href = "../loginPage/login.html"
})


async function authenticate(email, password, cpassword) {
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password)
        console.log(response)
        console.log('new user created')
    } catch(error) {
        console.log(error.message)
    }
}