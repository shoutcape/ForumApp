

// add delay if you want to show user a message before moving on
export function changePage(element, destination, delay=0) {
    setTimeout(async () => {
        await containerSlideUp(element, 300)
        window.location.href = destination
    }, delay)
}

/* 
the async/await authenticateLogin function needs a promise so we return a promise of a slideUp function, 
this creates a wait for the animation
*/
function containerSlideUp(element, duration) {
    return new Promise((resolve) => {
        element.slideUp(duration, resolve);
    });
}