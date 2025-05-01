document.addEventListener('DOMContentLoaded', () => {
    // تحسين تأثيرات الشريط العلوي
    const navbar = document.querySelector('.navbar');
    const heroSection = document.querySelector('.hero');
    
    const heroOptions = {
        threshold: 0.1
    };
    
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }, heroOptions);
    
    heroObserver.observe(heroSection);

    // تحسين العداد الحي
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                current = target;
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }
    
    animateCounter(document.getElementById('liveCounter'), 1257);
    animateCounter(document.getElementById('playersOnline'), 2243);

    // تأثيرات عند التمرير
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.game-card, .featured-games-1, .about-section');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // تهيئة العناصر
    document.querySelectorAll('.game-card, .featured-games-1, .about-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // تشغيل مرة أولية
});

// Updated script.js
document.addEventListener('DOMContentLoaded', () => {
    // Loading Screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = '<div class="spinner"></div>';
    document.body.prepend(loadingScreen);

    // Remove loading screen after 2s
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 500);
    }, 2000);

    // Dark Mode Toggle
    const navul = document.querySelector('.navbar-nav')
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    navul.appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Wishlist Functionality
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            this.innerHTML = this.classList.contains('active') ? 
                '<i class="fas fa-heart" style="color:red"></i>' : 
                '<i class="fas fa-heart"></i>';
        });
    });

    // Newsletter Validation
    const newsletterForm = document.querySelector('.newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        if(validateEmail(email)) {
            showToast('Subscribed successfully!');
            this.reset();
        } else {
            showToast('Please enter a valid email!', 'error');
        }
    });

    // Helper Functions
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    // Improved Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.game-card, .team-card, .stats-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Dynamic Current Year
    document.querySelector('.copyright').innerHTML = 
        `&copy; ${new Date().getFullYear()} Level Up. All rights reserved.`;
});

