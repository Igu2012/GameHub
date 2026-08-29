(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const gameKey = params.get('game') || '';
  const titleEl = document.getElementById('gamePageTitle');
  const frame = document.getElementById('gameFrame');
  const frameWrap = document.getElementById('gameFrameWrap');
  const status = document.getElementById('gameStatus');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const backButton = document.getElementById('backButton');
  const backLink = document.getElementById('backToGameHub');

  function showError(message) {
    status.textContent = message;
    status.classList.add('game-page-error');
    titleEl.textContent = 'GameHub';
    document.title = 'GameHub';
  }

  function setIcon(gameLink) {
    const icon = document.querySelector('link[rel="icon"]');
    if (!icon) return;
    const ico = GameHubAssets.gameAssetUrl(gameLink, 'favicon.ico');
    icon.onerror = function () {
      if (icon.href !== ico) {
        icon.onerror = null;
        icon.href = ico;
      }
    };
    GameHubAssets.resolveGameAssetUrl(gameLink, 'favicon.png')
      .then(function (url) { icon.href = url; })
      .catch(function () { icon.href = ico; });
  }

  function exitToHub() {
    if (window.history.length > 1) window.history.back();
    else window.location.assign('./');
  }

  function requestFullscreen() {
    const target = frame.requestFullscreen ? frame : frameWrap;
    if (target && target.requestFullscreen) target.requestFullscreen().catch(function () {});
  }

  backButton.addEventListener('click', exitToHub);
  backLink.addEventListener('click', function (event) {
    event.preventDefault();
    exitToHub();
  });
  fullscreenButton.addEventListener('click', requestFullscreen);

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
      let game = null;
      catalog.categories.some(function (category) {
        game = category.games.find(function (candidate) {
          return GameHubAssets.gameKey(candidate.Link) === gameKey;
        }) || null;
        return Boolean(game);
      });
      if (!game) throw new Error('game');

      titleEl.textContent = game.Name;
      document.title = game.Name + ' - GameHub';
      frame.title = game.Name;
      setIcon(game.Link);
      GameHubAssets.resolveGameAssetUrl(game.Link, 'index.html')
        .then(function (url) {
          frame.src = url;
          frame.addEventListener('load', function () {
            status.classList.add('is-hidden');
          }, { once: true });
        })
        .catch(function () {
          showError('Unable to reach the game host.');
        });
    })
    .catch(function () {
      showError('Unable to load this game.');
    });
})();
