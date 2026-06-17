// Shop Gallery scroll functionality
const shopGalleryItems = document.getElementById('shopGalleryItems');
const shopGalleryPrev = document.getElementById('shopGalleryPrev');
const shopGalleryNext = document.getElementById('shopGalleryNext');

const itemWidth = 250; // Breite eines Shop-Elements + gap
const scrollAmount = itemWidth;

shopGalleryPrev.addEventListener('click', () => {
  shopGalleryItems.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  });
});

shopGalleryNext.addEventListener('click', () => {
  shopGalleryItems.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
});
