let gamesData = [];
let currentCategory = 'all';
let popularGameSlugs = new Set();

function getAnonymousSessionId() {
    const key = 'gamehub_analytics_session';
    try {
        let value = localStorage.getItem(key);
        if (!value) {
            value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem(key, value);
        }
        return value;
    } catch (error) {
        return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    }
}

function trackAnalyticsEvent(eventType, gameSlug) {
    const payload = JSON.stringify({ eventType, gameSlug, sessionId: getAnonymousSessionId() });
    fetch('/api/analytics', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        keepalive: true
    }).catch(() => {});
}

function gameSlugFromLink(link) {
    return String(link || '').replace(/^\.?\//, '').split('/')[0];
}

async function loadPopularGames() {
    try {
        const response = await fetch('/api/top-games', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        popularGameSlugs = new Set((data.games || []).map((game) => game.gameSlug).filter(Boolean));
    } catch (error) {
        popularGameSlugs = new Set();
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const yearSpan = document.getElementById('footerYear');
    if (yearSpan) yearSpan.textContent = `GAMEHUB © ${new Date().getFullYear()}`;

    trackAnalyticsEvent('site_view');
    await Promise.all([
        loadPopularGames(),
        fetch('games.json')
            .then(res => res.json())
            .then(data => { gamesData = data.categories; })
            .catch(err => console.error('Error:', err))
    ]);

    if (gamesData.length) {
        initCategories();
        renderGames('all');
    }
});

function initCategories() {
    const nav = document.getElementById('categoriesNav');
    if (!nav) return;
    nav.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => filterCategory('all', allBtn);
    nav.appendChild(allBtn);

    gamesData.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat.name;
        btn.onclick = () => filterCategory(cat.id, btn);
        nav.appendChild(btn);
    });
}

function filterCategory(id, btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = id;
    document.getElementById('searchInput').value = '';
    renderGames(id);
}

function renderGames(catId) {
    const container = document.getElementById('gamesContainer');
    if (!container) return;
    container.innerHTML = '';

    if (catId === 'all') {
        gamesData.forEach(cat => renderSection(container, cat));
    } else {
        const cat = gamesData.find(c => c.id === catId);
        if (cat) renderSection(container, cat);
    }
}

function renderSection(container, cat) {
    const section = document.createElement('div');
    section.className = 'category-section';

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = cat.name;

    const grid = document.createElement('div');
    grid.className = 'games-grid';

    cat.games.forEach(game => {
        const gameSlug = gameSlugFromLink(game.Link);
        const isPopular = popularGameSlugs.has(gameSlug);
        const card = document.createElement('a');
        card.href = game.Link;
        card.className = `game-card${isPopular ? ' is-popular' : ''}`;
        card.setAttribute('aria-label', `${game.Name}${isPopular ? ' — jogo em alta' : ''}`);
        card.innerHTML = `
            ${isPopular ? '<span class="popular-badge" title="Jogo em alta" aria-label="Jogo em alta">🔥</span>' : ''}
            <div class="game-card-image">
                <img src="${game.ImageURL}" alt="${game.Name}" loading="lazy">
            </div>
            <div class="game-card-content">
                <span class="game-card-name">${game.Name}</span>
                ${game.MobileFriendly ? '<img src="img/mobile-icon.webp" class="mobile-icon" alt="Compatível com celular">' : ''}
            </div>
        `;
        card.addEventListener('click', () => trackAnalyticsEvent('game_open', gameSlug));
        grid.appendChild(card);
    });

    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
}

// Search
document.getElementById('searchInput').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const container = document.getElementById('gamesContainer');
    if (!term) {
        renderGames(currentCategory);
        return;
    }

    container.innerHTML = '';
    gamesData.forEach(cat => {
        const matches = cat.games.filter(g => g.Name.toLowerCase().includes(term));
        if (matches.length > 0) {
            renderSection(container, { name: cat.name, games: matches });
        }
    });
};

// Logo link
document.getElementById('logoLink').onclick = () => {
    location.reload();
};
