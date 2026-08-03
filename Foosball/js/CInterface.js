function CInterface(){
    var _oAudioToggle;
    var _oButExit;
    var _oContainer;
    var _oButFullscreen;
    var _oHelpPanel=null;
    var _bMobileInitialized;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oContainerScore;
    var _pStartPosContainerScore; 
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _oButUpP1;
    var _oButDownP1;
    var _oButUpP2;
    var _oButDownP2;
    var _pStartPosButUpP1;
    var _pStartPosButDownP1;
    var _pStartPosButUpP2;
    var _pStartPosButDownP2;
    var _oScoreTextBlue;
    var _oScoreTextRed;
    var _oButHelp;
    var _pStartPosButHelp;
    var _oButPause;
    var _pStartPosPause;
    
    this._init = function(){  
        _oContainer = new createjs.Container();
        _bMobileInitialized = false;
        s_oStage.addChild(_oContainer);
        var oExitX; 
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite,_oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = CANVAS_WIDTH - (oSprite.width/2) - 140;
        _pStartPosPause = {x: oExitX, y: (oSprite.height/2) + 10};
        oSprite = s_oSpriteLibrary.getSprite("but_pause");
        _oButPause = new CGfxButton(_pStartPosPause.x,_pStartPosPause.y,oSprite,_oContainer);
        _oButPause.addEventListener(ON_MOUSE_UP,function(){new CPause();},this);
        
        _pStartPosAudio = {x: _pStartPosPause.x-oSprite.width-10,y: _pStartPosPause.y};
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive, _oContainer);
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
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:oSprite.height/2+10};
            _pStartPosButHelp = {x:_pStartPosFullscreen.x+oSprite.width/2+10,y:_pStartPosFullscreen.y};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,_oContainer);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreen,this);
        }else{
            _pStartPosButHelp = {x:oSprite.width/4+10,y:oSprite.height/2+10};
        }
        
        oSprite = s_oSpriteLibrary.getSprite("but_help");
        _oButHelp = new CGfxButton(_pStartPosButHelp.x,_pStartPosButHelp.y,oSprite,_oContainer);
        _oButHelp.addEventListener(ON_MOUSE_UP,function(){new CPanelTutorial();},this);
        
        _pStartPosContainerScore= {x:CANVAS_WIDTH/2,y:83};
        _oContainerScore = new createjs.Container();
        _oContainer.addChild(_oContainerScore);
        oSprite = s_oSpriteLibrary.getSprite("score_panel");
        var oScorePanelBlue = new createBitmap(oSprite,oSprite.width,oSprite.height);
        oScorePanelBlue.regX = oSprite.width/2;
        oScorePanelBlue.regY = oSprite.height/2;
        _oContainerScore.x = _pStartPosContainerScore.x;
        _oContainerScore.y = _pStartPosContainerScore.y;
        _oScoreTextBlue = new createjs.Text(0," 50px "+PRIMARY_FONT,"#000000");
        _oScoreTextBlue.textAlign = "center";
        _oScoreTextBlue.x = -50;
        _oScoreTextBlue.y = +27;
        _oScoreTextBlue.textBaseline = "alphabetic";
        _oScoreTextRed = new createjs.Text(0," 50px "+PRIMARY_FONT,"#000000");
        _oScoreTextRed.textAlign = "center";
        _oScoreTextRed.x = +50;
        _oScoreTextRed.y = +27;
        _oScoreTextRed.textBaseline = "alphabetic";
        _oContainerScore.addChild(oScorePanelBlue,_oScoreTextBlue,_oScoreTextRed);
        
       this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        _oButExit.unload();
        
        s_oStage.removeChild(_oContainer);
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.unload();
        }        

        s_oInterface = null;
        
    };
    
    this.refreshPlayersScore = function (iScoreP1,iScoreP2){
       _oScoreTextBlue.text =  iScoreP1;
       _oScoreTextRed.text = iScoreP2;
    };
    
    this.initMobileButtons = function(){
        _bMobileInitialized = true;
        _pStartPosButUpP1;
        _pStartPosButDownP1;
        _pStartPosButUpP2;
        _pStartPosButDownP2;
        var oSprite = s_oSpriteLibrary.getSprite("arrow");
        
        if (!s_b2Players){
            _pStartPosButUpP1 = {x: CANVAS_WIDTH/2-800, y: CANVAS_HEIGHT/2+240};
            _pStartPosButDownP1 = {x: CANVAS_WIDTH/2-800, y: CANVAS_HEIGHT/2+450};
            _oButUpP1 = new CGfxButton(_pStartPosButUpP1.x,_pStartPosButUpP1.y,oSprite,_oContainer);
            _oButUpP1.setMuted(true);
            _oButDownP1 = new CGfxButton(_pStartPosButDownP1.x,_pStartPosButDownP1.y,oSprite,_oContainer);
            _oButDownP1.setMuted(true);
            _oButDownP1.getButtonImage().rotation= 180;
            
        }else{
            _pStartPosButUpP1 = {x: CANVAS_WIDTH/2-800, y: CANVAS_HEIGHT/2+240};
            _pStartPosButDownP1 = {x: CANVAS_WIDTH/2-800, y: CANVAS_HEIGHT/2+450};
            _pStartPosButUpP2 = {x: CANVAS_WIDTH/2+800, y: CANVAS_HEIGHT/2+240};
             _pStartPosButDownP2= {x: CANVAS_WIDTH/2+800, y: CANVAS_HEIGHT/2+450};
            _oButUpP1 = new CGfxButton(_pStartPosButUpP1.x,_pStartPosButUpP1.y,oSprite,_oContainer);
            _oButUpP1.setMuted(true);
            _oButDownP1 = new CGfxButton(_pStartPosButDownP1.x,_pStartPosButDownP1.y,oSprite,_oContainer);
            _oButDownP1.setMuted(true);
            _oButUpP2 = new CGfxButton(_pStartPosButUpP2.x,_pStartPosButUpP2.y,oSprite,_oContainer);
            _oButUpP2.setMuted(true);
            _oButDownP2 = new CGfxButton(_pStartPosButDownP2.x,_pStartPosButDownP2.y,oSprite,_oContainer);
            _oButDownP2.setMuted(true);
            _oButDownP1.getButtonImage().rotation= 180;
            _oButDownP2.getButtonImage().rotation= 180;
            _oButUpP2.addEventListener(ON_MOUSE_DOWN,function(){s_oGame.setBooleanUp2(true);},this);
            _oButUpP2.addEventListener(ON_MOUSE_UP,function(){s_oGame.setBooleanUp2(false);},this);
            _oButDownP2.addEventListener(ON_MOUSE_DOWN,function(){s_oGame.setBooleanDown2(true);},this);
            _oButDownP2.addEventListener(ON_MOUSE_UP,function(){s_oGame.setBooleanDown2(false);},this);
        }
        _oButUpP1.addEventListener(ON_MOUSE_DOWN,function(){s_oGame.setBooleanUp1(true);},this);
        _oButUpP1.addEventListener(ON_MOUSE_UP,function(){s_oGame.setBooleanUp1(false);},this);
        _oButDownP1.addEventListener(ON_MOUSE_DOWN,function(){s_oGame.setBooleanDown1(true);},this);
        _oButDownP1.addEventListener(ON_MOUSE_UP,function(){s_oGame.setBooleanDown1(false);},this);
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oContainerScore.y = _pStartPosContainerScore.y +iNewY;
        _oButHelp.setPosition(_pStartPosButHelp.x+iNewX,_pStartPosButHelp.y+iNewY);
        
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        _oButPause.setPosition(_pStartPosPause.x - iNewX,iNewY + _pStartPosPause.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }

        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
        }
        
        if (s_bMobile){
            if (_bMobileInitialized){
                if (!s_b2Players){
                    _oButUpP1.setPosition(_pStartPosButUpP1.x+iNewX,_pStartPosButUpP1.y-iNewY);
                    _oButDownP1.setPosition(_pStartPosButDownP1.x+iNewX,_pStartPosButDownP1.y-iNewY);
                }else{
                    _oButUpP1.setPosition(_pStartPosButUpP1.x+iNewX,_pStartPosButUpP1.y-iNewY);
                    _oButDownP1.setPosition(_pStartPosButDownP1.x+iNewX,_pStartPosButDownP1.y-iNewY);
                    _oButUpP2.setPosition(_pStartPosButUpP2.x-iNewX,_pStartPosButUpP2.y-iNewY);
                    _oButDownP2.setPosition(_pStartPosButDownP2.x-iNewX,_pStartPosButDownP2.y-iNewY);
                }
            }
        }
    };

    this.setOnTop = function(){
       s_oStage.addChildAt(_oContainer,s_oStage.numChildren); 
    };
    
    this._onButRestartRelease = function(){
        s_oGame.restartGame();
        $(s_oMain).trigger("restart_level", 1);
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        new CAreYouSurePanel(s_oGame.onExit);
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

    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;