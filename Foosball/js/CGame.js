
function CGame(oData){
    var _bStartGame;
    var _bUpdateBalls;
    var _iScore;
    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    var _oBall;
    var _aFieldEdgesBall;
    var _vSafePos;
    var _aPlayer1Stick;
    var _aPlayer2Stick;
    var _bUP1;
    var _bDOWN1;
    var _bUP2;
    var _bDOWN2;
    var _aPositionXCpu;
    var _iPlayer1Points;
    var _iPlayer2Points;
    var _bPaused;
    var _bGoalCheck;
    var _bInputUpdate;
    var _oArena;
    var _oField;
    var _oBallMask;
    var _oScoreRod;
    var _oGoalText;
    var _oButStartGame;
    var _bScalarProduct;
    var _oSound;
    var _bSoundComplete;
    var _bBallSpin;
    var _aHalfLeftSticks;
    var _aHalfRightSticks;
    var _aHalfUpEdges;
    var _aHalfDownEdges;

    var _bPokiStart;

    this._init = function(){
        _bPokiStart = false;
        
        setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME );
        _bStartGame=true;
        _bUpdateBalls = true;
        _bGoalCheck = true;
        _bInputUpdate = false;
        _bScalarProduct = true;
        _iScore=0;          
        _iPlayer1Points=0;
        _iPlayer2Points=0;
        _vSafePos = new CVector2();
        _aPlayer1Stick = new Array();
        _aPlayer2Stick = new Array();
        _bPaused = false;
        _bBallSpin = true;
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); //Draws on canvas
        _bUP1 = false;
        _bDOWN1 = false;
        if (s_b2Players){
            _bUP2 = false;
            _bDOWN2 = false;
        }
        _bSoundComplete = true;
       var oSprite= s_oSpriteLibrary.getSprite("field");
        _oField = new createBitmap(oSprite,oSprite.width,oSprite.height);
        _oField.regX = oSprite.width/2;
        _oField.regY = oSprite.height/2;
        _oField.x = CANVAS_WIDTH/2;
        _oField.y = CANVAS_HEIGHT/2-20;
        //_oField.on("mousedown",this.onField,this);
        s_oStage.addChild(_oField);
        _oInterface = new CInterface();
                 
        _aFieldEdgesBall = new Array();
        
        
        //1664
       _aFieldEdgesBall[HORIZONTAL_LINE_UP]=new CEdge(309,210,1608,210,5,false).getModel(); //Horizontal Line Up;
       _aFieldEdgesBall[HORIZONTAL_LINE_DOWN]= new CEdge(1608,798,309,798,5,false).getModel(); //Horizontal Line Down;
       _aFieldEdgesBall[VERTICAL_LINE_LEFT_UP]= new CEdge(309,360,309,210,5,false).getModel(); //vertical Line Left Up;
       _aFieldEdgesBall[VERTICAL_LINE_LEFT_DOWN]= new CEdge(309,799,309,639,5,false).getModel(); //vertical Line Left Down;
       _aFieldEdgesBall[VERTICAL_LINE_RIGHT_UP] = new CEdge(1608,210,1608,360,5,false).getModel(); //Vertocal Line Right UP;
       _aFieldEdgesBall[VERTICAL_LINE_RIGHT_DOWN] = new CEdge(1608,639,1608,799,5,false).getModel(); //Vertical Line Right Down;
        _oBall = new CBall(CANVAS_WIDTH/2,CANVAS_HEIGHT/2+230,s_oSpriteLibrary.getSprite("ball"),"ball_1",s_oStage);
        _oBall.setVisible(false);
        
        _aHalfUpEdges = [_aFieldEdgesBall[HORIZONTAL_LINE_UP],_aFieldEdgesBall[VERTICAL_LINE_LEFT_UP],_aFieldEdgesBall[VERTICAL_LINE_RIGHT_UP]];
        _aHalfDownEdges = [_aFieldEdgesBall[HORIZONTAL_LINE_DOWN],_aFieldEdgesBall[VERTICAL_LINE_LEFT_DOWN],_aFieldEdgesBall[VERTICAL_LINE_RIGHT_DOWN]];
        
        
        _aPlayer1Stick[GOALKEEPER]=new CStick(280+67,CANVAS_HEIGHT+200,BLUE_STICK, 1150,1410,[{y2: 475, y1:514}],GOALKEEPER,PLAYER_SPEED_STICKS);
        
        _aPlayer1Stick[DEFENDER]=new CStick(430+90,CANVAS_HEIGHT+160,BLUE_STICK, 1140,1350,[{y2:320,y1:360},
                                                                                                                              {y2: 633, y1: 673}],DEFENDER,PLAYER_SPEED_STICKS);
                                                                                                                          
        _aPlayer1Stick[MIDFIELDER]=new CStick(800+66,CANVAS_HEIGHT+100,BLUE_STICK, 1145,1210,[{y2: 253, y1:292},
                                                                                                                                {y2: 407, y1:450},
                                                                                                                                {y2: 560, y1:600},
                                                                                                                                { y2: 714, y1:752}],MIDFIELDER,PLAYER_SPEED_STICKS);
                                                                                                                            
        _aPlayer1Stick[STRIKER] =new CStick(1180+32,CANVAS_HEIGHT+160,BLUE_STICK, 1155,1320,[{y2:305,y1:340},
                                                                                                                                {y2: 483,y1: 517},
                                                                                                                                {y2:668,y1:706}],STRIKER,PLAYER_SPEED_STICKS);
        
        _aPlayer2Stick[GOALKEEPER] = new CStick(CANVAS_WIDTH-400+51,-270,RED_STICK, -400,-130,[{y1:475,y2:514}],GOALKEEPER,CPU_SPEED_STICKS);
        
        _aPlayer2Stick[DEFENDER] = new CStick(CANVAS_WIDTH-550+27,-240,RED_STICK, -335,-130,[{y1:317,y2:357},
                                                                                                                             {y1: 630, y2: 670}],DEFENDER,CPU_SPEED_STICKS);
                                                                                                                         
        _aPlayer2Stick[MIDFIELDER]= new CStick(CANVAS_WIDTH-920+40,-165,RED_STICK, -190, -130,[{y1: 248, y2:287},
                                                                                                                              {y1: 402, y2:440},
                                                                                                                              {y1: 555, y2:592},
                                                                                                                              { y1: 709, y2:748}],MIDFIELDER,CPU_SPEED_STICKS);
                                                                                                                          
        _aPlayer2Stick[STRIKER] = new CStick(CANVAS_WIDTH-1300+75,-237,RED_STICK, -320, -155,[{y1:300,y2:338},
                                                                                                                                {y1: 485,y2: 523},
                                                                                                                                {y1:665,y2:703}],STRIKER,CPU_SPEED_STICKS);
                                                                                                                            
        _aHalfLeftSticks = [_aPlayer1Stick[GOALKEEPER],_aPlayer1Stick[DEFENDER], _aPlayer1Stick[MIDFIELDER],_aPlayer2Stick[STRIKER]];
        _aHalfRightSticks = [_aPlayer2Stick[GOALKEEPER],_aPlayer2Stick[DEFENDER], _aPlayer2Stick[MIDFIELDER],_aPlayer1Stick[STRIKER]];
        
        _aPositionXCpu = [_aPlayer2Stick[GOALKEEPER].getX(),
                                 _aPlayer2Stick[DEFENDER].getX(),
                                 _aPlayer2Stick[MIDFIELDER].getX(),
                                 _aPlayer2Stick[STRIKER].getX()];
        
        var oSprite = s_oSpriteLibrary.getSprite("arena");
        _oArena = new createBitmap(oSprite,oSprite.width,oSprite.height);
        _oArena.x = _aFieldEdgesBall[HORIZONTAL_LINE_UP].getPointA().getX()-87;
        _oArena.y = _aFieldEdgesBall[HORIZONTAL_LINE_UP].getPointA().getY()-75;
        _oArena.cache(0,0,oSprite.width,oSprite.height);
        s_oStage.addChild(_oArena);
        _oScoreRod = new CScoreRod(POINTS_TO_WIN);
        _oBallMask = new createjs.Shape();
        _oBallMask.graphics.beginFill("#F00").drawRect(_oArena.x+10,_oArena.y,1456,720);
        _oBallMask.alpha = 0.01;
        s_oStage.addChild(_oBallMask);
        _oBall.getObject().mask = _oBallMask;
        _oInterface.setOnTop();
        
        if (!s_bMobile){
            document.onkeydown = this.keyDownKeyBoard;
            document.onkeyup = this.keyUpKeyBoard;
            
        }else{
            _oInterface.initMobileButtons();
        }
        
        oSprite = s_oSpriteLibrary.getSprite("but_kickoff");
        _oButStartGame = new CGfxButton(CANVAS_WIDTH*0.5,CANVAS_HEIGHT*0.5+300,oSprite,s_oStage);
        _oButStartGame.pulseAnimation();
        _oButStartGame.addEventListener(ON_MOUSE_DOWN,this.onMouseDown,this);
        
        if (s_b2Players===true&&!s_bMobile){
            if (s_bFirstMultiPlayer===true){
                s_bFirstMultiPlayer = false;
                s_bFirstPlay = false;
                new CPanelTutorial();
            }
        }
        
        if (s_bFirstPlay===true){
            s_bFirstPlay = false;
            new CPanelTutorial();
        }
       
    };
    
    this.keyUpKeyBoard = function(evt){
            if(!evt){ 
                evt = window.event; 
            } 
            evt.preventDefault(); 
           switch (evt.keyCode){
               case 87: _bUP1 = false; break;
               case 83: _bDOWN1 = false; break;
               case 38: _bUP2 = false; break;
               case 40:  _bDOWN2 = false; break;
           }
        };
        
        this.keyDownKeyBoard = function(evt){
            if(!evt){ 
                evt = window.event; 
             } 
            evt.preventDefault(); 
           switch (evt.keyCode){
               case 87: _bUP1 = true; break;
               case 83: _bDOWN1 = true; break;
               case 38: _bUP2 = true; break;
               case 40:  _bDOWN2 = true; break;
               case 32: 
                   if (evt.keyCode===32){
                    if (_bBallSpin&&_bPaused === false){
                        _oParent.onMouseDown();
                    }
                }
                break;
           }
           evt.preventDefault();  
        };
    
    this.AICpu = function (oBall, aSticks) {

        var iSector = getNearestNumber(_aPositionXCpu, oBall.getX());

        if (iSector === GOALKEEPER) {

            if (fixEnemyTremble(oBall, aSticks[GOALKEEPER].getEdges()[0].getModel()) === false) {
                if (oBall.getY() > aSticks[GOALKEEPER].getEdges()[0].getModel().m_pCenter().getY()) {
                    for (var i = 0; i < aSticks.length; i++) {
                        aSticks[i].onKeyDown();
                    }
                } else {
                    for (var i = 0; i < aSticks.length; i++) {
                        aSticks[i].onKeyUp();
                    }
                }
            }
        } else if (iSector === DEFENDER) {
            var aPosDefenderY = [aSticks[DEFENDER].getEdges()[0].getModel().m_pCenter().getY()
                        , aSticks[DEFENDER].getEdges()[1].getModel().m_pCenter().getY()];
            var iDefender = getNearestNumber(aPosDefenderY, oBall.getY());

            if (fixEnemyTremble(oBall, aSticks[DEFENDER].getEdges()[iDefender].getModel()) === false) {
                if (oBall.getY() - oBall.getHalfRadius() > aSticks[DEFENDER].getEdges()[iDefender].getModel().m_pCenter().getY()) {
                    for (var i = 0; i < aSticks.length; i++) {
                        aSticks[i].onKeyDown();
                    }
                } else {
                    for (var i = 0; i < aSticks.length; i++) {
                        aSticks[i].onKeyUp();
                    }
                }
            }
        } else if (iSector === MIDFIELDER) {

            var aPosMidfielderY = [aSticks[MIDFIELDER].getEdges()[0].getModel().m_pCenter().getY()
                        , aSticks[MIDFIELDER].getEdges()[1].getModel().m_pCenter().getY()
                        , aSticks[MIDFIELDER].getEdges()[2].getModel().m_pCenter().getY()
                        , aSticks[MIDFIELDER].getEdges()[3].getModel().m_pCenter().getY()];
            var iMidfielder = getNearestNumber(aPosMidfielderY, oBall.getY());

            if (fixEnemyTremble(oBall, aSticks[MIDFIELDER].getEdges()[iMidfielder].getModel()) === false) {

                if (oBall.getY() > aSticks[MIDFIELDER].getEdges()[iMidfielder].getModel().m_pCenter().getY()) {
                    for (var i = 0; i < aSticks.length; i++) {
                        aSticks[i].onKeyDown();
                    }
                } else {
                    for (var i = 0; i < aSticks.length; i++) {
                        aSticks[i].onKeyUp();
                    }
                }
            }
        } else if (iSector === STRIKER) {
            var aPosStrikerY = [aSticks[STRIKER].getEdges()[0].getModel().m_pCenter().getY(),
                aSticks[STRIKER].getEdges()[1].getModel().m_pCenter().getY(),
                aSticks[STRIKER].getEdges()[2].getModel().m_pCenter().getY()];
            var iStriker = getNearestNumber(aPosStrikerY, oBall.getY());


            if (fixEnemyTremble(oBall, aSticks[STRIKER].getEdges()[iStriker].getModel()) === false) {
                if (iStriker === 0) {
                    if (oBall.getY() - oBall.getHalfRadius() > aSticks[STRIKER].getEdges()[iStriker].getModel().getPointB().getY()) {
                        for (var i = 0; i < aSticks.length; i++) {
                            aSticks[i].onKeyDown();
                        }
                    } else {
                        for (var i = 0; i < aSticks.length; i++) {
                            aSticks[i].onKeyUp();
                        }
                    }

                } else if (iStriker === 2) {
                    if (oBall.getY() - oBall.getHalfRadius() > aSticks[STRIKER].getEdges()[iStriker].getModel().getPointA().getY()) {
                        for (var i = 0; i < aSticks.length; i++) {
                            aSticks[i].onKeyDown();
                        }
                    } else {
                        for (var i = 0; i < aSticks.length; i++) {
                            aSticks[i].onKeyUp();
                        }
                    }
                } else {
                    if (oBall.getY() > aSticks[STRIKER].getEdges()[iStriker].getModel().m_pCenter().getY()) {
                        for (var i = 0; i < aSticks.length; i++) {
                            aSticks[i].onKeyDown();
                        }
                    } else {
                        for (var i = 0; i < aSticks.length; i++) {
                            aSticks[i].onKeyUp();
                        }
                    }
                }
            }
        }


    };
        
        this.setBooleanUp1 = function(bVal){
            _bUP1 = bVal;
        };
        
        this.setBooleanDown1 = function(bVal){
            _bDOWN1 = bVal;
        };
        
        this.setBooleanUp2 = function(bVal){
            _bUP2 = bVal;
        };
        
        this.setBooleanDown2 = function(bVal){
            _bDOWN2 = bVal;
        };
        
        this.onMouseDown = function(){
            _oButStartGame.setVisible(false);
            _bBallSpin = false;
            
            playSound("whistle",1,false);

            var vLaunch = new CVector2( randomFloatBetween(0.05,0.1)*randomSign(), -1);            
            vLaunch.normalize();
            vLaunch.scalarProduct(BALL_START_VELOCITY);
            _oBall.vCurForce().setV(vLaunch);


            _oBall.setVisible(true);
            _oBall.scale(1.4);
            setTimeout(function(){_oBall.scale(1);},400);
            _bPaused = false;
            _bInputUpdate = true;

            setTimeout(function(){playSound("ball_wall",1,false);},250);
            
            s_oGame.setPokiStart(true);
        };
        
        this.collideCircleWithEdges = function(oBall,aEdge){
            for (var i=0;i<aEdge.length;i++){
                var oInfo = collideEdgeWithCircle(aEdge[i],oBall.vPos(),oBall.getRadius() );
                if ( oInfo ){
                    playSound("ball_wall",1,false);
                    var vEdgeNormal = new CVector2();
                    vEdgeNormal.setV(aEdge[i].getNormal());
                   vEdgeNormal.scalarProduct(oBall.getRadius()*1.05);
                    oInfo.closest_point.addV(vEdgeNormal);
                    oBall.setPos(oInfo.closest_point);
                    reflectVectorV2(oBall.vCurForce(), aEdge[i].getNormal());
                    break;
                }
            }
        };
        
        this.onField = function(evt){
           var vDir = new CVector2();
           vDir.set(evt.stageX/s_iScaleFactor,evt.stageY/s_iScaleFactor);
           vDir.subtract(_oBall.vPos());
           vDir.normalize();
           vDir.scalarProduct(1);
           _oBall.vCurForce().setV(vDir);
        };
     
    
    this.unload = function(){
        _bStartGame = false;
        
        _oInterface.unload();
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }
        
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();

           
    };
 
    this.onExit = function(){
        s_oMain.pokiShowCommercial();
        
        $(s_oMain).trigger("end_session");
        
        s_oGame.unload();
        s_oMain.gotoMenu();
    };
    
    this._onExitHelp = function () {
         _bStartGame = true;
         $(s_oMain).trigger("start_level",1);
    };
    
    this.gameOver = function(iWinner){
        
        if(s_b2Players){
            PokiSDK.happyTime(1);
        }else if(!s_b2Players && iWinner === 0){
            PokiSDK.happyTime(1);
        }
        
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'),iWinner);
        if (iWinner===0){
            _iScore = 100*_iPlayer1Points;
            _iScore-=50*_iPlayer2Points;
        }
        
        if (!s_bFriendly){
            saveItem("score_foosball_"+s_oLevelSettings.getCurrentLevel(),_iScore);
        }
        _oEndPanel.show(_iScore,iWinner);
    };
    
    this.collideBallWithPlayer = function(oBall,aStickPlayers){
        for (var i=0;i<aStickPlayers.length;i++){
            // sticks
            var aPlayers = aStickPlayers[i].getEdges();
            for (var j=0;j<aPlayers.length;j++){
                    // player
                    var oEdgePlayer = aPlayers[j].getModel();
                    var oInfo = collideEdgeWithCircle(oEdgePlayer,oBall.vPos(),oBall.getRadius() );
                    if ( oInfo ){
                        var vPlayerNormal = new CVector2();
                        vPlayerNormal.setV(oEdgePlayer.getNormal());
                        var iRandomAntiLoop =  randomFloatBetween(-0.1,0.1);
                        vPlayerNormal.add(0,iRandomAntiLoop);

                        var iDistFromCenter = distance( oInfo.closest_point, oEdgePlayer.m_pCenter() );
                        var iQuantityRot = 0;
                        var iHalfWidth = (oEdgePlayer.getLength()*0.5);
                        var iMaxAngleRot   = 30;
                        var iMinVelBall       = 23/PHYSICS_ITERATIONS;
                        var iVariableVelBall = 23/PHYSICS_ITERATIONS;                        
                        var vDirBall = new CVector2();
                        
                        iQuantityRot = (iDistFromCenter/iHalfWidth);

                        var iCurAngleRot = iMaxAngleRot*iQuantityRot; 
                            iCurAngleRot = degreesToRadians(iCurAngleRot);
                        if ( oInfo.closest_point.getY() > oEdgePlayer.m_pCenter().getY() ){
                            if (aStickPlayers[i].getColorStick()===BLUE_STICK){
                                vPlayerNormal.rotate(-iCurAngleRot);
                            }else{
                                vPlayerNormal.rotate(+iCurAngleRot);
                            }
                        }else{
                            if (aStickPlayers[i].getColorStick()===BLUE_STICK){
                                vPlayerNormal.rotate(+iCurAngleRot);
                            }else{
                                vPlayerNormal.rotate(-iCurAngleRot);
                            }
                        }
                        
                        vDirBall.setV(vPlayerNormal);
                        vDirBall.normalize();
                        vDirBall.scalarProduct( (1-iQuantityRot)*iVariableVelBall + iMinVelBall);

                        oBall.vCurForce().setV(vDirBall);

                        aStickPlayers[i].onShot();
                       if (_oSound === undefined){
                            _oSound = playSound("ball_kick",0.6,false);
                        }
                    else
                    {
                        stopSound("ball_kick");
                                                _oSound = playSound("ball_kick",0.6,false);

                    }
                       
                    
                        }
                }
            }
    };
    
    this.goalCheck = function(){
        if (_oBall.getX()>1618){
            playSound("goal",1,false);
            _bGoalCheck = false;
            _iPlayer1Points++;
            _oScoreRod.onGoalBlue();
            _oInterface.refreshPlayersScore(_iPlayer1Points,_iPlayer2Points);
            this.showGoalText(0);
            
            s_oGame.setPokiStart(false);
            
            if (_iPlayer1Points===POINTS_TO_WIN){
                setTimeout (function(){s_oGame.gameOver(0)},TIME_GOAL_ANIMATION);
                
                if (s_bFriendly===false){
                    if (s_iLastLevel<s_oLevelSettings.getNextLevel()){
                        saveItem("level_foosball",s_oLevelSettings.getNextLevel());
                        
                    }
                }
            }else{
                _bInputUpdate = false;
                setTimeout(this.afterGoal,2000);
            }
        }
        
        if ( _oBall.getX()<299){
            playSound("goal",1,false);
            _bGoalCheck = false;
            _iPlayer2Points++;
            _oScoreRod.onGoalRed();
            _oInterface.refreshPlayersScore(_iPlayer1Points,_iPlayer2Points);
            this.showGoalText(1);
            
            s_oGame.setPokiStart(false);
            
            if (_iPlayer2Points===POINTS_TO_WIN){
                setTimeout (function(){s_oGame.gameOver(1)},TIME_GOAL_ANIMATION);
            }else{
                _bInputUpdate = false;
                setTimeout(this.afterGoal,TIME_GOAL_ANIMATION);
            }
        }
    };
    
    this.showGoalText = function (iPlayer) {
        
        if(s_b2Players){
            PokiSDK.happyTime(0.5);
        }else if(!s_b2Players && iPlayer === 0){
            PokiSDK.happyTime(0.5);
        }
        
        s_oMain.pokiShowCommercial();
        
            var shape = new createjs.Shape();
            shape.graphics.beginFill("#000000").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
            shape.alpha = 0.01;
            shape.on("mousedown",function(){},this);
            s_oStage.addChild(shape);
            var oSprite = s_oSpriteLibrary.getSprite("goal_text");
            var oData = {
               images: [oSprite],
               frames: {width: 1654, height: 300, regX: 1654*0.5, regY: 300*0.5},
               animations: {idle: [0,1,"idle",0.3]}
            };
            var oSpriteSheet = new createjs.SpriteSheet(oData);
            _oGoalText = new createjs.Sprite(oSpriteSheet,"idle");
            _oGoalText.x = CANVAS_WIDTH*0.5;
            _oGoalText.y = CANVAS_HEIGHT*0.5;
            _oGoalText.alpha = 0;
            _oGoalText.scaleX = 0.3;
            _oGoalText.scaleY = 0.3;
            s_oStage.addChild(_oGoalText);
            if (iPlayer===0||s_b2Players){
                playSound("goal_exultance",1,false);
                }else if(iPlayer===1&&!s_b2Players){
                    playSound("miss_goal",1,false);
                }
            new createjs.Tween.get(_oGoalText).to({scaleX:0.8,scaleY:0.8,alpha:1},900,createjs.Ease.cubicOut)
                    .wait(1300)
                    .to({scaleX: 0, scaleY: 0, alpha:0},300,createjs.Ease.cubicIn)
                    .call(function(){s_oStage.removeChild(_oGoalText,shape);});
    };

    this.afterGoal = function(){
        _oButStartGame.setVisible(true);
       _oBall.resetPos();
       _bBallSpin = true;
       _oBall.setVisible(false);
       _bGoalCheck = true;
       _bInputUpdate = false;
    };
    
    this.update = function(){
        if (!_bPaused){
            if (_bUpdateBalls){
               for (var i=0;i<PHYSICS_ITERATIONS;i++){ 
                    _oBall.vPos().addV(_oBall.vCurForce());
               
                    if (_oBall.vPos().getX()<CANVAS_WIDTH*0.5){
                        this.collideBallWithPlayer(_oBall,_aHalfLeftSticks);
                    }else{
                        this.collideBallWithPlayer(_oBall,_aHalfRightSticks);
                    }
                    if (_oBall.vPos().getY()>CANVAS_HEIGHT/2-34){
                        this.collideCircleWithEdges(_oBall,_aHalfDownEdges);
                    }else{
                        this.collideCircleWithEdges(_oBall,_aHalfUpEdges);
                    }
                    _oBall.rolls();
              }
              if (_bScalarProduct){
                _oBall.vCurForce().scalarProduct(0.99);
              }

            };
            
            _oBall.updateSpritePosition();
            if (_bGoalCheck){
                    this.goalCheck();
              }
            
            if (_bInputUpdate){
                if (_bUP1){
                    for (var i=0; i<_aPlayer1Stick.length;i++){
                    _aPlayer1Stick[i].onKeyUp();
                    }
                }
                if (_bDOWN1){
                    for (var i=0; i<_aPlayer1Stick.length;i++){
                    _aPlayer1Stick[i].onKeyDown();
                    }
                }
                if (s_b2Players){
                    if (_bDOWN2){
                        for (var i=0; i<_aPlayer2Stick.length;i++){
                            _aPlayer2Stick[i].onKeyDown();
                        }
                    }
                    if (_bUP2){
                        for (var i=0; i<_aPlayer2Stick.length;i++){
                            _aPlayer2Stick[i].onKeyUp();
                        }
                    }
                }
                if (!s_b2Players){
                    this.AICpu(_oBall,_aPlayer2Stick);
                }
            }
            this.checkBallSlow();
        }
        
        for (var i=0;i<_aPlayer2Stick.length;i++){
            _aPlayer1Stick[i].update();
            _aPlayer2Stick[i].update();
        }
        
    };
    
    this.checkBallSlow = function(){
        if(_oBall.vCurForce().getX()+_oBall.vCurForce().getY()<0.4&&_oBall.vCurForce().getX()+_oBall.vCurForce().getY()>-0.4){
            _bScalarProduct=false;
        }else{
            _bScalarProduct=true;
        }
    };
    
    this.setPause = function(bVal){
        _bPaused = bVal;
        
        s_oGame.setPokiStart(!_bPaused);
    };

    this.setPokiStart = function(bVal){
        if(!_bInputUpdate){
            return;
        }
        
        if(bVal && !_bPokiStart){
            PokiSDK.gameplayStart();
            _bPokiStart = true;
        }else if(!bVal && _bPokiStart) {
            PokiSDK.gameplayStop();
            _bPokiStart = false;
        }
    };

    this.setInput = function(bVal){
        _bInputUpdate = bVal;
    };

    s_oGame=this;
    
    POINTS_TO_LOSE = oData.points_to_lose;
    START_SCORE = oData.starting_points;
    
    AD_SHOW_COUNTER = oData.ad_show_counter;
    
    _oParent=this;
    this._init();
}

var s_oGame;
