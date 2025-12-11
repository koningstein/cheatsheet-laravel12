// script.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialiseer Syntax Highlighting (Highlight.js)
    if (window.hljs) {
        hljs.highlightAll();
    }

    // 2. Thema Toggle Logica
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check localstorage of systeem voorkeur
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    }

    if(themeBtn){
        themeBtn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // 3. Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-toggle');
    const sidebarLeft = document.querySelector('.sidebar-left');

    if(menuBtn && sidebarLeft) {
        menuBtn.addEventListener('click', () => {
            sidebarLeft.classList.toggle('open');
        });
    }

    // 4. Automatische Table of Contents (Rechter Sidebar)
    const content = document.querySelector('.main-content');
    const tocList = document.getElementById('toc-list');

    if (content && tocList) {
        // Zoek alle H2 en H3 headers
        const headers = content.querySelectorAll('h2, h3');

        headers.forEach((header, index) => {
            // Voeg ID toe als die er niet is
            if (!header.id) {
                header.id = `section-${index}`;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${header.id}`;
            a.textContent = header.textContent;

            // Indentatie voor H3
            if(header.tagName === 'H3') {
                a.style.paddingLeft = '1.5rem';
            }

            // Click event voor smooth scroll
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(header.id).scrollIntoView({
                    behavior: 'smooth'
                });
            });

            li.appendChild(a);
            tocList.appendChild(li);
        });

        // Scroll Spy (Active link highlighten tijdens scrollen)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    document.querySelectorAll('.toc-list a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-100px 0px -60% 0px' });

        headers.forEach(header => observer.observe(header));
    }
});