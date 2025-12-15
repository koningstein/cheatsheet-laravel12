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
    const includeElements = document.querySelectorAll("[data-include]");
    let includesPending = includeElements.length;

    if (includesPending === 0) {
        initPageLogic();
    } else {
        includeElements.forEach(el => {
            const filePath = el.getAttribute("data-include");

            // Bepaal het "basis pad" (bijv. "../../" als filePath "../../sidebar.html" is)
            const lastSlashIndex = filePath.lastIndexOf("/");
            const basePath = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex + 1) : "";

            fetch(filePath)
                .then(res => {
                    if (!res.ok) throw new Error("Network response was not ok");
                    return res.text();
                })
                .then(content => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;

                    // Pad correcties voor links/images in de ingeladen HTML
                    const links = tempDiv.querySelectorAll('a, img, link, script');
                    links.forEach(link => {
                        if (link.hasAttribute('href')) {
                            const href = link.getAttribute('href');
                            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                                link.setAttribute('href', basePath + href);
                            }
                        }
                        if (link.hasAttribute('src')) {
                            const src = link.getAttribute('src');
                            if (src && !src.startsWith('http')) {
                                link.setAttribute('src', basePath + src);
                            }
                        }
                    });

                    el.outerHTML = tempDiv.innerHTML;
                })
                .catch(err => {
                    console.error(`Fout bij laden van ${filePath}:`, err);
                    el.innerHTML = `<p style="color:red">Error loading ${filePath}</p>`;
                })
                .finally(() => {
                    includesPending--;
                    if (includesPending === 0) {
                        initPageLogic();
                    }
                });
        });
    }

    // --- HOOFD LOGICA (Start pas na inladen HTML) ---
    function initPageLogic() {
        initThemeLogic();
        initColorLogic();
        initSidebarLogic();
        initTOC();
        initViewToggle(); // <--- NIEUWE FUNCTIE TOEGEVOEGD
    }

    // --- NIEUW: VIEW TOGGLE (Extended vs Cheatsheet) ---
    function initViewToggle() {
        const toggleBtn = document.getElementById('view-toggle');
        if (!toggleBtn) return;

        const path = window.location.pathname;
        const filename = path.split("/").pop(); // bijv: 'm1-1-ext.html' of 'm1-1.html'

        // Regex om Module ID en Pagina ID te vinden: m(Getal)-(Getal)(-ext?).html
        const regex = /m(\d+)-(\d+)(-ext)?\.html/;
        const match = filename.match(regex);

        if (match) {
            const moduleId = parseInt(match[1]); // bijv. 1
            const pageId = match[2];             // bijv. 1
            const isExtended = !!match[3];       // true als '-ext' in de naam zit

            if (isExtended) {
                // SITUATIE: We zitten op EXTENDED
                // Knop moet leiden naar CHEATSHEET
                toggleBtn.innerHTML = '🔄 Cheatsheet';
                toggleBtn.title = "Ga naar Cheatsheet view";

                // Doel: ../../../pages/moduleX/mX-Y.html
                // We gaan ervan uit dat Cheatsheet altijd bestaat
                toggleBtn.href = `../../../pages/module${moduleId}/m${moduleId}-${pageId}.html`;

            } else {
                // SITUATIE: We zitten op CHEATSHEET
                // Knop moet leiden naar EXTENDED
                toggleBtn.innerHTML = '🔄 Extended';
                toggleBtn.title = "Ga naar Extended view";

                // Regel: Als module <= 5 is, ga naar dezelfde pagina.
                // Anders (module 6+), ga naar start van Extended (m1-1-ext.html).
                if (moduleId <= 5) {
                    toggleBtn.href = `../../../ext/pages/module${moduleId}/m${moduleId}-${pageId}-ext.html`;
                } else {
                    toggleBtn.href = `../../../ext/pages/module1/m1-1-ext.html`;
                }
            }
        } else {
            // Geen match (bijv. index.html)? Verberg de knop.
            toggleBtn.style.display = 'none';
        }
    }

    // --- SIDEBAR LOGICA ---
    function initSidebarLogic() {
        const currentPath = window.location.pathname.split("/").pop();
        const links = document.querySelectorAll(".sidebar-left a");

        links.forEach(link => {
            const linkHref = link.getAttribute("href");
            const linkFile = linkHref ? linkHref.split("/").pop() : "";

            if (linkFile === currentPath && currentPath !== "") {
                link.classList.add("current");
                const submenu = link.closest(".submenu");
                if (submenu) {
                    submenu.style.display = "block";
                    const parentGroup = link.closest(".nav-item-container");
                    if (parentGroup) {
                        parentGroup.classList.add("active");
                        setTimeout(() => {
                            parentGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 100);
                    }
                }
            }
        });

        const navToggles = document.querySelectorAll('.nav-toggle');
        navToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const container = toggle.closest('.nav-item-container');
                container.classList.toggle('active');
            });
        });

        const menuBtn = document.getElementById('menu-toggle');
        const sidebarLeft = document.querySelector('.sidebar-left');
        if(menuBtn && sidebarLeft) {
            menuBtn.addEventListener('click', () => {
                sidebarLeft.classList.toggle('open');
            });
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
            sidebarRight.innerHTML = '';
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