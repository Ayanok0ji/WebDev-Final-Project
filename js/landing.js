(function () {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const prefersReductionMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const store = {}
})();