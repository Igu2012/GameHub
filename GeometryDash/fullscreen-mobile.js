const MobileFullscreen = {
    init() {
        if (!this.isMobile()) return;
        
        this.requestFullscreen();
        this.hideAddressBar();
        this.setupOrientationChange();
    },
    
    isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    },
    
    requestFullscreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    },
    
    hideAddressBar() {
        window.scrollTo(0, 1);
        
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
        
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        
        if (document.documentElement) {
            document.documentElement.style.height = '100vh';
            document.documentElement.style.overflow = 'hidden';
        }
        
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            meta.setAttribute('content', 'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        } else {
            const newMeta = document.createElement('meta');
            newMeta.name = 'viewport';
            newMeta.content = 'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(newMeta);
        }
    },
    
    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.hideAddressBar();
            }, 500);
        });
        
        window.addEventListener('resize', () => {
            if (window.innerHeight < window.screen.height) {
                document.body.style.height = window.innerHeight + 'px';
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => MobileFullscreen.init());
window.addEventListener('load', () => MobileFullscreen.init());
