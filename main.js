import firebase from './firebaseconfig.js';
import { showNotification } from './htmlElements/alertNotification.js';
import { changePage } from './utils/changePage.js';
const loginForm = $('#loginForm');
const registerLink = $('#registerLink');
const container = $('.pure-container');

container.hide();
container.slideDown(300);

// add submit listener to the loginform
loginForm.on('submit', function (e) {
    e.preventDefault();
    let email = $('#email')[0].value;
    let password = $('#password')[0].value;
    authenticateLogin(email, password);
});

registerLink.on('click', async function () {
    changePage(container, './pages/registerPage/register.html')
});

async function authenticateLogin(email, password) {
    await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async () => {
            showNotification(container,'Login Successful', 2000)
            changePage('./pages/forumPage/forum.html', 1000)
        })
        .catch((error) => {
            let message = error.message
            if (error.message == ('Firebase: The supplied auth credential is incorrect, malformed or has expired. (auth/invalid-credential).')) {
                message = 'Invalid Login Credentials'
            }
            showNotification(container, message, 3000);
        });
}