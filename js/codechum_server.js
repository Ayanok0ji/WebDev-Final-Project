var channels = [
  {
    name: "announcement",
    messages: [
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Welcome to the Codechum server!", time: "08:00" }
    ]
  },
  {
    name: "rules-and-info",
    messages: [
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Rule 1: Be respectful to everyone.", time: "08:10" },
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Rule 2: No spamming.", time: "08:11" }
    ]
  },
  {
    name: "roles",
    messages: [
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Ask a moderator for a new role.", time: "08:20" }
    ]
  },
  {
    name: "welcome",
    messages: [
      { author: "Eunice", avatar: "../assets/images/pf3.jpg", text: "Hi everyone! I am new here.", time: "09:15" },
      { author: "Mr. Bean", avatar: "../assets/images/mrb.jpg", text: "Welcome Eunice!", time: "09:16" }
    ]
  },
  {
    name: "general",
    messages: [
      { author: "Kitty", avatar: "../assets/images/cat.jpg", text: "Good morning everyone!", time: "10:00" }
    ]
  },
  {
    name: "coding-help",
    messages: [
      { author: "Chaa", avatar: "../assets/images/pf5.png", text: "How do I use a for loop?", time: "11:30" },
      { author: "Dynosure", avatar: "../assets/images/dyno.webp", text: "Check W3Schools, it is very helpful!", time: "11:32" }
    ]
  },
  {
    name: "language-discussion",
    messages: [
      { author: "Jarren", avatar: "../assets/images/pf4.png", text: "Python or Java for beginners?", time: "13:00" }
    ]
  },
  {
    name: "bug-reports",
    messages: [
      { author: "Chaa", avatar: "../assets/images/pf5.png", text: "The submit button freezes on my phone.", time: "14:45" }
    ]
  }
];

var currentChannel = 1;

var isMuted = true;
var isDeafened = true;


function showmessages() {
  var list = channels[currentChannel].messages;
  var html = "";

  for (var i = 0; i < list.length; i++) {
    html += '<div class="cc-msg">';
    html += '<img class="cc-avatar" src="' + list[i].avatar + '" alt="">';
    html += '<div>';
    html += '<div class="cc-head">';
    html += '<span class="cc-author">' + list[i].author + '</span>';
    html += '<span class="cc-time">' + list[i].time + '</span>';
    html += '</div>';
    html += '<p class="cc-text">' + list[i].text + '</p>';
    html += '</div>';
    html += '</div>';
  }

  document.getElementById("messages").innerHTML = html;

  var chat = document.getElementById("chat-body");
  chat.scrollTop = chat.scrollHeight;
}

function gettime() {
  var now = new Date();
  var minutes = now.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return now.getHours() + ":" + minutes;
}

function sendmessage() {
  var input = document.getElementById("message-input");
  var text = input.value.trim();

  if (text == "") {
    return;
  }

  channels[currentChannel].messages.push({
    author: "Froggy",
    avatar: "../assets/images/profile.jpg",
    text: text,
    time: getTime()
  });

  input.value = "";  
  showMessages();    

function switchchannel(index) {
  currentChannel = index;
  var channelName = channels[index].name;

  document.getElementById("channel-name").innerHTML = channelName;
  document.getElementById("welcome-title").innerHTML = "Welcome to #" + channelName + "!";
  document.getElementById("welcome-text").innerHTML = "This is the start of the #" + channelName + " channel.";
  document.getElementById("message-input").placeholder = "Message #" + channelName;

  for (var i = 0; i < channels.length; i++) {
    document.getElementById("channel-" + i).className = "channel";
  }

  document.getElementById("channel-" + index).className = "channel active";

  showMessages();
}


function togglemute() {
  var button = document.getElementById("mute-button");
  var icon = document.getElementById("mute-icon");

  if (isMuted == true) {

    isMuted = false;
    button.className = "user-icon";
    icon.src = "../assets/icons/ui-mic-24x24.svg";
  } else {

    isMuted = true;
    button.className = "user-icon muted";
    icon.src = "../assets/icons/ui-mic-off-red-24x24.svg";
  }
}


function toggledeafen() {
  var button = document.getElementById("deafen-button");
  var icon = document.getElementById("deafen-icon");

  if (isDeafened == true) {

    isDeafened = false;
    button.className = "user-icon";
    icon.src = "../assets/icons/ui-headphones-24x24.svg";
  } else {

    isDeafened = true;
    button.className = "user-icon deafened";
    icon.src = "../assets/icons/ui-deafen-off-red-24x24.svg";
  }
}


showMessages();