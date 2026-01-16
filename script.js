document.addEventListener("DOMContentLoaded", function() {
    // 1. On va chercher le fichier footer.html
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            // On l'injecte dans la page
            document.getElementById("footer-placeholder").innerHTML = data;
            
            // Une fois que le HTML est là, on active la bannière cookie
            initCookieBanner();
        })
        .catch(error => console.error("Erreur lors du chargement du footer:", error));
});

function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const btn = document.getElementById('accept-cookie');

    // Vérification de l'historique (localStorage)
    if (localStorage.getItem('cookieAccepted') === 'true') {
        if(banner) banner.style.display = 'none';
    }

    // Clic sur le bouton
    if(btn) {
        btn.addEventListener('click', function() {
            banner.style.display = 'none';
            localStorage.setItem('cookieAccepted', 'true');
        });
    }
}