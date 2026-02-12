// Configuration du carrousel RSS
let currentIndex = 0;
let articles = [];
let currentFeed = 'https://feeds.feedburner.com/TheHackersNews';

// Fonction pour charger les articles RSS via un proxy CORS
async function loadRSSFeed(feedUrl) {
    const track = document.getElementById('carouselTrack');
    track.innerHTML = '<div class="article-card loading"><div class="loading-spinner"></div><p>Chargement des articles...</p></div>';
    
    try {
        // Utilisation de rss2json API pour contourner CORS
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            articles = data.items.slice(0, 10); // Limiter à 10 articles
            displayArticles();
        } else {
            track.innerHTML = '<div class="article-card error"><p>❌ Erreur de chargement du flux RSS</p></div>';
        }
    } catch (error) {
        console.error('Erreur:', error);
        track.innerHTML = '<div class="article-card error"><p>❌ Impossible de charger les articles</p></div>';
    }
}

// Fonction pour afficher les articles dans le carrousel
function displayArticles() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    articles.forEach((article, index) => {
        // Créer la carte d'article
        const card = document.createElement('div');
        card.className = 'article-card';
        
        // Extraire l'image si disponible
        let imageUrl = '';
        if (article.enclosure && article.enclosure.link) {
            imageUrl = article.enclosure.link;
        } else if (article.thumbnail) {
            imageUrl = article.thumbnail;
        }
        
        // Nettoyer la description HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.description || article.content || '';
        const cleanDescription = tempDiv.textContent.substring(0, 150) + '...';
        
        // Formater la date
        const date = new Date(article.pubDate);
        const formattedDate = date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        card.innerHTML = `
            ${imageUrl ? `<div class="article-image" style="background-image: url('${imageUrl}')"></div>` : ''}
            <div class="article-content">
                <span class="article-date">📅 ${formattedDate}</span>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-description">${cleanDescription}</p>
                <a href="${article.link}" target="_blank" class="article-link">Lire l'article →</a>
            </div>
        `;
        
        track.appendChild(card);
        
        // Créer le point de navigation
        const dot = document.createElement('span');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    currentIndex = 0;
    updateCarousel();
}

// Fonction pour mettre à jour la position du carrousel
function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.dot');
    
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

// Navigation du carrousel
function nextSlide() {
    currentIndex = (currentIndex + 1) % articles.length;
    updateCarousel();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + articles.length) % articles.length;
    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Gestion des boutons de source
    document.querySelectorAll('.source-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFeed = this.getAttribute('data-feed');
            loadRSSFeed(currentFeed);
        });
    });

    // Événements des boutons de navigation
    document.getElementById('prevBtn').addEventListener('click', prevSlide);
    document.getElementById('nextBtn').addEventListener('click', nextSlide);

    // Auto-play du carrousel (optionnel)
    setInterval(nextSlide, 8000); // Change toutes les 8 secondes

    // Charger le flux par défaut au démarrage
    loadRSSFeed(currentFeed);
});