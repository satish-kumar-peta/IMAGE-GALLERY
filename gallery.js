
        // DOM elements
        const allImages = document.querySelectorAll('.gallery-img');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.querySelector('.lightbox-caption');
        const closeBtn = document.getElementById('close-lightbox');
        const prevBtn = document.getElementById('prev-img');
        const nextBtn = document.getElementById('next-img');
        const searchInput = document.getElementById('search-input');
        const favoritesEmpty = document.getElementById('favorites-empty');
        const deletedEmpty = document.getElementById('deleted-empty');
        const favoritesGallery = document.getElementById('favorites-gallery');
        const deletedGallery = document.getElementById('deleted-gallery');
        
        // Variables
        let currentImgIndex = 0;
        let favoritedImages = [];
        let deletedImages = [];
        
        // Tab functionality using HTML data attributes
        function changeTab(tabId) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Deactivate all tab buttons
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabId).classList.add('active');
            
            // Activate selected tab button
            document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
            
            // Check for empty favorites or deleted sections
            updateEmptyStates();
        }
        
        // Manage empty states visibility with HTML display property
        function updateEmptyStates() {
            favoritesEmpty.style.display = favoritedImages.length === 0 ? 'block' : 'none';
            deletedEmpty.style.display = deletedImages.length === 0 ? 'block' : 'none';
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Show appropriate empty states
            updateEmptyStates();
            
            // Set up event listeners
            
            // Open lightbox on image click
            allImages.forEach((img, index) => {
                img.addEventListener('click', function() {
                    openLightbox(index);
                });
            });
            
            // Close lightbox
            closeBtn.addEventListener('click', closeLightbox);
            
            // Navigate images in lightbox
            prevBtn.addEventListener('click', showPrevImage);
            nextBtn.addEventListener('click', showNextImage);
            
            // Setup favorite buttons
            document.querySelectorAll('.img-action-btn.favorite').forEach((btn, index) => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent opening the lightbox
                    toggleFavorite(index, this);
                });
            });
            
            // Setup delete buttons
            document.querySelectorAll('.img-action-btn.delete').forEach((btn, index) => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent opening the lightbox
                    moveToDeleted(index, this);
                });
            });
            
            // Search functionality
            searchInput.addEventListener('input', function() {
                filterImages(this.value.toLowerCase());
            });
        });
        
        // Lightbox functions
        function openLightbox(index) {
            currentImgIndex = index;
            const currentImg = allImages[index];
            lightboxImg.src = currentImg.src;
            lightboxCaption.textContent = currentImg.getAttribute('data-title');
            lightbox.style.display = 'flex';
        }
        
        function closeLightbox() {
            lightbox.style.display = 'none';
        }
        
        function showPrevImage() {
            currentImgIndex = (currentImgIndex - 1 + allImages.length) % allImages.length;
            updateLightboxImage();
        }
        
        function showNextImage() {
            currentImgIndex = (currentImgIndex + 1) % allImages.length;
            updateLightboxImage();
        }
        
        function updateLightboxImage() {
            const currentImg = allImages[currentImgIndex];
            lightboxImg.src = currentImg.src;
            lightboxCaption.textContent = currentImg.getAttribute('data-title');
        }
        
        // Favorite and delete functionality with DOM manipulation
        function toggleFavorite(index, button) {
            const card = button.closest('.gallery-card');
            const isFavorited = button.querySelector('i').classList.contains('fas');
            
            if (isFavorited) {
                // Remove from favorites
                button.querySelector('i').classList.replace('fas', 'far');
                const favIndex = favoritedImages.indexOf(index);
                if (favIndex > -1) {
                    favoritedImages.splice(favIndex, 1);
                }
                // Remove from favorites gallery
                const favoriteCard = document.querySelector(`#favorites-gallery [data-original-index="${index}"]`);
                if (favoriteCard) {
                    favoriteCard.remove();
                }
            } else {
                // Add to favorites
                button.querySelector('i').classList.replace('far', 'fas');
                favoritedImages.push(index);
                
                // Clone card to favorites gallery
                const clonedCard = card.cloneNode(true);
                clonedCard.setAttribute('data-original-index', index);
                
                // Set up event listeners for the cloned card
                const clonedImg = clonedCard.querySelector('.gallery-img');
                clonedImg.addEventListener('click', function() {
                    openLightbox(index);
                });
                
                const clonedFavBtn = clonedCard.querySelector('.img-action-btn.favorite');
                clonedFavBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleFavorite(index, this);
                    // Also update the original button
                    const originalBtn = document.querySelectorAll('.img-action-btn.favorite')[index];
                    originalBtn.querySelector('i').classList.replace('far', 'fas');
                });
                
                const clonedDelBtn = clonedCard.querySelector('.img-action-btn.delete');
                clonedDelBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    moveToDeleted(index, this);
                });
                
                // Add to favorites gallery
                favoritesGallery.appendChild(clonedCard);
            }
            
            updateEmptyStates();
        }
        
        function moveToDeleted(index, button) {
            const card = button.closest('.gallery-card');
            const originalCard = document.querySelectorAll('.gallery-card')[index];
            
            // Add to deleted items
            deletedImages.push(index);
            
            // Clone card to deleted gallery
            const clonedCard = card.cloneNode(true);
            clonedCard.setAttribute('data-original-index', index);
            
            // Set up event listeners for the cloned card
            const clonedImg = clonedCard.querySelector('.gallery-img');
            clonedImg.addEventListener('click', function() {
                openLightbox(index);
            });
            
            // Replace delete button with restore button
            const delBtnContainer = clonedCard.querySelector('.img-actions');
            const delBtn = clonedCard.querySelector('.img-action-btn.delete');
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'img-action-btn restore';
            restoreBtn.innerHTML = '<i class="fas fa-undo"></i>';
            restoreBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                restoreFromDeleted(index, this);
            });
            delBtnContainer.replaceChild(restoreBtn, delBtn);
            
            // Add to deleted gallery
            deletedGallery.appendChild(clonedCard);
            
            // Hide the original card
            if (originalCard) {
                originalCard.style.display = 'none';
            }
            
            // Also hide in favorites if it exists
            const favoriteCard = document.querySelector(`#favorites-gallery [data-original-index="${index}"]`);
            if (favoriteCard) {
                favoriteCard.style.display = 'none';
            }
            
            updateEmptyStates();
        }
        
        function restoreFromDeleted(index, button) {
            const card = button.closest('.gallery-card');
            const originalCard = document.querySelectorAll('.gallery-card')[index];
            
            // Show the original card
            if (originalCard) {
                originalCard.style.display = 'block';
            }
            
            // Show in favorites if it exists
            const favoriteCard = document.querySelector(`#favorites-gallery [data-original-index="${index}"]`);
            if (favoriteCard) {
                favoriteCard.style.display = 'block';
            }
            
            // Remove from deleted gallery
            card.remove();
            
            // Remove from deleted items
            const delIndex = deletedImages.indexOf(index);
            if (delIndex > -1) {
                deletedImages.splice(delIndex, 1);
            }
            
            updateEmptyStates();
        }
        
        // Search functionality using HTML methods
        function filterImages(query) {
            document.querySelectorAll('.gallery-card').forEach(card => {
                const title = card.querySelector('.img-title').textContent.toLowerCase();
                if (title.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide category headers based on whether they have visible children
            document.querySelectorAll('.category-header').forEach(header => {
                const nextGallery = header.nextElementSibling.querySelector('.gallery');
                const hasVisibleImages = Array.from(nextGallery.querySelectorAll('.gallery-card'))
                    .some(card => card.style.display !== 'none');
                
                header.style.display = hasVisibleImages ? 'block' : 'none';
                header.nextElementSibling.style.display = hasVisibleImages ? 'block' : 'none';
            });
        }