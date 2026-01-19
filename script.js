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

    // B. Lance le fond Blob Interactif (Jelly Effect)
    initRealLavaBackground();
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

// -------------------------------------------------------
// --- FOND : VRAIE LAVE LIQUIDE (Metaballs via Canvas) ---
// -------------------------------------------------------
function initRealLavaBackground() {
    
    // Palette pastel
    const colors = ['#ffc4d6', '#ffdab9', '#ffe4e1', '#e6e6fa'];

    class Bubble {
        constructor(canvas) {
            this.canvas = canvas;
            this.init();
        }

        init() {
            // Taille variée
            this.radius = Math.random() * 60 + 40; 
            
            // Position de départ aléatoire
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            
            // Vitesse de montée (lente et variable)
            this.speedY = Math.random() * 0.5 + 0.2;
            
            // Légère dérive horizontale (wobble naturel)
            this.speedX = (Math.random() - 0.5) * 0.4;
            
            this.color = colors[Math.floor(Math.random() * colors.length)];

            // --- NOUVEAU : Paramètres de déformation (Wobble) ---
            // On crée un "satellite" interne qui tourne pour déformer le cercle
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = Math.random() * 0.05 + 0.02; // Vitesse de déformation
            this.wobbleDistance = this.radius * 0.5; // Distance de déformation
        }

        update(mouseX, mouseY) {
            // 1. Mouvement naturel (montée)
            this.y -= this.speedY;
            this.x += this.speedX;

            // 2. Animation de la déformation interne
            this.angle += this.angleSpeed;

            // 3. Interaction Souris (Repousse le liquide)
            let dx = this.x - mouseX;
            let dy = this.y - mouseY;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            // Si la souris est proche, on pousse la "matière"
            if(dist < 300) {
                let force = (300 - dist) / 300; 
                // Pousser plus fort pour déformer le liquide
                this.x += (dx / dist) * force * 3; 
                this.y += (dy / dist) * force * 3;
            }

            // 4. Reset si sort de l'écran (boucle infinie)
            // On marge large (radius * 3) pour éviter le pop
            if (this.y < -this.radius * 3) {
                this.y = this.canvas.height + this.radius * 3;
                this.x = Math.random() * this.canvas.width;
                this.init(); // Reset des propriétés aléatoires
            }
            if (this.x < -this.radius * 3) this.x = this.canvas.width + this.radius * 3;
            if (this.x > this.canvas.width + this.radius * 3) this.x = -this.radius * 3;
        }

        draw(ctx) {
            ctx.beginPath();
            
            // L'ASTUCE METABALL :
            // Au lieu de dessiner 1 cercle, on en dessine 2 ou 3 proches
            // Le filtre CSS "Gooey" va les fusionner en une seule forme patatoïde
            
            // 1. Cercle principal
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            // 2. Cercle "satellite" qui tourne autour pour déformer la bulle
            // C'est ça qui empêche la bulle d'être ronde !
            let blobX = this.x + Math.cos(this.angle) * this.wobbleDistance;
            let blobY = this.y + Math.sin(this.angle) * this.wobbleDistance;
            
            // On ajoute ce sous-cercle au chemin (il fusionnera avec le principal)
            ctx.moveTo(blobX, blobY); 
            ctx.arc(blobX, blobY, this.radius * 0.7, 0, Math.PI * 2);

            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }

    // Setup Canvas
    let canvas = document.createElement('canvas');
    canvas.id = 'blob-canvas'; // Le CSS appliquera le filtre #goo ici !
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');

    let bubbles = [];
    // Nombre de bulles
    const numBubbles = 12; 
    
    // Redimensionnement
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Création des bulles
    for(let i=0; i<numBubbles; i++) {
        bubbles.push(new Bubble(canvas));
    }

    // Suivi souris lissé
    let mouse = { x: -1000, y: -1000 };
    let smoothMouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Boucle d'animation
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Lissage de la position souris
        smoothMouse.x += (mouse.x - smoothMouse.x) * 0.08;
        smoothMouse.y += (mouse.y - smoothMouse.y) * 0.08;

        bubbles.forEach(b => {
            b.update(smoothMouse.x, smoothMouse.y);
            b.draw(ctx);
        });

        requestAnimationFrame(animate);
    }
    animate();
}
