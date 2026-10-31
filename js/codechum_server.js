// Channel lists
var channels = [
  {
    name: "announcement",
    messages: [
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Welcome to the Codechum server!", time: "08:00", likes: 3, liked: false }
    ]
  },
  {
    name: "rules-and-info",
    messages: [
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Rule 1: Be respectful to everyone.", time: "08:10", likes: 5, liked: false },
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Rule 2: No spamming.", time: "08:11", likes: 2, liked: false }
    ]
  },
  {
    name: "roles",
    messages: [
      { author: "Admin", avatar: "../assets/images/pf2.png", text: "Ask a moderator for a new role.", time: "08:20", likes: 0, liked: false }
    ]
  },
  {
    name: "welcome",
    messages: [
      { author: "Eunice", avatar: "../assets/images/pf.jpg", text: "Hi everyone! I am new here.", time: "09:15", likes: 1, liked: false },
      { author: "Mr. Bean", avatar: "../assets/images/mrb.jpg", text: "Welcome Eunice!", time: "09:16", likes: 4, liked: false }
    ]
  },
  {
    name: "general",
    messages: [
      { author: "Kitty", avatar: "../assets/images/cat.jpg", text: "Good morning everyone!", time: "10:00", likes: 2, liked: false }
    ]
  },
  {
    name: "coding-help",
    messages: [
      { author: "Chaa", avatar: "../assets/images/smb.png", text: "How do I use a for loop?", time: "11:30", likes: 0, liked: false },
      { author: "Dynosure", avatar: "../assets/images/dyno.webp", text: "Check W3Schools, it is very helpful!", time: "11:32", likes: 6, liked: false }
    ]
  },
  {
    name: "language-discussion",
    messages: [
      { author: "Jarren", avatar: "../assets/images/jd.png", text: "Python or Java for beginners?", time: "13:00", likes: 1, liked: false }
    ]
  },
  {
    name: "bug-reports",
    messages: [
      { author: "Chaa", avatar: "../assets/images/smb.png", text: "The submit button freezes on my phone.", time: "14:45", likes: 0, liked: false }
    ]
  }
];

var currentChannel = 1;
var isMuted = true;
var isDeafened = true;

// show message on every channels
function showmessages() {
  var list = channels[currentChannel].messages;
  var search = document.getElementById("search-input").value.toLowerCase();
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var allText = (list[i].author + " " + list[i].text).toLowerCase();

    if (allText.indexOf(search) != -1) {
      html += '<article class="cc-msg">';
      html += '<img class="cc-avatar" src="' + list[i].avatar + '" onerror="this.onerror=null; this.src=\'../assets/images/profile.jpg\'" alt="' + list[i].author + '">';
      html += '<div>';
      html += '<div class="cc-head">';
      html += '<span class="cc-author">' + list[i].author + '</span>';
      html += '<span class="cc-time">' + list[i].time + '</span>';
      html += '</div>';
      html += '<p class="cc-text">' + list[i].text + '</p>';
      html += '<button type="button" class="cc-like ' + (list[i].liked ? "liked" : "") + '" onclick="likemessage(' + i + ')">&#128077; ' + list[i].likes + '</button>';
      html += '</div>';
      html += '</article>';
    }
  }

  if (html == "") {
    html = '<p class="cc-text">No messages found.</p>';
  }

  document.getElementById("messages").innerHTML = html;
}

// fallback real time
function gettime() {
  var now = new Date();
  var minutes = now.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return now.getHours() + ":" + minutes;
}

// send message function
function sendmessage(event) {
  event.preventDefault();

  var input = document.getElementById("message-input");
  var text = input.value.trim();

  if (text == "") {
    return false;
  }

  channels[currentChannel].messages.push({
    author: "Froggy",
    avatar: "../assets/images/profile.jpg",
    text: text,
    time: gettime(),
    likes: 0,
    liked: false
  });

  input.value = "";
  document.getElementById("search-input").value = "";

  showmessages();

  var chat = document.getElementById("chat-body");
  chat.scrollTop = chat.scrollHeight;

  return false;
}

// switch channel
function switchchannel(index) {
  currentChannel = index;
  var channelName = channels[index].name;

  document.getElementById("channel-name").innerHTML = channelName;
  document.getElementById("welcome-title").innerHTML = "Welcome to #" + channelName + "!";
  document.getElementById("welcome-text").innerHTML = "This is the start of the #" + channelName + " channel.";
  document.getElementById("message-input").placeholder = "Message #" + channelName;

  document.getElementById("search-input").value = "";

  for (var i = 0; i < channels.length; i++) {
    document.getElementById("channel-" + i).className = "channel";
  }

  document.getElementById("channel-" + index).className = "channel active";

  showmessages();
}

// react system
function likemessage(index) {
  var message = channels[currentChannel].messages[index];

  if (message.liked == true) {
    message.likes--;
    message.liked = false;
  } else {
    message.likes++;
    message.liked = true;
  }

  showmessages();
}

// toggle state of mute button
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

// toggle state of deafen button
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

// send message from variable channels
showmessages();
