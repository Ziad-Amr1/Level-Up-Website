document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const gamesPerPage = 12;
    let currentPage = 1;

    // Star Rating
    let selectedRating = 0;
    const ratingStars = document.querySelectorAll('#rating-filter i');
    
    ratingStars.forEach(star => {
      star.addEventListener('click', () => {
        const clickedRating = parseInt(star.dataset.rating);
    
        if (clickedRating === selectedRating) {
          // ⭐ إذا ضغط على نفس النجمة → ألغِ التحديد
          selectedRating = 0;
        } else {
          selectedRating = clickedRating;
        }
    
        // 🔄 تحديث مظهر النجوم
        ratingStars.forEach(s => {
          s.classList.toggle('active', parseInt(s.dataset.rating) <= selectedRating);
        });
    
      });
    });


    // Fetch games data
    fetch('../JSON/Games.json')
    .then(response => response.json())
    .then(data => {
        allGames = data.games;

        const prices = allGames.map(game => parseFloat(game.price) || 0);
        const maxPrice = Math.ceil(Math.max(...prices)) + 1;

        priceMinInput.max = maxPrice;
        priceMaxInput.max = maxPrice;

        priceMinInput.value = 0;               
        priceMaxInput.value = maxPrice;
        priceMinValueInput.value = "Free";
        priceMaxValueInput.value = maxPrice;

        updateSliderTrack();
        initStore();
    });

    // You mean here?


    function initStore() {
        renderGames();
        setupFilters();
        setupSorting();
        setupPagination();
        updateCartCount();
        setupFilterSidebar();
    }

    function renderGames(games = allGames) {
        const gamesGrid = document.querySelector('.games-grid');
        gamesGrid.innerHTML = games.map(game => `
            <div class="game-card" data-id="${game.id}">
                <img src="${game.cover_image || 'assets/default-game.jpg'}" alt="${game.title}">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <p class="game-description">${game.description || ''}</p>
                    <div class="game-meta">
                        <span class="price-tag">$${game.price || 'Free'}</span>
                        <div class="game-rating">
                            ${renderRating(game.rating)}
                        </div>
                    </div>
                    <div class="game-actions btn-group">
                    <button class="btn btn-cart add-to-cart">Add to Cart</button>
                    <button class="btn btn-wishlist wishlist-btn">
                        <i class="fas fa-heart"></i>
                    </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', addToCart);
        });

        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', showGameDetails);
        });
    }

    // New: Filter sidebar setup
    function setupFilterSidebar() {
        const filterSidebar = document.querySelector('.filter-sidebar');
        const filterToggle = document.querySelector('.filter-toggle-btn');
        const closeSidebar = document.querySelector('.close-sidebar');

        // Toggle Sidebar
        filterToggle.addEventListener('click', () => {
            filterSidebar.classList.add('active');
        });

        closeSidebar.addEventListener('click', () => {
            filterSidebar.classList.remove('active');
        });

        // Price Filter
        priceRange.addEventListener('input', updateSliderTrack);

    }

    // Updated filter function
    function applyFilters() {
        const activePlatforms = getActiveFilters('.platform-filters');
        const activeGenres = getActiveFilters('.genre-filters');
        const minPrice = parseFloat(document.getElementById("price-min").value);
        const maxPrice = parseFloat(document.getElementById("price-max").value);
        const minRating = selectedRating;

      
        const filteredGames = allGames.filter(game => {
          const price = parseFloat(game.price) || 0;
          const rating = parseFloat(game.rating) || 0;
          const platforms = game.platforms || [];
          const genres = game.genres || [];
      
          return (
            (activePlatforms.length === 0 || activePlatforms.every(p => platforms.includes(p))) &&
            (activeGenres.length === 0 || activeGenres.every(g => genres.includes(g))) &&
            price >= minPrice &&
            price <= maxPrice &&
            (selectedRating === 0 || (rating >= selectedRating && rating < selectedRating + 1))
          );
        });
      
        renderGames(filteredGames);
      }
      

    // Helper function
    function getActiveFilters(selector) {
        return Array.from(document.querySelectorAll(`${selector} .filter-btn.active`))
            .map(btn => btn.dataset.filter);
    }

    // Modified filter function
    function filterGames(e) {
        e.target.classList.toggle('active');
    }

    function renderRating(rating) {
        if (!rating) return '';
        const fullStars = Math.floor(rating);
        return `
            <div class="star-rating">
                ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
                ${rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                <span>(${rating})</span>
            </div>
        `;
    }

    function setupFilters() {
        const platforms = [...new Set(allGames.flatMap(game => game.platforms))];
        const genres = [...new Set(allGames.flatMap(game => game.genres))];
        
        renderFilterButtons('.platform-filters', platforms);
        renderFilterButtons('.genre-filters', genres);
    }

    function renderFilterButtons(containerSelector, items) {
        const container = document.querySelector(containerSelector);
        container.innerHTML = items.map(item => `
            <button class="filter-btn" data-filter="${item}">${item}</button>
        `).join('');

        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', filterGames);
        });
    }

    function setupSorting() {
        document.querySelector('.sort-select').addEventListener('change', (e) => {
            const sorted = [...allGames].sort((a, b) => {
                switch(e.target.value) {
                    case 'price-asc': return (a.price || 0) - (b.price || 0);
                    case 'price-desc': return (b.price || 0) - (a.price || 0);
                    case 'rating': return (b.rating || 0) - (a.rating || 0);
                    case 'newest': return new Date(b.release_date) - new Date(a.release_date);
                    default: return 0;
                }
            });
            renderGames(sorted);
        });
    }

    function setupPagination() {
        // Implement pagination logic here
    }

    function addToCart(e) {
        const gameId = e.target.closest('.game-card').dataset.id;
        const game = allGames.find(g => g.id == gameId);
        
        cartItems.push(game);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartCount();
        showToast(`${game.title} added to cart!`);
    }

    function updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartItems.length;
        }
    }

    function showGameDetails(e) {
        // Implement game modal logic here
    }

    function showToast(message, type = 'success') {
        // Implement toast notifications here
    }

    // Dark Mode Toggle
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.querySelector('.navbar-nav').appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Price Slider
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    const priceMinValueInput = document.getElementById('price-min-value');
    const priceMaxValueInput = document.getElementById('price-max-value');
    const sliderTrack = document.querySelector('.slider-track');

    // تلوين الخط بين المؤشرين
    function updateSliderTrack() {
    const min = parseInt(priceMinInput.value);
    const max = parseInt(priceMaxInput.value);
    const range = priceMaxInput.max - priceMinInput.min;

    const minPercent = ((min - priceMinInput.min) / range) * 100;
    const maxPercent = ((max - priceMinInput.min) / range) * 100;

    sliderTrack.style.left = minPercent + "%";
    sliderTrack.style.width = (maxPercent - minPercent) + "%";
    }

    // تحريك المؤشرات
    function handleSliderInput() {
    let min = parseInt(priceMinInput.value);
    let max = parseInt(priceMaxInput.value);

    if (min < 0) min = 0;
    if (max < 0) max = 0;
    if (min > max) min = max;

    priceMinInput.value = min;
    priceMaxInput.value = max;
    priceMinValueInput.value = min === 0 ? "Free" : min;
    priceMaxValueInput.value = max;

    updateSliderTrack();
    }

    // تعديل المربعات يدويًا
    function handleInputChange() {
    let minInput = priceMinValueInput.value.trim();
    let maxInput = priceMaxValueInput.value.trim();

    if (!/^\d+(\.\d+)?$/.test(minInput) && minInput.toLowerCase() !== "free") {
        minInput = 0;
    }
    if (!/^\d+(\.\d+)?$/.test(maxInput) && maxInput.toLowerCase() !== "free") {
        maxInput = priceMaxInput.max;
    }

    let min = (minInput.toLowerCase() === "free") ? 0 : parseFloat(minInput);
    let max = (maxInput.toLowerCase() === "free") ? 0 : parseFloat(maxInput);

    if (isNaN(min) || min < 0) min = 0;
    if (isNaN(max) || max < 0) max = parseFloat(priceMaxInput.max);
    if (min > max) min = max;

    priceMinInput.value = min;
    priceMaxInput.value = max;
    priceMinValueInput.value = min === 0 ? "Free" : min;
    priceMaxValueInput.value = max;

    updateSliderTrack();
    }

    // حماية أثناء الكتابة (فقط أرقام أو كلمة Free)
    function validatePriceInput(event) {
        const value = event.target.value.trim().toLowerCase();
      
        if (value === 'free' || /^\d+(\.\d+)?$/.test(value)) {
          return; // القيمة صحيحة
        }
      
        // إذا كانت القيمة غير صالحة
        event.target.value = '';
      }

    // أحداث المستخدم
    priceMinInput.addEventListener('input', handleSliderInput);
    priceMaxInput.addEventListener('input', handleSliderInput);

    priceMinValueInput.addEventListener('input', validatePriceInput);
    priceMaxValueInput.addEventListener('input', validatePriceInput);

    priceMinValueInput.addEventListener('change', handleInputChange);
    priceMaxValueInput.addEventListener('change', handleInputChange);

    // أول تحميل
    updateSliderTrack();
    

    // filter actions
    document.getElementById('clear-filters-btn').addEventListener('click', () => {
        // إعادة تعيين قيم الفلاتر
        selectedRating = 0;
        document.querySelectorAll('#rating-filter i').forEach(star => star.classList.remove('active'));
      
        priceMinInput.value = 0;
        priceMaxInput.value = priceMaxInput.max;
        priceMinValueInput.value = "Free";
        priceMaxValueInput.value = priceMaxInput.max;
      
        updateSliderTrack();
        applyFilters();
      });
      
      document.getElementById('apply-filters-btn').addEventListener('click', () => {
        applyFilters();
      });


      const sidebar = document.querySelector('.filters-sidebar');
      const overlay = document.querySelector('.filter-overlay');

        function closeSidebar() {
        document.body.classList.remove('no-scroll');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        }

        function openSidebar() {
        document.body.classList.add('no-scroll');
        sidebar.classList.add('open');
        overlay.classList.add('active');
        }

        // فتح الفلتر
        document.querySelector('.open-filters-btn').addEventListener('click', openSidebar);

        // إغلاق الفلتر بالأزرار أو الخلفية
        document.querySelector('.close-filters-btn').addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        // إغلاق بالضغط خارج الفلتر
        document.addEventListener('click', (e) => {
        if (!e.target.closest('.filters-sidebar') && !e.target.closest('.open-filters-btn')) {
            closeSidebar();
        }
        });

        // إغلاق بزر Escape
        document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
        });

      

        // game preview
        // ===== Game Preview Slider =====
            const previewSection = {
                elements: {
                    previewImage: document.querySelector('.game-preview img'),
                    previewTitle: document.querySelector('.game-content h3'),
                    previewDesc: document.querySelector('.game-content p'),
                    previewList: document.querySelector('.games-list ul')
                },
                currentIndex: 0,
                interval: null,
                targetIDs: [15, 21, 23, 24, 12] // الألعاب المطلوبة حسب ID
            };
        
            // جلب البيانات من ملف JSON
            fetch('JSON/Games.json')
                .then(response => {
                    if (!response.ok) throw new Error('Network error');
                    return response.json();
                })
                .then(data => {
                    const allGames = data.games;
                    initPreviewSlider(allGames);
                })
                .catch(error => {
                    console.error('Error loading games:', error);
                    showError('Failed to load featured games');
                });
        
            function initPreviewSlider(allGames) {
                // تصفية وترتيب الألعاب المطلوبة
                const selectedGames = allGames
                    .filter(game => previewSection.targetIDs.includes(game.id))
                    .sort((a, b) => 
                        previewSection.targetIDs.indexOf(a.id) - 
                        previewSection.targetIDs.indexOf(b.id)
                    );
        
                if (selectedGames.length === 0) {
                    showError('No featured games found');
                    return;
                }
        
                // تعبئة القائمة الجانبية
                previewSection.elements.previewList.innerHTML = selectedGames
                    .map((game, index) => `
                        <li data-index="${index}" class="${index === 0 ? 'active' : ''}">
                            <img src="${game.cover_image}" 
                                 alt="${game.title}" 
                                 loading="lazy"
                                 onerror="handleImageError(this)">
                            <h3>${game.title}</h3>
                        </li>
                    `).join('');
        
                // تفعيل أحداث النقر
                document.querySelectorAll('.games-list li').forEach((item, index) => {
                    item.addEventListener('click', () => {
                        previewSection.currentIndex = index;
                        updatePreviewSlide(selectedGames);
                        resetAutoSlide(selectedGames);
                    });
                });
        
                // بدء التشغيل الأولي
                updatePreviewSlide(selectedGames);
                startAutoSlide(selectedGames);
            }
        
            function updatePreviewSlide(games) {
                const currentGame = games[previewSection.currentIndex];
                
                // تأثيرات الانتقال
                previewSection.elements.previewImage.style.opacity = '0';
                previewSection.elements.previewTitle.style.opacity = '0';
                previewSection.elements.previewDesc.style.opacity = '0';
                
                setTimeout(() => {
                    previewSection.elements.previewImage.src = currentGame.cover_image;
                    previewSection.elements.previewImage.alt = currentGame.title;
                    previewSection.elements.previewTitle.textContent = currentGame.title;
                    previewSection.elements.previewDesc.textContent = currentGame.description;
                    
                    previewSection.elements.previewImage.style.opacity = '1';
                    previewSection.elements.previewTitle.style.opacity = '1';
                    previewSection.elements.previewDesc.style.opacity = '1';
                }, 300);
        
                // تحديث الحالة النشطة
                document.querySelectorAll('.games-list li').forEach(li => {
                    li.classList.remove('active');
                });
                document.querySelector(`.games-list li[data-index="${previewSection.currentIndex}"]`)
                    .classList.add('active');
            }
        
            function startAutoSlide(games) {
                if (previewSection.interval) clearInterval(previewSection.interval);
                
                previewSection.interval = setInterval(() => {
                    previewSection.currentIndex = 
                        (previewSection.currentIndex + 1) % games.length;
                    updatePreviewSlide(games);
                }, 5000);
            }
        
            function resetAutoSlide(games) {
                clearInterval(previewSection.interval);
                startAutoSlide(games);
            }
        
            function handleImageError(img) {
                img.src = 'assets/default-game.jpg';
                img.style.objectFit = 'contain';
            }
        
            function showError(message) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'preview-error';
                errorDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                `;
                document.querySelector('.preview-section').appendChild(errorDiv);
            }

            // search suggestions
            // ===== Search Suggestions =====
            const searchInput = document.getElementById('gameSearch');
            const suggestionsBox = document.querySelector('.search-suggestions');

            // جلب البيانات من ملف JSON
            fetch('JSON/Games.json')
                .then(response => response.json())
                .then(data => {
                    allGames = data.games;
                });

            // حدث البحث
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                suggestionsBox.innerHTML = '';
                
                if(searchTerm.length > 0) {
                    const filteredGames = allGames.filter(game => 
                        game.title.toLowerCase().includes(searchTerm)
                    );
                    
                    showSuggestions(filteredGames);
                    suggestionsBox.classList.add('active');
                } else {
                    suggestionsBox.classList.remove('active');
                }
            });

            function showSuggestions(games) {
                const html = games.slice(0,5).map(game => `
                    <div class="suggestion-item" data-id="${game.id}">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${game.cover_image}" 
                                alt="${game.title}" 
                                width="40" 
                                height="40"
                                class="rounded"
                                onerror="this.src='assets/default-game.jpg'">
                            <div>
                                <h6 class="mb-0">${game.title}</h6>
                                <small>$${game.price || 'Free'}</small>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                suggestionsBox.innerHTML = html;
                
                // حدث النقر على الاقتراح
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const gameId = item.dataset.id;
                        const selectedGame = allGames.find(g => g.id == gameId);
                        if(selectedGame) {
                            window.location.href = `game-details.html?id=${gameId}`;
                        }
                    });
                });
            }

            // إغلاق الاقتراحات عند النقر خارجها
            document.addEventListener('click', (e) => {
                if(!e.target.closest('.search-bar')) {
                    suggestionsBox.classList.remove('active');
                }
            });

            // Carousel
            // ===== Carousel =====
            // ===== Staff Picks Carousel =====
    class StaffPicksCarousel {
        constructor() {
            this.carouselTrack = document.querySelector('.carousel-track');
            this.carouselInner = document.querySelector('.carousel-inner');
            this.indicatorsContainer = document.querySelector('.carousel-indicators');
            this.prevBtn = document.querySelector('.prev-btn');
            this.nextBtn = document.querySelector('.next-btn');
            
            // Default settings
            this.settings = {
                autoplay: true,
                autoplayInterval: 5000,
                itemsPerView: 4,
                responsive: {
                    1200: 3,
                    992: 2,
                    576: 1
                }
            };

            this.state = {
                currentIndex: 0,
                isDragging: false,
                startPosX: 0,
                currentTranslate: 0,
                prevTranslate: 0,
                animationID: null
            };

            this.init();
        }

        async init() {
            try {
                await this.loadData();
                this.setupCarousel();
                this.setupControls();
                this.createIndicators();
                this.setupEventListeners();
                this.activateAutoplay();
            } catch (error) {
                console.error('Carousel initialization error:', error);
                this.showError('Failed to initialize carousel');
            }
        }

        async loadData() {
            try {
                const response = await fetch('../JSON/Games.json');
                const data = await response.json();
                
                if (!data.games || !Array.isArray(data.games)) {
                    throw new Error('Invalid data format');
                }

                this.items = data.games
                    .filter(game => game.is_featured)
                    .slice(0, 8);
                
                this.renderItems();
            } catch (error) {
                console.error('Data loading error:', error);
                this.showError('Failed to load games data');
            }
        }

        renderItems() {
            this.carouselTrack.innerHTML = this.items.map((game, index) => `
            <div class="carousel-item" data-index="${index}" style="--index: ${index}">
                    <div class="featured-card">
                        <img src="${game.cover_image}" 
                             alt="${game.title}" 
                             onerror="this.src='fallback-image.jpg'">
                        <div class="featured-content">
                            <h3>${game.title}</h3>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="price">${game.price ? '$' + game.price : 'Free'}</span>
                                <div class="rating">
                                    ${this.generateStars(game.rating)}
                                </div>
                            </div>
                            <button class="btn btn-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }


        setupCarousel() {
            // Set initial dimensions
            this.updateDimensions();
            
            // Set initial position
            this.carouselTrack.style.transform = `translateX(0)`;
            
            // Setup touch/swipe support
            this.setupTouchEvents();
        }

        updateDimensions() {
            const item = this.carouselTrack.firstElementChild;
            if (!item) return;

            const itemStyle = getComputedStyle(item);
            this.itemWidth = item.offsetWidth + 
                          parseFloat(itemStyle.marginLeft) + 
                          parseFloat(itemStyle.marginRight);
            
            this.carouselTrack.style.width = 
                `${this.items.length * this.itemWidth}px`;
            
            this.updateBreakpoints();
        }

        updateBreakpoints() {
            const width = window.innerWidth;
            this.settings.itemsPerView = 
                width >= 1200 ? 4 :
                width >= 992 ? 3 :
                width >= 576 ? 2 : 1;
        }

        setupControls() {
            // Previous Button
            this.prevBtn.addEventListener('click', () => {
                this.slideTo(this.state.currentIndex - 1);
            });

            // Next Button
            this.nextBtn.addEventListener('click', () => {
                this.slideTo(this.state.currentIndex + 1);
            });
        }

        createIndicators() {
            this.indicatorsContainer.innerHTML = 
                this.items.map((_, index) => `
                    <div class="carousel-indicator ${index === 0 ? 'active' : ''}" 
                         data-index="${index}"></div>
                `).join('');
        }

        setupEventListeners() {
            // Window Resize
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.updateDimensions();
                    this.slideTo(this.state.currentIndex);
                }, 250);
            });

            // Indicators Click
            this.indicatorsContainer.addEventListener('click', (e) => {
                const indicator = e.target.closest('.carousel-indicator');
                if (indicator) {
                    const index = parseInt(indicator.dataset.index);
                    this.slideTo(index);
                }
            });
        }

        slideTo(targetIndex) {
            const maxIndex = Math.ceil(this.items.length / this.settings.itemsPerView) - 1;
            this.state.currentIndex = Math.max(0, Math.min(targetIndex, maxIndex));
            
            const offset = this.state.currentIndex * 
                         this.itemWidth * 
                         this.settings.itemsPerView;
            
            this.carouselTrack.style.transform = `translateX(-${offset}px)`;
            this.updateActiveState();
        }

        updateActiveState() {
            // Update indicators
            document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.state.currentIndex);
            });

            // Update button states
            this.prevBtn.disabled = this.state.currentIndex === 0;
            this.nextBtn.disabled = this.state.currentIndex === 
                Math.floor(this.items.length / this.settings.itemsPerView) - 1;
        }

        setupTouchEvents() {
            this.carouselInner.addEventListener('touchstart', this.touchStart.bind(this));
            this.carouselInner.addEventListener('touchmove', this.touchMove.bind(this));
            this.carouselInner.addEventListener('touchend', this.touchEnd.bind(this));
            
            this.carouselInner.addEventListener('mousedown', this.touchStart.bind(this));
            document.addEventListener('mousemove', this.touchMove.bind(this));
            document.addEventListener('mouseup', this.touchEnd.bind(this));
        }

        touchStart(e) {
            this.state.startPosX = this.getPositionX(e);
            this.state.isDragging = true;
            this.carouselTrack.classList.add('grabbing');
            cancelAnimationFrame(this.state.animationID);
            this.state.prevTranslate = this.state.currentTranslate;
        }

        touchMove(e) {
            if (!this.state.isDragging) return;
            const currentPosition = this.getPositionX(e);
            const diff = currentPosition - this.state.startPosX;
            
            this.state.currentTranslate = this.state.prevTranslate + diff;
            this.carouselTrack.style.transform = 
                `translateX(${this.state.currentTranslate}px)`;
        }

        touchEnd() {
            if (!this.state.isDragging) return;
            this.state.isDragging = false;
            this.carouselTrack.classList.remove('grabbing');
            
            const movedBy = this.state.currentTranslate - this.state.prevTranslate;
            
            if (Math.abs(movedBy) > this.itemWidth * 0.2) {
                movedBy > 0 ? this.slideTo(this.state.currentIndex - 1) 
                            : this.slideTo(this.state.currentIndex + 1);
            } else {
                this.slideTo(this.state.currentIndex);
            }
        }

        getPositionX(e) {
            return e.type.includes('mouse') ? 
                e.pageX : 
                e.touches[0].clientX;
        }

        activateAutoplay() {
            if (!this.settings.autoplay) return;
            
            this.autoplayInterval = setInterval(() => {
                const nextIndex = this.state.currentIndex < 
                    Math.floor(this.items.length / this.settings.itemsPerView) - 1 ?
                    this.state.currentIndex + 1 : 0;
                this.slideTo(nextIndex);
            }, this.settings.autoplayInterval);
        }

        generateStars(rating) {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;
            
            return `
                ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
                ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
                ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
            `;
        }

        showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'carousel-error alert alert-danger';
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            `;
            this.carouselInner.parentNode.insertBefore(errorDiv, this.carouselInner);
        }
    }

    // Initialize carousel with error handling
    try {
        new StaffPicksCarousel();
    } catch (error) {
        console.error('Carousel failed to initialize:', error);
        document.querySelector('.carousel-indicators').innerHTML = 
            '<p class="text-danger">Error loading carousel</p>';
    }


      
});