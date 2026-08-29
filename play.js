(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const gameKey = params.get('game') || '';
  const requestedVersion = params.get('version') || '';
  const titleEl = document.getElementById('gamePageTitle');
  const subtitleEl = document.getElementById('gamePageSubtitle');
  const cover = document.getElementById('gameCover');
  const coverImage = document.getElementById('gameCoverImage');
  const coverTitle = document.getElementById('gameCoverTitle');
  const stage = document.getElementById('gameStage');
  const showcase = document.getElementById('gameShowcase');
  const frame = document.getElementById('gameFrame');
  const status = document.getElementById('gameStatus');
  const playButton = document.getElementById('playButton');
  const minecraftChooser = document.getElementById('minecraftChooser');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const playerControls = document.getElementById('playerControls');
  const relatedSection = document.getElementById('relatedSection');
  const relatedGames = document.getElementById('relatedGames');

  let currentGame = null;
  let selectedVersion = requestedVersion;

  function keyFor(link) {
    return GameHubAssets.gameKey(link);
  }

  function assetPath(game, filename) {
    return String(game.ImageURL || '').startsWith('img/')
      ? game.ImageURL
      : GameHubAssets.gameAssetUrl(game.Link, filename || String(game.ImageURL || '').split('/').pop());
  }

  function setIcon(game) {
    const icon = document.querySelector('link[rel="icon"]');
    if (!icon) return;
    const path = game.Favicon || 'favicon.png';
    GameHubAssets.resolveGameAssetUrl(game.Link, path).then(function (url) {
      icon.href = url + (url.includes('?') ? '&' : '?') + 'v=5';
    }).catch(function () {});
  }

  function isMobileDevice() {
    return window.matchMedia('(max-width: 680px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function requestFullscreen() {
    const request = showcase.requestFullscreen || showcase.webkitRequestFullscreen || showcase.mozRequestFullScreen || showcase.msRequestFullscreen;
    if (request && !document.fullscreenElement && !document.webkitFullscreenElement) Promise.resolve(request.call(showcase)).catch(function () {});
  }

  function requestMobileFullscreen() {
    if (isMobileDevice()) requestFullscreen();
  }

  function showError(message) {
    status.textContent = message;
    status.classList.remove('is-hidden');
    status.classList.add('error');
  }

  function loadCover(game) {
    coverTitle.textContent = game.Name;
    coverImage.alt = game.Name;
    const imagePath = String(game.ImageURL || '').startsWith('img/') ? game.ImageURL : String(game.ImageURL || '').split('/').pop();
    const applyImage = function (url) {
      coverImage.src = url;
      cover.style.setProperty('--cover-image', 'url("' + url.replace(/"/g, '\\"') + '")');
    };
    if (imagePath.startsWith('img/')) {
      applyImage(imagePath);
      return;
    }
    GameHubAssets.resolveGameAssetUrl(game.Link, imagePath).then(applyImage).catch(function () {
      coverImage.removeAttribute('src');
    });
  }

  function versionPathForGame(game) {
    if (keyFor(game.Link) !== 'Minecraft') return 'index.html';
    const allowed = new Set(['1.5.2.html', '1.8.8.html', '1.12.2.html']);
    return allowed.has(selectedVersion) ? selectedVersion : '';
  }

  function renderRelated(catalog, activeCategory) {
    const candidates = (activeCategory.games || []).filter(function (game) {
      return keyFor(game.Link) !== gameKey;
    }).slice(0, 6);
    if (!candidates.length) return;
    relatedGames.innerHTML = candidates.map(function (game) {
      const filename = String(game.ImageURL || '').split('/').pop();
      const source = String(game.ImageURL || '').startsWith('img/') ? game.ImageURL : GameHubAssets.gameAssetUrl(game.Link, filename);
      return '<a class="related-card" href="play.html?game=' + encodeURIComponent(keyFor(game.Link)) + '"><img src="' + source + '" alt="' + game.Name.replace(/"/g, '&quot;') + '" loading="lazy"><span>' + game.Name + '</span></a>';
    }).join('');
    relatedSection.hidden = false;
  }

  function startGame() {
    if (!currentGame) return;
    const path = versionPathForGame(currentGame);
    if (keyFor(currentGame.Link) === 'Minecraft' && !path) {
      playButton.hidden = true;
      minecraftChooser.hidden = false;
      return;
    }
    if (isMobileDevice()) requestMobileFullscreen();
    cover.style.display = 'none';
    stage.classList.add('is-active');
    playerControls.hidden = false;
    status.textContent = 'Loading game...';
    status.classList.remove('is-hidden', 'error');
    GameHubAssets.resolveGameAssetUrl(currentGame.Link, path).then(function (url) {
      frame.src = url;
      frame.addEventListener('load', function () { status.classList.add('is-hidden'); }, { once: true });
      if (keyFor(currentGame.Link) === 'Minecraft' && path !== 'index.html') {
        titleEl.textContent = currentGame.Name + ' ' + path.replace('.html', '');
        document.title = titleEl.textContent + ' - GameHub';
      }
    }).catch(function () { showError('Unable to load the game.'); });
  }

  fullscreenButton.addEventListener('click', requestFullscreen);
  frame.addEventListener('pointerdown', requestMobileFullscreen);
  frame.addEventListener('touchstart', requestMobileFullscreen, { passive: true });
  window.addEventListener('orientationchange', function () { window.setTimeout(requestMobileFullscreen, 120); });
  window.addEventListener('blur', function () { window.setTimeout(requestMobileFullscreen, 120); });

  cover.addEventListener('click', function (event) {
    if (event.target.closest('#minecraftChooser')) return;
    if (!playButton.hidden) startGame();
  });
  playButton.addEventListener('click', startGame);
  minecraftChooser.querySelectorAll('[data-version]').forEach(function (button) {
    button.addEventListener('click', function () {
      selectedVersion = button.getAttribute('data-version');
      minecraftChooser.hidden = true;
      startGame();
    });
  });

  if (!gameKey || !window.GameHubAssets) {
    showError('Game not found.');
    return;
  }

  fetch('games.json', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('catalog');
      return response.json();
    })
    .then(function (catalog) {
      let activeCategory = null;
      catalog.categories.some(function (category) {
        currentGame = category.games.find(function (candidate) { return keyFor(candidate.Link) === gameKey; }) || null;
        if (currentGame) activeCategory = category;
        return Boolean(currentGame);
      });
      if (!currentGame) throw new Error('game');
      titleEl.textContent = currentGame.Name;
      document.title = currentGame.Name + ' - GameHub';
      subtitleEl.textContent = 'Play instantly in GameHub';
      setIcon(currentGame);
      loadCover(currentGame);
      renderRelated(catalog, activeCategory);
    })
    .catch(function () { showError('Unable to load this game.'); });
})();
