"use strict";

function Touch_Singleton() {
    this._position = Vector2.zero;
    this._isDragging = false;
    this._power = 0;
    this._active = false;
    
    // Configurações da barra de força (lado esquerdo)
    this.powerBarRect = {
        x: 20,
        y: 150,
        width: 60,
        height: 500
    };

    var self = this;

    // Detectar se é dispositivo móvel
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        this._active = true;
        document.addEventListener('touchstart', function(e) { self.handleTouchStart(e); }, { passive: false });
        document.addEventListener('touchmove', function(e) { self.handleTouchMove(e); }, { passive: false });
        document.addEventListener('touchend', function(e) { self.handleTouchEnd(e); }, { passive: false });
    }
}

Touch_Singleton.prototype.handleTouchStart = function(e) {
    var touch = e.touches[0];
    var pos = this.getTouchPos(touch);
    this._position = pos;
    this._isDragging = true;

    // Verificar se tocou na barra de força
    if (this.isInsidePowerBar(pos)) {
        this.updatePower(pos);
        e.preventDefault();
    }
};

Touch_Singleton.prototype.handleTouchMove = function(e) {
    var touch = e.touches[0];
    var pos = this.getTouchPos(touch);
    this._position = pos;

    if (this._isDragging) {
        if (this.isInsidePowerBar(pos)) {
            this.updatePower(pos);
        } else {
            // Se estiver arrastando fora da barra, atualizamos a posição do mouse global para a mira
            Mouse._position = pos;
        }
        e.preventDefault();
    }
};

Touch_Singleton.prototype.handleTouchEnd = function(e) {
    this._isDragging = false;
    
    // Se soltou com força > 0, dispara (simula clique do mouse)
    if (this._power > 0) {
        // Disparo será tratado no Stick.js verificando Touch.power
    }
};

Touch_Singleton.prototype.getTouchPos = function(touch) {
    var canvasScale = Canvas2D.scale;
    var canvasOffset = Canvas2D.offset;
    var mx = (touch.pageX - canvasOffset.x) / canvasScale.x;
    var my = (touch.pageY - canvasOffset.y) / canvasScale.y;
    return new Vector2(mx, my);
};

Touch_Singleton.prototype.isInsidePowerBar = function(pos) {
    return pos.x >= this.powerBarRect.x && pos.x <= this.powerBarRect.x + this.powerBarRect.width &&
           pos.y >= this.powerBarRect.y && pos.y <= this.powerBarRect.y + this.powerBarRect.height;
};

Touch_Singleton.prototype.updatePower = function(pos) {
    // Calcular força baseada na altura do toque na barra (0 a 75, conforme Stick.js)
    var relativeY = pos.y - this.powerBarRect.y;
    var percent = 1 - (relativeY / this.powerBarRect.height);
    percent = Math.max(0, Math.min(1, percent));
    this._power = percent * 75;
};

Touch_Singleton.prototype.drawUI = function() {
    if (!this._active) return;

    var ctx = Canvas2D._canvasContext;
    var scale = Canvas2D.scale;

    ctx.save();
    ctx.scale(scale.x, scale.y);

    // Desenhar fundo da barra de força
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(this.powerBarRect.x, this.powerBarRect.y, this.powerBarRect.width, this.powerBarRect.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.powerBarRect.x, this.powerBarRect.y, this.powerBarRect.width, this.powerBarRect.height);

    // Desenhar nível de força
    var fillHeight = (this._power / 75) * this.powerBarRect.height;
    var gradient = ctx.createLinearGradient(0, this.powerBarRect.y + this.powerBarRect.height, 0, this.powerBarRect.y);
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(0.5, "orange");
    gradient.addColorStop(1, "red");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(this.powerBarRect.x + 5, this.powerBarRect.y + this.powerBarRect.height - fillHeight, this.powerBarRect.width - 10, fillHeight);

    // Texto explicativo
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("FORÇA", this.powerBarRect.x + this.powerBarRect.width/2, this.powerBarRect.y - 10);
    
    // Botão de chute se houver força
    if (this._power > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(this.powerBarRect.x, this.powerBarRect.y + this.powerBarRect.height + 20, this.powerBarRect.width, 60);
        ctx.fillStyle = "black";
        ctx.font = "bold 20px Arial";
        ctx.fillText("GO!", this.powerBarRect.x + this.powerBarRect.width/2, this.powerBarRect.y + this.powerBarRect.height + 55);
    }

    ctx.restore();
};

Touch_Singleton.prototype.checkShoot = function() {
    // Retorna verdadeiro se o usuário clicar no botão "GO"
    if (this._power > 0 && this._isDragging) {
        var pos = this._position;
        if (pos.x >= this.powerBarRect.x && pos.x <= this.powerBarRect.x + this.powerBarRect.width &&
            pos.y >= this.powerBarRect.y + this.powerBarRect.height + 20 && pos.y <= this.powerBarRect.y + this.powerBarRect.height + 80) {
            var p = this._power;
            this._power = 0;
            this._isDragging = false;
            return p;
        }
    }
    return 0;
};

var Touch = new Touch_Singleton();
