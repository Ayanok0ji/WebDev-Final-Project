const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

chatForm.addEventListener("submit", function (event) {

    event.preventDefault();

    let message = messageInput.value.trim();

    if (message !== "") {

        let newMessage = document.createElement("div");

        newMessage.className = "message mine";
        newMessage.textContent = message;

        messages.appendChild(newMessage);

        messageInput.value = "";

        messages.scrollTop = messages.scrollHeight;
    }

});