function CBall(iXPos, iYPos, oSprite, iID, oParentContainer) {

    var _oParentContainer;
    var _oContainer;
    var _oBall;
    var _oShadow;
    var _oStartPos;
    var _vPos;
    var _vPrevPos;
    var _vCurForce;
    var _iID;
    var _iRadius;
    var _iHalfRadius;
    var _iRadiusQuadro;
    var _iBufferTime = 0;
    var _iFrame = 0;

    this._init = function (iXPos, iYPos, oSprite, iID) {
        _oContainer = new createjs.Container();
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;

        this.createShadow();

        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 7, height: oSprite.height, regX: (oSprite.width / 2) / 7, regY: oSprite.height / 2}
        };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oBall = createSprite(oSpriteSheet, 0, (oSprite.width / 2) / 7, oSprite.height / 2, oSprite.width / 7, oSprite.height / 2);
        _oBall.stop();

        _oContainer.addChild(_oBall);

        _vPos = new CVector2();
        _vPos.set(_oContainer.x, _oContainer.y);
        _vPrevPos = new CVector2();
        _vPrevPos.set(0, 0);

        _iID = iID;

        _oStartPos = {x: iXPos, y: iYPos};

        _iRadius = (oSprite.width * 0.5) / 7;
        _iHalfRadius = _iRadius*0.5;
        _iRadiusQuadro = _iRadius * _iRadius;

        _vCurForce = new CVector2(0,0);

        _oParentContainer.addChild(_oContainer);

    };

    this.createShadow = function () {
        var oSpriteShadow = s_oSpriteLibrary.getSprite("player_shadow");
        _oShadow = createBitmap(oSpriteShadow);
        _oShadow.regX = oSpriteShadow.width * 0.5;
        _oShadow.regY = -7;
        _oShadow.y = -15;
        _oShadow.x = -5;
        _oShadow.alpha = 0.5;
       // _oShadow.scaleX = 0.8;
        //_oShadow.scaleY = 0.8;

        _oContainer.addChild(_oShadow);
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oContainer);
    };

    this.setVisible = function (bVisible) {
        _oContainer.visible = bVisible;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
    };

    this.resetPos = function () {
        _oContainer.x = _oStartPos.x;
        _oContainer.y = _oStartPos.y;
        _vPos.set(_oContainer.x, _oContainer.y);
        _vCurForce.set(0, 0);
    };

    this.setAngle = function (iAngle) {
        _oBall.rotation = iAngle;
    };

    this.getHalfRadius = function(){
        return _iHalfRadius;
    };

    this.getX = function () {
        return _oContainer.x;
    };

    this.getY = function () {
        return _oContainer.y;
    };

    this.scale = function (fValue) {
        _oContainer.scaleX = fValue;
        _oContainer.scaleY = fValue;
    };

    this.getScale = function () {
        return _oContainer.scaleX;
    };

    this.type = function () {
        return BALL;
    };

    this.vCurForce = function () {
        return _vCurForce;
    };

    this.vPos = function () {
        return _vPos;
    };

    this.setPos = function (vPos) {
        _vPos.setV(vPos);
    };

    this.vPrevPos = function () {
        return _vPrevPos;
    };

    this.getRadius = function () {
        return _iRadius;
    };

    this.getRadiusQuadro = function () {
        return _iRadiusQuadro;
    };

    this.updateSpritePosition = function () {
        _oContainer.x = _vPos.getX();
        _oContainer.y = _vPos.getY();
    };

    this.isGoalKeeper = function () {
        return false;
    };

    this.getID = function () {
        return _iID;
    };

    this.rolls = function () {
        /*
         decrease ball's velocity for testing purposes
       var vFixedForce = new CVector2();
       vFixedForce.setV(_vCurForce);
       vFixedForce.normalize();
       vFixedForce.scalarProduct(0.7);
       _vCurForce = vFixedForce;
       */
       
       var iLength2 = _vCurForce.length2()*BALL_SPRITE_ANIM_MULTIPLIER;
       var iSteps = iLength2;
       if (iSteps>0.1){
           iSteps = 0.1;
       }
  
       _iFrame+=iSteps;
       if (_iFrame>7){
           _iFrame-=7;
       }
       _oBall.gotoAndStop(Math.round(_iFrame));
       if (_vCurForce.getY()<0){
            var vAxis = new CVector2(-1,0);
            _oBall.rotation = radiansToDegree(vAxis.angleBetweenVectors(_vCurForce))-90;
        }else{
             var vAxis = new CVector2(+1,0);
            _oBall.rotation = radiansToDegree(vAxis.angleBetweenVectors(_vCurForce))+90;
        }
    };

    this.getChildIndex = function () {
        _oParentContainer.getChildIndex(_oContainer);
    };

    this.setChildIndex = function (iValue) {
        _oParentContainer.setChildIndex(_oContainer, iValue);
    };

    this.getObject = function () {
        return _oContainer;
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, oSprite, iID);

    return this;
}
