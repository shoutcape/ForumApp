

// change page animation
export function changePage(element, destination=null, delay=0) {
    setTimeout(async () => {
        await containerSlideUp(element, 300)
        if (destination){
            window.location.href = destination
        }
    }, delay)
}

// function that returns a promise so the program will wait for the animation to finish
function containerSlideUp(element, duration) {
    return new Promise((resolve) => {
            element.slideUp(duration, resolve);
    });
}


export function changeForm(currentElement, targetElement) {
    setTimeout(async () => {
    await containerSlideUp(currentElement,300)
    targetElement.slideDown()
    }, 0)
}