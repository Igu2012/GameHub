window.PokiSDK = {
    init: function() {
        return new Promise((resolve, reject) => {
            console.log("Mock PokiSDK initialized");
            resolve();
        });
    },
    gameLoadingStart: function() {
        console.log("Mock PokiSDK gameLoadingStart");
    },
    gameLoadingProgress: function(data) {
        // console.log("Mock PokiSDK gameLoadingProgress", data.percentageDone);
    },
    gameLoadingFinished: function() {
        console.log("Mock PokiSDK gameLoadingFinished");
    },
    commercialBreak: function() {
        return new Promise((resolve, reject) => {
            console.log("Mock PokiSDK commercialBreak");
            resolve();
        });
    },
    rewardedBreak: function() {
        return new Promise((resolve, reject) => {
            console.log("Mock PokiSDK rewardedBreak");
            resolve(true);
        });
    },
    displayAd: function() {
        console.log("Mock PokiSDK displayAd");
    },
    destroyAd: function() {
        console.log("Mock PokiSDK destroyAd");
    },
    gameplayStart: function() {
        console.log("Mock PokiSDK gameplayStart");
    },
    gameplayStop: function() {
        console.log("Mock PokiSDK gameplayStop");
    },
    happyTime: function(scale) {
        console.log("Mock PokiSDK happyTime", scale);
    },
    shareEvent: function(data) {
        console.log("Mock PokiSDK shareEvent", data);
    }
};
