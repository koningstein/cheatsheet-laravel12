// v2/script.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialiseer Syntax Highlighting (Highlight.js)
    if (window.hljs) {
        hljs.highlightAll();
    }

    const html = document.documentElement;

    // 2. Thema (Dark/Light) Logica
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    }

    if(themeBtn){
        themeBtn.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    // 3. Kleur Thema's Logica (Cycle door kleuren)
    const colorBtn = document.getElementById('color-toggle');
    const colors = ['red', 'blue', 'green', 'purple', 'orange'];

    // Check saved color
    const savedColor = localStorage.getItem('color') || 'red';
    html.setAttribute('data-color', savedColor);

    if(colorBtn) {
        colorBtn.addEventListener('click', () => {
            let currentColor = html.getAttribute('data-color') || 'red';
            let index = colors.indexOf(currentColor);
            let nextIndex = (index + 1) % colors.length;
            let nextColor = colors[nextIndex];

            html.setAttribute('data-color', nextColor);
            localStorage.setItem('color', nextColor);
        });
    }

    // 4. Sidebar Accordion Logica (Direct scrollen)
    const navToggles = document.querySelectorAll('.nav-toggle');

    // A. Open direct de groep waar de huidige pagina in zit (bij laden pagina)
    const currentLink = document.querySelector('.submenu a.current');
    if(currentLink) {
        const parentGroup = currentLink.closest('.nav-item-container');
        if(parentGroup) {
            parentGroup.classList.add('active');
            // Direct scrollen bij laden (zonder animatie want de pagina laadt net)
            parentGroup.scrollIntoView({ block: 'nearest' });
        }
    }

    // B. Click events voor het openen/sluiten
    navToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const container = toggle.closest('.nav-item-container');
            const wasActive = container.classList.contains('active');

            // Toggle de geklikte container
            container.classList.toggle('active');

            // Scroll logica: Als we hem openen, scroll direct
            if (!wasActive) {
                container.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        });
    });

    // 5. Mobile Menu
    const menuBtn = document.getElementById('menu-toggle');
    const sidebarLeft = document.querySelector('.sidebar-left');

    if(menuBtn && sidebarLeft) {
        menuBtn.addEventListener('click', () => {
            sidebarLeft.classList.toggle('open');
        });
    }

    // 6. Table of Contents (Rechter Sidebar)
    const content = document.querySelector('.main-content');
    const tocList = document.getElementById('toc-list');

    if (content && tocList) {
        // Zoek alle H2 en H3 headers
        const headers = content.querySelectorAll('h2, h3');

        headers.forEach((header, index) => {
            if (!header.id) {
                header.id = `section-${index}`;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${header.id}`;
            a.textContent = header.textContent;

            if(header.tagName === 'H3') {
                a.style.paddingLeft = '1.5rem';
            }

            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(header.id).scrollIntoView({
                    behavior: 'smooth'
                });
            });

            li.appendChild(a);
            tocList.appendChild(li);
        });

        // Scroll Spy
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.toc-list a').forEach(link => {
                        link.classList.remove('active');
                    });

                    const activeLink = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
                    if(activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, { rootMargin: '-100px 0px -60% 0px' });

        headers.forEach(header => observer.observe(header));
    }
});