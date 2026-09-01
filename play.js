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
  const mobileGate = document.getElementById('mobileGate');
  const mobileGateImage = document.getElementById('mobileGateImage');
  const stage = document.getElementById('gameStage');
  const showcase = document.getElementById('gameShowcase');
  const frame = document.getElementById('gameFrame');
  const status = document.getElementById('gameStatus');
  const playButton = document.getElementById('playButton');
  const minecraftChooser = document.getElementById('minecraftChooser');
  const mobileMinecraftChooser = document.getElementById('mobileMinecraftChooser');
  const mobileGateMessage = document.getElementById('mobileGateMessage');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const playerControls = document.getElementById('playerControls');
  const relatedSection = document.getElementById('relatedSection');
  const relatedGames = document.getElementById('relatedGames');

  let currentGame = null;
  let selectedVersion = requestedVersion;
  let mobileStartRequested = false;
  let gameStarted = false;
  let frameReady = false;
  const embeddedLoadingGames = new Set(['Granny2', 'HollowKnight', 'HollowKnightSilksong', 'Celeste']);

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
    const configured = String(game.Favicon || '').trim();
    const candidates = configured ? [configured] : ['favicon.ico', 'favicon.png'];
    function tryCandidate(index) {
      if (index >= candidates.length) return;
      GameHubAssets.resolveGameAssetUrl(game.Link, candidates[index]).then(function (url) {
        const probe = new Image();
        probe.onload = function () {
          icon.href = url + (url.includes('?') ? '&' : '?') + 'v=6';
        };
        probe.onerror = function () { tryCandidate(index + 1); };
        probe.src = url + (url.includes('?') ? '&' : '?') + 'probe=1';
      }).catch(function () { tryCandidate(index + 1); });
    }
    tryCandidate(0);
  }

  function isMobileDevice() {
    return window.matchMedia('(max-width: 680px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isFullscreen() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }

  function requestFullscreen() {
    const request = showcase.requestFullscreen || showcase.webkitRequestFullscreen || showcase.mozRequestFullScreen || showcase.msRequestFullscreen;
    if (!request || isFullscreen()) return Promise.resolve(false);
    try {
      return Promise.resolve(request.call(showcase)).then(function () { return true; }).catch(function () { return false; });
    } catch (error) {
      return Promise.resolve(false);
    }
  }

  function requestMobileFullscreen() {
    if (!isMobileDevice()) return Promise.resolve(false);
    return requestFullscreen().then(function (entered) {
      if (screen.orientation && screen.orientation.lock) {
        return screen.orientation.lock('landscape').catch(function () { return entered; }).then(function () { return entered; });
      }
      return entered;
    });
  }

  function showMobileGate() {
    if (!isMobileDevice()) return;
    mobileGate.hidden = false;
    const isMinecraft = currentGame && keyFor(currentGame.Link) === 'Minecraft';
    const hasMinecraftChooser = Boolean(isMinecraft && !selectedVersion);
    mobileGate.classList.toggle('is-minecraft-chooser', hasMinecraftChooser);
    showcase.classList.toggle('has-minecraft-chooser', hasMinecraftChooser);
    if (isMinecraft) {
      mobileGateMessage.textContent = selectedVersion ? 'Rotate your phone or tap to play' : 'Choose a Minecraft version first';
      mobileMinecraftChooser.hidden = Boolean(selectedVersion);
    }
    showcase.classList.remove('is-fullscreen-mobile');
    stage.classList.remove('is-active');
    playerControls.hidden = true;
  }

  function hideMobileGate() {
    mobileGate.hidden = true;
    showcase.classList.add('is-fullscreen-mobile');
  }

  function showResumeGate() {
    mobileGate.hidden = false;
    mobileGate.classList.remove('is-minecraft-chooser');
    showcase.classList.remove('has-minecraft-chooser');
    mobileGateMessage.textContent = 'Tap to return to fullscreen';
    mobileMinecraftChooser.hidden = true;
    showcase.classList.remove('is-fullscreen-mobile');
    playerControls.hidden = false;
  }

  function restoreAfterFullscreenExit() {
    if (!gameStarted) {
      if (isMobileDevice()) showMobileGate();
      return;
    }
    mobileStartRequested = false;
    if (isMobileDevice()) showResumeGate();
  }

  function showError(message) {
    status.textContent = message;
    status.classList.remove('is-hidden', 'is-loading');
    status.classList.add('error');
  }

  function handleEmbeddedGameMessage(event) {
    if (!frame.contentWindow || event.source !== frame.contentWindow) return;
    const payload = event.data || {};
    if (payload.gamehub !== 'game-status') return;
    if (payload.state === 'ready') {
      frameReady = true;
      status.classList.remove('is-loading', 'error');
      status.classList.add('is-hidden');
      return;
    }
    if (payload.state === 'error') {
      showError(payload.message || 'Unable to load the game.');
    }
  }

  function loadCover(game) {
    coverTitle.textContent = game.Name;
    coverImage.alt = game.Name;
    const imagePath = String(game.ImageURL || '').startsWith('img/') ? game.ImageURL : String(game.ImageURL || '').split('/').pop();
    const applyImage = function (url) {
      coverImage.src = url;
      mobileGateImage.src = url;
      mobileGateImage.alt = game.Name;
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
    });
    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const temporary = candidates[index];
      candidates[index] = candidates[randomIndex];
      candidates[randomIndex] = temporary;
    }
    const selectedGames = candidates.slice(0, 6);
    if (!selectedGames.length) return;
    relatedGames.innerHTML = selectedGames.map(function (game) {
      const filename = String(game.ImageURL || '').split('/').pop();
      const source = String(game.ImageURL || '').startsWith('img/') ? game.ImageURL : GameHubAssets.gameAssetUrl(game.Link, filename);
      return '<a class="related-card" href="play.html?game=' + encodeURIComponent(keyFor(game.Link)) + '"><img src="' + source + '" alt="' + game.Name.replace(/"/g, '&quot;') + '" loading="lazy"><span>' + game.Name + '</span></a>';
    }).join('');
    relatedSection.hidden = false;
  }

  function launchGame() {
    if (gameStarted || !currentGame) return;
    const path = versionPathForGame(currentGame);
    const activeGameKey = keyFor(currentGame.Link);
    const hasEmbeddedLoading = embeddedLoadingGames.has(activeGameKey);
    cover.style.display = 'none';
    stage.classList.add('is-active');
    playerControls.hidden = false;
    frameReady = false;
    status.textContent = hasEmbeddedLoading ? 'Loading game files...' : 'Loading game...';
    status.classList.remove('is-hidden', 'error');
    status.classList.toggle('is-loading', hasEmbeddedLoading);
    gameStarted = true;
    GameHubAssets.resolveGameAssetUrl(currentGame.Link, path).then(function (url) {
      frame.addEventListener('load', function () {
        if (hasEmbeddedLoading && !frameReady) {
          status.textContent = 'Loading game files...';
          return;
        }
        status.classList.add('is-hidden');
      }, { once: true });
      const frameUrl = activeGameKey === 'CookieClicker'
        ? url + (url.includes('?') ? '&' : '?') + 'gamehub=1'
        : url;
      frame.src = frameUrl;
      if (activeGameKey === 'Minecraft' && path !== 'index.html') {
        titleEl.textContent = currentGame.Name + ' ' + path.replace('.html', '');
        document.title = titleEl.textContent + ' - GameHub';
      }
    }).catch(function () { showError('Unable to load the game.'); });
  }

  function startGame() {
    if (!currentGame) return;
    const path = versionPathForGame(currentGame);
    if (keyFor(currentGame.Link) === 'Minecraft' && !path) {
      playButton.hidden = true;
      minecraftChooser.hidden = false;
      return;
    }
    if (isMobileDevice()) {
      if (keyFor(currentGame.Link) === 'Minecraft' && !selectedVersion) {
        mobileGateMessage.textContent = 'Choose a Minecraft version first';
        mobileGate.classList.add('is-minecraft-chooser');
        showcase.classList.add('has-minecraft-chooser');
        mobileMinecraftChooser.hidden = false;
        return;
      }
      mobileStartRequested = true;
      launchGame();
      requestMobileFullscreen();
      return;
    }
    launchGame();
  }

  window.addEventListener('message', handleEmbeddedGameMessage);
  fullscreenButton.addEventListener('click', function () {
    if (isMobileDevice() && !gameStarted) {
      startGame();
      return;
    }
    requestFullscreen();
  });
  mobileGate.addEventListener('click', function (event) {
    if (event.target.closest('[data-minecraft-version]')) return;
    if (keyFor(currentGame.Link) === 'Minecraft' && !selectedVersion) {
      mobileGateMessage.textContent = 'Choose a Minecraft version first';
      mobileMinecraftChooser.hidden = false;
      return;
    }
    mobileStartRequested = true;
    if (!gameStarted) launchGame();
    requestMobileFullscreen();
  });
  frame.addEventListener('pointerdown', requestMobileFullscreen);
  frame.addEventListener('touchstart', requestMobileFullscreen, { passive: true });
  let orientationTimer = 0;
  let landscapeAutoHandled = false;
  function isLandscapeOrientation() {
    return window.matchMedia('(orientation: landscape)').matches || window.innerWidth > window.innerHeight;
  }
  function startOnLandscape() {
    if (!isMobileDevice()) return;
    if (!isLandscapeOrientation()) {
      landscapeAutoHandled = false;
      return;
    }
    if (!currentGame || landscapeAutoHandled) return;
    landscapeAutoHandled = true;
    window.clearTimeout(orientationTimer);
    orientationTimer = window.setTimeout(function () {
      if (keyFor(currentGame.Link) === 'Minecraft' && !selectedVersion) {
        mobileGateMessage.textContent = 'Choose a Minecraft version first';
        mobileGate.classList.add('is-minecraft-chooser');
        showcase.classList.add('has-minecraft-chooser');
        mobileMinecraftChooser.hidden = false;
        return;
      }
      mobileStartRequested = true;
      if (!gameStarted) launchGame();
      requestMobileFullscreen();
    }, 180);
  }
  window.addEventListener('orientationchange', startOnLandscape);
  window.addEventListener('resize', startOnLandscape);
  if (screen.orientation) screen.orientation.addEventListener('change', startOnLandscape);
  document.addEventListener('fullscreenchange', function () {
    if (isFullscreen()) {
      if (isMobileDevice()) hideMobileGate();
      if (mobileStartRequested && !gameStarted) launchGame();
    } else {
      restoreAfterFullscreenExit();
    }
  });
  document.addEventListener('webkitfullscreenchange', function () {
    document.dispatchEvent(new Event('fullscreenchange'));
  });

  cover.addEventListener('click', function (event) {
    if (event.target.closest('#minecraftChooser')) return;
    if (!playButton.hidden) startGame();
  });
  playButton.addEventListener('click', startGame);
  document.querySelectorAll('[data-minecraft-version]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      selectedVersion = button.getAttribute('data-minecraft-version');
      minecraftChooser.hidden = true;
      mobileMinecraftChooser.hidden = true;
      mobileGate.classList.remove('is-minecraft-chooser');
      showcase.classList.remove('has-minecraft-chooser');
      if (isMobileDevice()) {
        mobileGateMessage.textContent = 'Rotate your phone or tap to play';
        mobileStartRequested = true;
        if (!gameStarted) launchGame();
        requestMobileFullscreen();
      } else {
        startGame();
      }
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
      if (isMobileDevice()) {
        showMobileGate();
        startOnLandscape();
      }
      renderRelated(catalog, activeCategory);
    })
    .catch(function () { showError('Unable to load this game.'); });
})();
