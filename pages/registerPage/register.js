import firebase from '../../firebaseconfig.js';

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
    changePage('../../index.html')
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
            showNotification('New User Created, Loading Login Page', 2000)
            changePage('../../index.html', 1000)
        })
        //  error handling for failed attempts
        .catch((error) => {
            showNotification(error.message, 2000);
        });
}

/* 
the async/await function needs a promise so we return a promise of the slideUp function, 
this creates a wait for the animation to complete
*/
function containerSlideUp(element, duration) {
    return new Promise((resolve) => {
        element.slideUp(duration, resolve);
    });
}

function showNotification(message, displayTime) {
    if ($('.notification').length === 0) {
        let speed = 300;
        let notification = $(`<div class="notification">${message}</div>`);
        if (message == 'New User Created, Loading Login Page') {
           notification.css('background-color', 'lightgreen') 
        }
        container.append(notification);
        notification.slideDown(speed);
        // timer for the removal of the notification
        setTimeout(() => {
            notification.slideUp(speed, function () {
                notification.remove();
            });
        }, displayTime);
    }
}

function changePage(destination, delay=0) {
    setTimeout(async () => {
        await containerSlideUp(container, 300)
        window.location.href = destination
    }, delay)
}
