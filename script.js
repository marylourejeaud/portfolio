/* --- SCRIPT.JS PRINCIPAL --- */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Initialise les fonctions du footer
    initCookieBanner();
    initLavaLampInteraction(); // C'est ça qui fait bouger les bulles du footer
    // initEasterEgg(); // Retiré car tu ne voulais plus l'emoji

    // 2. LANCE LES BULLES DE FOND D'ÉCRAN
    initGlowyBlobBackground();

    // 3. LANCE LE TAMAGOTCHI
    initTamagotchi();
});

/* --- GESTION DU CURSEUR MAGIQUE --- */
document.addEventListener('mousedown', () => {
    document.body.classList.add('is-clicking');
});

document.addEventListener('mouseup', () => {
    document.body.classList.remove('is-clicking');
});

/* --- COOKIES --- */
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

/* --- ANIMATION LAVA LAMP (FOOTER) --- */
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

/* --- FOND : GLOWY BLOBS --- */
function initGlowyBlobBackground() {
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
            this.vx = (Math.random() - 0.5) * 0.75; 
            this.vy = (Math.random() - 0.5) * 0.75;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.changeTargetTimer = 0;
        }

        update(mouseX, mouseY) {
            this.changeTargetTimer++;
            if (this.changeTargetTimer > 100 + Math.random() * 100) {
                this.vx = (Math.random() - 0.5) * 1.0;
                this.vy = (Math.random() - 0.5) * 1.0;
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

    let existingCanvas = document.getElementById('blob-canvas');
    if (existingCanvas) { existingCanvas.remove(); }

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

/* --- LOGIQUE TAMAGOTCHI (LITTLE BUDDY) --- */
function initTamagotchi() {
    const petImage = document.getElementById('pet-image');
    const poopImage = document.getElementById('poop-image');
    const eatingAppleAnim = document.getElementById('eating-apple'); 
    const btnFeed = document.getElementById('btn-feed');
    const btnBrush = document.getElementById('btn-brush');
    const btnPlay = document.getElementById('btn-play'); // 1. NOUVEAU : Bouton Balle
    
    // On vérifie que tous les boutons existent
    if (!petImage || !poopImage || !btnFeed || !btnBrush || !btnPlay) return;

    // VARIABLES GLOBALES
    let feedCount = 0;       
    let resetTimer = null;    
    let actionTimeout = null; 
    let idleTimer = null;     
    let sleepTimeout = null;  

    // --- FONCTION : LANCER LE SOMMEIL ---
    function startIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);

        // On lance le compte à rebours de 15 secondes (défini dans ton code précédent)
        idleTimer = setTimeout(() => {
            // Sécurité : On attend si elle est occupée
            if (petImage.src.includes("eating") || 
                petImage.src.includes("vomiting") || 
                petImage.src.includes("brushing") ||
                petImage.src.includes("playing") || // Ajout : Pas de dodo en jouant
                petImage.src.includes("pooping")) {
                startIdleTimer(); 
                return;
            }

            console.log("Antoaneta s'endort...");
            petImage.src = "Image/falling_asleep.gif";

            sleepTimeout = setTimeout(() => {
                if (petImage.src.includes("falling_asleep.gif")) {
                    petImage.src = "Image/sleeping.gif";
                }
            }, 4000); 

        }, 15000); 
    }

    // --- FONCTION : RÉVEIL (INTERACTION) ---
    function wakeUpInteraction() {
        startIdleTimer(); // On remet le chrono à zéro car il y a eu une action
    }

    // On lance le timer dès le début
    startIdleTimer();

    // --- CLIQUER SUR ANTOANETA (RÉACTION "MAD" SI ELLE DORT) ---
    petImage.addEventListener('click', function() {
        if (petImage.src.includes("sleeping") || petImage.src.includes("falling_asleep")) {
            console.log("Pas contente !");
            petImage.src = "Image/mad.gif";
            wakeUpInteraction();
            
            if (sleepTimeout) clearTimeout(sleepTimeout);
            if (actionTimeout) clearTimeout(actionTimeout);

            actionTimeout = setTimeout(() => {
                petImage.src = "Image/neutral.gif";
            }, 3000); 
        }
    });

    // --- 2. NOUVELLE ACTION : JOUER (BALLE) ---
    btnPlay.addEventListener('click', function() {
        wakeUpInteraction(); // Ça la réveille
        console.log("On joue !");

        petImage.src = "Image/playing.gif";
        eatingAppleAnim.style.display = 'none'; // On cache la pomme si elle est là

        if (actionTimeout) clearTimeout(actionTimeout);

        // Retour au calme après 4 secondes
        actionTimeout = setTimeout(() => {
            petImage.src = "Image/neutral.gif";
        }, 4000);
    });

    // --- ACTION : BROSSER ---
    btnBrush.addEventListener('click', function() {
        wakeUpInteraction(); 
        console.log("Câlin !");
        
        petImage.src = "Image/brushing.gif";
        eatingAppleAnim.style.display = 'none';
        
        if (actionTimeout) clearTimeout(actionTimeout);

        actionTimeout = setTimeout(() => {
            petImage.src = "Image/loving.gif";
            actionTimeout = setTimeout(() => {
                petImage.src = "Image/neutral.gif";
            }, 3000); 
        }, 3000); 
    });

    // --- ACTION : NOURRIR ---
    btnFeed.addEventListener('click', function() {
        wakeUpInteraction(); 
        feedCount++;

        if (feedCount === 1) {
            resetTimer = setTimeout(() => { feedCount = 0; }, 10000); 
        }

        if (actionTimeout) clearTimeout(actionTimeout);

        if (feedCount >= 3) {
            console.log("Trop mangé !");
            eatingAppleAnim.style.display = 'none';
            petImage.src = "Image/vomiting.gif";
            feedCount = 0;
            clearTimeout(resetTimer);

            actionTimeout = setTimeout(() => {
                petImage.src = "Image/neutral.gif";
            }, 4000);

        } else {
            console.log("Miam !");
            petImage.src = "Image/eating.gif";
            eatingAppleAnim.src = "Image/eating_apple.gif?t=" + new Date().getTime();
            eatingAppleAnim.style.display = 'block'; 

            actionTimeout = setTimeout(() => {
                petImage.src = "Image/neutral.gif";
                eatingAppleAnim.style.display = 'none';
            }, 4000);
        }
    });

    // --- ACTION : NETTOYER LE CACA ---
    poopImage.addEventListener('click', function() {
        // NOTE : On n'appelle PAS wakeUpInteraction() ici.
        // Nettoyer ne la réveille pas et ne reset pas le timer de sommeil.
        poopImage.style.display = 'none'; 
        console.log("Propre !");
    });

    // --- CYCLE AUTOMATIQUE (CACA) ---
    setInterval(() => {
        if (petImage.src.includes("eating") || 
            petImage.src.includes("vomiting") || 
            petImage.src.includes("loving") ||
            petImage.src.includes("brushing") ||
            petImage.src.includes("playing") || 
            petImage.src.includes("falling_asleep") || 
            petImage.src.includes("sleeping")) return;

        petImage.src = "Image/pooping.gif";
        
        setTimeout(() => { poopImage.style.display = 'block'; }, 2500);
        setTimeout(() => { 
            if (!petImage.src.includes("sleeping")) {
                petImage.src = "Image/neutral.gif"; 
            }
        }, 5000); 
    }, 17000); 
}