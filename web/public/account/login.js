function checkShouldAutoLogin(){
    let shouldAutoLogin = false;
    let username = getCookie("username");
    if(username !== null) {
        let loggedIn = getCookie("loggedIn");
        console.log(loggedIn);
        if(loggedIn === null || loggedIn === "true") {
            shouldAutoLogin = true;
        }
    }
    return shouldAutoLogin
}
