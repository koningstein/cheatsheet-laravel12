// v2/script.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialiseer Syntax Highlighting (Highlight.js)
    if (window.hljs) {
        hljs.highlightAll();
    }

    const html = document.documentElement;

    // --- CONFIGURATIE ARRAYS ---

    // Thema's (Achtergronden)
    const themes = ['light', 'dark', 'material', 'monokai', 'night-owl'];

    // Kleuren (Accenten)
    const colors = ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'darkblue'];

    // --- 2. THEMA LOGICA (Carrousel) ---
    const themeBtn = document.getElementById('theme-toggle');

    // Haal op of zet default
    let savedTheme = localStorage.getItem('theme') || 'light';
    if (!themes.includes(savedTheme)) savedTheme = 'light';

    // Pas toe bij laden
    html.setAttribute('data-theme', savedTheme);
    updateThemeButtonText(savedTheme);

    if(themeBtn){
        themeBtn.addEventListener('click', () => {
            // Huidige ophalen
            let current = html.getAttribute('data-theme');
            let index = themes.indexOf(current);

            // Volgende in de rij (modulo zorgt dat hij teruggaat naar 0)
            let nextIndex = (index + 1) % themes.length;
            let nextTheme = themes[nextIndex];

            // Zet attribuut en sla op
            html.setAttribute('data-theme', nextTheme);
            localStorage.setItem('theme', nextTheme);

            updateThemeButtonText(nextTheme);
        });
    }

    function updateThemeButtonText(theme) {
        if(!themeBtn) return;
        // Mooie labels voor op de knop
        const labels = {
            'light': '☀️ Light',
            'dark': '🌙 Laravel Dark',
            'material': '🌑 Material',
            'monokai': '👾 Monokai',
            'night-owl': '🦉 Night Owl'
        };
        themeBtn.textContent = labels[theme] || 'Thema';
    }

    // --- 3. KLEUR LOGICA (Carrousel) ---
    const colorBtn = document.getElementById('color-toggle');

    // Haal op of zet default
    let savedColor = localStorage.getItem('color') || 'red';
    if (!colors.includes(savedColor)) savedColor = 'red';

    // Pas toe bij laden
    html.setAttribute('data-color', savedColor);
    updateColorButtonText(savedColor);

    if(colorBtn) {
        colorBtn.addEventListener('click', () => {
            let current = html.getAttribute('data-color');
            let index = colors.indexOf(current);

            let nextIndex = (index + 1) % colors.length;
            let nextColor = colors[nextIndex];

            html.setAttribute('data-color', nextColor);
            localStorage.setItem('color', nextColor);

            updateColorButtonText(nextColor);
        });
    }

    function updateColorButtonText(color) {
        if(!colorBtn) return;
        // Capitalize eerste letter voor de knop
        const label = color.charAt(0).toUpperCase() + color.slice(1);
        colorBtn.textContent = `🎨 ${label}`;
    }

    // --- 4. SIDEBAR ACCORDION LOGICA ---
    const navToggles = document.querySelectorAll('.nav-toggle');

    // A. Open direct de groep waar de huidige pagina in zit
    const currentLink = document.querySelector('.submenu a.current');
    if(currentLink) {
        const parentGroup = currentLink.closest('.nav-item-container');
        if(parentGroup) {
            parentGroup.classList.add('active');
            parentGroup.scrollIntoView({ block: 'nearest' });
        }
    }

    // B. Click events
    navToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const container = toggle.closest('.nav-item-container');
            const wasActive = container.classList.contains('active');

            // Sluit eventueel andere groepen als je 'accordion' gedrag wilt (optioneel)
            // document.querySelectorAll('.nav-item-container').forEach(c => c.classList.remove('active'));

            container.classList.toggle('active');

            if (!wasActive) {
                container.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        });
    });

    // --- 5. MOBILE MENU ---
    const menuBtn = document.getElementById('menu-toggle');
    const sidebarLeft = document.querySelector('.sidebar-left');

    if(menuBtn && sidebarLeft) {
        menuBtn.addEventListener('click', () => {
            sidebarLeft.classList.toggle('open');
        });

        // Sluit menu als je ergens anders klikt op mobiel
        document.addEventListener('click', (e) => {
            if(window.innerWidth <= 768 &&
                sidebarLeft.classList.contains('open') &&
                !sidebarLeft.contains(e.target) &&
                e.target !== menuBtn) {
                sidebarLeft.classList.remove('open');
            }
        });
    }

    // --- 6. TABLE OF CONTENTS (AUTO GENERATED) ---
    const content = document.querySelector('.main-content');
    const sidebarRight = document.querySelector('.sidebar-right');

    if (content && sidebarRight) {
        // Maak container
        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc-container';

        const tocTitle = document.createElement('h4');
        tocTitle.textContent = 'Op deze pagina';
        tocContainer.appendChild(tocTitle);

        const ul = document.createElement('ul');
        ul.className = 'toc-list';
        ul.id = 'toc-list';
        tocContainer.appendChild(ul);

        sidebarRight.appendChild(tocContainer);

        // Scan headers
        const headers = content.querySelectorAll('h2, h3');

        headers.forEach((header, index) => {
            if (!header.id) {
                header.id = `section-${index}`;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${header.id}`;
            a.textContent = header.textContent.replace(/^#\s/, ''); // Verwijder visuele hash

            if(header.tagName === 'H3') {
                a.style.paddingLeft = '1.5rem';
                a.style.fontSize = '0.8rem';
            }

            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(header.id).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Update URL zonder jump
                history.pushState(null, null, `#${header.id}`);
            });

            li.appendChild(a);
            ul.appendChild(li);
        });

        // Scroll Spy (Markeer actieve link tijdens scrollen)
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    document.querySelectorAll('.toc-list a').forEach(link => {
                        link.classList.remove('active');
                        if(link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        headers.forEach(header => observer.observe(header));
    }
});