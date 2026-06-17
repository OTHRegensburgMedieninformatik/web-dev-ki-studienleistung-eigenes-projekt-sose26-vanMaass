// Gallery scroll functionality
const galleryItems = document.getElementById('galleryItems');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');

const itemWidth = 250; // Breite eines Galerie-Elements + margin
const scrollAmount = itemWidth;

galleryPrev.addEventListener('click', () => {
  galleryItems.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  });
});

galleryNext.addEventListener('click', () => {
  galleryItems.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
});
