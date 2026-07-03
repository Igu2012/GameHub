function CScoreRod (iPointsToWin){
    var _oContainer;
    var _oBlueRod;
    var _oRedRod;
    var _iPointsToWin;
    var _aPointsCubeBlue;
    var _aPointsCubeRed;
    var _iCounterGoalRed;
    var _iCounterGoalBlue;
    
    this.init = function(iPointsToWin){
        _iPointsToWin = iPointsToWin;
        if (_iPointsToWin>10){
            _iPointsToWin = 10;
        }
        _aPointsCubeBlue = new Array();
        _aPointsCubeRed = new Array();
        _iCounterGoalBlue = 0;
        _iCounterGoalRed = 0;
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        var oSprite = s_oSpriteLibrary.getSprite("score_rod_blue");
        _oBlueRod = new createBitmap(oSprite,oSprite.width,oSprite.height);
        _oBlueRod.x = CANVAS_WIDTH/2-720;
        _oBlueRod.y = CANVAS_HEIGHT/2-223;
        _oContainer.addChild(_oBlueRod);
        oSprite = s_oSpriteLibrary.getSprite("score_rod_red");
        _oRedRod = new createBitmap(oSprite,oSprite.width,oSprite.height);
        _oRedRod.x = CANVAS_WIDTH/2+693;
        _oRedRod.y = CANVAS_HEIGHT/2-223;
        _oContainer.addChild(_oRedRod);
        
        oSprite = s_oSpriteLibrary.getSprite("score_cube_blue");
        var oSprite2 = s_oSpriteLibrary.getSprite("score_cube_red");
        
        for (var i=0;i<_iPointsToWin;i++){
            _aPointsCubeBlue.push(new createBitmap(oSprite,oSprite.width,oSprite.height));
            _aPointsCubeBlue[i].x = _oBlueRod.x;
            _aPointsCubeRed.push(new createBitmap(oSprite2,oSprite2.width,oSprite2.height));
             _aPointsCubeRed[i].x = _oRedRod.x;
            if (i===0){
                _aPointsCubeBlue[i].y = _oBlueRod.y+oSprite.height-7;
                _aPointsCubeRed[i].y = _oRedRod.y+307;//-oSprite2.height-7;
            }else{
                _aPointsCubeBlue[i].y = _aPointsCubeBlue[i-1].y+oSprite.height-8;
                _aPointsCubeRed[i].y = _aPointsCubeRed[i-1].y-oSprite2.height+9;
            }
            _oContainer.addChild(_aPointsCubeBlue[i]);
            //_oContainer.addChild(_aPointsCubeRed[i]);
        }
        
        for (var i=_aPointsCubeRed.length;i>=0;i--){
            _oContainer.addChild(_aPointsCubeRed[i]);
        }
        
    };
    
    this.onGoalBlue = function(){
       if (_iCounterGoalBlue===0){
           new createjs.Tween.get(_aPointsCubeBlue[_aPointsCubeBlue.length-1]).to({y: _oBlueRod.y+307},1000,createjs.Ease.cubicOut);
       }else{
           new createjs.Tween.get(_aPointsCubeBlue[_aPointsCubeBlue.length-(1+_iCounterGoalBlue)]).to({y: _aPointsCubeBlue[_aPointsCubeBlue.length-(_iCounterGoalBlue)].y-25},1000,createjs.Ease.cubicOut);
       }
       _iCounterGoalBlue++;
    };
    
    this.onGoalRed = function(){
        if (_iCounterGoalRed===0){
           new createjs.Tween.get(_aPointsCubeRed[_aPointsCubeRed.length-1]).to({y: _oRedRod.y+33-8},1000,createjs.Ease.cubicOut);
       }else{
           new createjs.Tween.get(_aPointsCubeRed[_aPointsCubeRed.length-(1+_iCounterGoalRed)]).to({y: _aPointsCubeRed[_aPointsCubeRed.length-(_iCounterGoalRed)].y+33-8},1000,createjs.Ease.cubicOut);
       }
       _iCounterGoalRed++;
    };
    
    this.init(iPointsToWin);
}