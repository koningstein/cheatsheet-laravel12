document.addEventListener('DOMContentLoaded', () => {
    // Vind de theme switcher
    const themeSelect = document.getElementById('theme-switcher');

    // 1. Haal het opgeslagen thema op, of gebruik 'blue' als standaard
    const currentTheme = localStorage.getItem('spiderpi_theme') || 'blue';

    // 2. Pas het thema direct toe bij het laden van de pagina
    document.body.dataset.theme = currentTheme;
    if (themeSelect) {
        themeSelect.value = currentTheme;
    }

    // 3. Voeg een listener toe voor als de gebruiker wisselt
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            const selectedTheme = themeSelect.value;
            document.body.dataset.theme = selectedTheme;
            // Sla de keuze op voor de volgende keer
            localStorage.setItem('spiderpi_theme', selectedTheme);
        });
    }

    // 4. Activeer syntax highlighting (als highlight.js geladen is)
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
});