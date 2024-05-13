import firebase from '../../firebaseconfig.js';
import { showNotification } from '../../htmlElements/alertNotification.js';
import { changePage } from '../../utils/changePage.js';

const registerForm = $('#registerForm');
const loginLink = $('#loginLink');

const container = $('.pure-container');
container.hide();
container.slideDown(300);

registerForm.on('submit', function (e) {
    e.preventDefault();
    let email = $('#email')[0].value;
    let password = $('#password')[0].value;
    let cpassword = $('#cpassword')[0].value;
    authenticate(email, password, cpassword);
});

loginLink.on('click', async function () {
    changePage(container, '../../index.html')
});

async function authenticate(email, password, cpassword) {
    if (password !== cpassword) {
        showNotification(`Passwords don't match`, 2000);
        return;
    }
    await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async () => {
            showNotification(container,'New User Created, Loading Login Page', 2000)
            changePage(container, '../../index.html', 1000)
        })
        //  error handling for failed attempts
        .catch((error) => {
            showNotification(container, error.message, 2000);
        });
}