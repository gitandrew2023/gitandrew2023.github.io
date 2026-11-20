/* ==========================================================================
   North Star Bakery - Touchstone 5 Client-Side JavaScript Subsystem
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  initMobileNav();
  initFavorites();
  initProductFilter();
  initFormValidation();
  initVideoControls();
});

/* 1. Mobile Navigation Toggle */
function initMobileNav() {
  const toggleBtn = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', function() {
      const isOpen = mainNav.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });
  }
}

/* 2. Interactive Favorites Manager with localStorage */
const STORAGE_KEY = 'northstar_bakery_favorites';

function getFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch(e) {
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    updateFavoritesUI();
  } catch(e) {}
}

function toggleFavorite(id, name, price) {
  let favs = getFavorites();
  const index = favs.findIndex(item => item.id === id);
  if (index > -1) {
    favs.splice(index, 1);
  } else {
    favs.push({ id, name, price });
  }
  saveFavorites(favs);
}

function removeFavorite(id) {
  let favs = getFavorites().filter(item => item.id !== id);
  saveFavorites(favs);
}

function clearAllFavorites() {
  saveFavorites([]);
}

function updateFavoritesUI() {
  const favs = getFavorites();
  
  // Update header counter
  const counterEl = document.getElementById('nav-fav-count');
  if (counterEl) {
    counterEl.textContent = `⭐ Favorites (${favs.length})`;
  }

  // Update card buttons
  document.querySelectorAll('.btn-fav').forEach(btn => {
    const card = btn.closest('.product-card, .featured-text');
    if (card) {
      const match = favs.some(item => btn.getAttribute('onclick').includes(item.id));
      if (match) {
        btn.classList.add('active');
        btn.textContent = '❤️ Favorited';
      } else {
        btn.classList.remove('active');
        btn.textContent = '⭐ Add to Favorites';
      }
    }
  });

  // Render Favorites Drawer on products.html
  const drawer = document.getElementById('favorites-list');
  if (drawer) {
    if (favs.length === 0) {
      drawer.innerHTML = '<p class="empty-fav">No favorite items saved yet. Click "⭐ Add to Favorites" on any product card above!</p>';
    } else {
      drawer.innerHTML = favs.map(item => `
        <div class="fav-item-card">
          <div>
            <strong>${item.name}</strong><br>
            <small>${item.price}</small>
          </div>
          <button class="btn btn-secondary" onclick="removeFavorite('${item.id}')">✕ Remove</button>
        </div>
      `).join('');
    }
  }
}

function initFavorites() {
  updateFavoritesUI();

  // Check URL parameter for pre-filling form
  if (window.location.search.includes('prefill=true')) {
    const favs = getFavorites();
    const detailsField = document.getElementById('item_details');
    const notice = document.getElementById('storage-notice');
    if (detailsField && favs.length > 0) {
      const itemsList = favs.map(f => `- 1x ${f.name} (${f.price})`).join('\n');
      detailsField.value = `Pre-ordering Saved Favorites:\n${itemsList}`;
      if (notice) notice.style.display = 'block';
    }
  }
}

/* 3. Dynamic Product Category Filter */
function initProductFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* 4. Client-Side Form Validation with Inline Feedback */
function initFormValidation() {
  const form = document.getElementById('preorder-form');
  if (!form) return;

  // Load remembered user contact info from localStorage
  const savedUser = localStorage.getItem('northstar_bakery_user');
  if (savedUser) {
    try {
      const u = JSON.parse(savedUser);
      if (u.name) document.getElementById('user_name').value = u.name;
      if (u.email) document.getElementById('user_email').value = u.email;
    } catch(e) {}
  }

  // Set minimum date to today
  const dateInput = document.getElementById('pickup_date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    // 1. Required Name Check
    const nameInput = document.getElementById('user_name');
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showError(nameInput, 'err-name', 'Please enter your full name (minimum 2 characters).');
      isValid = false;
    }

    // 2. Email Pattern Check
    const emailInput = document.getElementById('user_email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, 'err-email', 'Please enter a valid email address (e.g. name@domain.com).');
      isValid = false;
    }

    // 3. Pickup Date Check
    if (!dateInput.value) {
      showError(dateInput, 'err-date', 'Please select a pickup date.');
      isValid = false;
    }

    // 4. Request Type Check
    const typeSelect = document.getElementById('request_type');
    if (!typeSelect.value) {
      showError(typeSelect, 'err-type', 'Please select a request type.');
      isValid = false;
    }

    // 5. Item Details Check
    const detailsInput = document.getElementById('item_details');
    if (!detailsInput.value.trim() || detailsInput.value.trim().length < 10) {
      showError(detailsInput, 'err-details', 'Please specify your items (minimum 10 characters).');
      isValid = false;
    }

    if (isValid) {
      // Handle Remember Me
      const rememberCb = document.getElementById('remember_me');
      if (rememberCb && rememberCb.checked) {
        localStorage.setItem('northstar_bakery_user', JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim()
        }));
      }

      form.style.display = 'none';
      document.getElementById('form-success-modal').style.display = 'block';
    }
  });
}

function showError(inputEl, errorId, message) {
  inputEl.classList.add('invalid');
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = message;
}

function resetForm() {
  const form = document.getElementById('preorder-form');
  if (form) {
    form.reset();
    form.style.display = 'block';
    document.getElementById('form-success-modal').style.display = 'none';
  }
}

/* 5. Custom Video Player Controls */
function initVideoControls() {
  setupVideo('bakery-video', 'btn-play-pause', 'btn-mute', 'btn-cc');
  setupVideo('about-bakery-video', 'btn-play-pause-about', 'btn-mute-about', null);
}

function setupVideo(videoId, playId, muteId, ccId) {
  const video = document.getElementById(videoId);
  const playBtn = document.getElementById(playId);
  const muteBtn = document.getElementById(muteId);
  const ccBtn = document.getElementById(ccId);

  if (!video) return;

  if (playBtn) {
    playBtn.addEventListener('click', function() {
      if (video.paused) {
        video.play();
        playBtn.textContent = '⏸ Pause';
      } else {
        video.pause();
        playBtn.textContent = '▶ Play';
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', function() {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? '🔇 Unmute' : '🔊 Mute';
    });
  }

  if (ccBtn) {
    ccBtn.addEventListener('click', function() {
      const track = video.textTracks[0];
      if (track) {
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
