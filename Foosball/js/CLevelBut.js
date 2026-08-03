function CLevelBut(iXPos, iYPos, szText,oSprite, bActive,oParentContainer) {
    var _bActive;
    var _aCbCompleted;
    var _aCbOwner;
    var _aButton = new Array();
    var _aParams = [];
    
    var _oLevelTextStruct;
    var _oLevelText;
    var _oButton;
    var _oContainer;
    var _oParentContainer;
    
    var _mousedown;
    var _pressup;

    this._init = function (iXPos, iYPos, szText,oSprite, bActive) {
        _aCbCompleted = new Array();
        _aCbOwner = new Array();
        
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);
        
        var oData = {
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: oSprite.width / 2, height: oSprite.height, regX: (oSprite.width / 2) / 2, regY: oSprite.height / 2},
            animations: {state_true: [0], state_false: [1]}
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);

        _bActive = bActive;
        _oButton = createSprite(oSpriteSheet, "state_" + _bActive, (oSprite.width / 2) / 2, oSprite.height / 2, oSprite.width / 2, oSprite.height);

        _oButton.mouseEnabled = bActive;
        _oButton.x = iXPos;
        _oButton.y = iYPos;
        _oButton.stop();
		
        if (!s_bMobile&&_bActive){
            _oContainer.cursor = "pointer";
        }
        
        _oContainer.addChild(_oButton);
        _aButton.push(_oButton);

        _oLevelText = new createjs.Text(szText, "80px " + PRIMARY_FONT, "#fff");
        _oLevelText.x = iXPos-7;
        _oLevelText.y = iYPos + 30;
        _oLevelText.textAlign = "center";
        _oLevelText.textBaseline = "alphabetic";
        _oLevelText.lineWidth = 200;
        _oContainer.addChild(_oLevelText);
        
        if(!bActive){
            _oLevelText.color = "#404040";
        }

        this._initListener();
    };

    this.unload = function () {
         _oContainer.off("mousedown", _mousedown);
        _oContainer.off("pressup", _pressup);

        _oContainer.removeChild(_oButton);
    };

    this._initListener = function () {
        _mousedown = _oContainer.on("mousedown", this.buttonDown);
        _pressup = _oContainer.on("pressup", this.buttonRelease);
    };

    this.viewBut = function (oButton) {
        _oContainer.addChild(oButton);
    };

    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };

    this.addEventListenerWithParams = function (iEvent, cbCompleted, cbOwner, aParams) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams = aParams;
    };

    this.ifClickable = function () {
        if (_oContainer.mouseEnabled === true) {
            return 1;
        }
        return 0;
    };

    this.setActive = function (iLevel, bActive) {
        _bActive = bActive;
        _aButton[iLevel].gotoAndStop("state_" + _bActive);
        _aButton[iLevel].mouseEnabled = true;
        
        if(_bActive){
            _oLevelText.color = "#69b8d5";
            _oLevelTextStruct.color = "#004e6f";
        }else{
            _oLevelText.color = "#b4b4b4";
            _oLevelTextStruct.color = "#606161";
        }
        
    };

    this.buttonRelease = function () {
        if(!_bActive){
            return;
        }
        playSound("click", 1, false);

        if (_aCbCompleted[ON_MOUSE_UP]) {
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP], _aParams);
        }
    };

    this.buttonDown = function () {
        if (_aCbCompleted[ON_MOUSE_DOWN]) {
            _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN], _aParams);
        }
    };

    this.setPosition = function (iXPos, iYPos) {
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
    };

    this.setVisible = function (bVisible) {
        _oContainer.visible = bVisible;
    };
    
    _oParentContainer = oParentContainer;
    this._init(iXPos, iYPos, szText,oSprite, bActive,oParentContainer);
}