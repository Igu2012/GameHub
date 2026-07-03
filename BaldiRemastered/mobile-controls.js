const BaldiSmartControls = {
    isInitialized: false,
    controlsVisible: false,
    gameStarted: false,
    
    init() {
        if (!this.isMobile()) return;
        
        this.monitorGameStart();
    },
    
    isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    },
    
    monitorGameStart() {
        const canvas = document.getElementById('unity-canvas');
        if (!canvas) {
            setTimeout(() => this.monitorGameStart(), 500);
            return;
        }
        
        canvas.addEventListener('click', () => {
            if (!this.gameStarted) {
                this.gameStarted = true;
                setTimeout(() => {
                    this.createControlsUI();
                }, 1000);
            }
        });
        
        setTimeout(() => {
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.createControlsUI();
            }
        }, 8000);
    },
    
    createControlsUI() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        const container = document.createElement('div');
        container.id = 'mobile-controls';
        container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 150px;
            background: rgba(0,0,0,0.3);
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 10px;
            box-sizing: border-box;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        const joystickArea = document.createElement('div');
        joystickArea.id = 'joystick-area';
        joystickArea.style.cssText = `
            width: 120px;
            height: 120px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            position: relative;
            border: 2px solid rgba(255,255,255,0.3);
        `;
        
        const joystick = document.createElement('div');
        joystick.id = 'joystick';
        joystick.style.cssText = `
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        `;
        
        joystickArea.appendChild(joystick);
        
        const buttonsArea = document.createElement('div');
        buttonsArea.id = 'buttons-area';
        buttonsArea.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
            width: 200px;
        `;
        
        const buttons = [
            { id: 'run-btn', label: 'Run', key: 'shift' },
            { id: 'interact-btn', label: 'Use', key: 'e' },
            { id: 'pause-btn', label: 'Pause', key: 'escape' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.textContent = btn.label;
            button.style.cssText = `
                width: 50px;
                height: 50px;
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.4);
                color: white;
                border-radius: 8px;
                font-size: 10px;
                cursor: pointer;
                touch-action: manipulation;
            `;
            
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.focusUnityCanvas();
                this.sendKeyToUnity(btn.key, true);
                button.style.background = 'rgba(255,255,255,0.4)';
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.sendKeyToUnity(btn.key, false);
                button.style.background = 'rgba(255,255,255,0.2)';
            });
            
            buttonsArea.appendChild(button);
        });
        
        container.appendChild(joystickArea);
        container.appendChild(buttonsArea);
        document.body.appendChild(container);
        
        setTimeout(() => {
            container.style.opacity = '1';
            this.controlsVisible = true;
        }, 100);
        
        this.setupJoystick(joystickArea, joystick);
    },
    
    focusUnityCanvas() {
        const canvas = document.getElementById('unity-canvas');
        if (canvas) {
            canvas.focus();
            canvas.click();
        }
    },
    
    setupJoystick(area, stick) {
        let isActive = false;
        let currentKeys = { w: false, a: false, s: false, d: false };
        
        const handleMove = (e) => {
            if (!isActive) return;
            
            const touch = e.touches[0];
            const rect = area.getBoundingClientRect();
            const x = touch.clientX - rect.left - rect.width / 2;
            const y = touch.clientY - rect.top - rect.height / 2;
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = rect.width / 2 - 30;
            
            const angle = Math.atan2(y, x);
            const limitedDistance = Math.min(distance, maxDistance);
            
            const stickX = Math.cos(angle) * limitedDistance;
            const stickY = Math.sin(angle) * limitedDistance;
            
            stick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;
            
            this.handleJoystickInput(angle, currentKeys);
        };
        
        area.addEventListener('touchstart', (e) => {
            isActive = true;
            this.focusUnityCanvas();
            handleMove(e);
        });
        
        document.addEventListener('touchmove', handleMove);
        
        document.addEventListener('touchend', () => {
            isActive = false;
            stick.style.transform = 'translate(-50%, -50%)';
            Object.keys(currentKeys).forEach(key => {
                if (currentKeys[key]) this.sendKeyToUnity(key, false);
                currentKeys[key] = false;
            });
        });
    },
    
    handleJoystickInput(angle, currentKeys) {
        const directions = {
            'w': angle > -Math.PI * 0.75 && angle < -Math.PI * 0.25,
            'a': angle > -Math.PI * 1.25 && angle < -Math.PI * 0.75,
            's': angle > Math.PI * 0.25 || angle < -Math.PI * 0.75,
            'd': angle > -Math.PI * 0.25 && angle < Math.PI * 0.25
        };
        
        Object.entries(directions).forEach(([key, active]) => {
            if (active && !currentKeys[key]) {
                this.sendKeyToUnity(key, true);
                currentKeys[key] = true;
            } else if (!active && currentKeys[key]) {
                this.sendKeyToUnity(key, false);
                currentKeys[key] = false;
            }
        });
    },
    
    sendKeyToUnity(key, isPressed) {
        const keyCode = {
            'w': 87, 'a': 65, 's': 83, 'd': 68,
            'e': 69, 'shift': 16, 'escape': 27
        }[key] || key.charCodeAt(0);
        
        const eventType = isPressed ? 'keydown' : 'keyup';
        const event = new KeyboardEvent(eventType, {
            key: key,
            keyCode: keyCode,
            code: `Key${key.toUpperCase()}`,
            bubbles: true,
            cancelable: true
        });
        
        const canvas = document.getElementById('unity-canvas');
        if (canvas) {
            canvas.dispatchEvent(event);
        }
        document.dispatchEvent(event);
        window.dispatchEvent(event);
    }
};

document.addEventListener('DOMContentLoaded', () => BaldiSmartControls.init());
window.addEventListener('load', () => BaldiSmartControls.init());
