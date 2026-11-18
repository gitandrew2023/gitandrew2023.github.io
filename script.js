/**
 * North Star Bakery - Interactive JavaScript Subsystem (Touchstone 4)
 * Features Included:
 * 1. Mobile Drawer Navigation Toggle
 * 2. Product Category Filtering (Breads, Pastries, Cookies)
 * 3. Product Wishlist & Favorites Manager using browser localStorage
 * 4. Automatic Pre-filling of Form Fields from localStorage
 * 5. Real-time & Submit-time Form Validation with Custom Field Feedback
 * 6. HTML5 Video Custom Player Controls (Play/Pause, Mute, CC Subtitles)
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // -------------------------------------------------------------
  // 1. Mobile Drawer Navigation
  // -------------------------------------------------------------
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
  }

  // -------------------------------------------------------------
  // 2. Browser Storage & Favorites Management (Touchstone 4 Requirement)
  // -------------------------------------------------------------
  const STORAGE_KEY = 'northstar_bakery_favorites';
  const FORM_STORAGE_KEY = 'northstar_bakery_form_user';

  // Helper functions for localStorage
  function getStoredFavorites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return [];
    }
  }

  function saveFavoritesToStorage(favorites) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // Update UI components showing favorite count & list
  function updateFavoritesUI() {
    const favorites = getStoredFavorites();
    const countBadges = document.querySelectorAll('#fav-count, #fav-summary-count');
    
    countBadges.forEach(badge => {
      if (badge) badge.textContent = favorites.length;
    });

    // Update Add-to-Fav buttons active state
    const addFavButtons = document.querySelectorAll('.add-fav-btn');
    addFavButtons.forEach(btn => {
      const id = btn.getAttribute('data-id');
      const isFav = favorites.some(item => item.id === id);
      if (isFav) {
        btn.classList.add('active');
        btn.innerHTML = '❤️ Favorited';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '⭐ Add to Favorites';
      }
    });

    // Render Favorites Drawer on Products Page if present
    const favListContainer = document.getElementById('favorites-list');
    const favActions = document.getElementById('favorites-actions');

    if (favListContainer) {
      if (favorites.length === 0) {
        favListContainer.className = 'favorites-list-empty';
        favListContainer.innerHTML = '<p>No favorites saved yet. Click the "⭐ Add to Favorites" button on any product below to save items for quick pre-ordering!</p>';
        if (favActions) favActions.classList.add('hidden');
      } else {
        favListContainer.className = 'favorites-list-content';
        let html = '';
        favorites.forEach(item => {
          html += `
            <div class="fav-item-row">
              <div>
                <strong>${item.name}</strong> <span class="text-muted">(${item.price})</span>
              </div>
              <button class="btn btn-sm btn-outline remove-fav-btn" data-id="${item.id}">Remove</button>
            </div>
          `;
        });
        favListContainer.innerHTML = html;
        if (favActions) favActions.classList.remove('hidden');

        // Attach event listeners to remove buttons
        favListContainer.querySelectorAll('.remove-fav-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idToRemove = e.target.getAttribute('data-id');
            removeFavorite(idToRemove);
          });
        });
      }
    }

    // Auto-fill Item Details in Pre-Order Form if on Contact Page
    const itemDetailsTextarea = document.getElementById('item_details');
    const favAutofillNotice = document.getElementById('fav-autofill-notice');
    if (itemDetailsTextarea && favorites.length > 0) {
      if (!itemDetailsTextarea.value.trim()) {
        const favNames = favorites.map(f => `1x ${f.name}`).join('\n');
        itemDetailsTextarea.value = `[Pre-Filled from Saved Favorites]:\n${favNames}`;
        if (favAutofillNotice) favAutofillNotice.classList.remove('hidden');
      }
    }
  }

  function addFavorite(item) {
    let favorites = getStoredFavorites();
    if (!favorites.some(f => f.id === item.id)) {
      favorites.push(item);
      saveFavoritesToStorage(favorites);
      updateFavoritesUI();
    }
  }

  function removeFavorite(id) {
    let favorites = getStoredFavorites();
    favorites = favorites.filter(f => f.id !== id);
    saveFavoritesToStorage(favorites);
    updateFavoritesUI();
  }

  // Attach click events to Add-to-Fav buttons across site
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('add-fav-btn')) {
      const btn = e.target;
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');

      let favorites = getStoredFavorites();
      const isFav = favorites.some(f => f.id === id);

      if (isFav) {
        removeFavorite(id);
      } else {
        addFavorite({ id, name, price });
      }
    }
  });

  // Clear All Favorites Button
  const clearFavsBtn = document.getElementById('clear-favs-btn');
  if (clearFavsBtn) {
    clearFavsBtn.addEventListener('click', () => {
      saveFavoritesToStorage([]);
      updateFavoritesUI();
    });
  }

  // Initialize Favorites UI on load
  updateFavoritesUI();


  // -------------------------------------------------------------
  // 3. Dynamic Product Category Filter (Products Page)
  // -------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');

        productCards.forEach(card => {
          if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }


  // -------------------------------------------------------------
  // 4. Form Validation & LocalStorage Auto-Fill (Touchstone 4 Requirement)
  // -------------------------------------------------------------
  const preorderForm = document.getElementById('preorder-form');

  if (preorderForm) {
    const nameInput = document.getElementById('user_name');
    const emailInput = document.getElementById('user_email');
    const dateInput = document.getElementById('pickup_date');
    const typeSelect = document.getElementById('request_type');
    const detailsInput = document.getElementById('item_details');
    const rememberCheckbox = document.getElementById('remember_me');

    // Auto-fill saved user contact info from localStorage on page open
    try {
      const savedUser = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.name && nameInput) nameInput.value = userData.name;
        if (userData.email && emailInput) emailInput.value = userData.email;
      }
    } catch (e) {
      console.error('Error loading saved contact info:', e);
    }

    // Single field validator function
    function validateField(inputElement, errorElementId, validationRules) {
      const value = inputElement.value.trim();
      let errorMessage = '';

      if (validationRules.required && !value) {
        errorMessage = 'This field is required.';
      } else if (validationRules.minLength && value.length < validationRules.minLength) {
        errorMessage = `Must be at least ${validationRules.minLength} characters long.`;
      } else if (validationRules.emailPattern) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = 'Please enter a valid email address (e.g., name@domain.com).';
        }
      } else if (validationRules.futureDate) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(selectedDate.getTime()) || selectedDate < today) {
          errorMessage = 'Please select a valid future date for pickup.';
        }
      }

      const errorSpan = document.getElementById(errorElementId);
      if (errorMessage) {
        inputElement.classList.add('is-invalid');
        if (errorSpan) errorSpan.textContent = errorMessage;
        return false;
      } else {
        inputElement.classList.remove('is-invalid');
        if (errorSpan) errorSpan.textContent = '';
        return true;
      }
    }

    // Attach input event listeners for real-time error clearing
    if (nameInput) {
      nameInput.addEventListener('input', () => validateField(nameInput, 'err-user_name', { required: true, minLength: 2 }));
    }
    if (emailInput) {
      emailInput.addEventListener('input', () => validateField(emailInput, 'err-user_email', { required: true, emailPattern: true }));
    }
    if (dateInput) {
      dateInput.addEventListener('change', () => validateField(dateInput, 'err-pickup_date', { required: true, futureDate: true }));
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', () => validateField(typeSelect, 'err-request_type', { required: true }));
    }
    if (detailsInput) {
      detailsInput.addEventListener('input', () => validateField(detailsInput, 'err-item_details', { required: true, minLength: 10 }));
    }

    // Submit handler
    preorderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, 'err-user_name', { required: true, minLength: 2 });
      const isEmailValid = validateField(emailInput, 'err-user_email', { required: true, emailPattern: true });
      const isDateValid = validateField(dateInput, 'err-pickup_date', { required: true, futureDate: true });
      const isTypeValid = validateField(typeSelect, 'err-request_type', { required: true });
      const isDetailsValid = validateField(detailsInput, 'err-item_details', { required: true, minLength: 10 });

      if (isNameValid && isEmailValid && isDateValid && isTypeValid && isDetailsValid) {
        
        // Save contact info if remember me checked
        if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim()
          }));
        }

        // Show Confirmation Message
        document.getElementById('confirm-name').textContent = nameInput.value.trim();
        document.getElementById('confirm-date').textContent = dateInput.value;
        document.getElementById('confirm-email').textContent = emailInput.value.trim();

        const successMsg = document.getElementById('form-success-message');
        if (successMsg) {
          successMsg.classList.remove('hidden');
          successMsg.scrollIntoView({ behavior: 'smooth' });
        }

        // Reset Form & Clear Favorites if ordered
        preorderForm.reset();
        saveFavoritesToStorage([]);
        updateFavoritesUI();
      }
    });
  }


  // -------------------------------------------------------------
  // 5. Video Player Custom Controls Setup
  // -------------------------------------------------------------
  function setupVideoControls(videoId, playBtnId, muteBtnId, ccBtnId) {
    const video = document.getElementById(videoId);
    const playBtn = document.getElementById(playBtnId);
    const muteBtn = document.getElementById(muteBtnId);
    const ccBtn = document.getElementById(ccBtnId);

    if (video && playBtn && muteBtn && ccBtn) {
      playBtn.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          playBtn.textContent = '⏸ Pause';
        } else {
          video.pause();
          playBtn.textContent = '▶ Play';
        }
      });

      muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔇 Unmute' : '🔊 Mute';
      });

      ccBtn.addEventListener('click', () => {
        if (video.textTracks && video.textTracks.length > 0) {
          const track = video.textTracks[0];
          if (track.mode === 'showing') {
            track.mode = 'hidden';
            ccBtn.textContent = '💬 CC Subtitles (Off)';
          } else {
            track.mode = 'showing';
            ccBtn.textContent = '💬 CC Subtitles (On)';
          }
        }
      });
    }
  }

  setupVideoControls('bakery-video', 'btn-play-pause', 'btn-mute', 'btn-cc');
  setupVideoControls('bakery-video-about', 'btn-play-pause-about', 'btn-mute-about', 'btn-cc-about');

});
