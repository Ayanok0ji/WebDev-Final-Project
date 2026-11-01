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

// load saved messages
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
var replyToken = 0;
var activeReactionIndex = -1;
var toastTimer = null;

var POPULAR_EMOJIS = ["👍", "❤️", "😂", "😮", "🎉", "🔥", "👀", "💀", "✨", "🚀", "💯", "👏"];
var COMPOSER_EMOJIS = ["😀", "😂", "😍", "🥺", "😎", "😭", "👍", "👋", "🔥", "❤️", "🎉", "👀", "😴", "🤔", "😡", "🙏", "💯", "✨"];

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

      // show replied message with curved spine
      if (list[i].replyTo) {
        html += '<div class="cc-reply">';
        html += '<span class="cc-reply-author">@' + safeText(list[i].replyTo.author) + '</span>';
        html += '<span class="cc-reply-text">' + safeText(list[i].replyTo.text) + '</span>';
        html += '</div>';
      }

      html += '<div class="cc-msg-main">';

      html += '<img class="cc-avatar" src="' + list[i].avatar + '" onerror="this.onerror=null; this.src=\'../assets/images/profile.jpg\'" alt="' + safeText(list[i].author) + '">';

      html += '<div class="cc-content">';

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

        html += reaction.emoji + ' <span class="cc-reaction-count">' + reaction.count + '</span>';
        html += '</button>';
      }

      if (permissions[currentChannel].react) {
        html += '<button type="button" class="cc-add-reaction" title="Add Reaction" onclick="openReactionPicker(event, ' + i + ')">+</button>';
      }

      html += '</div>'; // cc-reactions
      html += '</div>'; // cc-content
      html += '</div>'; // cc-msg-main

      // message hover actions
      html += '<div class="cc-actions">';
      if (permissions[currentChannel].react) {
        html += '<button type="button" class="cc-action-btn" title="Add Reaction" onclick="openReactionPicker(event, ' + i + ')">';
        html += '<img src="../assets/icons/ui-emoji-smile-24x24.svg" alt="React">';
        html += '</button>';
      }
      html += '<button type="button" class="cc-action-btn" title="Reply" onclick="replymessage(' + i + ')">';
      html += '<img src="../assets/icons/ui-reply-arrow-24x24.svg" alt="Reply">';
      html += '</button>';
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
    scheduleReply(text, channelNumber);
  }

  return false;
}

// automatic reply system like home and contact
function scheduleReply(userText, channelNumber) {
  var token = ++replyToken;
  var targetChannel = channelNumber;

  var members = [
    { author: "Kitty", avatar: "../assets/images/cat.jpg" },
    { author: "Chaa", avatar: "../assets/images/smb.png" },
    { author: "Dynosure", avatar: "../assets/images/dyno.webp" },
    { author: "Jarren", avatar: "../assets/images/jd.png" },
    { author: "Mr. Bean", avatar: "../assets/images/mrb.jpg" }
  ];

  var member = members[Math.floor(Math.random() * members.length)];

  var replies = [
    "haha nice!",
    "I agree with that!",
    "Wait, let me check that.",
    "Good question!",
    "Check W3Schools or MDN, it helps a lot!",
    "Working on that right now.",
    "Thanks for sharing!",
    "Can you show your code?",
    "That looks good to me!",
    "lol true",
    "👀"
  ];

  var replyText = replies[Math.floor(Math.random() * replies.length)];

  setTimeout(function () {
    if (token != replyToken || currentChannel != targetChannel) {
      return;
    }

    // show typing indicator
    var chatBody = document.getElementById("chat-body");
    var oldTyping = document.getElementById("typing-indicator");
    if (oldTyping) {
      oldTyping.remove();
    }

    var typing = document.createElement("div");
    typing.className = "typing";
    typing.id = "typing-indicator";
    typing.textContent = member.author + " is typing...";
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(function () {
      if (token != replyToken) {
        var el = document.getElementById("typing-indicator");
        if (el) el.remove();
        return;
      }

      var el = document.getElementById("typing-indicator");
      if (el) el.remove();

      var newMsg = {
        author: member.author,
        avatar: member.avatar,
        text: replyText,
        time: gettime(),
        reactions: []
      };

      // quote user sometimes
      if (Math.random() > 0.4) {
        newMsg.replyTo = {
          author: currentUser,
          text: userText
        };
      }

      channels[targetChannel].messages.push(newMsg);
      savemessages();

      if (currentChannel == targetChannel) {
        showmessages();
        var chat = document.getElementById("chat-body");
        chat.scrollTop = chat.scrollHeight;
      }
    }, 1200 + Math.random() * 800);
  }, 500);
}

// switching channel system
function switchchannel(index) {
  // check view permission
  if (permissions[index].view == false) {
    return;
  }

  currentChannel = index;
  replyToken++;

  // cancel old typing indicator
  var typing = document.getElementById("typing-indicator");
  if (typing) {
    typing.remove();
  }

  var channelName = channels[index].name;

  document.getElementById("channel-name").innerHTML = channelName;
  document.getElementById("welcome-title").innerHTML = "Welcome to #" + channelName + "!";
  document.getElementById("welcome-text").innerHTML = "This is the start of the #" + channelName + " channel.";
  document.getElementById("message-input").placeholder = "Message #" + channelName;

  document.getElementById("search-input").value = "";

  cancelreply();
  closeReactionPicker();

  var composerPicker = document.getElementById("composer-emoji-picker");
  if (composerPicker) {
    composerPicker.classList.remove("open");
  }

  // close sidebar on mobile screen
  var app = document.querySelector(".app");
  if (app) {
    app.classList.remove("show-sidebar");
  }

  for (var i = 0; i < channels.length; i++) {
    var ch = document.getElementById("channel-" + i);
    if (ch) ch.className = "channel";
  }

  var activeCh = document.getElementById("channel-" + index);
  if (activeCh) activeCh.className = "channel active";

  showmessages();
  updatechatpermission();
  updatepermissionstatus();

  var chat = document.getElementById("chat-body");
  if (chat) {
    chat.scrollTop = chat.scrollHeight;
  }
}

// hide channels without view permission
function updatechannels() {
  for (var i = 0; i < channels.length; i++) {
    var ch = document.getElementById("channel-" + i);
    if (!ch) continue;
    if (permissions[i].view == true) {
      ch.style.display = "flex";
    } else {
      ch.style.display = "none";
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

// open reaction picker popover
function openReactionPicker(event, index) {
  event.stopPropagation();

  if (permissions[currentChannel].react == false) {
    return;
  }

  activeReactionIndex = index;

  var picker = document.getElementById("reaction-picker");
  if (!picker) return;

  var rect = event.currentTarget.getBoundingClientRect();
  var top = rect.top - 58;
  if (top < 10) {
    top = rect.bottom + 6;
  }

  var left = rect.left - 60;
  if (left < 10) {
    left = 10;
  }
  if (left + 230 > window.innerWidth) {
    left = window.innerWidth - 240;
  }

  picker.style.top = top + "px";
  picker.style.left = left + "px";
  picker.classList.add("open");
}

// close reaction picker
function closeReactionPicker() {
  activeReactionIndex = -1;
  var picker = document.getElementById("reaction-picker");
  if (picker) {
    picker.classList.remove("open");
  }
}

// choose reaction emoji
function chooseReaction(emoji) {
  if (activeReactionIndex < 0) {
    return;
  }

  var message = channels[currentChannel].messages[activeReactionIndex];
  if (!message.reactions) {
    message.reactions = [];
  }

  var found = false;

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
  closeReactionPicker();
}

// toggle existing reaction
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

  var preview = document.getElementById("reply-preview");
  preview.innerHTML =
    '<div class="reply-preview-content">' +
    '<span>Replying to <b>@' + safeText(message.author) + '</b></span>' +
    '<button type="button" class="reply-cancel-btn" onclick="cancelreply()" title="Cancel reply">×</button>' +
    '</div>';

  var row = document.getElementById("message-row");
  if (row) row.classList.add("with-reply");

  document.getElementById("message-input").focus();
}

// cancel reply
function cancelreply() {
  replyTo = null;
  document.getElementById("reply-preview").innerHTML = "";

  var row = document.getElementById("message-row");
  if (row) row.classList.remove("with-reply");
}

// toggle composer emoji popover
function toggleComposerEmoji(event) {
  event.stopPropagation();
  var pop = document.getElementById("composer-emoji-picker");
  if (!pop) return;

  var btn = event.currentTarget;
  var rect = btn.getBoundingClientRect();
  pop.style.bottom = (window.innerHeight - rect.top + 8) + "px";
  pop.style.right = Math.max(8, window.innerWidth - rect.right) + "px";
  pop.classList.toggle("open");
}

// insert emoji to message input
function insertComposerEmoji(emoji) {
  var input = document.getElementById("message-input");
  if (input.disabled) return;
  input.value += emoji;
  input.focus();
}

// trigger file upload
function triggerFileInput() {
  if (permissions[currentChannel].send == false) return;
  document.getElementById("file-input").click();
}

// handle file upload
function handleFileUpload() {
  var fileInput = document.getElementById("file-input");
  if (fileInput.files && fileInput.files[0]) {
    var fileName = fileInput.files[0].name;
    var newMessage = {
      author: currentUser,
      avatar: "../assets/images/profile.jpg",
      text: "📎 " + fileName,
      time: gettime(),
      reactions: [],
      replyTo: replyTo
    };

    channels[currentChannel].messages.push(newMessage);
    cancelreply();
    showmessages();
    savemessages();

    var chat = document.getElementById("chat-body");
    chat.scrollTop = chat.scrollHeight;

    if (currentChannel >= 3) {
      scheduleReply("uploaded " + fileName, currentChannel);
    }
  }
  fileInput.value = "";
}

// toast notification
function toast(msg) {
  var t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    t.classList.remove("show");
  }, 2200);
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

// setup emoji pickers
function setupEmojiPickers() {
  var reactPicker = document.getElementById("reaction-picker");
  if (reactPicker && reactPicker.innerHTML === "") {
    for (var i = 0; i < POPULAR_EMOJIS.length; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = POPULAR_EMOJIS[i];
      btn.onclick = (function (em) {
        return function () {
          chooseReaction(em);
        };
      })(POPULAR_EMOJIS[i]);
      reactPicker.appendChild(btn);
    }
  }

  var composerPicker = document.getElementById("composer-emoji-picker");
  if (composerPicker && composerPicker.innerHTML === "") {
    for (var j = 0; j < COMPOSER_EMOJIS.length; j++) {
      var cBtn = document.createElement("button");
      cBtn.type = "button";
      cBtn.textContent = COMPOSER_EMOJIS[j];
      cBtn.onclick = (function (em) {
        return function () {
          insertComposerEmoji(em);
        };
      })(COMPOSER_EMOJIS[j]);
      composerPicker.appendChild(cBtn);
    }
  }
}

// close popups when clicking outside
document.addEventListener("click", function (e) {
  var reactPicker = document.getElementById("reaction-picker");
  if (reactPicker && reactPicker.classList.contains("open")) {
    if (!reactPicker.contains(e.target) && !e.target.closest(".cc-action-btn") && !e.target.closest(".cc-add-reaction")) {
      closeReactionPicker();
    }
  }

  var composerPicker = document.getElementById("composer-emoji-picker");
  if (composerPicker && composerPicker.classList.contains("open")) {
    if (!composerPicker.contains(e.target) && !e.target.closest(".composer-emoji-btn")) {
      composerPicker.classList.remove("open");
    }
  }
});

// cancel reply and close popups on escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (replyTo != null) {
      cancelreply();
    }
    closeReactionPicker();
    var composerPicker = document.getElementById("composer-emoji-picker");
    if (composerPicker) {
      composerPicker.classList.remove("open");
    }
  }
});

// start
setupEmojiPickers();
updatechannels();
showmessages();
updatechatpermission();
