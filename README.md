# Discord Clone

Final Project for **Web Design and Development** (Computer Engineering, 2nd Year)

This is a copy of the **Discord** website. We made it with HTML, CSS, and JavaScript only.
It has no backend and no database. All the fake data (users, channels, messages) is
kept in JavaScript arrays and objects, and saved in the browser with `localStorage`.

## Team Members

| Name | Part in the video |
| ---- | ----------------- |
| [De Ala, Jarren T.] | Team introduction |
| [Pamorada, Denisse Kashan R.] | Tour of the pages |
| [Biding, Sebastian Mike M.] | JavaScript demo |
| [Severino, Daryl Ashley Nicole P.] | Code walkthrough |
| [Espino, Aaron Jhon L.] | Challenges and conclusion |

## How to Open the Project

1. Download the project folder.
2. Open the file `pages/index.html` in your browser (Chrome, Edge, or Firefox).
3. You do not need to install anything.

## Test Accounts (for the login page)

| Email or phone number | Password |
| ----------------- | -------- |
| admin@discord.com | admin123 |
| froggy@gmail.com | test |

## Pages

| Page | File | What it shows |
| ---- | ---- | ------------- |
| Landing page | `pages/index.html` | The Discord home page with pictures, videos, and a footer |
| Login | `pages/login.html` | Login form |
| Register | `pages/register.html` | Sign-up form |
| Direct Messages | `pages/home.html` and `pages/contact.html` | Friends list and private chats |
| Server (Codechum) | `pages/codechum.html` | A server with channels, chat, and members |
| Terms of Service | `pages/terms.html` | Terms page |
| Privacy Policy | `pages/privacy.html` | Privacy page |

All pages use the same colors, fonts, and links so they look like one website.

## What You Can Do (JavaScript Features)

- **Log in:** the site checks your name and password against a list of users.
- **Show or hide the password** with a button.
- **Send messages** in the server and in direct messages.
- **Get fake replies:** after you send a message, a reply comes back by itself.
- **Change channels** inside the Codechum server.
- **Add emoji reactions** to messages, and remove them.
- **Search** your direct messages and the messages in a chat.
- **Keep your data:** messages stay after you refresh the page.
- **Landing page extras:** a menu for phones, a "back to top" button, and a download
  button that changes for each device.

## Folder Structure

```
README.md         This file
pages/            All pages (.html), including index.html (the main page)
css/              Style files (.css)
js/               JavaScript files (.js)
assets/
  fonts/          The Discord font
  icons/          Small icons (.svg)
  images/         Profile pictures and logos
  landing/        Pictures and videos for the landing page
```

## What We Used

- **HTML5:** tags like `header`, `nav`, `main`, `section`, `aside`, and `footer`
- **CSS:** Flexbox, Grid, and `@media` rules so the pages fit smaller screens
- **JavaScript:** arrays, objects, functions, loops, if-statements, and `localStorage`

## Problems We Had

- **The layout was hard.** Discord shows many parts on one screen: the server list,
  the channel list, the chat, and the member list. It took many tries to place them
  correctly.
- **Keeping all pages the same.** We had to use the same style and links on every page.
- **No backend.** We had to pretend to have real data, so we used arrays, objects,
  and `localStorage`.
- **Broken links.** Some links had the wrong folder path, so we checked every link and
  fixed them.
- **Working together.** Each person made a part, and then we had to join everything
  without breaking the other parts.

## What We Learned

- How to build a website with many pages.
- How to use Flexbox and Grid to make big layouts.
- How to use JavaScript to make a page react to clicks and typing.
- How to keep files neat in folders.
- How to work as a team and fix problems together.

## Note

This project is only for school. Discord and its logos belong to Discord Inc.