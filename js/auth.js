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
function togglepassword() {
    var box = document.getElementById("login-password");
    var icon = document.getElementById("toggle-password");

    if (box.type == "password") {
        box.type = "text";
        icon.src = "../assets/icons/ui-eye-off-hide-24x24.svg";
        icon.alt = "Hide password";
    } else {
        box.type = "password";
        icon.src = "../assets/icons/ui-eye-show-24x24.svg";
        icon.alt = "Show password";
    }
}

// registration system
function checkregister() {
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

    for (var i = 0; i < users.length; i++) {
        if (email == users[i].email || username == users[i].username) {
            error.innerHTML = "Email or username is already taken.";
            return false;
        }
    }

    alert("Account created! You can now log in.");
    return true;
}