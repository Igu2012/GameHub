function CMenu(){
    var _oBg;
    var _oButPlay;
    var _oFade;
    var _oAudioToggle;
    var _oCreditsBut;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _pStartPosCredits;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _oButTournament;
    var _oLogoMenu;
    var _pStartPosDeleteSave;
    var _oDeleteSaveBut;
    var _pStartPosFriendlyBut;
    var _pStartPosTournamentBut;
    
    
    this._init = function(){
        s_b2Players = false;
            setVolume("soundtrack",1);
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('friendly_mode');
        _pStartPosFriendlyBut = {x: CANVAS_WIDTH/2-225,y: CANVAS_HEIGHT -200};
        _oButPlay = new CGfxButton(_pStartPosFriendlyBut.x,_pStartPosFriendlyBut.y,oSprite,s_oStage);
        _oButPlay.addEventListener(ON_MOUSE_DOWN, this._onButFriendlyRelease, this);
        
        var oSprite = s_oSpriteLibrary.getSprite("tournament_mode");
        _pStartPosTournamentBut = {x:(CANVAS_WIDTH/2+225),y:CANVAS_HEIGHT -200};
        _oButTournament = new CGfxButton(_pStartPosTournamentBut.x,_pStartPosTournamentBut.y,oSprite,s_oStage);
        _oButTournament.addEventListener(ON_MOUSE_DOWN, this._onButTournamentRelease, this);
     
        var oSprite = s_oSpriteLibrary.getSprite('but_info');
        _pStartPosCredits = {x: (oSprite.height/2) + 10, y: (oSprite.height/2) + 10};            
        _oCreditsBut = new CGfxButton((CANVAS_WIDTH/2),CANVAS_HEIGHT -240,oSprite, s_oStage);
        _oCreditsBut.addEventListener(ON_MOUSE_UP, this._onCreditsBut, this);
     
        oSprite = s_oSpriteLibrary.getSprite("but_delete_save");
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _pStartPosDeleteSave = {x: CANVAS_WIDTH - (oSprite.height*1.5)- 5, y: (oSprite.height/2) + 10};
        }else{
            _pStartPosDeleteSave = {x: CANVAS_WIDTH - (oSprite.width/2)- 10, y: (oSprite.height/2) + 10};
        }
        _oDeleteSaveBut = new CGfxButton(_pStartPosDeleteSave.x,_pStartPosDeleteSave.y,oSprite,s_oStage);
        _oDeleteSaveBut.addEventListener(ON_MOUSE_UP,s_oLevelSettings.deleteSaveData,this);
        
       oSprite = s_oSpriteLibrary.getSprite("logo_menu"); 
       _oLogoMenu = new createBitmap(oSprite,oSprite.width,oSprite.height);
       _oLogoMenu.regX = oSprite.width/2;
       _oLogoMenu.regY = oSprite.height/2;
       _oLogoMenu.y = CANVAS_HEIGHT/2-100;
       _oLogoMenu.x = -700;
       s_oStage.addChild(_oLogoMenu);
     
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2), y: (oSprite.height/2) + 10};            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);          
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width/2 + 10,y:(oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        var oParent = this;
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        new createjs.Tween.get(_oLogoMenu).wait(500).to({x: CANVAS_WIDTH/2},1000, createjs.Ease.bounceOut).call(function(){ oParent.pulseTitle();});
        
        if(!s_bStorageAvailable){
            new CMsgBox(TEXT_ERR_LS,s_oStage);
        }
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
        
    };
    
    this.pulseTitle = function(){
        var oParent = this;
        new createjs.Tween.get(_oLogoMenu).to({scaleX: 1*0.9, scaleY: 1*0.9}, 850, createjs.Ease.quadOut).to({scaleX: 1, scaleY: 1}, 650, createjs.Ease.quadIn).call(function () {
            oParent.pulseTitle();
        });
    };
    
    this.unload = function(){
        s_oStage.removeChild(_oLogoMenu);
        _oButPlay.unload(); 
        _oButTournament.unload();
        _oDeleteSaveBut.unload()
        _oButPlay = null;
        _oFade.visible = false;
        
        _oCreditsBut.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.unload();
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        s_oMenu = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButPlay.setPosition(_pStartPosFriendlyBut.x,_pStartPosFriendlyBut.y-iNewY);
        _oButTournament.setPosition(_pStartPosTournamentBut.x,_pStartPosTournamentBut.y-iNewY);
        _oDeleteSaveBut.setPosition(_pStartPosDeleteSave.x-iNewX,_pStartPosDeleteSave.y+iNewY);
        _oCreditsBut.setPosition(_pStartPosCredits.x + iNewX,iNewY + _pStartPosCredits.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
        }
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onCreditsBut = function(){
        new CCreditsPanel();
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    this._onButFriendlyRelease = function(){ 
         s_oMain.pokiShowCommercial(s_oMenu._startGameFriendly);
    };
    
    this._onButTournamentRelease = function(){
        s_oMain.pokiShowCommercial(s_oMenu._startGameTournament);
    };

    this._startGameFriendly = function(){
        s_oMenu.unload();
        $(s_oMain).trigger("start_session");
        s_bFriendly = true;
        CPU_SPEED_STICKS = CPU_SPEED_STICK_FRIENDLY;
        POINTS_TO_WIN = NUM_GOAL_FRIENDLY;
        
        s_oMain.gotoSelectPlayers(); 
    };
    
    this._startGameTournament = function(){
        s_oMenu.unload();
        
        $(s_oMain).trigger("start_session");
        s_bFriendly = false;
        s_oMain.gotoLevelMenu();
    };
    
    s_oMenu = this;
    
    this._init();
}

var s_oMenu = null;