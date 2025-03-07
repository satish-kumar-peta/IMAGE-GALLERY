// Global variables for lightbox functionality
let currentImgIndex = 0;
let galleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initializeTabs();
    
    // Initialize view options
    initializeViewOptions();
    
    // Initialize image actions
    initializeImageActions();
    
    // Initialize lightbox functionality
    initializeLightbox();
    
    // Initialize search functionality
    initializeSearch();
});

// Tab functionality
function initializeTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Change tab function
function changeTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
}

// View options functionality
function initializeViewOptions() {
    const viewOptions = document.querySelectorAll('.view-option');
    viewOptions.forEach(option => {
        option.addEventListener('click', function() {
            const viewType = this.getAttribute('data-view');
            const parentSection = this.closest('.section-header').parentElement;
            
            // Remove active class from all options in this section
            this.parentElement.querySelectorAll('.view-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Apply view type to gallery
            const gallery = parentSection.querySelector('.gallery');
            if (gallery) {
                if (viewType === 'list') {
                    gallery.classList.add('list-view');
                    gallery.classList.remove('grid-view');
                } else {
                    gallery.classList.add('grid-view');
                    gallery.classList.remove('list-view');
                }
            }
        });
    });
}

// Image actions functionality
function initializeImageActions() {
    // Favorite button functionality
    const favoriteButtons = document.querySelectorAll('.img-action-btn.favorite');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent opening lightbox when clicking action button
            
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                addToFavorites(this.closest('.gallery-card'));
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                removeFromFavorites(this.closest('.gallery-card'));
            }
        });
    });
    
    // Download button functionality
    const downloadButtons = document.querySelectorAll('.img-action-btn.download');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent opening lightbox when clicking action button
            
            const img = this.closest('.gallery-img-container').querySelector('img');
            const imgTitle = img.getAttribute('data-title') || 'download';
            
            // Create a temporary link to download the image
            const link = document.createElement('a');
            link.href = img.src;
            link.download = imgTitle + '.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
    
    // Delete button functionality
    const deleteButtons = document.querySelectorAll('.img-action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent opening lightbox when clicking action button
            
            const card = this.closest('.gallery-card');
            moveToDeleted(card);
        });
    });
}

// Add to favorites functionality
function addToFavorites(card) {
    const favoritesGallery = document.getElementById('favorites-gallery');
    const favoritesEmpty = document.getElementById('favorites-empty');
    
    // Clone the card
    const clonedCard = card.cloneNode(true);
    
    // Re-initialize the action buttons on the cloned card
    const favoriteButton = clonedCard.querySelector('.img-action-btn.favorite');
    favoriteButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const icon = this.querySelector('i');
        icon.classList.remove('fas');
        icon.classList.add('far');
        removeFromFavorites(clonedCard);
    });
    
    const downloadButton = clonedCard.querySelector('.img-action-btn.download');
    downloadButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const img = this.closest('.gallery-img-container').querySelector('img');
        const imgTitle = img.getAttribute('data-title') || 'download';
        
        const link = document.createElement('a');
        link.href = img.src;
        link.download = imgTitle + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    const deleteButton = clonedCard.querySelector('.img-action-btn.delete');
    deleteButton.addEventListener('click', function(e) {
        e.stopPropagation();
        moveToDeleted(clonedCard);
    });
    
    // Add click event to open lightbox
    clonedCard.querySelector('.gallery-img-container').addEventListener('click', function() {
        openLightbox(this.querySelector('img'));
    });
    
    // Add to favorites gallery
    favoritesGallery.appendChild(clonedCard);
    
    // Hide the empty state if there are items
    if (favoritesGallery.children.length > 0) {
        favoritesEmpty.style.display = 'none';
    }
}

// Remove from favorites functionality
function removeFromFavorites(card) {
    const favoritesGallery = document.getElementById('favorites-gallery');
    const favoritesEmpty = document.getElementById('favorites-empty');
    
    // If the card is in the favorites tab, remove it
    if (card.parentElement === favoritesGallery) {
        favoritesGallery.removeChild(card);
    }
    
    // Show the empty state if there are no items
    if (favoritesGallery.children.length === 0) {
        favoritesEmpty.style.display = 'flex';
    }
}

// Move to deleted functionality
function moveToDeleted(card) {
    const deletedGallery = document.getElementById('deleted-gallery');
    const deletedEmpty = document.getElementById('deleted-empty');
    
    // Clone the card
    const clonedCard = card.cloneNode(true);
    
    // Add restore button
    const actionsDiv = clonedCard.querySelector('.img-actions');
    const restoreButton = document.createElement('button');
    restoreButton.className = 'img-action-btn restore';
    restoreButton.innerHTML = '<i class="fas fa-undo"></i>';
    
    restoreButton.addEventListener('click', function(e) {
        e.stopPropagation();
        restoreFromDeleted(clonedCard);
    });
    
    actionsDiv.appendChild(restoreButton);
    
    // Add click event to open lightbox
    clonedCard.querySelector('.gallery-img-container').addEventListener('click', function() {
        openLightbox(this.querySelector('img'));
    });
    
    // Add to deleted gallery
    deletedGallery.appendChild(clonedCard);
    
    // Hide the empty state if there are items
    if (deletedGallery.children.length > 0) {
        deletedEmpty.style.display = 'none';
    }
    
    // If card is in favorites, remove it from there as well
    if (card.parentElement === document.getElementById('favorites-gallery')) {
        removeFromFavorites(card);
    }
}

// Restore from deleted functionality
function restoreFromDeleted(card) {
    const deletedGallery = document.getElementById('deleted-gallery');
    const deletedEmpty = document.getElementById('deleted-empty');
    
    // Remove from deleted gallery
    deletedGallery.removeChild(card);
    
    // Show the empty state if there are no items
    if (deletedGallery.children.length === 0) {
        deletedEmpty.style.display = 'flex';
    }
}

// Initialize lightbox functionality
function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeBtn = document.getElementById('close-lightbox');
    const prevBtn = document.getElementById('prev-img');
    const nextBtn = document.getElementById('next-img');
    
    // Click event for all gallery images
    const galleryImgContainers = document.querySelectorAll('.gallery-img-container');
    galleryImgContainers.forEach(container => {
        container.addEventListener('click', function() {
            openLightbox(this.querySelector('img'));
        });
    });
    
    // Close lightbox
    closeBtn.addEventListener('click', function() {
        lightbox.style.display = 'none';
    });
    
    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
            lightbox.style.display = 'none';
        }
    });
    
    // Previous image
    prevBtn.addEventListener('click', function() {
        if (currentImgIndex > 0) {
            currentImgIndex--;
            updateLightboxImage();
        }
    });
    
    // Next image
    nextBtn.addEventListener('click', function() {
        if (currentImgIndex < galleryImages.length - 1) {
            currentImgIndex++;
            updateLightboxImage();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                lightbox.style.display = 'none';
            } else if (e.key === 'ArrowLeft') {
                if (currentImgIndex > 0) {
                    currentImgIndex--;
                    updateLightboxImage();
                }
            } else if (e.key === 'ArrowRight') {
                if (currentImgIndex < galleryImages.length - 1) {
                    currentImgIndex++;
                    updateLightboxImage();
                }
            }
        }
    });
}

// Open lightbox
function openLightbox(img) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    
    // Get all visible images in the current tab
    const activeTab = document.querySelector('.tab-content.active');
    galleryImages = Array.from(activeTab.querySelectorAll('.gallery-img'));
    
    // Find the index of the clicked image
    currentImgIndex = galleryImages.indexOf(img);
    
    // Update lightbox image
    updateLightboxImage();
    
    // Show lightbox
    lightbox.style.display = 'flex';
}

// Update lightbox image
function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const prevBtn = document.getElementById('prev-img');
    const nextBtn = document.getElementById('next-img');
    
    // Update image and caption
    const img = galleryImages[currentImgIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.getAttribute('data-title') || img.alt;
    
    // Update navigation buttons
    prevBtn.style.display = currentImgIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = currentImgIndex < galleryImages.length - 1 ? 'block' : 'none';
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Get all gallery cards
        const galleryCards = document.querySelectorAll('.gallery-card');
        
        // Filter cards based on search term
        galleryCards.forEach(card => {
            const title = card.querySelector('.img-title').textContent.toLowerCase();
            const imgAlt = card.querySelector('.gallery-img').alt.toLowerCase();
            
            if (title.includes(searchTerm) || imgAlt.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Hide category headers with no visible cards
        const categoryHeaders = document.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            const nextGallery = header.nextElementSibling;
            if (nextGallery) {
                const gallery = nextGallery.querySelector('.gallery');
                if (gallery) {
                    const visibleCards = Array.from(gallery.querySelectorAll('.gallery-card')).filter(card => card.style.display !== 'none');
                    
                    if (visibleCards.length === 0) {
                        header.style.display = 'none';
                        nextGallery.style.display = 'none';
                    } else {
                        header.style.display = '';
                        nextGallery.style.display = '';
                    }
                }
            }
        });
    });
}