// Animations and Interactive Effects for Instagram Growth Service

class AnimationManager {
    constructor() {
        this.observers = [];
        this.counters = [];
        this.typingElements = [];
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupTypingAnimations();
        this.setupParticleSystem();
        this.setupHoverEffects();
        this.setupScrollTriggers();
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = utils.createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.dataset.animation || 'fadeInUp';
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-' + animationType);
                        element.classList.add('visible');
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe elements with scroll animations
        const animatedElements = document.querySelectorAll('[data-aos]');
        animatedElements.forEach(el => {
            el.classList.add('scroll-trigger');
            observer.observe(el);
        });

        this.observers.push(observer);
    }

    // Number counter animations
    setupCounterAnimations() {
        const counterObserver = utils.createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const targetValue = parseInt(element.dataset.count);
                    const duration = parseInt(element.dataset.duration) || 2000;
                    
                    utils.animateNumber(element, 0, targetValue, duration);
                    counterObserver.unobserve(element);
                }
            });
        });

        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });

        this.observers.push(counterObserver);
    }

    // Typing animation
    setupTypingAnimations() {
        const typingElements = document.querySelectorAll('.typing-text');
        
        typingElements.forEach(element => {
            const text = element.dataset.text || element.textContent;
            element.textContent = '';
            element.style.width = '0';
            
            const observer = utils.createIntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.typeText(element, text);
                        observer.unobserve(element);
                    }
                });
            });
            
            observer.observe(element);
            this.observers.push(observer);
        });
    }

    typeText(element, text, speed = 100) {
        let i = 0;
        element.style.width = 'auto';
        
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        };
        
        typeWriter();
    }

    // Particle system for background
    setupParticleSystem() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
        `;

        hero.appendChild(particleContainer);

        // Create particles
        for (let i = 0; i < 20; i++) {
            this.createParticle(particleContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = utils.random(2, 8);
        const left = utils.random(0, 100);
        const animationDuration = utils.random(10, 20);
        const animationDelay = utils.random(0, 10);
        const opacity = Math.random() * 0.5 + 0.2;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, ${opacity});
            border-radius: 50%;
            left: ${left}%;
            animation: particle-float ${animationDuration}s linear infinite;
            animation-delay: ${animationDelay}s;
        `;
        
        container.appendChild(particle);
        
        // Remove and recreate particle when animation ends
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
                this.createParticle(container);
            }
        }, (animationDuration + animationDelay) * 1000);
    }

    // Hover effects and interactions
    setupHoverEffects() {
        // Button ripple effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                utils.createRipple(button, e);
            });
        });

        // Card hover effects
        const cards = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        // Icon animations on hover
        const icons = document.querySelectorAll('.feature-icon, .contact-icon');
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'jello 0.8s ease-in-out';
            });
            
            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        });
    }

    // Scroll-triggered effects
    setupScrollTriggers() {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateNavbar();
                    this.updateScrollIndicator();
                    this.parallaxEffects();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', utils.throttle(handleScroll, 10));
    }

    updateNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const scrollTop = window.pageYOffset;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    updateScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) return;

        const scrollTop = window.pageYOffset;
        const opacity = Math.max(0, 1 - scrollTop / 500);
        
        scrollIndicator.style.opacity = opacity;
        
        if (opacity <= 0) {
            scrollIndicator.style.display = 'none';
        } else {
            scrollIndicator.style.display = 'block';
        }
    }

    parallaxEffects() {
        const scrollTop = window.pageYOffset;
        
        // Parallax for floating shapes
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            const yPos = -(scrollTop * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });

        // Parallax for phone mockup
        const phoneMockup = document.querySelector('.phone-mockup');
        if (phoneMockup) {
            const yPos = -(scrollTop * 0.05);
            phoneMockup.style.transform = `translateY(${yPos}px)`;
        }
    }

    // Heart animation for Instagram interface
    animateHeart() {
        const heartIcon = document.querySelector('.heart-icon');
        if (!heartIcon) return;

        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        heartIcon.style.color = '#ff6b6b';
        heartIcon.style.animation = 'heartbeat 0.6s ease-in-out';
        
        setTimeout(() => {
            heartIcon.style.animation = '';
        }, 600);
    }

    // Stagger animations for elements
    staggerElements(elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    }

    // Create floating elements
    createFloatingElement(container, config = {}) {
        const defaultConfig = {
            size: 80,
            color: 'rgba(255, 255, 255, 0.1)',
            duration: 6,
            delay: 0
        };
        
        const settings = { ...defaultConfig, ...config };
        
        const element = document.createElement('div');
        element.style.cssText = `
            position: absolute;
            width: ${settings.size}px;
            height: ${settings.size}px;
            background: ${settings.color};
            border-radius: 50%;
            pointer-events: none;
            animation: float ${settings.duration}s ease-in-out infinite;
            animation-delay: ${settings.delay}s;
            top: ${utils.random(10, 80)}%;
            left: ${utils.random(10, 80)}%;
        `;
        
        container.appendChild(element);
        return element;
    }

    // Cleanup observers
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
    }
}

// Testimonial Carousel Animation
class TestimonialCarousel {
    constructor() {
        this.track = document.querySelector('.testimonial-track');
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('#prev-btn');
        this.nextBtn = document.querySelector('#next-btn');
        
        this.currentSlide = 0;
        this.totalSlides = this.cards.length;
        this.autoPlayInterval = null;
        
        if (this.track) {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.updateCarousel();
        this.startAutoPlay();
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause auto-play on hover
        if (this.track) {
            this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.track.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }

    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateCarousel();
    }

    nextSlide() {
        this.currentSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }

    updateCarousel() {
        if (!this.track) return;
        
        const translateX = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// FAQ Accordion Animation
class FAQAccordion {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => this.toggleItem(item));
        });
    }

    toggleItem(item) {
        const isActive = item.classList.contains('active');
        
        // Close all items
        this.faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
            const answer = faqItem.querySelector('.faq-answer');
            answer.style.maxHeight = null;
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
            const answer = item.querySelector('.faq-answer');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    }
}

// Form Animation Handler
class FormAnimations {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            this.setupFormInputs(form);
            this.setupFormSubmission(form);
        });
    }

    setupFormInputs(form) {
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Focus animations
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
            
            // Validation animations
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    validateInput(input) {
        const formGroup = input.parentElement;
        const isValid = input.checkValidity();
        
        formGroup.classList.toggle('valid', isValid && input.value);
        formGroup.classList.toggle('invalid', !isValid && input.value);
    }

    setupFormSubmission(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.animateFormSubmission(form);
        });
    }

    animateFormSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
            submitBtn.classList.add('success');
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('success');
                form.reset();
                
                // Show success notification
                utils.notification.success('Message sent successfully!');
            }, 2000);
        }, 2000);
    }
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animation manager
    window.animationManager = new AnimationManager();
    
    // Initialize carousel
    window.testimonialCarousel = new TestimonialCarousel();
    
    // Initialize FAQ accordion
    window.faqAccordion = new FAQAccordion();
    
    // Initialize form animations
    window.formAnimations = new FormAnimations();
    
    // Add heart click animation
    const heartIcon = document.querySelector('.heart-icon');
    if (heartIcon) {
        heartIcon.addEventListener('click', () => {
            window.animationManager.animateHeart();
            
            // Update likes count
            const likesCount = document.querySelector('.likes-count');
            if (likesCount) {
                const currentCount = parseInt(likesCount.textContent.replace(/,/g, ''));
                const newCount = currentCount + utils.random(1, 10);
                utils.animateNumber(likesCount, currentCount, newCount, 500);
            }
        });
    }
    
    // Add scroll to section functionality for scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const featuresSection = document.querySelector('#features');
            if (featuresSection) {
                utils.smoothScrollTo(featuresSection, 80);
            }
        });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.animationManager) {
        window.animationManager.destroy();
    }
});