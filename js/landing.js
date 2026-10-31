(function () {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- tiny safe storage helper ---------- */
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

    