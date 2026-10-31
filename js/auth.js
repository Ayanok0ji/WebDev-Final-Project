var users = [
    { email: "admin@discord.com", username: "admin", password: "admin123" },
    { email: "froggy@gmail.com", username: "froggy", password: "test" }
];

// Login Function
function checklogin() {
    var user = document.getElementById("email").value.toLowerCase();
    var pass = document.getElementById("password").value;

    for (var i = 0; i < users.length; i++) {
        if ((user == users[i].email || user == users[i].username) && pass == users[i].password) {
            return true;
        }
    }

    // Invalid or Incorrect Password 
    document.getElementById("error").innerHTML = "Login or password is invalid.";
    return false;
}

