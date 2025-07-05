// Main JavaScript for Roll Paradise Website
class RollParadise {
    constructor() {
        this.cart = {
            items: [],
            total: 0,
            count: 0
        };
        this.isModalOpen = false; // New flag to track modal state
        this.floatingParticlesInterval = null; // To store the interval ID
        this.init();
    }

    init() {
        this.initEventListeners();
        this.initSmoothScrolling();
        this.initAnimations();
        this.initScrollEffects();
        this.initFloatingActionButton();
        this.addMagicEffects();
        this.addCardHoverEffects();
        this.createParticleSystem();
        this.addEasterEggs();
        this.addLoadingAnimations();
        this.initHeroSmoothScrolling();
        this.updateCartFromServer();

        
        console.log('🌯 Roll Paradise loaded successfully!');
    }

    initEventListeners() {
        // Hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navMenu.classList.contains('active') && 
                !hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });

        // Enhanced smooth scrolling for all anchor links
        this.initSmoothScrolling();

        // Add scroll indicator click handler
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                this.smoothScrollToSection('#featured-rolls');
            });
        }
    }

    // Enhanced smooth scrolling functionality
    initSmoothScrolling() {
        // Smooth scroll for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                // Only smooth scroll if the target is not just '#'
                if (targetId && targetId !== '#') {
                    e.preventDefault();
                    this.smoothScrollToSection(targetId);
                }
            });
        });

        // Smooth scroll for navigation menu links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollToSection(href);
                    
                    // Close mobile menu if open
                    const navMenu = document.getElementById('nav-menu');
                    const hamburger = document.getElementById('hamburger');
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        hamburger.classList.remove('active');
                    }
                }
            });
        });

        // Smooth scroll for CTA buttons
        document.querySelectorAll('.btn[href^="#"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('href');
                this.smoothScrollToSection(targetId);
            });
        });

        // Smooth scroll for footer links
        document.querySelectorAll('.footer-links a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                this.smoothScrollToSection(targetId);
            });
        });

        // Smooth scroll for hero section buttons
        this.initHeroSmoothScrolling();
    }

    // Enhanced scroll to section function
    smoothScrollToSection(sectionId, offset = 80) {
        const targetElement = document.querySelector(sectionId);
        if (targetElement) {
            const targetPosition = targetElement.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Smooth scroll for hero section buttons
    initHeroSmoothScrolling() {
        // Hero primary button (Build Your Dream Roll)
        const heroPrimaryBtn = document.querySelector('.hero .btn-primary');
        if (heroPrimaryBtn) {
            heroPrimaryBtn.addEventListener('click', (e) => {
                const href = heroPrimaryBtn.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollToSection(href);
                }
            });
        }

        // Hero secondary button (Explore Menu)
        const heroSecondaryBtn = document.querySelector('.hero .btn-secondary');
        if (heroSecondaryBtn) {
            heroSecondaryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollToSection('#featured-rolls');
            });
        }

        // Featured actions button
        const exploreMenuBtn = document.querySelector('.featured-actions .btn');
        if (exploreMenuBtn) {
            exploreMenuBtn.addEventListener('click', (e) => {
                const href = exploreMenuBtn.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollToSection(href);
                }
            });
        }

        // CTA buttons
        const buildRollBtn = document.querySelector('.cta-buttons .btn-primary');
        if (buildRollBtn) {
            buildRollBtn.addEventListener('click', (e) => {
                const href = buildRollBtn.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollToSection(href);
                }
            });
        }
    }

    initAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, delay);
                }
            });
        }, observerOptions);

        // Observe all elements with animation classes
        document.querySelectorAll('.reveal-text, .card-reveal, .feature-reveal, .animate-text, .animate-stats, .animate-buttons').forEach(el => {
            observer.observe(el);
        });

        // Initialize counter animations
        this.initCounterAnimations();
    }

    initCounterAnimations() {
        const animateCounters = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
                    const increment = target / 100;
                    let current = 0;
                    
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            if (counter.textContent.includes('K')) {
                                counter.textContent = Math.ceil(current / 1000) + 'K+';
                            } else if (counter.textContent.includes('.')) {
                                counter.textContent = (current / 10).toFixed(1);
                            } else {
                                counter.textContent = Math.ceil(current);
                            }
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = counter.textContent; // Reset to original
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        };

        const counterObserver = new IntersectionObserver(animateCounters, {
            threshold: 0.5
        });

        document.querySelectorAll('.stat-number').forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    initScrollEffects() {
        let ticking = false;

        const updateNavbar = () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.3)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                }
            }
        };

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            // Parallax effect for satellite rolls
            const satelliteRolls = document.querySelectorAll('.satellite-roll');
            satelliteRolls.forEach((roll, index) => {
                if (roll) {
                    const speed = 0.2 + (index * 0.1);
                    const yPos = -(scrolled * speed);
                    const rotation = scrolled * 0.05 + index * 90;
                    roll.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
                }
            });

            // Parallax effect for hero background
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                const yPos = scrolled * 0.5;
                heroBackground.style.transform = `translateY(${yPos}px)`;
            }
        };

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (!this.isModalOpen) { // Only update if modal is not open
                        updateNavbar();
                        updateParallax();
                        this.updateScrollIndicator();
                        console.log('Scroll effects are active.');
                    } else {
                        console.log('Scroll effects are paused because modal is open.');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            const scrolled = window.pageYOffset;
            const opacity = Math.max(0, 1 - (scrolled / 300));
            scrollIndicator.style.opacity = opacity;
            scrollIndicator.style.transform = `translateX(-50%) translateY(${scrolled * 0.2}px)`;
        }
    }

    initFloatingActionButton() {
        const fabMain = document.getElementById('fab-main');
        const fabContainer = document.querySelector('.fab-container');
        
        if (fabMain && fabContainer) {
            fabMain.addEventListener('click', () => {
                fabContainer.classList.toggle('active');
                fabMain.classList.toggle('active');
            });

            // Close FAB when clicking outside
            document.addEventListener('click', (e) => {
                if (!fabContainer.contains(e.target)) {
                    fabContainer.classList.remove('active');
                    fabMain.classList.remove('active');
                }
            });
        }
    }

    addMagicEffects() {
        // Add hover effects to cards
        this.addCardHoverEffects();
        
        // Add particle effects
        this.createParticleSystem();
        
        // Add easter eggs
        this.addEasterEggs();
        
        // Add loading animations
        this.addLoadingAnimations();
    }

    addCardHoverEffects() {
        const cards = document.querySelectorAll('.featured-card, .feature-card, .review-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createHoverParticles(e.target);
            });
            
            card.addEventListener('mousemove', (e) => {
                this.updateCardTilt(e);
            });
            
            card.addEventListener('mouseleave', (e) => {
                this.resetCardTilt(e.target);
            });
        });
    }

    createHoverParticles(element) {
        const particles = ['✨', '🌟', '💫', '⭐'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                const emoji = particles[Math.floor(Math.random() * particles.length)];
                
                particle.textContent = emoji;
                particle.style.cssText = `
                    position: absolute;
                    font-size: 1.5rem;
                    pointer-events: none;
                    z-index: 1000;
                    animation: sparkle 1s ease-out forwards;
                    left: ${Math.random() * element.offsetWidth}px;
                    top: ${Math.random() * element.offsetHeight}px;
                `;
                
                element.style.position = 'relative';
                element.appendChild(particle);
                
                setTimeout(() => {
                    if (element.contains(particle)) {
                        element.removeChild(particle);
                    }
                }, 1000);
            }, i * 100);
        }
    }

    updateCardTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    }

    resetCardTilt(card) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }

    createParticleSystem() {
        const particles = ['🥬', '🍅', '🧄', '🌶️', '🧀', '🥒', '🥕', '🫒', '🌽', '🥑', '🥖', '🍖', '🐟', '🐔'];

        // Create floating particles periodically
        // This will now be controlled by toggleFloatingParticles
        // Removed setInterval here as it will be managed externally.

        // Create burst particles on button clicks
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createBurstParticles(e.target);
            });
        });
    }

    // New method to control floating particles
    toggleFloatingParticles(enable) {
        if (enable) {
            // Start creating particles if not already running
            if (!this.floatingParticlesInterval) {
                this.floatingParticlesInterval = setInterval(() => {
                    if (document.visibilityState === 'visible') {
                        const particles = ['🥬', '🍅', '🧄', '🌶️', '🧀', '🥒', '🥕', '🫒', '🌽', '🥑', '🥖', '🍖', '🐟', '🐔'];
                        if (Math.random() > 0.8) {
                            this.createFloatingParticle(particles[Math.floor(Math.random() * particles.length)]);
                        }
                    }
                }, 2000);
            }
        } else {
            // Stop creating particles
            if (this.floatingParticlesInterval) {
                clearInterval(this.floatingParticlesInterval);
                this.floatingParticlesInterval = null;
            }
            // Also remove any existing floating particles
            document.querySelectorAll('.floating-particle').forEach(p => p.remove());
        }
    }

    createFloatingParticle(emoji) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.textContent = emoji;
        
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 4 + 5;
        const size = Math.random() * 20 + 15;
        
        particle.style.cssText = `
            position: fixed;
            font-size: ${size}px;
            left: ${startX}px;
            top: 100vh;
            pointer-events: none;
            z-index: 500;
            opacity: 0.7;
            animation: floatUp ${duration}s linear forwards;
            will-change: transform;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        }, duration * 1000);
    }

    createBurstParticles(element) {
        const particles = ['🎉', '✨', '🎊', '⭐', '🌟'];
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            const emoji = particles[Math.floor(Math.random() * particles.length)];
            
            particle.textContent = emoji;
            particle.style.cssText = `
                position: fixed;
                font-size: 1.5rem;
                left: ${centerX}px;
                top: ${centerY}px;
                pointer-events: none;
                z-index: 1000;
                animation: burst 0.8s ease-out forwards;
                animation-delay: ${i * 0.1}s;
                transform: rotate(${i * 45}deg);
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 1000);
        }
    }

    addEasterEggs() {
        // Konami code easter egg
        let konamiCode = [];
        const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑ ↑ ↓ ↓ ← → ← → B A
        
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }
            
            if (konamiCode.join(',') === konamiSequence.join(',')) {
                this.activateRainbowMode();
                this.showToast('🌈 Rainbow mode activated! You found the secret! 🎉', 'success');
                konamiCode = [];
            }
        });

        // Click counter easter egg
        let clickCount = 0;
        const logo = document.querySelector('.nav-logo');
        if (logo) {
            logo.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 10) {
                    this.activatePartyMode();
                    this.showToast('🎊 Party mode activated! 🎊', 'success');
                    clickCount = 0;
                }
            });
        }
    }

    activateRainbowMode() {
        document.body.classList.add('rainbow-mode');
        
        const rainbowStyle = document.createElement('style');
        rainbowStyle.id = 'rainbow-style';
        rainbowStyle.textContent = `
            .rainbow-mode {
                animation: rainbow 2s infinite;
            }
            
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        
        document.head.appendChild(rainbowStyle);
        
        setTimeout(() => {
            document.body.classList.remove('rainbow-mode');
            const style = document.getElementById('rainbow-style');
            if (style) {
                document.head.removeChild(style);
            }
        }, 10000);
    }

    activatePartyMode() {
        // Create confetti explosion
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 50);
        }
        
        // Shake the page
        document.body.style.animation = 'shake 0.5s ease-in-out 3';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 1500);
    }

    createConfetti() {
        const colors = ['#FF6B35', '#FFD700', '#32CD32', '#FF4444', '#6A0DAD'];
        const confetti = document.createElement('div');
        
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            z-index: 1000;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (document.body.contains(confetti)) {
                document.body.removeChild(confetti);
            }
        }, 5000);
    }

    addLoadingAnimations() {
        // Add loading states to buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.classList.contains('loading')) {
                    btn.classList.add('loading');
                    setTimeout(() => {
                        btn.classList.remove('loading');
                    }, 1000);
                }
            });
        });
    }

    // Cart functionality
    async updateCartFromServer() {
        try {
            const response = await fetch('/api/get_cart_info');
            const data = await response.json();
            this.updateCartDisplay(data.cart_count, data.cart_total);
        } catch (error) {
            console.log('Could not fetch cart info');
        }
    }

    updateCartDisplay(count, total) {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
            cartCountElement.style.display = count > 0 ? 'block' : 'none';
            
            // Animate cart count
            if (count > 0) {
                cartCountElement.style.animation = 'bounce 0.6s ease';
                setTimeout(() => {
                    cartCountElement.style.animation = '';
                }, 600);
            }
        }
        
        // Update any total displays
        const totalElements = document.querySelectorAll('.cart-total');
        totalElements.forEach(el => {
            el.textContent = `₹${total.toFixed(2)}`;
        });
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Add icon based on type
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '🔔';
        toast.innerHTML = `${icon} ${message}`;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toast.style.animation = 'slideOutRight 0.5s ease forwards';
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 500);
            }
        }, 4000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// Initialize the app
let rollParadise;

document.addEventListener('DOMContentLoaded', () => {
    rollParadise = new RollParadise();
    window.RollParadiseInstance = rollParadise;
});

// Global functions for template access
function addToCart(itemId, itemType, quantity = 1) {
    // Check if user needs to sign in first
    if (!requireSignIn(() => addToCart(itemId, itemType, quantity))) {
        return;
    }
    
    fetch('/api/add_to_cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: itemId,
            type: itemType,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            rollParadise.showToast(data.message, 'success');
            rollParadise.updateCartDisplay(data.cart_count, data.cart_total);
            
            // Add visual feedback
            rollParadise.createBurstParticles(event.target);
        } else {
            rollParadise.showToast(data.message, 'error');
        }
    })
    .catch(error => {
        rollParadise.showToast('Error adding item to cart', 'error');
    });
}

function showToast(message, type = 'info') {
    if (rollParadise) {
        rollParadise.showToast(message, type);
    }
}

function updateCartDisplay(count, total) {
    if (rollParadise) {
        rollParadise.updateCartDisplay(count, total);
    }
}

// Add custom animations CSS
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes burst {
        0% {
            transform: scale(0) translateX(0);
            opacity: 1;
        }
        100% {
            transform: scale(1) translateX(100px);
            opacity: 0;
        }
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .btn.loading {
        position: relative;
        color: transparent;
    }
    
    .btn.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        color: white;
    }
    
    .floating-particle {
        will-change: transform;
    }
    
    /* Enhanced hover effects */
    .featured-card {
        transition: all 0.3s ease;
    }
    
    .featured-card:hover {
        transform: translateY(-10px) scale(1.02);
    }
    
    .feature-card {
        transition: all 0.3s ease;
    }
    
    .feature-card:hover {
        transform: translateY(-15px);
    }
    
    /* Smooth scroll behavior */
    html {
        scroll-behavior: smooth;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #FF6B35, #FFD700);
        border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #FFD700, #FF6B35);
    }
    
    /* Selection color */
    ::selection {
        background: rgba(255, 107, 53, 0.3);
        color: #333;
    }
    
    /* Focus styles */
    button:focus,
    a:focus,
    input:focus {
        outline: 2px solid #FF6B35;
        outline-offset: 2px;
    }
`;

document.head.appendChild(animationStyles);

// Add some performance optimizations
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Preload images
        const images = [
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1551782450-17144efb5c50?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    });
}

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== SIGN IN MODAL FUNCTIONALITY =====

// Open Sign In Modal
function openSignInModal() {
    const overlay = document.getElementById('signinModalOverlay');
    if (!overlay) {
        return;
    }
    overlay.classList.add('active');
    document.body.classList.add('modal-open');

    // Save current scroll position and set top property to prevent jump
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    if (window.RollParadiseInstance) {
        window.RollParadiseInstance.currentScrollPosition = scrollY; // Store for later
    }

    // Set the flag and stop background JavaScript animations
    if (window.RollParadiseInstance) {
        window.RollParadiseInstance.isModalOpen = true;
        window.RollParadiseInstance.toggleFloatingParticles(false);
    }

    // Add entrance animation
    setTimeout(() => {
        const modal = document.getElementById('signinModal');
        if (modal) {
            modal.style.animation = 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        }
    }, 50);
}

// Close Sign In Modal
function closeSignInModal() {
    const overlay = document.getElementById('signinModalOverlay');
    const modal = document.getElementById('signinModal');
    
    if (modal) {
        modal.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }
    
    setTimeout(() => {
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.classList.remove('modal-open');

        // Restore scroll position and remove top property
        document.body.style.top = ''; // Remove the inline style
        if (window.RollParadiseInstance && window.RollParadiseInstance.currentScrollPosition !== undefined) {
            window.scrollTo(0, window.RollParadiseInstance.currentScrollPosition);
            window.RollParadiseInstance.currentScrollPosition = undefined;
        }

        // Reset the flag and resume background JavaScript animations
        if (window.RollParadiseInstance) {
            window.RollParadiseInstance.isModalOpen = false;
            window.RollParadiseInstance.toggleFloatingParticles(true);
        }

        if (modal) {
            modal.style.animation = '';
        }
    }, 300);
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('signinModalOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeSignInModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeSignInModal();
        }
    });
});

// Switch Modal Tabs
function switchModalTab(tab) {
    const loginForm = document.getElementById('modalLoginForm');
    const signupForm = document.getElementById('modalSignupForm');
    const tabIndicator = document.getElementById('modalTabIndicator');
    const tabButtons = document.querySelectorAll('.auth-container-modal .tab-button');
    
    // Remove active class from all tabs
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        tabIndicator.classList.remove('signup');
        tabButtons[0].classList.add('active');
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        tabIndicator.classList.add('signup');
        tabButtons[1].classList.add('active');
    }
}

// Toggle Modal Password Visibility
function toggleModalPassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Toggle Modal Checkbox
function toggleModalCheckbox(checkbox) {
    checkbox.classList.toggle('checked');
}

// Handle Sign In Form Submission
function handleSignIn(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    const button = form.querySelector('.auth-button');
    const originalText = button.querySelector('span').textContent;
    button.querySelector('span').textContent = 'Signing In...';
    button.disabled = true;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        button.querySelector('span').textContent = originalText;
        button.disabled = false;

        if (data.success) {
            showToast('Welcome back! Sign in successful.', 'success');
            window.isSignedIn = true;
            updateAuthUI();
            closeSignInModal();
            setTimeout(() => {
                redirectAfterSignIn();
                window.location.reload(); // Ensure all buttons work after login
            }, 1000);
        } else {
            showToast(data.message || 'Invalid email or password.', 'error');
        }
    })
    .catch((error) => {
        button.querySelector('span').textContent = originalText;
        button.disabled = false;
        showToast('Error signing in. Please try again.', 'error');
    });
}

// Handle Sign Up Form Submission
function handleSignUp(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const full_name = formData.get('full_name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const termsAccepted = form.querySelector('.checkbox').classList.contains('checked');
    
    if (!full_name || !email || !phone || !password) {
        showToast('Please fill in all fields.', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showToast('Please accept the Terms of Service and Privacy Policy.', 'error');
        return;
    }
    
    // Add loading state
    const button = form.querySelector('.auth-button');
    const originalText = button.querySelector('span').textContent;
    button.querySelector('span').textContent = 'Creating Account...';
    button.disabled = true;
    
    fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, phone, password })
    })
    .then(response => response.json())
    .then(data => {
        button.querySelector('span').textContent = originalText;
        button.disabled = false;

        if (data.success) {
            showToast('Account created successfully! Welcome to Roll Paradise!', 'success');
            window.isSignedIn = true;
            updateAuthUI();
            closeSignInModal();
            setTimeout(() => {
                redirectAfterSignIn();
                window.location.reload(); // Ensure all buttons work after signup
            }, 1000);
        } else {
            showToast(data.message || 'Error creating account. Please try again.', 'error');
        }
    })
    .catch((error) => {
        button.querySelector('span').textContent = originalText;
        button.disabled = false;
        showToast('Error creating account. Please try again.', 'error');
    });
}

// Social Login Handler
function socialLogin(provider) {
    showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
    console.log(`Social login with ${provider}`);
}

// Logout function
function logout() {
    fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/';
        } else {
            alert('Logout failed. Please try again.');
        }
    })
    .catch(() => {
        alert('Logout failed. Please try again.');
    });
}

// Check authentication status on page load
function checkAuthStatus() {
    fetch('/api/check-auth')
    .then(response => response.json())
    .then(data => {
        window.isSignedIn = data.authenticated;
        updateAuthUI();
    })
    .catch(() => {
        window.isSignedIn = false;
        updateAuthUI();
    });
}

// Update UI based on authentication status
function updateAuthUI() {
    const authButtons = document.querySelectorAll('.auth-button, .signin-button');
    const userInfo = document.querySelector('.user-info');
    
    if (window.isSignedIn) {
        // Hide signin buttons, show user info
        authButtons.forEach(btn => btn.style.display = 'none');
        if (userInfo) userInfo.style.display = 'block';
    } else {
        // Show signin buttons, hide user info
        authButtons.forEach(btn => btn.style.display = 'block');
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Show Forgot Password (placeholder)
function showForgotPassword() {
    showToast('Forgot password functionality coming soon!', 'info');
}

// This variable will be set by the backend in base.html
window.isSignedIn = window.isSignedIn || false;

// Update requireSignIn to use the real flag
function requireSignIn(callback) {
    if (!window.isSignedIn) {
        openSignInModal();
        return false;
    }
    if (callback) callback();
    return true;
}

// Update DOMContentLoaded handler to protect all main links/buttons
// (Order Now, View Full Menu, Build Your Roll, etc.)
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status first
    checkAuthStatus();
    
    const protectedLinks = document.querySelectorAll(
        'a[href*="customize"], a[href*="cart"], a[href*="menu"], .btn-primary, .btn-secondary, .btn-special'
    );
    protectedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!window.isSignedIn) {
                e.preventDefault();
                openSignInModal();
                sessionStorage.setItem('redirectAfterSignIn', this.href || window.location.href);
            }
        });
    });
    // Always update UI on load
    updateAuthUI();
});

// Redirect after successful sign in
function redirectAfterSignIn() {
    const redirectUrl = sessionStorage.getItem('redirectAfterSignIn');
    if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterSignIn');
        window.location.href = redirectUrl;
    }
}

// Responsive JavaScript improvements
document.addEventListener('DOMContentLoaded', function() {
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Handle viewport changes
    function handleViewportChange() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        // Adjust modal positioning for mobile
        const modals = document.querySelectorAll('.modal, .quick-view-content, .signin-modal');
        modals.forEach(modal => {
            if (isMobile) {
                modal.style.maxHeight = '90vh';
                modal.style.overflowY = 'auto';
            } else {
                modal.style.maxHeight = 'none';
                modal.style.overflowY = 'visible';
            }
        });

        // Adjust navigation menu for mobile
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && isMobile) {
            navMenu.style.maxHeight = 'calc(100vh - 100px)';
            navMenu.style.overflowY = 'auto';
        }

        // Adjust grid layouts
        const grids = document.querySelectorAll('.featured-grid, .features-grid, .drinks-grid, .categories-grid, .ingredients-grid');
        grids.forEach(grid => {
            if (isSmallMobile) {
                grid.style.gap = '1rem';
            } else if (isMobile) {
                grid.style.gap = '1.5rem';
            } else {
                grid.style.gap = '2rem';
            }
        });

        // Adjust button sizes for touch
        const buttons = document.querySelectorAll('.btn, .nav-link, .filter-btn, .quantity-btn');
        buttons.forEach(button => {
            if (isMobile) {
                button.style.minHeight = '44px';
                button.style.minWidth = '44px';
            } else {
                button.style.minHeight = '';
                button.style.minWidth = '';
            }
        });
    }

    // Call on load and resize
    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);

    // Improve mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.classList.add('modal-open');
            } else {
                document.body.classList.remove('modal-open');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.classList.remove('modal-open');
            });
        });
    }

    // Improve modal handling for mobile
    function improveModalHandling() {
        const modals = document.querySelectorAll('.modal, .quick-view-content, .signin-modal');
        
        modals.forEach(modal => {
            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });

            // Close modal with escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });

            // Prevent modal content from closing modal when clicked
            const modalContent = modal.querySelector('.modal-content, .quick-view-body, .auth-container-modal');
            if (modalContent) {
                modalContent.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
        });
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    improveModalHandling();

    // Improve form handling for mobile
    function improveFormHandling() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Prevent zoom on input focus for iOS
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    }
                });
            });

            // Improve form submission feedback
            form.addEventListener('submit', function(e) {
                const submitBtn = form.querySelector('button[type="submit"], .submit-review-btn, .place-order-btn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
                    
                    // Re-enable button after 5 seconds as fallback
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
                    }, 5000);
                }
            });
        });
    }

    improveFormHandling();

    // Improve touch interactions
    function improveTouchInteractions() {
        // Add touch feedback for buttons
        const touchElements = document.querySelectorAll('.btn, .nav-link, .filter-btn, .quantity-btn, .star-rating label.star');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = '';
            });
            
            element.addEventListener('touchcancel', function() {
                this.style.transform = '';
            });
        });

        // Improve scrolling performance
        const scrollContainers = document.querySelectorAll('.nav-menu, .modal, .quick-view-content');
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
        });
    }

    improveTouchInteractions();

    // Improve image loading for mobile
    function improveImageLoading() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" for better performance
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Handle image load errors
            img.addEventListener('error', function() {
                this.src = '/static/images/placeholder.png';
                this.alt = 'Image not available';
            });
        });
    }

    improveImageLoading();

    // Improve accessibility for mobile
    function improveAccessibility() {
        // Add ARIA labels for better screen reader support
        const buttons = document.querySelectorAll('.btn, .nav-link, .filter-btn, .quantity-btn');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                const icon = button.querySelector('i, .icon');
                if (icon) {
                    button.setAttribute('aria-label', icon.className.split(' ').pop() || 'Button');
                }
            }
        });

        // Improve focus management
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = '2px solid #3b82f6';
                this.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }

    improveAccessibility();

    // Auto-fill signed-in user info in the Share Your Experience section
    if (window.signedInUser) {
        const nameEl = document.getElementById('signedInUserName');
        const emailEl = document.getElementById('signedInUserEmail');
        if (nameEl) nameEl.textContent = window.signedInUser.name || 'User Name';
        if (emailEl) emailEl.textContent = window.signedInUser.email || 'user@email.com';
    }

});

// --- Client-side Review System ---
const initialReviews = [
  {
    name: 'Sarah Johnson',
    title: 'Food Blogger',
    rating: 5,
    reviewTitle: 'Absolutely Amazing!',
    text: 'The rolls here are incredible! Fresh ingredients, perfect seasoning, and amazing presentation. The customization options are endless and the staff is so friendly. Will definitely be back!',
    date: '2 days ago',
    avatar: 'https://www.gravatar.com/avatar/sarah123?d=mp&s=100'
  },
  {
    name: 'Mike Chen',
    title: 'Local Foodie',
    rating: 4,
    reviewTitle: 'Great Taste & Service',
    text: 'Loved the variety and the quick service. The spicy rolls are my favorite - perfect heat level! The delivery was fast and the food was still hot. Highly recommend!',
    date: '1 week ago',
    avatar: 'https://www.gravatar.com/avatar/mike456?d=mp&s=100'
  },
  {
    name: 'Emily Rodriguez',
    title: 'Health Enthusiast',
    rating: 5,
    reviewTitle: 'Fresh & Healthy Options',
    text: 'Perfect for health-conscious people like me! The veggie rolls are packed with nutrients and taste fantastic. Love that I can customize everything to my dietary preferences.',
    date: '2 weeks ago',
    avatar: 'https://www.gravatar.com/avatar/emily789?d=mp&s=100'
  },
  {
    name: 'David Kumar',
    title: 'Regular Customer',
    rating: 5,
    reviewTitle: 'My Go-To Place',
    text: 'Been coming here for months now. Consistent quality, friendly staff, and the customization options are endless! The loyalty program is great too. My favorite lunch spot!',
    date: '3 weeks ago',
    avatar: 'https://www.gravatar.com/avatar/david101?d=mp&s=100'
  },
  {
    name: 'Lisa Thompson',
    title: 'Family Foodie',
    rating: 5,
    reviewTitle: 'Perfect for Family Dinners',
    text: 'My kids love watching their rolls being made! The staff is so patient and the food is always fresh. Great portion sizes and reasonable prices. Highly recommend for families!',
    date: '1 month ago',
    avatar: 'https://www.gravatar.com/avatar/lisa202?d=mp&s=100'
  },
  {
    name: 'Alex Martinez',
    title: 'Office Manager',
    rating: 4,
    reviewTitle: 'Great for Office Orders',
    text: 'We order from here regularly for office lunches. The bulk orders are handled perfectly, always on time, and everyone loves the variety. The corporate discounts are a nice bonus!',
    date: '1 month ago',
    avatar: 'https://www.gravatar.com/avatar/alex303?d=mp&s=100'
  }
];

let reviews = [...initialReviews];

function renderReviews() {
  const reviewsRow = document.getElementById('reviewsRow');
  if (!reviewsRow) return;
  reviewsRow.innerHTML = '';
  reviews.forEach((review, idx) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    // Staggered animation
    card.style.animationDelay = (0.1 + idx * 0.1) + 's';
    card.innerHTML = `
      <div class="review-header">
        <div class="reviewer-info">
          <div class="reviewer-avatar">
            <img src="${review.avatar}" alt="${review.name}">
          </div>
          <div class="reviewer-details">
            <h4 class="reviewer-name">${review.name}</h4>
            <div class="review-rating">
              ${'<i class="fas fa-star"></i>'.repeat(review.rating)}${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
              <span class="rating-value">${review.rating}/5</span>
            </div>
          </div>
        </div>
        <div class="review-date">${review.date}</div>
      </div>
      <div class="review-content">
        <p class="review-text">${review.text}</p>
      </div>
    `;
    reviewsRow.appendChild(card);
  });
}

// Confetti burst animation
function confettiBurst() {
  const confettiContainer = document.getElementById('confetti-container');
  if (!confettiContainer) return;
  const colors = ['#FFD700', '#FF6B35', '#32CD32', '#FF4444', '#6A0DAD'];
  for (let i = 0; i < 24; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = (50 + Math.random() * 40 - 20) + '%';
    confetti.style.top = '40%';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(confetti);
    setTimeout(() => {
      if (confettiContainer.contains(confetti)) confettiContainer.removeChild(confetti);
    }, 1200);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  renderReviews();
  
  // Set user info display if available
  if (window.signedInUser) {
    const nameEl = document.getElementById('signedInUserName');
    const emailEl = document.getElementById('signedInUserEmail');
    if (nameEl) nameEl.textContent = window.signedInUser.name || 'User Name';
    if (emailEl) emailEl.textContent = window.signedInUser.email || 'user@email.com';
  }

  // Star sparkle effect
  document.querySelectorAll('.ultra-star-rating label.star').forEach(star => {
    star.addEventListener('mouseenter', function() {
      this.classList.add('star-sparkle');
    });
    star.addEventListener('mouseleave', function() {
      this.classList.remove('star-sparkle');
    });
    star.addEventListener('click', function() {
      this.classList.add('star-sparkle');
      setTimeout(() => this.classList.remove('star-sparkle'), 400);
    });
  });

  // Initialize star rating functionality
  initStarRating();
  
  const addReviewForm = document.getElementById('addReviewForm');
  if (addReviewForm) {
    addReviewForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Use signed-in user info
      const name = (window.signedInUser && window.signedInUser.name) ? window.signedInUser.name : 'Anonymous';
      const email = (window.signedInUser && window.signedInUser.email) ? window.signedInUser.email : '';
      const rating = parseInt(document.querySelector('input[name="rating"]:checked').value);
      const text = document.getElementById('reviewText').value.trim();
      const date = 'Just now';
      
      // Validate required fields
      if (!name || !email || !text) {
        showToast('Please sign in and fill in all required fields.', 'error');
        return;
      }
      
      // Use email for avatar (more consistent)
      const avatar = `https://www.gravatar.com/avatar/${email.toLowerCase().trim()}?d=mp&s=100`;
      
      reviews.unshift({ name, rating, text, date, avatar });
      renderReviews();
      addReviewForm.reset();
      
      // Reset star rating
      document.getElementById('star5').checked = true;
      updateRatingText(5);
      
      showToast('Thank you for your review!', 'success');
      confettiBurst();
    });
  }
});

function initStarRating() {
  const starInputs = document.querySelectorAll('input[name="rating"]');
  const ratingText = document.querySelector('.rating-text');
  
  starInputs.forEach(input => {
    input.addEventListener('change', function() {
      const rating = parseInt(this.value);
      updateRatingText(rating);
    });
  });
  
  // Initialize with 5 stars
  updateRatingText(5);
}

function updateRatingText(rating) {
  const ratingText = document.querySelector('.rating-text');
  if (ratingText) {
    const ratingLabels = {
      1: '1 star',
      2: '2 stars', 
      3: '3 stars',
      4: '4 stars',
      5: '5 stars'
    };
    ratingText.textContent = ratingLabels[rating] || '5 stars';
  }
}


