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

    // B. Lance le fond "Lava Lamp" réaliste
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
        } else { blob.style.opacity = "0"; }
        requestAnimationFrame(animate);
    }
    animate();
}

// -------------------------------------------------------
// --- FOND : LAVE REALISTE (Fusion par filtre CSS) ---
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
            this.speedX = (Math.random() - 0.5) * 0.2;
            
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Facteur d'étirement (1 = rond, >1 = ovale vertical)
            this.scaleY = 1; 
        }

        update(mouseX, mouseY) {
            // 1. Mouvement naturel (montée)
            this.y -= this.speedY;
            this.x += this.speedX;

            // 2. Interaction Souris DOUCE (Repousse légèrement)
            let dx = this.x - mouseX;
            let dy = this.y - mouseY;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            // Si la souris est proche (< 250px), on déforme et pousse
            if(dist < 250) {
                let force = (250 - dist) / 250; // Force entre 0 et 1
                
                // Pousser doucement
                this.x += (dx / dist) * force * 1.5; 
                this.y += (dy / dist) * force * 1.5;
                
                // Déformation au contact : s'aplatit ou s'étire légèrement
                // Plus on est proche, plus ça "s'écrase" un peu horizontalement (effet tension de surface)
                this.scaleY = 1 + (force * 0.2); 
            } else {
                // Retour à la forme normale (étirement naturel dû à la vitesse)
                // Plus ça va vite vers le haut, plus c'est étiré verticalement (effet goutte)
                this.scaleY = 1 + (this.speedY * 0.1); 
            }

            // 3. Reset si sort de l'écran
            if (this.y < -this.radius * 2) {
                this.y = this.canvas.height + this.radius * 2;
                this.x = Math.random() * this.canvas.width;
                this.init(); // Reset des propriétés aléatoires pour varier
            }
            if (this.x < -this.radius) this.x = this.canvas.width + this.radius;
            if (this.x > this.canvas.width + this.radius) this.x = -this.radius;
        }

        draw(ctx) {
            ctx.save(); // Sauvegarde le contexte avant transformation
            ctx.translate(this.x, this.y);
            ctx.scale(1, this.scaleY); // Applique l'étirement vertical
            
            ctx.beginPath();
            // On dessine un cercle en (0,0) car on a déjà translate le contexte
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
            
            ctx.restore(); // Restaure le contexte pour la prochaine bulle
        }
    }

    // Setup Canvas
    let canvas = document.createElement('canvas');
    canvas.id = 'blob-canvas'; // Le CSS appliquera le filtre #goo ici !
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');

    let bubbles = [];
    // Plus de bulles ! (20)
    const numBubbles = 20; 
    
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
        smoothMouse.x += (mouse.x - smoothMouse.x) * 0.05;
        smoothMouse.y += (mouse.y - smoothMouse.y) * 0.05;

        bubbles.forEach(b => {
            b.update(smoothMouse.x, smoothMouse.y);
            b.draw(ctx);
        });

        requestAnimationFrame(animate);
    }
    animate();
}
