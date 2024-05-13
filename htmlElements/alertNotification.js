export function showNotification(element, message, displayTime) {
    // prevent duplicate notifications
    if ($('.notification').length === 0) {
        let speed = 300
        let style

        // list of words to trigger style change in notification
        let errorWords = ['empty', 'error', 'invalid'];
        if (errorWords.some(word => message.toLowerCase().includes(word))) {
            style = 'errorNotification'
        }

        let notification = $(
            `<div class="notification ${style}">${message}</div>`
        )
        element.append(notification)
        notification.fadeIn(speed)
        // timer for the removal of the notification
        setTimeout(() => {
            notification.slideUp(speed, function () {
                notification.remove()
            })
        }, displayTime)
    }
}
