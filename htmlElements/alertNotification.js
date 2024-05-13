export function showNotification(element, message, displayTime) {
    if ($('.notification').length === 0) {
        let speed = 300
        let style

        if (message.includes('Empty')) {
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
