/* --- 1. CHARGEMENT AUTOMATIQUE DE PEP.JS --- */
(function() {
    var script = document.createElement('script');
    script.src = "https://code.jquery.com/pep/0.4.3/pep.js";
    script.async = true;
    document.head.appendChild(script);
})();

/* --- 2. CODE PRINCIPAL --- */
document.addEventListener("DOMContentLoaded", function() {
    
    // A. Charge le footer et ses animations
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
            initCookieBanner();
            initLavaLampInteraction(); 
        })
        .catch(error => console.error("Erreur footer:", error));

    // B. Lance le fond Blob Interactif (Jelly Effect)
    initBlobBackground();
});

// --- FONCTIONS UTILITAIRES ---

function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const btn = document.getElementById('accept-cookie');
    const btnRefuse = document.getElementById('refuse-cookie');

    if (localStorage.getItem('cookieAccepted') === 'true') {
        if(banner) banner.style.display = 'none';
        return;
    }
    if(btn) {
        btn.addEventListener('click', () => { 
            if(banner) banner.style.display = 'none'; 
            localStorage.setItem('cookieAccepted', 'true'); 
        });
    }
    if(btnRefuse) {
        btnRefuse.addEventListener('click', () => { 
            if(banner) banner.style.display = 'none'; 
        });
    }
}

function initLavaLampInteraction() {
    const container = document.querySelector('.lamp-container');
    const blob = document.getElementById('cursor-blob');
    if (!container || !blob) return;

    let currentX = 0, currentY = 0, mouseX = 0, mouseY = 0, isHovering = false;

    container.addEventListener('mousemove', function(e) {
        isHovering = true;
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', function() { isHovering = false; });

    function animate() {
        if (isHovering) {
            currentX += (mouseX - currentX) * 0.08;
            currentY += (mouseY - currentY) * 0.08;
            blob.style.opacity = "1";
            blob.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        } else {
            blob.style.opacity = "0";
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// --- FOND BLOB (JELLY EFFECT) ---
function initBlobBackground() {
    class Blob {
        constructor() { this.points = []; }
        init() {
            for(let i = 0; i < this.numPoints; i++) {
                let point = new Point(this.divisional * ( i + 1 ), this);
                this.push(point);
            }
        }
        render() {
            let canvas = this.canvas;
            let ctx = this.ctx;
            let pointsArray = this.points;
            let points = this.numPoints;
            let center = this.center;
            
            ctx.clearRect(0,0,canvas.width,canvas.height);
            
            pointsArray[0].solveWith(pointsArray[points-1], pointsArray[1]);

            let p0 = pointsArray[points-1].position;
            let p1 = pointsArray[0].position;
            let _p2 = p1;

            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.moveTo( (p0.x + p1.x) / 2, (p0.y + p1.y) / 2 );

            for(let i = 1; i < points; i++) {
                pointsArray[i].solveWith(pointsArray[i-1], pointsArray[i+1] || pointsArray[0]);
                let p2 = pointsArray[i].position;
                var xc = (p1.x + p2.x) / 2;
                var yc = (p1.y + p2.y) / 2;
                ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
                p1 = p2;
            }

            var xc = (p1.x + _p2.x) / 2;
            var yc = (p1.y + _p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);

            ctx.fillStyle = this.color;
            ctx.fill();
            
            requestAnimationFrame(this.render.bind(this));
        }
        push(item) { if(item instanceof Point) this.points.push(item); }
        set color(value) { this._color = value; }
        get color() { return this._color || '#ffdab9'; }
        set canvas(value) {
            if(value instanceof HTMLElement && value.tagName.toLowerCase() === 'canvas') {
                this._canvas = value;
                this.ctx = this._canvas.getContext('2d');
            }
        }
        get canvas() { return this._canvas; }
        set numPoints(value) { if(value > 2) this._points = value; }
        get numPoints() { return this._points || 32; }
        set radius(value) { if(value > 0) this._radius = value; }
        get radius() { return this._radius || 150; }
        set position(value) { if(typeof value == 'object' && value.x && value.y) this._position = value; }
        get position() { return this._position || { x: 0.5, y: 0.5 }; }
        get divisional() { return Math.PI * 2 / this.numPoints; }
        get center() { return { x: this.canvas.width * this.position.x, y: this.canvas.height * this.position.y }; }
    }

    class Point {
        constructor(azimuth, parent) {
            this.parent = parent;
            this.azimuth = Math.PI - azimuth;
            this._components = { x: Math.cos(this.azimuth), y: Math.sin(this.azimuth) };
            this.acceleration = -0.3 + Math.random() * 0.6;
        }
        solveWith(leftPoint, rightPoint) {
            this.acceleration = (-0.3 * this.radialEffect + ( leftPoint.radialEffect - this.radialEffect ) + ( rightPoint.radialEffect - this.radialEffect )) * this.elasticity - this.speed * this.friction;
        }
        set acceleration(value) { if(typeof value == 'number') { this._acceleration = value; this.speed += this._acceleration * 2; } }
        get acceleration() { return this._acceleration || 0; }
        set speed(value) { if(typeof value == 'number') { this._speed = value; this.radialEffect += this._speed * 5; } }
        get speed() { return this._speed || 0; }
        set radialEffect(value) { if(typeof value == 'number') { this._radialEffect = value; } }
        get radialEffect() { return this._radialEffect || 0; }
        get position() { 
            return { 
                x: this.parent.center.x + this.components.x * (this.parent.radius + this.radialEffect), 
                y: this.parent.center.y + this.components.y * (this.parent.radius + this.radialEffect) 
            }
        }
        get components() { return this._components; }
        set elasticity(value) { if(typeof value === 'number') this._elasticity = value; }
        get elasticity() { return this._elasticity || 0.001; }
        set friction(value) { if(typeof value === 'number') this._friction = value; }
        get friction() { return this._friction || 0.0085; }
    }

    // Initialisation du Blob
    let blob = new Blob;
    let canvas = document.createElement('canvas');
    canvas.id = 'blob-canvas'; 
    canvas.setAttribute('touch-action', 'none');
    document.body.appendChild(canvas);

    let resize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let oldMousePoint = { x: 0, y: 0};
    let hover = false;

    // Config couleurs et taille
    blob.canvas = canvas;
    blob.color = '#ffc4d6'; // Rose
    blob.radius = 250; 
    blob.init();
    blob.render();

    // Interaction souris
    let mouseMove = function(e) {
        let pos = blob.center;
        let diff = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        let dist = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y));
        let angle = null;
        
        blob.mousePos = { x: pos.x - e.clientX, y: pos.y - e.clientY };
        
        if(dist < blob.radius && hover === false) {
            let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = true;
            blob.color = '#ff9a8b'; // Orange/Corail au survol
        } else if(dist > blob.radius && hover === true){ 
            let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = false;
            blob.color = '#ffc4d6'; // Retour au Rose
        }
        
        if(typeof angle == 'number') {
            let nearestPoint = null;
            let distanceFromPoint = 100;
            
            blob.points.forEach((point)=> {
                if(Math.abs(angle - point.azimuth) < distanceFromPoint) {
                    nearestPoint = point;
                    distanceFromPoint = Math.abs(angle - point.azimuth);
                }
            });
            
            if(nearestPoint) {
                let strength = { x: oldMousePoint.x - e.clientX, y: oldMousePoint.y - e.clientY };
                let strengthValue = Math.sqrt((strength.x * strength.x) + (strength.y * strength.y));
                if (strengthValue > 10) strengthValue = 10;
                nearestPoint.acceleration = strengthValue / 2;
            }
        }
        oldMousePoint.x = e.clientX;
        oldMousePoint.y = e.clientY;
    }
    
    window.addEventListener('mousemove', mouseMove);
}
