let gamesData = [];
let currentCategory = 'all';

// Ano no rodapé
const yearSpan = document.getElementById('footerYear');
if (yearSpan) yearSpan.textContent = `GAMEHUB © ${new Date().getFullYear()}`;

// Carregar jogos
fetch('games.json')
    .then(res => res.json())
    .then(data => {
        gamesData = data.categories;
        initCategories();
        renderGames('all');
    })
    .catch(err => console.error('Erro ao carregar jogos:', err));

function initCategories() {
    const nav = document.getElementById('categoriesNav');
    if (!nav) return;
    
    nav.innerHTML = '';
    
    // Botão "Todos"
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'Todos';
    allBtn.onclick = () => filterCategory('all', allBtn);
    nav.appendChild(allBtn);
    
    // Botões das categorias
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
    
    section.innerHTML = `
        <h2 class="category-title">${cat.name}</h2>
        <div class="games-grid"></div>
    `;
    
    const grid = section.querySelector('.games-grid');
    cat.games.forEach(game => {
        const card = document.createElement('a');
        card.href = game.Link;
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-card-image">
                <img src="${game.ImageURL}" alt="${game.Name}" loading="lazy">
            </div>
            <div class="game-card-content">
                <div class="game-card-name">${game.Name}</div>
                ${game.MobileFriendly ? '<img src="img/mobile-icon.webp" class="mobile-icon" alt="Mobile">' : ''}
            </div>
        `;
        grid.appendChild(card);
    });
    
    container.appendChild(section);
}

// Busca simples
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

// Logo volta para o início
document.getElementById('logoLink').onclick = () => {
    const allBtn = document.querySelector('.category-btn');
    if (allBtn) allBtn.click();
};
