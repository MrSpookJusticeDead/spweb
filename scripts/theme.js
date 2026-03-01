// theme.js localStorage persistence

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return; // Exit if button doesn't exist

        const icon = toggle.querySelector('.icon');
        const html = document.documentElement;

        // Load saved preference or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);

        toggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateIcon(next);
        });

        function updateIcon(theme) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        // Modified and made theme.js dark light mode, with localStorage persistence, and added comments for clarity.
    });
})();