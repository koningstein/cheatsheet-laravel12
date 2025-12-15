document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialiseer Syntax Highlighting (Highlight.js)
    if (window.hljs) {
        hljs.highlightAll();
    }

    const html = document.documentElement;

    // --- CONFIGURATIE ARRAYS ---
    const themes = ['light', 'dark', 'material', 'monokai', 'night-owl'];
    const colors = ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'darkblue'];

    // --- INCLUDE SYSTEM (HEADER/SIDEBAR) ---
    // Dit stukje zoekt naar <div data-include="..."> en laadt de bestanden in
    const includeElements = document.querySelectorAll("[data-include]");
    let includesPending = includeElements.length;

    if (includesPending === 0) {
        // Geen includes? Start direct de logica
        initPageLogic();
    } else {
        includeElements.forEach(el => {
            const file = el.getAttribute("data-include");
            fetch(file)
                .then(res => {
                    if (!res.ok) throw new Error("Network response was not ok");
                    return res.text();
                })
                .then(html => {
                    el.outerHTML = html; // Vervang de placeholder door de echte HTML
                })
                .catch(err => {
                    console.error(`Fout bij laden van ${file}:`, err);
                    el.innerHTML = `<p style="color:red">Error loading ${file}</p>`;
                })
                .finally(() => {
                    includesPending--;
                    if (includesPending === 0) {
                        // Wacht tot ALLES is ingeladen, start dan pas de logica
                        initPageLogic();
                    }
                });
        });
    }

    // --- HOOFD LOGICA (Start pas na inladen HTML) ---
    function initPageLogic() {
        initThemeLogic();
        initColorLogic();
        initSidebarLogic(); // Belangrijk: Active class zetten
        initTOC();          // Inhoudsopgave genereren
    }

    // --- SIDEBAR LOGICA (Active state & Accordion) ---
    function initSidebarLogic() {
        // 1. Bepaal huidige pagina
        const currentPath = window.location.pathname.split("/").pop(); // bijv: 'm1-1-ext.html'

        // 2. Loop door alle links in de (net ingeladen) sidebar
        const links = document.querySelectorAll(".sidebar-left a");

        links.forEach(link => {
            const linkHref = link.getAttribute("href");
            // Check of bestandsnaam overeenkomt
            const linkFile = linkHref ? linkHref.split("/").pop() : "";

            if (linkFile === currentPath && currentPath !== "") {
                // A. Zet current class op de link
                link.classList.add("current");

                // B. Klap het submenu open
                const submenu = link.closest(".submenu");
                if (submenu) {
                    submenu.style.display = "block";

                    // C. Zet het pijltje goed (active class op container)
                    const parentGroup = link.closest(".nav-item-container");
                    if (parentGroup) {
                        parentGroup.classList.add("active");

                        // Scroll naar het item als het buiten beeld is
                        setTimeout(() => {
                            parentGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 100);
                    }
                }
            }
        });

        // 3. Click events voor open/dicht klappen
        const navToggles = document.querySelectorAll('.nav-toggle');
        navToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const container = toggle.closest('.nav-item-container');
                container.classList.toggle('active');
            });
        });

        // 4. Mobiel menu
        const menuBtn = document.getElementById('menu-toggle');
        const sidebarLeft = document.querySelector('.sidebar-left');
        if(menuBtn && sidebarLeft) {
            menuBtn.addEventListener('click', () => {
                sidebarLeft.classList.toggle('open');
            });
            // Sluit menu bij klik buiten menu
            document.addEventListener('click', (e) => {
                if(window.innerWidth <= 768 && sidebarLeft.classList.contains('open') && !sidebarLeft.contains(e.target) && e.target !== menuBtn) {
                    sidebarLeft.classList.remove('open');
                }
            });
        }
    }

    // --- THEMA LOGICA ---
    function initThemeLogic() {
        const themeBtn = document.getElementById('theme-toggle');
        let savedTheme = localStorage.getItem('theme') || 'light';
        if (!themes.includes(savedTheme)) savedTheme = 'light';

        html.setAttribute('data-theme', savedTheme);
        updateThemeButtonText(themeBtn, savedTheme);

        if(themeBtn){
            themeBtn.addEventListener('click', () => {
                let current = html.getAttribute('data-theme');
                let index = themes.indexOf(current);
                let nextTheme = themes[(index + 1) % themes.length];

                html.setAttribute('data-theme', nextTheme);
                localStorage.setItem('theme', nextTheme);
                updateThemeButtonText(themeBtn, nextTheme);
            });
        }
    }

    function updateThemeButtonText(btn, theme) {
        if(!btn) return;
        const labels = { 'light': '☀️ Light', 'dark': '🌙 Laravel Dark', 'material': '🌑 Material', 'monokai': '👾 Monokai', 'night-owl': '🦉 Night Owl' };
        btn.textContent = labels[theme] || 'Thema';
    }

    // --- KLEUR LOGICA ---
    function initColorLogic() {
        const colorBtn = document.getElementById('color-toggle');
        let savedColor = localStorage.getItem('color') || 'red';
        if (!colors.includes(savedColor)) savedColor = 'red';

        html.setAttribute('data-color', savedColor);
        updateColorButtonText(colorBtn, savedColor);

        if(colorBtn) {
            colorBtn.addEventListener('click', () => {
                let current = html.getAttribute('data-color');
                let index = colors.indexOf(current);
                let nextColor = colors[(index + 1) % colors.length];

                html.setAttribute('data-color', nextColor);
                localStorage.setItem('color', nextColor);
                updateColorButtonText(colorBtn, nextColor);
            });
        }
    }

    function updateColorButtonText(btn, color) {
        if(!btn) return;
        const label = color.charAt(0).toUpperCase() + color.slice(1);
        btn.textContent = `🎨 ${label}`;
    }

    // --- TABLE OF CONTENTS LOGICA ---
    function initTOC() {
        const content = document.querySelector('.main-content');
        const sidebarRight = document.querySelector('.sidebar-right');

        if (content && sidebarRight) {
            sidebarRight.innerHTML = ''; // Reset

            const tocContainer = document.createElement('div');
            tocContainer.className = 'toc-container';

            const tocTitle = document.createElement('h4');
            tocTitle.textContent = 'Inhoud';
            tocContainer.appendChild(tocTitle);

            const ul = document.createElement('ul');
            ul.className = 'toc-list';
            ul.id = 'toc-list';
            tocContainer.appendChild(ul);
            sidebarRight.appendChild(tocContainer);

            const headers = content.querySelectorAll('h2, h3');
            headers.forEach((header, index) => {
                if (!header.id) header.id = `section-${index}`;

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${header.id}`;
                // Haal eventuele handmatige # weg voor de TOC weergave
                a.textContent = header.textContent.replace(/^#\s?/, '');

                if(header.tagName === 'H3') {
                    a.style.paddingLeft = '1rem';
                    a.style.fontSize = '0.85rem';
                }

                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById(header.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.pushState(null, null, `#${header.id}`);
                });
                li.appendChild(a);
                ul.appendChild(li);
            });

            // Scroll Spy
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.toc-list a').forEach(link => {
                            link.classList.remove('active');
                            if(link.getAttribute('href') === `#${entry.target.id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, { rootMargin: '-100px 0px -70% 0px' });

            headers.forEach(header => observer.observe(header));
        }
    }
});