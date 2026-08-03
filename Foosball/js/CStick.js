function CStick (iX,iY,iColorStick,iYUp,iYDown,aPosEdges,iTypeStick,iSpeed){
    var _oContainer;
    var _oStick;
    var _iYUpMax;
    var _iYDownMax;
    var _aPosEdges;
    var _aPlayerEdges;
    var _aSpritesPlayer;
    var _iSense;
    var _iTypeStick;
    var _iSpeed;
    var _iColorStick;
    var _iCurAcceleration;
    
    this.init = function(iX,iY,iColorStick,iYUp,iYDown,aPosEdges,iTypeStick,iSpeed){
        var oSprite;
        var oInfo;
        var iOffsetSpeed = 0;
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        _aPlayerEdges = new Array();
        _aSpritesPlayer = new Array();
        _iColorStick = iColorStick;
        _iCurAcceleration = 0;
        _iTypeStick = iTypeStick;
        if (iTypeStick===GOALKEEPER){
            iOffsetSpeed = PLAYER_SPEED_STICKS/2;
        }else if(iTypeStick===DEFENDER){
            iOffsetSpeed = PLAYER_SPEED_STICKS/3;
        }else if(iTypeStick===MIDFIELDER){
            
        }else if(iTypeStick===STRIKER){
            iOffsetSpeed = PLAYER_SPEED_STICKS/4;
        }
        
        _iSpeed = iSpeed+iOffsetSpeed;
        
        oSprite = s_oSpriteLibrary.getSprite("stick");
        
        _oStick = new createBitmap(oSprite,oSprite.width,oSprite.height);
        
        _oStick.regX = 21;
        _oStick.regY = 1224;
        _oStick.x = iX;
        _oStick.y = iY;
        if (_iColorStick===1){
            _oStick.scaleY*=-1;
        }
        _oContainer.addChild(_oStick);
        _iYUpMax = iYUp;
        _iYDownMax = iYDown;
        _aPosEdges = aPosEdges;
        
        var iOffsetX = 0;
        
        if (_iColorStick===0){
            oSprite = s_oSpriteLibrary.getSprite("player_blue");
            oInfo = {regX:53 ,regY:32 };
            _iSense = 1;
            iOffsetX = 15;
        }else{
            oSprite = s_oSpriteLibrary.getSprite("player_red");
            oInfo = {regX:49 ,regY:32 };
            _iSense = -1;
            iOffsetX = -15;
        }
        
       var oData = {
          images: [oSprite],
          frames: {width: 100, height: 70, regX: oInfo.regX, regY: oInfo.regY},
          animations: {idle: [0,0,"idle"], shot: {frames: [1,2,3],next: "idle"}}
       };
       
       var oSpriteSheet = new createjs.SpriteSheet(oData);
       
        for (var i=0;i<aPosEdges.length;i++){
            _aPlayerEdges.push(new CEdge(iX+iOffsetX,_aPosEdges[i].y1,iX+iOffsetX,_aPosEdges[i].y2,1,false));
            _aSpritesPlayer.push(new createjs.Sprite(oSpriteSheet,"idle"));
            _aSpritesPlayer[i].x = _aPlayerEdges[i].getModel().m_pCenter().getX()-iOffsetX;
            _aSpritesPlayer[i].y = _aPlayerEdges[i].getModel().m_pCenter().getY();
            _oContainer.addChild(_aSpritesPlayer[i]);
        }
        
    };
    
    this.getX = function(){
        return _oStick.x;
    };
    
    this.getColorStick = function(){
        return _iColorStick;
    };
    
    this.getDistanceFromStickToEdge = function(oEdge){
        return Math.sqrt(Math.pow((oEdge.x-_oStick.x),2)+Math.pow((oEdge.y-_oStick.y),2));
    };
    
    this.onKeyUp = function(){
       if( _oStick.y === _iYUpMax ){
           return;
       }
       
       _iCurAcceleration -= STICK_ACCELLERATION;

        this.__updateStickPositions();        
    };
    
    this.onKeyDown = function(){
        if( _oStick.y === _iYDownMax ){
            return;
       }    
       
       _iCurAcceleration += STICK_ACCELLERATION;
       
        this.__updateStickPositions();
    };
    
    this.__updateStickPositions = function(){
        
       if( Math.abs(_iCurAcceleration) > _iSpeed ){           
            if( _iCurAcceleration < 0 ){
                _iCurAcceleration = -_iSpeed;
            }else{
                _iCurAcceleration = _iSpeed;
            }           
       }
       
        var iPlacement = _iCurAcceleration;
        
        if (_oStick.y+_iCurAcceleration < _iYUpMax){
            iPlacement = _iYUpMax-_oStick.y;
            _iCurAcceleration = 0;
        }else if (_oStick.y+_iCurAcceleration > _iYDownMax){
            _iCurAcceleration = 0;
            iPlacement = _iYDownMax-_oStick.y;
        }
        
        _oStick.y += iPlacement; 
        
        for (var i=0;i<_aPlayerEdges.length;i++){
              _aPlayerEdges[i].moveY(iPlacement);
              _aSpritesPlayer[i].y += iPlacement;
        }        
    };
    
    this.onShot = function(){
       for (var i=0;i<_aSpritesPlayer.length;i++){
           _aSpritesPlayer[i].gotoAndPlay("shot");
       }
    };
    
    
    this.getEdges = function(){
        return _aPlayerEdges;
    };
    
    this.update = function(){
        _iCurAcceleration *= STICK_FRICTION;
        this.__updateStickPositions();
    };
    
    this.init(iX,iY,iColorStick,iYUp,iYDown,aPosEdges,iTypeStick,iSpeed);
}