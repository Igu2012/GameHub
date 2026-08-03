function CEndPanel(oSpriteBg,iWinner){
    
    var _oBg;
    var _oGroup;
    

    var _oMsgText;

    var _oScoreText;
    var _iScore;
    var _oButRestart;
    var _oButHome;

    var _oButNext;
    var _iWinner;
    var _oEndSound;
    var _iGlobalScore;
    
    this._init = function(oSpriteBg,iWinner){
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible=false;
        s_oStage.addChild(_oGroup);
        
        s_oGame.setPause(true);
        _iWinner = iWinner;
        var oShape = new createjs.Shape();
        oShape.graphics.beginFill("#000").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        oShape.alpha = 0.5;
        oShape.on("mousedown",this.onMouseDown,this);
        _oGroup.addChild(oShape);
        
        _oBg = createBitmap(oSpriteBg);
        var oBgInfo = _oBg.getBounds();
        _oBg.regX = oBgInfo.width/2;
        _oBg.regY = oBgInfo.height/2;
        _oBg.x = CANVAS_WIDTH/2;
        _oBg.y = CANVAS_HEIGHT/2;
        _oGroup.addChild(_oBg);

        _oMsgText = new CTLText(_oGroup, 
                    CANVAS_WIDTH/2-300, (CANVAS_HEIGHT/2)-240, 600, 200, 
                    80, "center", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    " ",
                    true, true, true,
                    false );


        
        _oScoreText = new CTLText(_oGroup, 
                    CANVAS_WIDTH/2-300, (CANVAS_HEIGHT/2)-10, 600, 100, 
                    80, "center", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false);
                    


        
        var oSprite = s_oSpriteLibrary.getSprite("but_restart");
        _oButRestart = new CGfxButton(CANVAS_WIDTH/2+100,CANVAS_HEIGHT/2+150,oSprite,_oGroup);
        
        oSprite = s_oSpriteLibrary.getSprite("but_home");
        _oButHome = new CGfxButton(CANVAS_WIDTH/2-100,CANVAS_HEIGHT/2+150,oSprite,_oGroup);
        
        if (s_bFriendly===false&&s_oLevelSettings.getCurrentLevel()!==s_oLevelSettings.getNumLevel()-1){
            if (_iWinner!==0&&s_oLevelSettings.getCurrentLevel()>=s_iLastLevel-1){
            }else{
                _oButRestart.setX(CANVAS_WIDTH/2);
                _oButHome.setX(_oButRestart.getX()-200);
                oSprite = s_oSpriteLibrary.getSprite("but_next");
                _oButNext = new CGfxButton(CANVAS_WIDTH/2+200,CANVAS_HEIGHT/2+150,oSprite,_oGroup);
                _oButNext.addEventListener(ON_MOUSE_DOWN,this.onButNext,this);
            }
        };
    };
    
    this.onButNext = function(){
        stopSound("applause");
        stopSound("game_over");
       s_oGame.unload();
       s_oLevelSettings.nextLevel();
       s_oMain.gotoGame();
       s_oStage.removeChild(_oGroup);
       if (!s_bFriendly){
            var szImg = "200x200.jpg";
            var szTitle = "Congratulations!";
            var szMsg = "You collected <strong>" + _iScore + " points</strong>!<br><br>Share your score with your friends!";
            var szMsgShare = "My score is " + _iScore + " points! Can you do better?";        
            $(s_oMain).trigger("share_event",_iScore, szImg, szTitle, szMsg, szMsgShare);
        }
        
    };
    
    this.unload = function(){
        
    };
    
    this.onMouseDown = function(){
        
    };
    
    this._initListener = function(){
        _oButHome.addEventListener(ON_MOUSE_DOWN,this._onExit,this);
        _oButRestart.addEventListener(ON_MOUSE_DOWN,this._onRestart, this);
    };
    
    this.show = function(iScore,iWinner){
        _iGlobalScore = 0;
        if (iWinner===0||s_b2Players){
	_oEndSound = playSound("applause",1,false);
        }else{
              _oEndSound =  playSound("game_over",1,false);
        }
        _iScore = iScore;
        
        var iPlayerWin = iWinner + 1;
        
        if (iWinner===0){
            _oMsgText.refreshText(TEXT_GAMEOVER);
        }else{
            iScore = 0;
            _iScore = 0;
            _oMsgText.refreshText(TEXT_LOSE+iPlayerWin+TEXT_LOSE2);
        }
       
        if (s_b2Players===true){
            _oMsgText.refreshText(TEXT_WIN_2PLAYERS+iPlayerWin+TEXT_WIN_2PLAYERS_2);
        }
       
        if (!s_bFriendly){
            $(s_oMain).trigger("end_level",s_oLevelSettings.getCurrentLevel());

            _oScoreText.refreshText( TEXT_SCORE +": "+iScore);
            
            if (s_oLevelSettings.getCurrentLevel()===s_oLevelSettings.getNumLevel()-1 && iWinner === 0){
                _oMsgText.refreshText(TEXT_WIN_TOURNAMENT);
            }
            
        }
        
        _oGroup.visible = true;
        
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {oParent._initListener();});
        
        for (var i=0;i<s_oLevelSettings.getNumLevel();i++){
            if (getItem("score_foosball_"+i)!==null&&getItem("score_foosball_"+i)!==null&&getItem("score_foosball_"+i)!==0){
                _iGlobalScore+=parseInt(getItem("score_foosball_"+i));
            }
        }
        if (!s_bFriendly){
            $(s_oMain).trigger("save_score",_iGlobalScore);  
            $(s_oMain).trigger("show_interlevel_ad");
            $(s_oMain).trigger("end_session");
        }
    };
    
    this._onExit = function(){
        stopSound("applause");
        stopSound("game_over");
        
        if (!s_bFriendly){
            var szImg = "200x200.jpg";
            var szTitle = "Congratulations!";
            var szMsg = "You collected <strong>" + _iScore + " points</strong>!<br><br>Share your score with your friends!";
            var szMsgShare = "My score is " + _iScore + " points! Can you do better?";        
            $(s_oMain).trigger("share_event",_iScore, szImg, szTitle, szMsg, szMsgShare);
        }
        
        _oGroup.off("mousedown",this._onExit);
        s_oStage.removeChild(_oGroup);
        
        
        
        s_oGame.unload();
        s_oMain.gotoMenu();
    };
    
    this._onRestart = function(){
        stopSound("applause");
        stopSound("game_over");
       s_oGame.unload();
       s_oMain.gotoGame();
       s_oStage.removeChild(_oGroup);
       if (!s_bFriendly){
            var szImg = "200x200.jpg";
            var szTitle = "Congratulations!";
            var szMsg = "You collected <strong>" + _iScore + " points</strong>!<br><br>Share your score with your friends!";
            var szMsgShare = "My score is " + _iScore + " points! Can you do better?";        
            $(s_oMain).trigger("share_event",_iScore, szImg, szTitle, szMsg, szMsgShare);
        }
        
       
    };
    
    this._init(oSpriteBg,iWinner);
    
    return this;
}
