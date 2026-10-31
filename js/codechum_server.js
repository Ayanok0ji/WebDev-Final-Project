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

// load save messages
var savedMessages = localStorage.getItem("codechumMessages");

if (savedMessages) {
  var savedData = JSON.parse(savedMessages);

  for (var i = 0; i < channels.length; i++) {
    if (savedData[i]) {
      channels[i].messages = savedData[i];
    }
  }
}

// convert old likes to reactions
for (var i = 0; i < channels.length; i++) {
  for (var j = 0; j < channels[i].messages.length; j++) {
    var message = channels[i].messages[j];

    if (!message.reactions) {
      message.reactions = [];

      if (message.likes > 0) {
        message.reactions.push({
          emoji: "👍",
          count: message.likes,
          reacted: message.liked
        });
      }
    }
  }
}

// default channel permissions
var permissions = [];

for (var i = 0; i < channels.length; i++) {
  permissions.push({
    view: true,
    history: true,
    send: i > 2,
    react: true
  });
}

// load saved permissions
var savedPermissions = localStorage.getItem("codechumPermissions");

if (savedPermissions) {
  permissions = JSON.parse(savedPermissions);
}

var currentChannel = 1;
var isMuted = true;
var isDeafened = true;
var currentUser = "Froggy";
var replyTo = null;

// save messages
function savemessages() {
  var data = [];

  for (var i = 0; i < channels.length; i++) {
    data.push(channels[i].messages);
  }

  localStorage.setItem("codechumMessages", JSON.stringify(data));
}

// save permissions
function savepermissions() {
  localStorage.setItem("codechumPermissions", JSON.stringify(permissions));
}

// make message text safe
function safeText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// show messages
function showmessages() {
  var list = channels[currentChannel].messages;
  var search = document.getElementById("search-input").value.toLowerCase();
  var html = "";

  // check message history permission
  if (permissions[currentChannel].history == false) {
    document.getElementById("messages").innerHTML =
      '<p class="cc-text">You do not have permission to view message history.</p>';
    return;
  }

  for (var i = 0; i < list.length; i++) {
    var allText = (list[i].author + " " + list[i].text).toLowerCase();

    if (allText.indexOf(search) != -1) {
      html += '<article class="cc-msg">';

      html += '<img class="cc-avatar" src="' + list[i].avatar + '" onerror="this.onerror=null; this.src=\'../assets/images/profile.jpg\'" alt="' + safeText(list[i].author) + '">';

      html += '<div class="cc-content">';

      // show replied message
      if (list[i].replyTo) {
        html += '<div class="cc-reply">';
        html += '<span>' + safeText(list[i].replyTo.author) + '</span>';
        html += '<p>' + safeText(list[i].replyTo.text) + '</p>';
        html += '</div>';
      }

      html += '<div class="cc-head">';
      html += '<span class="cc-author">' + safeText(list[i].author) + '</span>';
      html += '<span class="cc-time">' + list[i].time + '</span>';
      html += '</div>';

      html += '<p class="cc-text">' + safeText(list[i].text) + '</p>';

      // show reactions
      if (!list[i].reactions) {
        list[i].reactions = [];
      }

      html += '<div class="cc-reactions">';

      for (var r = 0; r < list[i].reactions.length; r++) {
        var reaction = list[i].reactions[r];

        html += '<button type="button" class="cc-reaction ' +
          (reaction.reacted ? "selected" : "") +
          '" onclick="toggleReaction(' + i + ',' + r + ')" ' +
          (permissions[currentChannel].react ? "" : "disabled") + '>';

        html += reaction.emoji + ' ' + reaction.count;
        html += '</button>';
      }

      if (permissions[currentChannel].react) {
        html += '<button type="button" class="cc-add-reaction" onclick="addReaction(' + i + ')">+</button>';
      }

      html += '</div>';

      html += '<button type="button" class="cc-reply-button" onclick="replymessage(' + i + ')">Reply</button>';

      html += '</div>';
      html += '</article>';
    }
  }

  if (html == "") {
    html = '<p class="cc-text">No messages found.</p>';
  }

  document.getElementById("messages").innerHTML = html;
}

// update message bar based on permission
function updatechatpermission() {
  var messageBar = document.getElementById("message-row");
  var notice = document.getElementById("no-permission");

  if (permissions[currentChannel].send == true) {
    messageBar.style.display = "flex";
    notice.style.display = "none";
  } else {
    messageBar.style.display = "none";
    notice.style.display = "block";
  }
}

// fallback to get current time
function gettime() {
  var now = new Date();
  var minutes = now.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return now.getHours() + ":" + minutes;
}

// send message system
function sendmessage(event) {
  event.preventDefault();

  // check send permission
  if (permissions[currentChannel].send == false) {
    return false;
  }

  var input = document.getElementById("message-input");
  var text = input.value.trim();

  if (text == "") {
    return false;
  }

  var newMessage = {
    author: currentUser,
    avatar: "../assets/images/profile.jpg",
    text: text,
    time: gettime(),
    reactions: [],
    replyTo: replyTo
  };

  channels[currentChannel].messages.push(newMessage);

  var channelNumber = currentChannel;

  input.value = "";
  document.getElementById("search-input").value = "";

  cancelreply();
  showmessages();
  savemessages();

  var chat = document.getElementById("chat-body");
  chat.scrollTop = chat.scrollHeight;

  // automatic reply in public channels
  if (channelNumber >= 3) {
    automaticreply(text, channelNumber);
  }

  return false;
}

// automatic reply system
function automaticreply(text, channelNumber) {
  var replies = [
    {
      author: "Kitty",
      avatar: "../assets/images/cat.jpg",
      text: "That's interesting!"
    },
    {
      author: "Chaa",
      avatar: "../assets/images/smb.png",
      text: "I agree with you!"
    },
    {
      author: "Dynosure",
      avatar: "../assets/images/dyno.webp",
      text: "Thanks for sharing!"
    },
    {
      author: "Jarren",
      avatar: "../assets/images/jd.png",
      text: "Can you explain more?"
    }
  ];

  var random = Math.floor(Math.random() * replies.length);
  var reply = replies[random];

  setTimeout(function () {
    channels[channelNumber].messages.push({
      author: reply.author,
      avatar: reply.avatar,
      text: reply.text,
      time: gettime(),
      reactions: [],
      replyTo: {
        author: currentUser,
        text: text
      }
    });

    savemessages();

    if (currentChannel == channelNumber) {
      showmessages();

      var chat = document.getElementById("chat-body");
      chat.scrollTop = chat.scrollHeight;
    }
  }, 2000);
}

// switching channel system
function switchchannel(index) {
  // check view permission
  if (permissions[index].view == false) {
    return;
  }

  currentChannel = index;
  var channelName = channels[index].name;

  document.getElementById("channel-name").innerHTML = channelName;
  document.getElementById("welcome-title").innerHTML = "Welcome to #" + channelName + "!";
  document.getElementById("welcome-text").innerHTML = "This is the start of the #" + channelName + " channel.";
  document.getElementById("message-input").placeholder = "Message #" + channelName;

  document.getElementById("search-input").value = "";

  cancelreply();

  for (var i = 0; i < channels.length; i++) {
    document.getElementById("channel-" + i).className = "channel";
  }

  document.getElementById("channel-" + index).className = "channel active";

  showmessages();
  updatechatpermission();
  updatepermissionstatus();
}

// hide channels without view permission
function updatechannels() {
  for (var i = 0; i < channels.length; i++) {
    if (permissions[i].view == true) {
      document.getElementById("channel-" + i).style.display = "flex";
    } else {
      document.getElementById("channel-" + i).style.display = "none";
    }
  }

  // move to another channel if current one is hidden
  if (permissions[currentChannel].view == false) {
    for (var i = 0; i < channels.length; i++) {
      if (permissions[i].view == true) {
        switchchannel(i);
        return;
      }
    }

    document.getElementById("channel-name").innerHTML = "No available channels";
    document.getElementById("messages").innerHTML =
      '<p class="cc-text">You do not have permission to view any channels.</p>';

    document.getElementById("message-row").style.display = "none";
    document.getElementById("no-permission").style.display = "none";
  }
}

// add reaction
function addReaction(index) {
  if (permissions[currentChannel].react == false) {
    return;
  }

  var emoji = prompt("Choose an emoji: 👍 ❤️ 😂 😮 🎉 🔥");

  if (emoji == null || emoji.trim() == "") {
    return;
  }

  emoji = emoji.trim();

  var message = channels[currentChannel].messages[index];
  var found = false;

  if (!message.reactions) {
    message.reactions = [];
  }

  for (var i = 0; i < message.reactions.length; i++) {
    if (message.reactions[i].emoji == emoji) {
      if (message.reactions[i].reacted == true) {
        message.reactions[i].count--;
        message.reactions[i].reacted = false;
      } else {
        message.reactions[i].count++;
        message.reactions[i].reacted = true;
      }

      if (message.reactions[i].count <= 0) {
        message.reactions.splice(i, 1);
      }

      found = true;
      break;
    }
  }

  if (found == false) {
    message.reactions.push({
      emoji: emoji,
      count: 1,
      reacted: true
    });
  }

  savemessages();
  showmessages();
}

// remove or add reaction
function toggleReaction(messageIndex, reactionIndex) {
  if (permissions[currentChannel].react == false) {
    return;
  }

  var reaction = channels[currentChannel].messages[messageIndex].reactions[reactionIndex];

  if (reaction.reacted == true) {
    reaction.count--;
    reaction.reacted = false;
  } else {
    reaction.count++;
    reaction.reacted = true;
  }

  if (reaction.count <= 0) {
    channels[currentChannel].messages[messageIndex].reactions.splice(reactionIndex, 1);
  }

  savemessages();
  showmessages();
}

// reply to message
function replymessage(index) {
  var message = channels[currentChannel].messages[index];

  replyTo = {
    author: message.author,
    text: message.text
  };

  document.getElementById("reply-preview").innerHTML =
    '<div class="reply-preview-content">' +
    '<span>Replying to <b>' + safeText(message.author) + '</b></span>' +
    '<p>' + safeText(message.text) + '</p>' +
    '<button type="button" onclick="cancelreply()">×</button>' +
    '</div>';

  document.getElementById("message-input").focus();
}

// cancel reply
function cancelreply() {
  replyTo = null;
  document.getElementById("reply-preview").innerHTML = "";
}

// open channel permissions
function openpermissions() {
  var panel = document.getElementById("permission-panel");

  if (panel.style.display == "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
    updatepermissionstatus();
  }
}

// show current channel permissions
function updatepermissionstatus() {
  document.getElementById("permission-view").checked = permissions[currentChannel].view;
  document.getElementById("permission-history").checked = permissions[currentChannel].history;
  document.getElementById("permission-send").checked = permissions[currentChannel].send;
  document.getElementById("permission-react").checked = permissions[currentChannel].react;
}

// save changed permissions
function updatepermissions() {
  permissions[currentChannel].view = document.getElementById("permission-view").checked;
  permissions[currentChannel].history = document.getElementById("permission-history").checked;
  permissions[currentChannel].send = document.getElementById("permission-send").checked;
  permissions[currentChannel].react = document.getElementById("permission-react").checked;

  savepermissions();
  updatechannels();
  updatechatpermission();
  showmessages();
}

// toggle state for mute
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

// toggle state for deafen
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

// fire show messages to bring the messages in the codechum server page
updatechannels();
showmessages();
updatechatpermission();