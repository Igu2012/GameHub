function CEdge (iX1,iY1,iX2,iY2,iHeight,bVisible){
    var _oModel;
    var _oViewer;
    
    this.init = function(iX1,iY1,iX2,iY2,iHeight){
        var oLength;
        _oModel = new CEdgeModel(iX1,iY1,iX2,iY2);
        oLength = _oModel.getLength();
        if (bVisible){
            _oViewer = new CEdgeViewer(iX1,iY1,iX2,iY2,oLength,iHeight);
        }
        
    };
    
    this.getModel = function(){
       return _oModel; 
    };
    
    this.moveY = function(iY){
       if (bVisible){
           _oViewer.moveY(iY);
       } 
       _oModel.moveY(iY);
    };
    
    this.init(iX1,iY1,iX2,iY2,iHeight);
}
