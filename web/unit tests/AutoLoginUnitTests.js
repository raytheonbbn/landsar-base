/**
 * To run these tests, run UnitTests.html in web browser
 */

function testLoginSuccessfully(){
    setCookie("username", "admin", 0)
    setCookie("loggedIn", true, 0)

    return checkShouldAutoLogin()
}

function testLoginUnsuccessfully(){
    setCookie("username", "admin", 0)
    setCookie("loggedIn", false, 0)

    return checkShouldAutoLogin()
}