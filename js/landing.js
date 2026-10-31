(function () {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const prefersReductionMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, val) {
            try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
        }
    };

    function injectStyles() {
        const css = `
            .nav-toggle {
                display: none;
                width: 40px; height: 40px;
                border: none; border-radius: 10px;
                background: rgba(255,255,255,0.1);
                cursor: pointer;
                align-items: center; justify-content: center;
                flex-direction: column; gap: 5px;
            }
            .nav-toggle span {
                display: block; width: 20px; height: 2px;
                background: #fff; border-radius: 2px;
                transition: transform .25s ease, opacity .2s ease;
            }
            .nav-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
            .nav-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
            .nav-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
 
            .mobile-menu {
                position: fixed; inset: 0 0 0 0;
                padding: 88px 24px 24px;
                background: rgba(26,32,129,0.98);
                z-index: 90;
                display: flex; flex-direction: column; gap: 4px;
                opacity: 0; visibility: hidden;
                transform: translateY(-8px);
                transition: opacity .25s ease, transform .25s ease, visibility .25s;
                overflow-y: auto;
            }
            .mobile-menu.open { opacity: 1; visibility: visible; transform: none; }
            .mobile-menu a {
                display: block; padding: 14px 8px;
                font-size: 20px; font-weight: 600;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .mobile-menu a:hover { color: #a5b0ff; }
 
            @media (max-width: 900px) { .nav-toggle { display: inline-flex; } }
            @media (min-width: 901px) { .mobile-menu { display: none; } }
 
            header.site-header { transition: box-shadow .25s ease, background-color .25s ease; }
            header.site-header.scrolled {
                box-shadow: 0 6px 24px rgba(0,0,0,0.35);
                background-color: rgba(26,32,129,0.95);
            }
            .nav-menu a.active { color: #a5b0ff; text-decoration: underline; text-underline-offset: 6px; }
 
            .feature-card.will-reveal { opacity: 0; transform: translateY(24px); }
            .feature-card.will-reveal.revealed {
                opacity: 1; transform: none;
                transition: opacity .6s ease, transform .6s ease;
            }
 
            .toast {
                position: fixed; left: 50%; bottom: 28px;
                transform: translate(-50%, 20px);
                background: #23272a; color: #fff;
                padding: 12px 20px; border-radius: 12px;
                font-size: 15px; z-index: 200;
                box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                opacity: 0; pointer-events: none;
                transition: opacity .25s ease, transform .25s ease;
            }
            .toast.show { opacity: 1; transform: translate(-50%, 0); }
 
            .back-to-top {
                position: fixed; right: 20px; bottom: 20px;
                width: 46px; height: 46px; border-radius: 50%;
                border: none; background: #5865f2; color: #fff;
                font-size: 20px; cursor: pointer; z-index: 80;
                box-shadow: 0 6px 18px rgba(0,0,0,0.4);
                opacity: 0; visibility: hidden;
                transition: opacity .25s ease, visibility .25s, background-color .2s ease;
            }
            .back-to-top.show { opacity: 1; visibility: visible; }
            .back-to-top:hover { background: #4752c4; }
 
            a:focus-visible, button:focus-visible, select:focus-visible {
                outline: 3px solid #a5b0ff; outline-offset: 3px;
            }
            body.menu-open { overflow: hidden; }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    let toastEl, toastTimer;
    function showToast(message) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast';
            toastEl.setAttribute('role', 'status');
            toastEl.setAttribute('aria-live', 'polite');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
    }

    function initScrollUI() {
        const header = $('.site-header');
        const topBtn = document.createElement('button');
        topBtn.className = 'back-to-top';
        topBtn.type = 'button';
        topBtn.setAttribute('aria-label', 'Back to top');
        topBtn.textContent = '↑';
        document.body.appendChild(topBtn);

        topBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });

        let ticking = false;
        function update() {
            const y = window.scrollY;
            header.classList.toggle('scrolled', y > 10);
            topBtn.classList.toggle('show', y > 600);
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    }

    function initMobileMenu() {
        const actions = $('.nav-actions');
        const menuList = $('.nav-menu');
        if (!actions || !menuList) return;

        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'mobile-menu');
        toggle.innerHTML = '<span></span><span></span><span></span>';
        actions.appendChild(toggle);

        const panel = document.createElement('nav');
        panel.className = 'mobile-menu';
        panel.id = 'mobile-menu';
        panel.setAttribute('aria-label', 'Mobile navigation');
        $$('a', menuList).forEach(a => {
            const clone = a.cloneNode(true);
            panel.appendChild(clone);
        });
        document.body.appendChild(panel);

        function setOpen(open) {
            panel.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            document.body.classList.toggle('menu-open', open);
        }

        toggle.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
        panel.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
        window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
    }

    function initLinks() {
        const header = $('.site-header');

        document.addEventListener('click', e => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const hash = link.getAttribute('href');
            if (hash === '#') { e.preventDefault(); return; }

            const target = document.getElementById(hash.slice(1));
            e.preventDefault();

            if (!target) {
                // Section doesn't exist yet (e.g. #about, #jobs)
                showToast(`“${link.textContent.trim()}” page is coming soon.`);
                return;
            }

            const offset = header ? header.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            history.replaceState(null, '', hash);
        });

        // Footer social links open in a new tab – make that safe
        $$('a[target="_blank"]').forEach(a => a.setAttribute('rel', 'noopener noreferrer'));
    }

    function initActiveNav() {
        const sections = [$('#download'), $('#features')].filter(Boolean);
        if (!('IntersectionObserver' in window) || !sections.length) return;

        const links = $$('.nav-menu a');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = '#' + entry.target.id;
                links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id &&
                    // "Nitro / Discover / Blog / Careers" all point at #features; only mark the first
                    links.find(l => l.getAttribute('href') === id) === a));
            });
        }, { rootMargin: '-40% 0px -50% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    function initReveal() {
        const cards = $$('.feature-card');
        if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

        cards.forEach(c => c.classList.add('will-reveal'));
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        cards.forEach(c => observer.observe(c));
    }

    function initVideos() {
        const videos = $$('.feature-media video');
        if (!videos.length) return;

        if (prefersReducedMotion) {
            videos.forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
            return;
        }
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const v = entry.target;
                if (entry.isIntersecting) {
                    const p = v.play();
                    if (p && p.catch) p.catch(() => { /* autoplay blocked – ignore */ });
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.35 });
        videos.forEach(v => observer.observe(v));

        // Pause everything when the tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) videos.forEach(v => v.pause());
        });
    }

    function detectPlatform() {
        const ua = navigator.userAgent || '';
        const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
        if (/android/i.test(ua)) return 'Android';
        if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
        if (/mac/i.test(platform) || /Macintosh/i.test(ua)) return 'Mac';
        if (/linux/i.test(platform) || /Linux/i.test(ua)) return 'Linux';
        return 'Windows';
    }

    let currentPlatform = 'Windows';
    function initDownloadButton() {
        currentPlatform = detectPlatform();
        const btn = $('.hero-buttons .btn-white');
        if (!btn) return;

        btn.addEventListener('click', e => {
            e.preventDefault();
            showToast(`Starting Discord download for ${currentPlatform}…`);
        });
        applyDownloadLabel(store.get('lang') || 'en-US');
    }

    function applyDownloadLabel(lang) {
        const btn = $('.hero-buttons .btn-white');
        if (!btn) return;
        const label = lang === 'fil'
            ? `I-download para sa ${currentPlatform}`
            : `Download for ${currentPlatform}`;
        const textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (textNode) textNode.textContent = '\n                        ' + label + '\n                    ';
        else btn.append(label);
    }

    const TRANSLATIONS = {
        'en-US': {},
        fil: {
            '.hero-title': 'Group chat na puno ng saya at laro',
            '.hero-subtitle': 'Magandang gamitin ang Discord para maglaro at makipag-chill kasama ang mga kaibigan, o kahit magtayo ng pandaigdigang komunidad. I-customize ang sarili mong espasyo para makipagkwentuhan, maglaro, at tumambay.',
            '.hero-buttons .btn-dark': 'Buksan ang Discord sa browser mo',
            '.nav-login-btn': 'Mag-login',
            '.cta-title': 'HINDI KA NA MAKAKA-SCROLL. MAG-CHAT NA LANG.',
            '.cta-container .btn-primary': 'Buksan ang Discord',
            '.footer-bottom-btn': 'Mag-sign up',
            '.footer-language label': 'Wika:'
        }
    };
    const originals = new Map();

    function applyLanguage(lang) {
        const dict = TRANSLATIONS[lang] || {};
        originals.forEach((text, el) => { el.textContent = text; });
        Object.keys(TRANSLATIONS.fil).forEach(sel => {
            const el = $(sel);
            if (!el) return;
            if (!originals.has(el)) originals.set(el, el.textContent);
            if (dict[sel]) el.textContent = dict[sel];
        });
        document.documentElement.lang = lang === 'fil' ? 'fil' : 'en';
        applyDownloadLabel(lang);
    }

    function initLanguage() {
        const select = $('#lang-select');
        if (!select) return;

        const saved = store.get('lang');
        if (saved && TRANSLATIONS[saved]) select.value = saved;
        applyLanguage(select.value);

        select.addEventListener('change', () => {
            store.set('lang', select.value);
            applyLanguage(select.value);
            showToast(select.value === 'fil' ? 'Wika: Filipino' : 'Language: English');
        });
    }

    function initHeroParallax() {
        const art = $('.hero-art');
        if (!art || prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

        const layers = [
            { el: $('.hero-character-boy'), depth: 10 },
            { el: $('.hero-character-main'), depth: 6 },
            { el: $('.hero-character-wumpus'), depth: 14 },
            { el: $('.hero-star-1'), depth: -18 },
            { el: $('.hero-star-2'), depth: -12 }
        ].filter(l => l.el);

        let raf = null;
        const hero = $('.hero-section');

        hero.addEventListener('mousemove', e => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                layers.forEach(({ el, depth }) => {
                    el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
                });
            });
        });

        hero.addEventListener('mouseleave', () => {
            layers.forEach(({ el }) => {
                el.style.transition = 'transform .4s ease';
                el.style.transform = '';
                setTimeout(() => { el.style.transition = ''; }, 400);
            });
        });

        layers.forEach(({ el }) => { el.style.willChange = 'transform'; });
    }

    function initSocials() {
        $$('.footer-social-link').forEach(link => {
            const name = link.getAttribute('title');
            if (name) link.setAttribute('aria-label', name);
        });
    }

    function init() {
        injectStyles();
        initScrollUI();
        initMobileMenu();
        initLinks();
        initActiveNav();
        initReveal();
        initVideos();
        initDownloadButton();
        initLanguage();
        initHeroParallax();
        initSocials();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();