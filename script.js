/* --- CODE PRINCIPAL --- */
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

    // B. Lance le fond aux multiples Blobs (Version "Zen & Petite")
    initSoftMultiBlobBackground();
});

// --- FONCTIONS UTILITAIRES (Cookies & Footer) ---
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

// -------------------------------------------------------
// --- NOUVEAU FOND : BLOBS PETITS, CALMES ET DISCRETS ---
// -------------------------------------------------------
function initSoftMultiBlobBackground() {
    
    // Palette de couleurs pales
    const paleColors = [
        '#ffc4d6', // Rose
        '#ffdab9', // Pêche
        '#fffaf0', // Crème floral
        '#e6e6fa', // Lavande pâle
        '#ffe4e1'  // Rose brumeux
    ];

    class Blob {
        constructor(radius, color, initialX, initialY) {
            this.points = [];
            this.radius = radius;
            this._color = color;
            this._position = { x: initialX, y: initialY };
        }
        init() {
            for(let i = 0; i < this.numPoints; i++) {
                let point = new Point(this.divisional * ( i + 1 ), this);
                this.points.push(point);
            }
        }
        render() {
            let ctx = this.ctx;
            let pointsArray = this.points;
            let points = this.numPoints;
            let center = this.center;
            
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
            ctx.globalAlpha = 0.8; 
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        set canvas(value) {
            if(value instanceof HTMLElement && value.tagName.toLowerCase() === 'canvas') {
                this._canvas = value;
                this.ctx = this._canvas.getContext('2d');
            }
        }
        get canvas() { return this._canvas; }
        get numPoints() { return 32; }
        get position() { return this._position; }
        get divisional() { return Math.PI * 2 / this.numPoints; }
        get center() { return { x: this.position.x, y: this.position.y }; }
        get color() { return this._color; }
    }

    class Point {
        constructor(azimuth, parent) {
            this.parent = parent;
            this.azimuth = Math.PI - azimuth;
            this._components = { x: Math.cos(this.azimuth), y: Math.sin(this.azimuth) };
            // Accélération initiale quasi nulle pour éviter le "tremblement" au démarrage
            this.acceleration = 0; 
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
        
        // --- RÉGLAGES PHYSIQUES "CALMES" ---
        // Friction augmentée (0.02 -> 0.05) : Le blob absorbe l'énergie, il ne "bloblotte" pas.
        get friction() { return 0.05; } 
        // Elasticité très faible : Il revient à sa forme lentement, sans rebondir.
        get elasticity() { return 0.001; } 
    }

    // --- Initialisation ---
    let canvas = document.createElement('canvas');
    canvas.id = 'blob-canvas';
    canvas.setAttribute('touch-action', 'none');
    document.body.appendChild(canvas);

    let ctx = canvas.getContext('2d');
    let blobs = [];
    let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
    let smoothedMouse = { x: window.innerWidth/2, y: window.innerHeight/2 };

    let resize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Création des blobs (PLUS PETITS) ---
    const numBlobs = 6; 
    for (let i = 0; i < numBlobs; i++) {
        // Taille réduite : entre 80px et 200px (au lieu de 200-500)
        let radius = Math.random() * 120 + 80; 
        
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let color = paleColors[Math.floor(Math.random() * paleColors.length)];
        
        let b = new Blob(radius, color, x, y);
        b.canvas = canvas;
        b.init();
        blobs.push(b);
    }

    window.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // --- Animation ---
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Lissage souris très lent (0.05) pour éviter les mouvements brusques
        smoothedMouse.x += (mouse.x - smoothedMouse.x) * 0.05;
        smoothedMouse.y += (mouse.y - smoothedMouse.y) * 0.05;

        blobs.forEach(blob => {
            let pos = blob.center;
            let diff = { x: smoothedMouse.x - pos.x, y: smoothedMouse.y - pos.y };
            let dist = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y));
            let angle = Math.atan2(diff.y, diff.x);

            // Interaction souris
            if(dist < blob.radius * 1.5) {
                let nearestPoint = null;
                let distanceFromPoint = 100;
                blob.points.forEach((point)=> {
                    if(Math.abs(angle - point.azimuth) < distanceFromPoint) {
                        nearestPoint = point;
                        distanceFromPoint = Math.abs(angle - point.azimuth);
                    }
                });
                
                if(nearestPoint) {
                    let strength = dist / blob.radius;
                    // FORCE RÉDUITE : Multiplicateur 0.5 (au lieu de 2)
                    // C'est doux, ça ne déforme pas violemment le blob
                    nearestPoint.acceleration = -(1 - strength) * 0.5; 
                }
            }
            blob.render();
        });

        requestAnimationFrame(animate);
    }
    animate();
}
