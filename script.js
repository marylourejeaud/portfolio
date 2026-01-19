/* --- CODE PRINCIPAL --- */
document.addEventListener("DOMContentLoaded", function() {
    
    // A. Charge le footer
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
            initCookieBanner();
            initLavaLampInteraction(); 
        })
        .catch(error => console.error("Erreur footer:", error));

    // B. Lance le fond Blob "Lava Lamp" (Montée + Anti-collision)
    initRisingBlobsBackground();
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
        } else { blob.style.opacity = "0"; }
        requestAnimationFrame(animate);
    }
    animate();
}

// -------------------------------------------------------
// --- FOND : BLOBS QUI MONTENT & NE SE TOUCHENT PAS ---
// -------------------------------------------------------
function initRisingBlobsBackground() {
    
    const paleColors = ['#ffc4d6', '#ffdab9', '#fffaf0', '#e6e6fa', '#ffe4e1'];

    class Blob {
        constructor(radius, color, x, y, speedY) {
            this.points = [];
            this.radius = radius;
            this._color = color;
            this._position = { x: x, y: y };
            this.speedY = speedY; // Vitesse de montée
            this.originalRadius = radius;
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
            ctx.globalAlpha = 0.75; // Un peu plus transparent pour la douceur
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
        get friction() { return 0.05; } 
        get elasticity() { return 0.001; } 
    }

    // --- Initialisation ---
    let canvas = document.createElement('canvas');
    canvas.id = 'blob-canvas';
    canvas.setAttribute('touch-action', 'none');
    document.body.appendChild(canvas);

    let ctx = canvas.getContext('2d');
    let blobs = [];
    // Souris "fictive" pour le lissage
    let smoothedMouse = { x: -500, y: -500 }; 
    let mouse = { x: -500, y: -500 };

    let resize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Création des blobs montants ---
    const numBlobs = 5; // Nombre limité pour éviter l'encombrement
    for (let i = 0; i < numBlobs; i++) {
        let radius = Math.random() * 80 + 80; // Taille entre 80 et 160
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height; // Départ aléatoire
        // Vitesse de montée : entre 0.2 et 0.6 pixels par frame
        let speedY = Math.random() * 0.4 + 0.2; 
        let color = paleColors[Math.floor(Math.random() * paleColors.length)];
        
        let b = new Blob(radius, color, x, y, speedY);
        b.canvas = canvas;
        b.init();
        blobs.push(b);
    }

    window.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // --- Boucle d'animation principale ---
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Lissage souris
        smoothedMouse.x += (mouse.x - smoothedMouse.x) * 0.05;
        smoothedMouse.y += (mouse.y - smoothedMouse.y) * 0.05;

        // 1. Mise à jour des positions (Montée + Reset)
        blobs.forEach(blob => {
            // Fait monter le blob
            blob._position.y -= blob.speedY;

            // Reset en bas si le blob est sorti par le haut
            // (On ajoute une marge de radius * 2 pour qu'il soit totalement sorti)
            if (blob._position.y < -blob.radius * 2) {
                blob._position.y = canvas.height + blob.radius * 2;
                blob._position.x = Math.random() * canvas.width; // Nouvelle position X
                // Optionnel : Changer la taille/couleur au respawn pour varier
            }
        });

        // 2. Gestion des COLLISIONS (Anti-chevauchement)
        for (let i = 0; i < blobs.length; i++) {
            for (let j = i + 1; j < blobs.length; j++) {
                let b1 = blobs[i];
                let b2 = blobs[j];

                let dx = b2._position.x - b1._position.x;
                let dy = b2._position.y - b1._position.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // Distance minimale = somme des rayons + une petite marge (50px)
                let minDistance = b1.radius + b2.radius + 50;

                if (distance < minDistance) {
                    // C'est trop proche ! On calcule l'angle de répulsion
                    let angle = Math.atan2(dy, dx);
                    // Force douce pour les écarter
                    let force = 0.5; 
                    
                    // On pousse b1 vers l'arrière
                    b1._position.x -= Math.cos(angle) * force;
                    b1._position.y -= Math.sin(angle) * force;
                    
                    // On pousse b2 vers l'avant
                    b2._position.x += Math.cos(angle) * force;
                    b2._position.y += Math.sin(angle) * force;
                }
            }
        }

        // 3. Rendu final et interaction souris légère
        blobs.forEach(blob => {
            let pos = blob.center;
            let diff = { x: smoothedMouse.x - pos.x, y: smoothedMouse.y - pos.y };
            let dist = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y));
            let angle = Math.atan2(diff.y, diff.x);

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
                    // Interaction très légère
                    nearestPoint.acceleration = -(1 - strength) * 0.4; 
                }
            }
            blob.render();
        });

        requestAnimationFrame(animate);
    }
    animate();
}
