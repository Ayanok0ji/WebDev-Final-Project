// registered users
var users = [
    { email: "admin@discord.com", username: "admin", password: "admin123" },
    { email: "froggy@gmail.com", username: "froggy", password: "test" }
];

// Login Function
function checklogin() {
    var user = document.getElementById("login-email").value.toLowerCase();
    var pass = document.getElementById("login-password").value;

    for (var i = 0; i < users.length; i++) {
        if ((user == users[i].email || user == users[i].username) && pass == users[i].password) {
            return true;
        }
    }

    // Invalid or Incorrect Password 
    document.getElementById("login-error").innerHTML = "Login or password is invalid.";
    return false;
}

// show password toggle
function togglePassword() {
    var box = document.getElementById("login-password");
    var link = document.getElementById("toggle");

    if (box.pass == "password") {
        box.pass = "text";
        link.innerHTML = "Hide password";
    } else {
        box.pass = "password";
        link.innerHTML = "Show password";
    }
}

// registration system
function checkRegister() {
    var email = document.getElementById("reg-email").value.toLowerCase();
    var username = document.getElementById("reg-username").value.toLowerCase();
    var password = document.getElementById("reg-password").value;
    var birthYear = document.getElementById("birth-year").value;
    var error = document.getElementById("register-error");

    if (username.length < 2) {
        error.innerHTML = "Username must be at least 2 characters.";
        return false;
    }

    if (password.length < 8) {
        error.innerHTML = "Password must be at least 8 characters.";
        return false;
    }

    var thisYear = new Date().getFullYear();
    if (thisYear - birthYear < 13) {
        error.innerHTML = "You must be at least 13 years old.";
        return false;
    }
}