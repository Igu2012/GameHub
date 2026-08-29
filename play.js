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
  const stageFullscreenButton = document.getElementById('stageFullscreenButton');
  const backButton = document.getElementById('backButton');
  const stageBackButton = document.getElementById('stageBackButton');
  const backLink = document.getElementById('backToGameHub');

  let currentGame = null;
  let currentVersionPath = '';
  let selectedVersion = requestedVersion;

  function setIcon(gameLink) {
    const icon = document.querySelector('link[rel="icon"]');
    if (!icon) return;
    function cacheBusted(url) {
      const separator = url.indexOf('?') >= 0 ? '&' : '?';
      return url + separator + 'gameIcon=' + encodeURIComponent(gameKey) + '&v=4';
    }
    function tryIcon(path, fallback) {
      GameHubAssets.resolveGameAssetUrl(gameLink, path).then(function (url) {
        const probe = new Image();
        probe.onload = function () { icon.href = cacheBusted(url); };
        probe.onerror = function () {
          if (fallback) tryIcon(fallback, null);
        };
        probe.src = cacheBusted(url);
      }).catch(function () {
        if (fallback) tryIcon(fallback, null);
      });
    }
    tryIcon('favicon.png', 'favicon.ico');
  }

  function exitToHub() {
    if (window.history.length > 1) window.history.back();
    else window.location.assign('./');
  }

  function requestFullscreen() {
    const target = showcase;
    const request = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen || target.msRequestFullscreen;
    if (request) Promise.resolve(request.call(target)).catch(function () {});
  }

  function showError(message) {
    status.textContent = message;
    status.classList.remove('is-hidden');
    status.classList.add('error');
    titleEl.textContent = currentGame ? currentGame.Name : 'GameHub';
    document.title = currentGame ? currentGame.Name + ' - GameHub' : 'GameHub';
  }

  function imagePathFromCatalog(game) {
    const imageUrl = String(game.ImageURL || '');
    return imageUrl.startsWith('img/') ? imageUrl : imageUrl.split('/').pop();
  }

  function loadCover(game) {
    coverTitle.textContent = game.Name;
    coverImage.alt = game.Name;
    const imagePath = imagePathFromCatalog(game);
    if (imagePath.startsWith('img/')) {
      coverImage.src = imagePath;
      return;
    }
    GameHubAssets.resolveGameAssetUrl(game.Link, imagePath)
      .then(function (url) { coverImage.src = url; })
      .catch(function () { coverImage.removeAttribute('src'); });
  }

  function versionPathForGame(game) {
    if (GameHubAssets.gameKey(game.Link) !== 'Minecraft') return 'index.html';
    const allowed = new Set(['1.5.2.html', '1.8.8.html', '1.12.2.html']);
    return allowed.has(selectedVersion) ? selectedVersion : '' ;
  }

  function startGame() {
    if (!currentGame) return;
    currentVersionPath = versionPathForGame(currentGame);
    if (GameHubAssets.gameKey(currentGame.Link) === 'Minecraft' && !currentVersionPath) return;
    cover.style.display = 'none';
    stage.classList.add('is-active');
    status.textContent = 'Loading game...';
    status.classList.remove('is-hidden', 'error');
    GameHubAssets.resolveGameAssetUrl(currentGame.Link, currentVersionPath)
      .then(function (url) {
        frame.src = url;
        frame.addEventListener('load', function () {
          status.classList.add('is-hidden');
        }, { once: true });
        if (GameHubAssets.gameKey(currentGame.Link) === 'Minecraft' && currentVersionPath !== 'index.html') {
          titleEl.textContent = currentGame.Name + ' ' + currentVersionPath.replace('.html', '');
          document.title = titleEl.textContent + ' - GameHub';
        }
        // This is intentionally the only automatic fullscreen request: it follows the Play click.
        if (window.matchMedia('(max-width: 680px)').matches) requestFullscreen();
      })
      .catch(function () { showError('Unable to reach the game host.'); });
  }

  [fullscreenButton, stageFullscreenButton].forEach(function (button) {
    button.addEventListener('click', requestFullscreen);
  });
  [backButton, stageBackButton].forEach(function (button) {
    button.addEventListener('click', exitToHub);
  });
  backLink.addEventListener('click', function (event) {
    event.preventDefault();
    exitToHub();
  });
  playButton.addEventListener('click', function () {
    if (currentGame && GameHubAssets.gameKey(currentGame.Link) === 'Minecraft' && !selectedVersion) {
      playButton.hidden = true;
      minecraftChooser.hidden = false;
      return;
    }
    startGame();
  });
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
      catalog.categories.some(function (category) {
        currentGame = category.games.find(function (candidate) {
          return GameHubAssets.gameKey(candidate.Link) === gameKey;
        }) || null;
        return Boolean(currentGame);
      });
      if (!currentGame) throw new Error('game');
      titleEl.textContent = currentGame.Name;
      document.title = currentGame.Name + ' - GameHub';
      subtitleEl.textContent = GameHubAssets.gameKey(currentGame.Link) === 'Minecraft' && requestedVersion
        ? 'Minecraft ' + requestedVersion.replace('.html', '')
        : 'Play instantly in GameHub';
      setIcon(currentGame.Link);
      loadCover(currentGame);
    })
    .catch(function () { showError('Unable to load this game.'); });
})();
