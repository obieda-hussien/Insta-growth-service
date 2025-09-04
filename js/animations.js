/**
 * Animation Controller for Instagram Growth Service Website
 * Handles scroll animations, transitions, and interactive effects
 */

class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.isAnimationSupported = this.checkAnimationSupport();
        
        this.init();
    }

    /**
     * Check if animations are supported and preferred
     * @returns {boolean} - Animation support status
     */
    checkAnimationSupport() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Check for intersection observer support
        const hasIntersectionObserver = 'IntersectionObserver' in window;
        
        return !prefersReducedMotion && hasIntersectionObserver;
    }

    /**
     * Initialize all animations
     */
    init() {
        if (!this.isAnimationSupported) {
            this.showAllElements();
            return;
        }

        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupTypingAnimations();
        this.setupParticleAnimations();
        this.setupCarouselAnimations();
        this.setupHoverEffects();
        this.setupLoadingAnimations();
    }

    /**
     * Show all elements if animations are disabled
     */
    showAllElements() {
        const hiddenElements = DOM.selectAll('.scroll-animate');
        hiddenElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
    }

    /**
     * Setup scroll-triggered animations
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '-50px 0px'
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const animateElements = DOM.selectAll('[data-animate], .scroll-animate, .feature-card, .step-item, .pricing-card, .testimonial-card');
        animateElements.forEach(element => {
            scrollObserver.observe(element);
        });

        this.observers.set('scroll', scrollObserver);
    }

    /**
     * Animate element when it comes into view with enhanced easing
     * @param {Element} element - Element to animate
     */
    animateElement(element) {
        const animationType = element.dataset.animate || 'fadeInUp';
        const delay = parseInt(element.dataset.delay) || 0;
        const duration = parseInt(element.dataset.duration) || 800;

        // Add GPU acceleration for better performance
        element.style.willChange = 'transform, opacity';
        
        setTimeout(() => {
            element.classList.add('animate-' + animationType);
            element.style.opacity = '1';
            element.style.transform = 'none';
            
            // Remove will-change after animation completes
            setTimeout(() => {
                element.style.willChange = 'auto';
            }, duration);
        }, delay);
    }

    /**
     * Setup counter animations for statistics
     */
    setupCounterAnimations() {
        const counterElements = DOM.selectAll('[data-count]');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    this.animateCounter(entry.target);
                    entry.target.dataset.animated = 'true';
                }
            });
        }, { threshold: 0.5 });

        counterElements.forEach(element => {
            counterObserver.observe(element);
        });

        this.observers.set('counter', counterObserver);
    }

    /**
     * Animate counter from 0 to target value
     * @param {Element} element - Counter element
     */
    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = parseInt(element.dataset.duration) || 2000;
        const formatter = element.dataset.formatter;

        let formatFunction = null;
        if (formatter === 'k') {
            formatFunction = (num) => Utils.formatNumber(num);
        } else if (formatter === 'plus') {
            formatFunction = (num) => num.toLocaleString() + '+';
        }

        Animation.countUp(element, 0, target, duration, formatFunction);
    }

    /**
     * Setup typing animations
     */
    setupTypingAnimations() {
        const typingElements = DOM.selectAll('.typing-animation');
        
        const typingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.typed) {
                    this.animateTyping(entry.target);
                    entry.target.dataset.typed = 'true';
                }
            });
        }, { threshold: 0.3 });

        typingElements.forEach(element => {
            typingObserver.observe(element);
        });

        this.observers.set('typing', typingObserver);
    }

    /**
     * Animate typing effect
     * @param {Element} element - Typing element
     */
    animateTyping(element) {
        const text = element.textContent;
        const speed = parseInt(element.dataset.typingSpeed) || 100;
        
        Animation.typeWriter(element, text, speed);
    }

    /**
     * Setup particle animations
     */
    setupParticleAnimations() {
        this.createFloatingParticles();
        this.animateBackgroundGradient();
    }

    /**
     * Create floating particles in hero section
     */
    createFloatingParticles() {
        const particleContainer = DOM.select('.particles-container');
        if (!particleContainer) return;

        // Add more particles dynamically
        for (let i = 0; i < 10; i++) {
            const particle = DOM.create('div', { className: 'particle' });
            
            // Random position and animation delay
            particle.style.left = Utils.random(0, 100) + '%';
            particle.style.top = Utils.random(0, 100) + '%';
            particle.style.animationDelay = Utils.random(0, 6) + 's';
            particle.style.animationDuration = Utils.random(4, 8) + 's';
            
            // Random color from neon palette
            const colors = ['var(--neon-blue)', 'var(--neon-pink)', 'var(--neon-green)', 'var(--neon-purple)'];
            particle.style.background = colors[Utils.random(0, colors.length - 1)];
            
            particleContainer.appendChild(particle);
        }
    }

    /**
     * Animate background gradient
     */
    animateBackgroundGradient() {
        const body = document.body;
        if (body) {
            body.classList.add('animate-gradientBG');
        }
    }

    /**
     * Setup carousel animations
     */
    setupCarouselAnimations() {
        this.initTestimonialCarousel();
    }

    /**
     * Initialize testimonial carousel
     */
    initTestimonialCarousel() {
        const carousel = DOM.select('.testimonials-carousel');
        if (!carousel) return;

        const track = DOM.select('.testimonial-track', carousel);
        const cards = DOM.selectAll('.testimonial-card', track);
        const indicators = DOM.selectAll('.indicator', carousel);
        const prevBtn = DOM.select('.prev-btn', carousel);
        const nextBtn = DOM.select('.next-btn', carousel);

        if (!track || cards.length === 0) return;

        let currentIndex = 0;
        let autoplayTimer = null;

        const updateCarousel = (index) => {
            currentIndex = index;
            const translateX = -index * 100;
            track.style.transform = `translateX(${translateX}%)`;

            // Update indicators
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        };

        const nextSlide = () => {
            const nextIndex = (currentIndex + 1) % cards.length;
            updateCarousel(nextIndex);
        };

        const prevSlide = () => {
            const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
            updateCarousel(prevIndex);
        };

        const startAutoplay = () => {
            autoplayTimer = setInterval(nextSlide, 5000);
        };

        const stopAutoplay = () => {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        };

        // Event listeners
        DOM.on(nextBtn, 'click', nextSlide);
        DOM.on(prevBtn, 'click', prevSlide);

        indicators.forEach((indicator, index) => {
            DOM.on(indicator, 'click', () => updateCarousel(index));
        });

        // Pause autoplay on hover
        DOM.on(carousel, 'mouseenter', stopAutoplay);
        DOM.on(carousel, 'mouseleave', startAutoplay);

        // Touch/swipe support
        this.addSwipeSupport(track, prevSlide, nextSlide);

        // Start autoplay
        startAutoplay();
    }

    /**
     * Add swipe support for mobile
     * @param {Element} element - Element to add swipe to
     * @param {Function} onSwipeLeft - Left swipe handler
     * @param {Function} onSwipeRight - Right swipe handler
     */
    addSwipeSupport(element, onSwipeLeft, onSwipeRight) {
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;
        const threshold = 100;
        const restraint = 100;

        DOM.on(element, 'touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: true });

        DOM.on(element, 'touchend', (e) => {
            const touch = e.changedTouches[0];
            distX = touch.clientX - startX;
            distY = touch.clientY - startY;

            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                if (distX > 0) {
                    onSwipeRight();
                } else {
                    onSwipeLeft();
                }
            }
        }, { passive: true });
    }

    /**
     * Setup enhanced hover effects with modern interactions
     */
    setupHoverEffects() {
        this.setupRippleEffect();
        this.setupMagneticEffect();
        this.setupTiltEffect();
        this.setupModernButtonEffects();
    }

    /**
     * Setup modern button effects
     */
    setupModernButtonEffects() {
        const buttons = DOM.selectAll('.btn');
        
        buttons.forEach(button => {
            // Add magnetic effect for desktop
            if (window.innerWidth > 768) {
                DOM.on(button, 'mousemove', (e) => {
                    const rect = button.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    const moveX = x * 0.15;
                    const moveY = y * 0.15;
                    
                    button.style.transform = `translate(${moveX}px, ${moveY}px)`;
                });
                
                DOM.on(button, 'mouseleave', () => {
                    button.style.transform = 'translate(0, 0)';
                });
            }
            
            // Add modern loading state
            DOM.on(button, 'click', () => {
                if (button.classList.contains('loading')) return;
                
                const originalText = button.innerHTML;
                button.classList.add('loading');
                
                // Remove loading state after operation
                setTimeout(() => {
                    button.classList.remove('loading');
                    
                    // Add success state briefly
                    button.classList.add('success');
                    setTimeout(() => {
                        button.classList.remove('success');
                    }, 600);
                }, 1500);
            });
        });
    }

    /**
     * Setup ripple effect for buttons
     */
    setupRippleEffect() {
        const rippleButtons = DOM.selectAll('.ripple-effect');

        rippleButtons.forEach(button => {
            DOM.on(button, 'click', (e) => {
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const ripple = DOM.create('div', {
                    className: 'ripple',
                    style: `
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.3);
                        pointer-events: none;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        transform: scale(0);
                        animation: ripple-animation 0.6s ease-out;
                    `
                });

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple animation CSS
        const style = DOM.create('style');
        style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup magnetic effect for interactive elements
     */
    setupMagneticEffect() {
        const magneticElements = DOM.selectAll('.magnetic-effect');

        magneticElements.forEach(element => {
            DOM.on(element, 'mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const moveX = x * 0.1;
                const moveY = y * 0.1;

                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            DOM.on(element, 'mouseleave', () => {
                element.style.transform = 'translate(0, 0)';
            });
        });
    }

    /**
     * Setup tilt effect for cards
     */
    setupTiltEffect() {
        const tiltElements = DOM.selectAll('.tilt-effect');

        tiltElements.forEach(element => {
            DOM.on(element, 'mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / centerY * -10;
                const rotateY = (x - centerX) / centerX * 10;

                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            DOM.on(element, 'mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    /**
     * Setup loading animations
     */
    setupLoadingAnimations() {
        // Animate elements on page load
        window.addEventListener('load', () => {
            const loadAnimateElements = DOM.selectAll('.load-animate');
            loadAnimateElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('animate-fadeInUp');
                }, index * 100);
            });
        });

        // Progressive image loading
        this.setupLazyImageLoading();
    }

    /**
     * Setup lazy image loading with animations
     */
    setupLazyImageLoading() {
        const images = DOM.selectAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('fade-in');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });

        this.observers.set('images', imageObserver);
    }

    /**
     * Create custom cursor effects
     */
    setupCustomCursor() {
        if (!Utils.getDeviceInfo().isDesktop) return;

        const cursor = DOM.create('div', {
            className: 'custom-cursor',
            style: `
                position: fixed;
                width: 20px;
                height: 20px;
                background: var(--neon-blue);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: difference;
                transition: transform 0.1s ease;
            `
        });

        document.body.appendChild(cursor);

        DOM.on(document, 'mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });

        // Scale cursor on hover over interactive elements
        const interactiveElements = DOM.selectAll('a, button, [role="button"]');
        interactiveElements.forEach(element => {
            DOM.on(element, 'mouseenter', () => {
                cursor.style.transform = 'scale(2)';
            });

            DOM.on(element, 'mouseleave', () => {
                cursor.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * Add parallax scrolling effect
     */
    setupParallaxEffect() {
        const parallaxElements = DOM.selectAll('.parallax');
        
        const updateParallax = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 10);

        DOM.on(window, 'scroll', updateParallax);
    }

    /**
     * Cleanup all observers and animations
     */
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.animatedElements.clear();
    }
}

// Particle system for enhanced visual effects
class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            count: options.count || 50,
            colors: options.colors || ['#00d4ff', '#ff6b6b', '#4ecdc4', '#bb6bd9'],
            speed: options.speed || 1,
            size: options.size || { min: 1, max: 4 },
            ...options
        };
        this.particles = [];
        this.animationId = null;

        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < this.options.count; i++) {
            const particle = {
                x: Math.random() * this.container.offsetWidth,
                y: Math.random() * this.container.offsetHeight,
                vx: (Math.random() - 0.5) * this.options.speed,
                vy: (Math.random() - 0.5) * this.options.speed,
                size: Utils.random(this.options.size.min, this.options.size.max),
                color: this.options.colors[Utils.random(0, this.options.colors.length - 1)],
                opacity: Math.random()
            };

            const element = DOM.create('div', {
                className: 'particle',
                style: `
                    position: absolute;
                    width: ${particle.size}px;
                    height: ${particle.size}px;
                    background: ${particle.color};
                    border-radius: 50%;
                    pointer-events: none;
                    opacity: ${particle.opacity};
                `
            });

            particle.element = element;
            this.particles.push(particle);
            this.container.appendChild(element);
        }
    }

    animate() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off walls
            if (particle.x <= 0 || particle.x >= this.container.offsetWidth) {
                particle.vx *= -1;
            }
            if (particle.y <= 0 || particle.y >= this.container.offsetHeight) {
                particle.vy *= -1;
            }

            // Update position
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles.forEach(particle => {
            particle.element.remove();
        });
        this.particles = [];
    }
}

// Initialize animation controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
    
    // Initialize particle system for hero section
    const heroSection = DOM.select('.hero-section');
    if (heroSection) {
        const particleContainer = DOM.select('.particles-container', heroSection);
        if (particleContainer && window.innerWidth > 768) {
            window.particleSystem = new ParticleSystem(particleContainer, {
                count: 30,
                speed: 0.5
            });
        }
    }
});

// Export for use in other modules
window.AnimationController = AnimationController;
window.ParticleSystem = ParticleSystem;