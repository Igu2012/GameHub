function CEdgeModel(xA, yA, xB, yB) {
    //--------------------
    // Attributes
    var m_pA = null;
    var m_pB = null;
    var m_pCenter = null;
    var m_pProj = null;
    var m_vNormal = null;

    var LENGTH_NORMAL = 5;

    //--------------------
    // Methods
    this._init = function (xA, yA, xB, yB) {
        this.set(xA, yA, xB, yB);
    };

    this.destroy = function () {
        m_pA = null;
        m_pB = null;
        m_pCenter = null;
        m_pProj = null;
        m_vNormal = null;
    };

    this.render = function (oLineDraw) {
        oLineDraw.moveTo(m_pA.x, m_pA.y);
        oLineDraw.lineTo(m_pB.x, m_pB.y);
    };

    this.toString = function (sz) {
        trace(sz + " " + m_pA.x + " " + m_pA.y + " " + m_pB.x + " " + m_pB.y);
    };

    this.add = function (vAdd) {
        m_pA.addV(vAdd);
        m_pB.addV(vAdd);
    };

    this.set = function (xA, yA, xB, yB) {
        m_pA = new CVector2();
        m_pB = new CVector2();
        m_pA.set(xA, yA);
        m_pB.set(xB, yB);
        this.calculateNormal();
        this.calculateCenter();
    };
    
    this.moveY = function(iY){
        m_pA.add(0,iY);
        m_pB.add(0,iY);
        this.calculateNormal();
        this.calculateCenter();
    };

    this.scale = function (iVal) {
        m_pA.scalarProduct(iVal);
        m_pB.scalarProduct(iVal);
        this.calculateNormal();
        this.calculateCenter();
    };

    this.calculateNormal = function () {
        m_vNormal = null;
        m_vNormal = new CVector2();
        m_vNormal.setV(m_pB);
        m_vNormal.subtract(m_pA);
        m_vNormal.rot90CCW();
        m_vNormal.normalize();
    };

    this.calculateCenter = function () {
        m_pCenter = null;
        m_pCenter = centerBetweenPointsV2(m_pA, m_pB);

        m_pProj = new CVector2();
        m_pProj.setV(m_vNormal);
        m_pProj.scalarProduct(LENGTH_NORMAL);
        m_pProj.addV(m_pCenter);
    };

    this.getPointA = function () {
        return m_pA;
    };

    this.m_pCenter = function () {
        return m_pCenter;
    };

    this.getPointB = function () {
        return m_pB;
    };

    this.getNormal = function () {
        return m_vNormal;
    };

    this.renderNormal = function (oLineDraw) {
        oLineDraw.moveTo(m_pCenter.x, m_pCenter.y);
        oLineDraw.lineTo(m_pProj.x, m_pProj.y);
    };
    
    this.getLength = function(){
        return Math.sqrt(Math.pow((xB-xA),2)+Math.pow((yB-yA),2));
    };

    this._init(xA, yA, xB, yB);

    return this;
}