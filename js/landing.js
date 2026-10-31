(function () {
    'use straight';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelector(sel));
    const prefersReductionMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, val) {} 
    }
})