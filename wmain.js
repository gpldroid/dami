// إعدادات الـ API - الآن نوجه الطلبات لملف الـ PHP الخاص بك
const API_CONFIG = {
    proxyUrl: "api_proxy.php", // رابط ملف الـ PHP الذي أنشأناه
    serverBase: "http://ottpro.iptvpro2.com:8789" // سنحتاجه فقط لروابط الفيديو المباشرة
};

const player = new Plyr('#player');
const video = document.getElementById('player');
const hls = new Hls();

let fullData = [];
let displayedCount = 42;
let currentMode = 'get_live_streams';

// دالة جلب البيانات من الوسيط PHP
async function fetchData(action, extraParams = {}) {
    const queryString = new URLSearchParams({ action, ...extraParams }).toString();
    try {
        const response = await fetch(`${API_CONFIG.proxyUrl}?${queryString}`);
        if (!response.ok) throw new Error("Network error");
        return await response.json();
    } catch (e) {
        console.error("Fetch Error:", e);
        return null;
    }
}

// تبديل الأوضاع (مباشر، أفلام، مسلسلات)
async function switchMode(action, catAction, btn) {
    currentMode = action;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const catsWrapper = document.getElementById('catsWrapper');
    catsWrapper.innerHTML = '<div class="text-xs opacity-50 px-2">جاري التحديث...</div>';
    
    const cats = await fetchData(catAction);
    
    if (cats && Array.isArray(cats)) {
        let html = `<button onclick="fetchContent('${action}', 'all', this)" class="cat-btn active">الكل</button>`;
        cats.forEach(cat => {
            html += `<button onclick="updateCategoryUI(this); fetchContent('${action}', '${cat.category_id}')" class="cat-btn">${cat.category_name}</button>`;
        });
        catsWrapper.innerHTML = html;
        fetchContent(action, 'all');
    }
}

function updateCategoryUI(btn) {
    document.querySelectorAll('.cat-btn').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
}

async function fetchContent(action, catId) {
    const grid = document.getElementById('contentGrid');
    grid.style.opacity = "0.5";
    
    const params = catId !== 'all' ? { category_id: catId } : {};
    const data = await fetchData(action, params);
    
    grid.style.opacity = "1";
    if (data) {
        fullData = data;
        displayedCount = 42;
        renderItems();
    }
}

function renderItems() {
    const grid = document.getElementById('contentGrid');
    const list = fullData.slice(0, displayedCount);
    
    grid.innerHTML = list.map(item => `
        <div onclick="playStream('${item.stream_id || item.series_id || item.vod_id}', '${item.container_extension || 'm3u8'}')" class="media-card">
            <img src="${item.stream_icon || item.cover || 'https://via.placeholder.com/150'}" 
                 class="media-logo" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/150';">
            <p class="media-title">${item.name}</p>
        </div>
    `).join('');
    
    document.getElementById('loadMore').style.display = fullData.length > displayedCount ? 'block' : 'none';
}

// دالة تشغيل البث
function playStream(id, ext) {
    // هنا نستخدم البيانات الأصلية للسيرفر لأن الفيديو يشتغل برابط مباشر
    const user = "Oujakr12";
    const pass = "87593226";
    
    let type = (currentMode === 'get_live_streams') ? "live" : (currentMode === 'get_vod_streams' ? "movie" : "series");
    let format = (currentMode === 'get_live_streams') ? "m3u8" : (ext || "mp4");
    
    const streamUrl = `${API_CONFIG.serverBase}/${type}/${user}/${pass}/${id}.${format}`;
    
    if (hls) hls.destroy();
    
    if (format === 'm3u8' && Hls.isSupported()) {
        const newHls = new Hls();
        newHls.loadSource(streamUrl);
        newHls.attachMedia(video);
        newHls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        video.src = streamUrl;
        video.play().catch(e => console.warn("Playback failed", e));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// تهيئة الصفحة عند التحميل
window.onload = () => {
    const firstBtn = document.querySelector('.mode-btn');
    if(firstBtn) switchMode('get_live_streams', 'get_live_categories', firstBtn);
};
