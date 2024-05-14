import firebase from './firebaseconfig.js';
import { showNotification } from './htmlElements/alertNotification.js';
import { changePage, changeForm } from './utils/changePage.js';
const loginForm = $('#loginForm');
const registerLink = $('#registerLink');
const Lcontainer = $('#login');
const Rcontainer = $('#register')
const registerForm = $('#registerForm');
const loginLink = $('#loginLink');
// 
Lcontainer.slideDown(400);

// add submit listener to the loginform
loginForm.on('submit', function (e) {
    e.preventDefault();
    let email = $('#email')[0].value;
    let password = $('#password')[0].value;
    authenticateLogin(email, password);
});

registerLink.on('click', async function () {
    changeForm(Lcontainer, Rcontainer)
});

async function authenticateLogin(email, password) {
    await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async () => {
            showNotification(Lcontainer,'Login Successful', 2000)
            changePage(Lcontainer, './pages/forumPage/forum.html', 1000)
        })
        .catch((error) => {
            let message = error.message
            if (error.message == ('Firebase: The supplied auth credential is incorrect, malformed or has expired. (auth/invalid-credential).')) {
                message = 'Invalid Login Credentials'
            }
            showNotification(Lcontainer, message, 3000);
        });
}


registerForm.on('submit', function (e) {
    e.preventDefault();
    let email = $('#Remail')[0].value;
    let password = $('#Rpassword')[0].value;
    let cpassword = $('#Rcpassword')[0].value;
    authenticateRegister(email, password, cpassword);
});

loginLink.on('click', async function () {
    changeForm(Rcontainer, Lcontainer)
});

async function authenticateRegister(email, password, cpassword) {
    if (password !== cpassword) {
        showNotification(Rcontainer,`Passwords don't match`, 2000);
        return;
    }
    await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async () => {
            showNotification($('html'),'New User Created, Loading Login Page', 2001)
            changeForm(Rcontainer, Lcontainer)
        })
        //  error handling for failed attempts
        .catch((error) => {
            showNotification(Rcontainer, error.message, 2001);
        });
}
