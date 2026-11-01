(function () {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    /* ---------- storage (safe) ---------- */
    const STORE_KEY = 'dm-state-v1';
    const store = {
        read() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } },
        write(v) { try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } }
    };
    const state = store.read();
    const conv = name => (state[name] = state[name] || { messages: [], friend: false, blocked: false });

    /* ---------- elements ---------- */
    const app = $('.app');
    const chatBody = $('.chat-body');
    const chatInput = $('.chat-input-row input');
    const chatForm = $('.chat-input-row');
    const dmSearch = $('.search-bar input');
    const headerSearch = $('.header-search input');
    const profilePanel = $('.profile-panel');
    const me = {
        name: ($('.user-panel .name') || {}).textContent || 'You',
        avatar: $('.user-panel .avatar') ? $('.user-panel .avatar').getAttribute('src') : ''
    };

    /* ---------- injected styles ---------- */
    (function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toast { position: fixed; left: 50%; bottom: 80px; transform: translate(-50%, 16px);
                background: #111214; color: #f2f3f5; padding: 10px 18px; border-radius: 8px;
                font-size: 14px; z-index: 300; box-shadow: 0 8px 24px rgba(0,0,0,.5);
                opacity: 0; pointer-events: none; transition: opacity .2s ease, transform .2s ease; }
            .toast.show { opacity: 1; transform: translate(-50%, 0); }
            .emoji-pop { position: fixed; z-index: 250; background: #2b2d31; border: 1px solid #1e1f22;
                border-radius: 8px; padding: 8px; display: none; grid-template-columns: repeat(6, 1fr); gap: 2px;
                box-shadow: 0 8px 24px rgba(0,0,0,.5); }
            .emoji-pop.open { display: grid; }
            .emoji-pop button { background: none; border: none; font-size: 22px; padding: 4px; border-radius: 4px; cursor: pointer; }
            .emoji-pop button:hover { background: #35373c; }
            .typing { color: #949ba4; font-size: 13px; font-style: italic; margin: 0 0 16px 56px; }
            .no-results { color: #949ba4; font-size: 13px; text-align: center; padding: 16px 8px; }
            .voice-controls span.on, .voice-btn.on { background: #404249; color: #fff; border-radius: 4px; }
            .nav-item.selected { background: #404249; color: #fff; }
            .profile-sub .tag { font-size: 10px; font-weight: 700; color: #b5bac1; background: #1e1f22;
                padding: 1px 5px; border-radius: 4px; margin-left: 4px; vertical-align: middle; }
            .profile-panel.panel-hidden { display: none !important; }
            .chat-input-row input:disabled { cursor: not-allowed; }
            .btn:disabled { opacity: .6; cursor: default; }
            .chat-msg.hidden-by-search { display: none; }
            a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid #a5b0ff; outline-offset: 2px; }
        `;
        document.head.appendChild(style);
    })();

    /* ---------- toast ---------- */
    let toastEl, toastTimer;
    function toast(msg) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
    }

    /* ---------- helpers ---------- */
    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }
    function hash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
        return h;
    }
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timeNow = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const scrollToBottom = () => { chatBody.scrollTop = chatBody.scrollHeight; };

    /* ---------- read a DM list item ---------- */
    function readDm(item) {
        const nameEl = $('.name', item);
        const textNode = Array.from(nameEl.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        const tagEl = $('.tag', item);
        const subEl = $('.subtext', item);
        const statusEl = $('.status', item);
        return {
            item,
            name: (textNode ? textNode.textContent : nameEl.textContent).trim(),
            tag: tagEl ? tagEl.textContent.trim() : '',
            sub: subEl ? subEl.textContent.trim() : '',
            avatar: $('.avatar', item).getAttribute('src'),
            status: ['online', 'idle', 'dnd', 'offline'].find(s => statusEl.classList.contains(s)) || 'offline'
        };
    }

    /* Capture the page's original (hand-written) profile details for the first DM */
    const initialItem = $('.dm-item.active') || $('.dm-item');
    const initialData = readDm(initialItem);
    const initialExtras = {
        username: ($('.big-username') || {}).textContent || '',
        mutual: ($('.mutual-row span') || {}).textContent || '',
        since: ($('.profile-info p:last-of-type') || {}).textContent || '',
        bio: ($('.profile-sub') ? $('.profile-sub').childNodes[0].textContent.trim() : ''),
        bioTag: ($('.profile-sub .tag') || {}).textContent || '',
        mascot: $('.mascot') ? $('.mascot').getAttribute('src') : ''
    };

    function extrasFor(data) {
        if (data.name === initialData.name) {
            return {
                username: initialExtras.username,
                mutual: initialExtras.mutual,
                since: initialExtras.since,
                bio: initialExtras.bio,
                bioTag: initialExtras.bioTag
            };
        }
        const h = hash(data.name);
        return {
            username: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'user',
            mutual: `${1 + (h % 9)} Mutual Friends \u00b7 ${h % 4} Mutual Servers`,
            since: `${MONTHS[h % 12]} ${1 + (h % 28)}, ${2022 + ((h >> 3) % 4)}`,
            bio: data.sub,
            bioTag: data.tag
        };
    }

    /* ---------- current conversation ---------- */
    let current = null;      // readDm() result
    let replyToken = 0;

    function openDm(data, opts = {}) {
        current = data;
        replyToken++;

        // sidebar highlight
        $$('.dm-item').forEach(i => i.classList.toggle('active', i === data.item));
        $$('.nav-item').forEach(n => n.classList.remove('selected'));

        // header
        $('.header-avatar').src = data.avatar;
        $('.chat-name').textContent = data.name;

        // profile panel
        const x = extrasFor(data);
        $('.profile-avatar').src = data.avatar;
        const big = $('.status.big');
        if (big) big.className = `status ${data.status} big`;
        $('.profile-info h2').textContent = data.name;
        const sub = $('.profile-sub');
        if (sub) {
            sub.textContent = '';
            if (x.bio) sub.append(x.bio);
            if (x.bioTag) { sub.append(' '); sub.append(el('span', 'tag', x.bioTag)); }
        }
        const ml = $('.mutual-line');
        if (ml) { const img = $('img', ml); ml.textContent = ' ' + x.mutual; if (img) ml.prepend(img); }
        const ps = $$('.profile-info p');
        if (ps.length) ps[ps.length - 1].textContent = x.since;

        renderChat();
        applyBlockState();
        if (!opts.keepSidebar) app.classList.remove('show-sidebar');
        if (!opts.noFocus && !chatInput.disabled && window.innerWidth > 768) chatInput.focus();
    }

    /* ---------- render chat history ---------- */
    function renderChat() {
        const c = conv(current.name);
        const x = extrasFor(current);
        chatBody.textContent = '';

        chatBody.append(
            Object.assign(el('img', 'big-avatar'), { src: current.avatar, alt: '' }),
            el('h1', 'big-name', current.name),
            el('p', 'big-username', x.username)
        );

        const start = el('p', 'dm-start');
        start.append('This is the beginning of your direct message history with ');
        start.append(el('strong', null, current.name));
        start.append('.');
        chatBody.append(start);

        const row = el('div', 'mutual-row');
        row.append(el('span', null, x.mutual));
        const add = el('button', 'btn primary', c.friend ? 'Friend Request Sent' : 'Add Friend');
        add.type = 'button';
        add.dataset.action = 'add-friend';
        add.disabled = c.friend;
        const block = el('button', 'btn', c.blocked ? 'Unblock' : 'Block');
        block.type = 'button';
        block.dataset.action = 'block';
        row.append(add, block);
        chatBody.append(row);

        if (!c.messages.length && !c.blocked) {
            if (initialExtras.mascot) {
                const m = el('img', 'mascot');
                m.src = initialExtras.mascot;
                m.alt = 'mascot';
                chatBody.append(m);
            }
            const wave = el('button', 'wave-btn', `Wave to ${current.name}`);
            wave.type = 'button';
            wave.dataset.action = 'wave';
            chatBody.append(wave);
        }

        c.messages.forEach(appendMessage);
        scrollToBottom();
        if (headerSearch && headerSearch.value) filterMessages(headerSearch.value);
    }

    function appendMessage(m) {
        if (!$('.today-divider', chatBody)) {
            const d = el('div', 'chat-divider today-divider');
            d.append(el('span', null, new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })));
            chatBody.append(d);
        }
        const mine = m.from === 'me';
        const wrap = el('div', 'chat-msg');
        const av = el('img', 'msg-avatar');
        av.src = mine ? me.avatar : current.avatar;
        av.alt = '';
        const body = el('div', 'msg-body');
        const head = el('div', 'msg-header');
        head.append(el('span', 'msg-name', mine ? me.name : current.name), el('span', 'msg-time', `Today at ${m.time}`));

        if (m.image || m.text === '👋') {
            const img = el('img', 'msg-sticker');
            img.src = m.image || '../assets/images/mascot2.gif';
            img.alt = 'wave';
            body.append(head, img);
        } else {
            body.append(head, el('div', 'msg-text', m.text));
        }

        wrap.append(av, body);
        chatBody.append(wrap);
    }

    /* ---------- sending ---------- */
    function sendMessage(text, from = 'me', image = null) {
        text = (text || '').trim();
        if (!text && !image) return;
        const c = conv(current.name);
        const hadMessages = c.messages.length > 0;
        const m = { from, text, image, time: timeNow() };
        c.messages.push(m);
        store.write(state);
        if (!hadMessages) renderChat(); else { appendMessage(m); scrollToBottom(); }
        if (from === 'me') scheduleReply();
    }

    const REPLIES = [
        'haha oo nga', 'wait lang ha', 'sige!', 'omg really?', 'lol', 'ano meron?',
        'busy ako ngayon, reply ako mamaya', '\ud83d\udc40', 'ayos yan', 'tara later', 'hmm, di ko sure'
    ];

    function scheduleReply() {
        const c = conv(current.name);
        if (c.blocked || current.status === 'offline' || current.status === 'dnd') return;
        const token = ++replyToken;
        const target = current;
        setTimeout(() => {
            if (token !== replyToken || current !== target) return;
            const typing = el('div', 'typing', `${target.name} is typing\u2026`);
            chatBody.append(typing);
            scrollToBottom();
            setTimeout(() => {
                typing.remove();
                const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
                const m = { from: 'them', text, time: timeNow() };
                conv(target.name).messages.push(m);
                store.write(state);
                if (current === target && token === replyToken) { appendMessage(m); scrollToBottom(); }
            }, 1200 + Math.random() * 1000);
        }, 500);
    }

    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        if (chatInput.disabled) return;
        sendMessage(chatInput.value);
        chatInput.value = '';
    });

    /* ---------- block / add friend / wave (delegated) ---------- */
    function applyBlockState() {
        const blocked = conv(current.name).blocked;
        chatInput.disabled = blocked;
        chatInput.placeholder = blocked
            ? 'You cannot send messages to a user you have blocked.'
            : `Message @${current.name}`;
    }

    chatBody.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const c = conv(current.name);
        switch (btn.dataset.action) {
            case 'add-friend':
                c.friend = true;
                btn.textContent = 'Friend Request Sent';
                btn.disabled = true;
                toast(`Friend request sent to ${current.name}`);
                break;
            case 'block':
                c.blocked = !c.blocked;
                toast(c.blocked ? `${current.name} blocked` : `${current.name} unblocked`);
                renderChat();
                applyBlockState();
                break;
            case 'wave':
                sendMessage('', 'me', '../assets/images/mascot2.gif');
                break;
        }
        store.write(state);
    });

    /* ---------- DM list: switching conversations ---------- */
    $('.dm-scroll').addEventListener('click', e => {
        const item = e.target.closest('.dm-item');
        if (!item) return;
        e.preventDefault();   // stay on this page instead of following href
        openDm(readDm(item));
    });

    /* ---------- DM list search ---------- */
    if (dmSearch) {
        dmSearch.removeAttribute('readonly');
        const empty = el('div', 'no-results', 'No conversations found.');
        empty.hidden = true;
        $('.dm-scroll').append(empty);

        dmSearch.addEventListener('input', () => {
            const q = dmSearch.value.trim().toLowerCase();
            let visible = 0;
            $$('.dm-item').forEach(item => {
                const show = !q || readDm(item).name.toLowerCase().includes(q);
                item.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            empty.hidden = visible > 0;
        });
        dmSearch.addEventListener('keydown', e => {
            if (e.key === 'Escape') { dmSearch.value = ''; dmSearch.dispatchEvent(new Event('input')); dmSearch.blur(); }
            if (e.key === 'Enter') {
                const first = $$('.dm-item').find(i => i.style.display !== 'none');
                if (first) openDm(readDm(first));
            }
        });
    }

    /* ---------- in-chat search ---------- */
    function filterMessages(q) {
        q = q.trim().toLowerCase();
        $$('.chat-msg', chatBody).forEach(m => {
            const text = ($('.msg-text', m) || {}).textContent || '';
            m.classList.toggle('hidden-by-search', !!q && !text.toLowerCase().includes(q));
        });
    }
    if (headerSearch) {
        headerSearch.removeAttribute('readonly');
        headerSearch.addEventListener('input', () => filterMessages(headerSearch.value));
        headerSearch.addEventListener('keydown', e => {
            if (e.key === 'Escape') { headerSearch.value = ''; filterMessages(''); headerSearch.blur(); }
        });
    }

    /* ---------- mute / deafen ---------- */
    const SVG = path => 'data:image/svg+xml;utf8,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#b5bac1" d="${path}"/></svg>`);
    const ICON_MIC = SVG('M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z');
    const ICON_HEADPHONES = SVG('M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2v-8H5v-1a7 7 0 0 1 14 0v1h-2v8h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z');

    const muteBtn = $('.user-panel .icon.muted');
    const deafBtn = $('.user-panel .icon.deafened');
    const audio = { muted: !!muteBtn, deafened: !!deafBtn };
    const muteSrc = muteBtn ? $('img', muteBtn).getAttribute('src') : '';
    const deafSrc = deafBtn ? $('img', deafBtn).getAttribute('src') : '';

    function renderAudio() {
        if (muteBtn) {
            muteBtn.classList.toggle('muted', audio.muted);
            muteBtn.title = audio.muted ? 'Unmute' : 'Mute';
            $('img', muteBtn).src = audio.muted ? muteSrc : ICON_MIC;
        }
        if (deafBtn) {
            deafBtn.classList.toggle('deafened', audio.deafened);
            deafBtn.title = audio.deafened ? 'Undeafen' : 'Deafen';
            $('img', deafBtn).src = audio.deafened ? deafSrc : ICON_HEADPHONES;
        }
    }
    if (muteBtn) muteBtn.addEventListener('click', () => {
        if (audio.deafened) { audio.deafened = false; audio.muted = false; }   // unmuting also undeafens
        else audio.muted = !audio.muted;
        renderAudio();
        toast(audio.muted ? 'Muted' : 'Unmuted');
    });
    if (deafBtn) deafBtn.addEventListener('click', () => {
        audio.deafened = !audio.deafened;
        audio.muted = audio.deafened;
        renderAudio();
        toast(audio.deafened ? 'Deafened' : 'Undeafened');
    });
    renderAudio();

    /* ---------- voice panel ---------- */
    const voicePanel = $('.voice-panel');
    $$('.voice-controls span').forEach(btn => btn.addEventListener('click', () => {
        const on = btn.classList.toggle('on');
        toast(`${btn.title}: ${on ? 'on' : 'off'}`);
    }));
    const videoBtn = $('.voice-btn:not(.hangup)');
    if (videoBtn) videoBtn.addEventListener('click', () => {
        const on = videoBtn.classList.toggle('on');
        toast(`Video: ${on ? 'on' : 'off'}`);
    });
    const hangup = $('.voice-btn.hangup');
    if (hangup) hangup.addEventListener('click', () => {
        if (voicePanel) voicePanel.style.display = 'none';
        toast('Disconnected from voice');
    });

    /* ---------- left nav tabs (Friends, Nitro, etc.) ---------- */
    $$('.nav-item').forEach(item => item.addEventListener('click', () => {
        const label = $('.nav-label', item).textContent.trim();
        toast(`${label} isn\u2019t available yet`);
    }));

    /* ---------- section header + user panel actions ---------- */
    const createDm = $('.action-icon[title="Create DM"]');
    if (createDm && dmSearch) createDm.addEventListener('click', () => { app.classList.add('show-sidebar'); dmSearch.focus(); });
    const moreBtn = $('.action-icon[title="More"]');
    if (moreBtn) moreBtn.addEventListener('click', () => toast('More options coming soon'));
    const settings = $('.user-panel .icon[title="Settings"]');
    if (settings) settings.addEventListener('click', () => toast('User settings aren\u2019t available yet'));

    /* ---------- server rail ---------- */
    $$('.server-rail .server-icon').forEach(icon => {
        if (icon.tagName === 'A') return;                       // real links navigate normally
        icon.addEventListener('click', () => {
            if (icon.classList.contains('add-server')) return toast('Creating servers isn\u2019t available yet');
            if (icon.classList.contains('explore')) return toast('Server discovery isn\u2019t available yet');
            const badge = $('.badge-rail', icon);
            if (badge) badge.remove();
            toast('Marked as read. Server channels aren\u2019t available yet.');
        });
    });

    /* ---------- chat header icons ---------- */
    const profileToggle = $('.header-icons span[title="Member List"]');
    if (profileToggle && profilePanel) profileToggle.addEventListener('click', () => {
        profilePanel.classList.toggle('panel-hidden');
    });
    const HEADER_MESSAGES = {
        'Start Voice Call': () => `Calling ${current.name}\u2026`,
        'Start Video Call': () => `Starting video call with ${current.name}\u2026`,
        'Pinned Messages': () => 'No pinned messages yet',
        'Add Friends to DM': () => 'Group DMs aren\u2019t available yet',
        'Inbox': () => 'Your inbox is empty',
        'Help': () => 'Help center coming soon'
    };
    $$('.header-icons > span[title], .top-icons > span[title]').forEach(btn => {
        const fn = HEADER_MESSAGES[btn.title];
        if (fn) btn.addEventListener('click', () => toast(fn()));
    });
    const viewProfile = $('.view-profile-btn');
    if (viewProfile) viewProfile.addEventListener('click', () => toast(`${current.name}\u2019s full profile isn\u2019t available yet`));
    $$('.panel-icon').forEach(p => p.addEventListener('click', () => toast('Coming soon')));

    /* ---------- composer: attachments, emoji, extras ---------- */
    const fileInput = Object.assign(document.createElement('input'), { type: 'file', hidden: true });
    document.body.appendChild(fileInput);
    const plus = $('.plus-icon');
    if (plus) plus.addEventListener('click', () => { if (!chatInput.disabled) fileInput.click(); });
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) sendMessage(`\ud83d\udcce ${fileInput.files[0].name}`);
        fileInput.value = '';
    });

    const EMOJIS = ['\ud83d\ude00', '\ud83d\ude02', '\ud83d\ude0d', '\ud83e\udd7a', '\ud83d\ude0e', '\ud83d\ude2d',
        '\ud83d\udc4d', '\ud83d\udc4b', '\ud83d\udd25', '\u2764\ufe0f', '\ud83c\udf89', '\ud83d\udc40',
        '\ud83d\ude34', '\ud83e\udd14', '\ud83d\ude21', '\ud83d\ude4f', '\ud83d\udcaf', '\u2728'];
    const pop = el('div', 'emoji-pop');
    EMOJIS.forEach(em => {
        const b = el('button', null, em);
        b.type = 'button';
        b.addEventListener('click', () => {
            if (chatInput.disabled) return;
            chatInput.value += em;
            chatInput.focus();
        });
        pop.append(b);
    });
    document.body.appendChild(pop);

    const emojiBtn = $('.input-emoji');
    if (emojiBtn) emojiBtn.addEventListener('click', e => {
        e.stopPropagation();
        const r = emojiBtn.getBoundingClientRect();
        pop.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
        pop.style.bottom = (window.innerHeight - r.top + 10) + 'px';
        pop.classList.toggle('open');
    });
    document.addEventListener('click', e => { if (!pop.contains(e.target)) pop.classList.remove('open'); });

    const COMPOSER_TOASTS = {
        'Gift': 'Gifting isn\u2019t available yet', 'GIF': 'GIF picker coming soon',
        'Attach Image': 'Use the + button to attach a file', 'Apps': 'Apps aren\u2019t available yet'
    };
    $$('.input-icons > span[title]').forEach(btn => {
        const msg = COMPOSER_TOASTS[btn.title];
        if (msg) btn.addEventListener('click', () => toast(msg));
    });

    /* ---------- keyboard shortcuts ---------- */
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && dmSearch) {
            e.preventDefault();
            app.classList.add('show-sidebar');
            dmSearch.focus();
            dmSearch.select();
        }
        if (e.key === 'Escape') {
            pop.classList.remove('open');
            app.classList.remove('show-sidebar');
        }
    });

    /* ---------- reset current conversation ---------- */
    function resetConversation() {
        state[current.name] = { messages: [], friend: false, blocked: false };
        store.write(state);
        replyToken++;              // cancels any pending fake reply
        renderChat();
        applyBlockState();
        toast(`Conversation with ${current.name} reset`);
    }
    window.resetConversation = resetConversation;

    // Shortcut: Ctrl/Cmd + Shift + Backspace
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Backspace') {
            e.preventDefault();
            resetConversation();
        }
    });

    /* ---------- init ---------- */
    openDm(initialData, { noFocus: true, keepSidebar: true });
})();