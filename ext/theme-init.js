// js/theme-init.js
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('color') || 'red';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-color', savedColor);
})();