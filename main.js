        const API = { base: "http://ottpro.iptvpro2.com:8789", user: "Oujakr12", pass: "87593226" };
        const player = new Plyr('#player', { controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'] });
        const video = document.getElementById('player');
        const hls = new Hls();
        
        const i18n = {
            ar: { home: "الرئيسية", live: "مباشر", movies: "أفلام", series: "مسلسلات", search_placeholder: "ابحث عن القناة أو الفيلم...", loading: "جاري التحميل...", load_more: "عرض المزيد", download_title: "حمل تطبيق DAMI X-PRO", download_desc: "استمتع بأفضل القنوات والأفلام بجودة عالية وبدون تقطيع على هاتفك.", download_now: "تحميل الآن", download_app: "تحميل التطبيق", about_us: "من نحن", contact_us: "اتصل بنا", privacy_policy: "سياسة الخصوصية", terms_use: "شروط الاستخدام", footer_rights: "جميع الحقوق محفوظة للمطور عماد الدين لمراني", modal_about: "DAMI X-PRO هي منصة رائدة في مجال البث الرقمي توفر محتوى ترفيهي عالي الجودة.", modal_contact: "يمكنك التواصل معنا عبر الواتساب: +212640059730", modal_privacy: "نحن نحترم خصوصيتك. لا يتم مشاركة بياناتك مع أي طرف ثالث.", modal_terms: "باستخدامك للموقع، فإنك توافق على عدم إعادة بث المحتوى أو استخدامه بشكل غير قانوني." },
            en: { home: "Home", live: "Live TV", movies: "Movies", series: "Series", search_placeholder: "Search channels or movies...", loading: "Loading...", load_more: "Load More", download_title: "Download DAMI X-PRO App", download_desc: "Enjoy the best channels and movies in high quality without interruption.", download_now: "Download Now", download_app: "Download App", about_us: "About Us", contact_us: "Contact Us", privacy_policy: "Privacy Policy", terms_use: "Terms of Use", footer_rights: "All rights reserved to developer Imad Eddine Lamrani", modal_about: "DAMI X-PRO is a leading streaming platform providing high-quality entertainment content.", modal_contact: "Contact us via WhatsApp: +212640059730", modal_privacy: "We respect your privacy. Data is not shared.", modal_terms: "By using this site, you agree not to re-stream content illegally." },
            fr: { home: "Accueil", live: "Direct", movies: "Films", series: "Séries", search_placeholder: "Rechercher...", loading: "Chargement...", load_more: "Voir plus", download_title: "Télécharger DAMI X-PRO", download_desc: "Profitez des meilleures chaînes et films en haute qualité sans interruption.", download_now: "Télécharger", download_app: "Télécharger l'App", about_us: "À propos", contact_us: "Contactez-nous", privacy_policy: "Confidentialité", terms_use: "Conditions", footer_rights: "Tous droits réservés au développeur Imad Eddine Lamrani", modal_about: "DAMI X-PRO est une plateforme de streaming leader offrant un contenu de haute qualité.", modal_contact: "Contactez-nous via WhatsApp : +212640059730", modal_privacy: "Nous respectons votre vie privée.", modal_terms: "Vous acceptez de ne pas rediffuser le contenu illégalement." },
            es: { home: "Inicio", live: "En vivo", movies: "Películas", series: "Series", search_placeholder: "Buscar...", loading: "Cargando...", load_more: "Ver más", download_title: "Descargar DAMI X-PRO", download_desc: "Disfruta de los mejores canales y películas en alta calidad.", download_now: "Descargar", download_app: "Descargar App", about_us: "Nosotros", contact_us: "Contacto", privacy_policy: "Privacidad", terms_use: "Condiciones", footer_rights: "Todos los derechos reservados a Imad Eddine Lamrani", modal_about: "DAMI X-PRO es una plataforma de transmisión digital de alta calidad.", modal_contact: "Contáctenos vía WhatsApp: +212640059730", modal_privacy: "Respetamos su privacidad.", modal_terms: "Acepta no retransmitir contenido ilegalmente." }
        };

        let currentLang = 'ar', currentMode = 'get_live_streams', fullData = [], displayedCount = 42;

        function toggleTheme() {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            document.getElementById('themeIcon').className = isLight ? 'fas fa-sun text-yellow-500' : 'fas fa-moon text-yellow-100';
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
            document.querySelector('.sidebar-overlay').classList.toggle('open');
        }

        function changeLanguage(lang) {
            currentLang = lang;
            document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
            document.querySelectorAll('[data-translate]').forEach(el => { const key = el.getAttribute('data-translate'); el.innerText = i18n[lang][key]; });
            document.querySelectorAll('[data-translate-placeholder]').forEach(el => { const key = el.getAttribute('data-translate-placeholder'); el.placeholder = i18n[lang][key]; });
        }

        function showModal(type) {
            toggleSidebar();
            const modal = document.getElementById('infoModal');
            document.getElementById('modalTitle').innerText = i18n[currentLang][(type === 'about' ? 'about_us' : type === 'contact' ? 'contact_us' : type === 'privacy' ? 'privacy_policy' : 'terms_use')];
            document.getElementById('modalBody').innerText = i18n[currentLang][`modal_${type}`];
            modal.style.display = 'flex';
        }

        async function switchMode(action, catAction, btn) {
            currentMode = action;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            await fetchCategories(catAction, action);
        }

        async function fetchCategories(catAction, streamAction) {
            const container = document.getElementById('catsWrapper');
            try {
                const res = await fetch(`${API.base}/player_api.php?username=${API.user}&password=${API.pass}&action=${catAction}`);
                const cats = await res.json();
                container.innerHTML = `<button onclick="fetchContent('${streamAction}', 'all', this)" class="cat-btn active">الكل</button>`;
                cats.forEach(cat => {
                    const b = document.createElement('button');
                    b.className = "cat-btn"; b.innerText = cat.category_name;
                    b.onclick = (e) => {
                        document.querySelectorAll('.cat-btn').forEach(x => x.classList.remove('active'));
                        e.target.classList.add('active');
                        fetchContent(streamAction, cat.category_id);
                    };
                    container.appendChild(b);
                });
                fetchContent(streamAction, 'all');
            } catch(e) { container.innerHTML = "Error"; }
        }

        async function fetchContent(action, catId) {
            const grid = document.getElementById('contentGrid');
            grid.innerHTML = '<div class="col-span-full text-center py-20 opacity-40">...</div>';
            let url = `${API.base}/player_api.php?username=${API.user}&password=${API.pass}&action=${action}`;
            if(catId !== 'all') url += `&category_id=${catId}`;
            try {
                const res = await fetch(url);
                fullData = await res.json();
                displayedCount = 42;
                renderItems();
            } catch(e) { grid.innerHTML = "Error"; }
        }

        function renderItems() {
            const grid = document.getElementById('contentGrid');
            const list = fullData.slice(0, displayedCount);
            grid.innerHTML = list.map(item => `
                <div onclick="playStream('${item.stream_id || item.series_id || item.vod_id}', '${item.container_extension || 'm3u8'}')" class="media-card">
                    <img src="${item.stream_icon || item.cover || 'https://via.placeholder.com/150'}" class="media-logo" loading="lazy">
                    <p class="media-title">${item.name}</p>
                </div>
            `).join('');
            document.getElementById('loadMore').style.display = fullData.length > displayedCount ? 'block' : 'none';
        }

        function renderMore() { displayedCount += 42; renderItems(); }

        function playStream(id, ext) {
            let type = (currentMode === 'get_live_streams') ? "live" : (currentMode === 'get_vod_streams' ? "movie" : "series");
            let format = (currentMode === 'get_live_streams') ? "m3u8" : (ext || "mp4");
            const streamUrl = `${API.base}/${type}/${API.user}/${API.pass}/${id}.${format}`;
            hls.stopLoad(); hls.detachMedia(); video.pause(); 
            if (format === 'm3u8' && Hls.isSupported()) {
                hls.loadSource(streamUrl); hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
            } else { video.src = streamUrl; video.play().catch(e => {}); }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        document.getElementById('searchBar').oninput = (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = fullData.filter(i => i.name.toLowerCase().includes(val));
            const grid = document.getElementById('contentGrid');
            grid.innerHTML = filtered.slice(0, 42).map(item => `
                <div onclick="playStream('${item.stream_id || item.series_id}', 'm3u8')" class="media-card">
                    <img src="${item.stream_icon || item.cover}" class="media-logo" loading="lazy">
                    <p class="media-title">${item.name}</p>
                </div>
            `).join('');
        };

        window.onscroll = () => {
            const btn = document.getElementById("backToTop");
            if (window.scrollY > 400) btn.classList.add('show');
            else btn.classList.remove('show');
        };

        document.getElementById('year').textContent = new Date().getFullYear();
        window.onload = () => switchMode('get_live_streams', 'get_live_categories', document.querySelector('.mode-btn'));
