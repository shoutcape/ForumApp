export function createUsernameWindow() {
    const usernameWindow = $(`
            <div class="usernameWindow">
                <form class="pure-form pure-form-stacked" id="usernameForm"> 
                    <h1>Welcome<br>Enter your Username</h1>
                    <label for="usernameInput"></label>
                    <input type="text" id="usernameInput">
                    <button id="usernameButton" class="pure-button" type="submit">Enter</button>
                </form>
            </div>
    `)
    return usernameWindow
}
