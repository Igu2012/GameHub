(function (global) {
  'use strict';

  const providerHosts = {
    vercel: {
      gamefiles01: 'https://gamefiles01.vercel.app',
      gamefiles02: 'https://gamefiles02.vercel.app',
      gamefiles03: 'https://gamefiles03.vercel.app'
    },
    render: {
      gamefiles01: 'https://gamefiles01.onrender.com',
      gamefiles02: 'https://gamefiles02.onrender.com',
      gamefiles03: 'https://gamefiles03.onrender.com'
    }
  };

  const repositoryByGame = {
    HollowKnightSilksong: 'gamefiles01', Cuphead: 'gamefiles01', Balatro: 'gamefiles01',
    CookieClicker: 'gamefiles01', BaldiRemastered: 'gamefiles01', SoccerRandom: 'gamefiles01',
    RocketGoal: 'gamefiles01', BasketRandom: 'gamefiles01', VolleyRandom: 'gamefiles01',
    FootballLegends: 'gamefiles01', BoxingRandom: 'gamefiles01', Fnaf_4: 'gamefiles01',
    HollowKnight: 'gamefiles02', Celeste: 'gamefiles02', Fnaf_Sister_Location: 'gamefiles02',
    GettingOverIt: 'gamefiles02', Granny1: 'gamefiles02', BuckshotRoulette: 'gamefiles02', Undertale: 'gamefiles02',
    Fnaf_1: 'gamefiles03', Fnaf_2: 'gamefiles03', Fnaf_3: 'gamefiles03', Fnaf_Ultimate_Custom_Night: 'gamefiles03', ADGAC: 'gamefiles03',
    Repo: 'gamefiles03', Granny2: 'gamefiles03', Funkin: 'gamefiles03', GeometryDash: 'gamefiles03',
    PvZ: 'gamefiles03', 20MinutesTillDawn: 'gamefiles03', SubwaySurfers: 'gamefiles03', HappyWheels: 'gamefiles03',
    LevelDevil: 'gamefiles03', Minecraft: 'gamefiles03', CrazyCattle3D: 'gamefiles03', Doom: 'gamefiles03',
    BadPiggies: 'gamefiles03', SnailBob: 'gamefiles03', SnailBob2: 'gamefiles03', SnailBob3: 'gamefiles03',
    SnailBob4: 'gamefiles03', SnailBob5: 'gamefiles03', SnailBob6: 'gamefiles03', SnailBob7: 'gamefiles03',
    SnailBob8: 'gamefiles03', PapasPizzeria: 'gamefiles03', PapasFreezeria: 'gamefiles03', PapasBurgeria: 'gamefiles03',
    PapasPastaria: 'gamefiles03', AngryBirds1: 'gamefiles03', Bloxorz: 'gamefiles03', TheRightMix: 'gamefiles03',
    DuckLife1: 'gamefiles03', DuckLife2: 'gamefiles03', DuckLife3: 'gamefiles03', DuckLife4: 'gamefiles03',
    DuckLife5: 'gamefiles03', FireboyAndWatergirl: 'gamefiles03', FireboyAndWatergirl2: 'gamefiles03',
    FireboyAndWatergirl3: 'gamefiles03', FireboyAndWatergirl4: 'gamefiles03', FireboyAndWatergirl5: 'gamefiles03',
    FireboyAndWatergirl6: 'gamefiles03', TankTrouble: 'gamefiles03', Wrassling: 'gamefiles03', BadIceCream: 'gamefiles03',
    BasketballLegends: 'gamefiles03', ClassicPoolGame: 'gamefiles03', Foosball: 'gamefiles03', MotoX3M: 'gamefiles03',
    MotoX3M2: 'gamefiles03', MotoX3MPoolParty: 'gamefiles03', MotoX3MSpookyLand: 'gamefiles03', MotoX3MWinter: 'gamefiles03'
  };

  function currentProvider() {
    const hostname = String(global.location && global.location.hostname || '').toLowerCase();
    if (hostname.endsWith('.onrender.com') || hostname.includes('render')) return 'render';
    return 'vercel';
  }

  function gameKey(link) {
    return String(link || '').replace(/^\/+|\/+$/g, '').split('/')[0];
  }

  function repositoryFor(link) {
    return repositoryByGame[gameKey(link)] || 'gamefiles03';
  }

  function gameAssetUrl(link, relativePath) {
    const provider = currentProvider();
    const repository = repositoryFor(link);
    const root = providerHosts[provider][repository];
    const game = gameKey(link);
    const relative = String(relativePath || 'index.html').replace(/^\/+/, '');
    return `${root}/${game}/${relative}`;
  }

  function gamePageUrl(link) {
    const game = gameKey(link);
    return `play.html?game=${encodeURIComponent(game)}`;
  }

  global.GameHubAssets = { currentProvider, gameKey, repositoryFor, gameAssetUrl, gamePageUrl, providerHosts, repositoryByGame };
})(window);
