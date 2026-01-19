document.addEventListener("DOMContentLoaded", function() {
    // 1. On charge le footer HTML
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            // On l'injecte dans le placeholder
            document.getElementById("footer-placeholder").innerHTML = data;
            
            // 2. On lance les scripts UNE FOIS le HTML chargé
            initCookieBanner();
            initLavaLampInteraction(); // <--- C'est ça qui manquait !
        })
        .catch(error => console.error("Erreur footer:", error));
});

// --- GESTION BANNIÈRE COOKIE ---
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const btn = document.getElementById('accept-cookie');
    const btnRefuse = document.getElementById('refuse-cookie');

    // Si déjà accepté, on cache
    if (localStorage.getItem('cookieAccepted') === 'true') {
        if(banner) banner.style.display = 'none';
        return;
    }

    // Clics boutons
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

// --- GESTION LAVA LAMP INTERACTIVE ---
function initLavaLampInteraction() {
    const container = document.querySelector('.lamp-container');
    const blob = document.getElementById('cursor-blob');
    
    // Sécurité : si pas de footer, on arrête
    if (!container || !blob) return;

    // Variables de position
    let currentX = 0;
    let currentY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;

    // 1. On détecte la souris DANS le conteneur
    container.addEventListener('mousemove', function(e) {
        isHovering = true;
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // 2. Quand on sort, la bulle disparaît
    container.addEventListener('mouseleave', function() {
        isHovering = false;
    });

    // 3. Boucle d'animation fluide
    function animate() {
        if (isHovering) {
            // Effet élastique (Lerp)
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
