/* --- SCRIPT.JS PRINCIPAL --- */
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialise les fonctions du footer (qui est maintenant déjà là)
    initCookieBanner();
    initLavaLampInteraction(); 
    initEasterEgg(); 

    // 2. Lance le fond Glowy Blob (Particules Gooey)
    initGlowyBlobBackground();
});

// --- GESTION DU CURSEUR MAGIQUE ---
document.addEventListener('mousedown', () => {
    document.body.classList.add('is-clicking');
});

document.addEventListener('mouseup', () => {
    document.body.classList.remove('is-clicking');
});

// --- EASTER EGG CARBONNADE ---
function initEasterEgg() {
    const pot = document.getElementById('secret-recipe');
    if(pot) {
        pot.addEventListener('click', () => {
            alert("Le secret de ma Carbonnade Flamande:\n\n1. Beaucoup de patience (comme pour le nettoyage de données).\n2. Une cuisson lente.\n3. Et surtout... le pain d'épices avec la moutarde !");
            
            // Effet visuel temporaire
            document.body.style.transition = "background 1s";
            document.body.style.background = "linear-gradient(to bottom, #fff5f7, #ffdab9)";
            setTimeout(() => {
                document.body.style.background = "";
            }, 3000);
        });
    }
}

// --- COOKIES ---
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

// --- ANIMATION LAVA LAMP (FOOTER) ---
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

// --- FOND : GLOWY BLOBS (Particules Gooey) ---
function initGlowyBlobBackground() {
    // Si tu veux changer les couleurs des bulles du fond, c'est ici :
    const colors = ['#ffc4d6', '#ffdab9', '#ffe4e1', '#e6e6fa'];

    class Particle {
        constructor(canvas) {
            this.canvas = canvas;
            this.init();
        }

        init() {
            this.radius = Math.random() * 40 + 30;
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.vx = (Math.random() - 0.5) * 1.5; 
            this.vy = (Math.random() - 0.5) * 1.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.changeTargetTimer = 0;
        }

        update(mouseX, mouseY) {
            this.changeTargetTimer++;
            if (this.changeTargetTimer > 100 + Math.random() * 100) {
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.changeTargetTimer = 0;
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

            let dx = this.x - mouseX;
            let dy = this.y - mouseY;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < 200) {
                let force = (200 - dist) / 200;
                this.x += (dx / dist) * force * 3;
                this.y += (dy / dist) * force * 3;
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }

    let canvas = document.createElement('canvas');
    canvas.id = 'blob-canvas'; 
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');

    let particles = [];
    const numParticles = 25; 
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for(let i=0; i<numParticles; i++) {
        particles.push(new Particle(canvas));
    }

    let mouse = { x: -1000, y: -1000 };
    let smoothMouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        smoothMouse.x += (mouse.x - smoothMouse.x) * 0.1;
        smoothMouse.y += (mouse.y - smoothMouse.y) * 0.1;

        particles.forEach(p => {
            p.update(smoothMouse.x, smoothMouse.y);
            p.draw(ctx);
        });
        requestAnimationFrame(animate);
    }
    animate();
}