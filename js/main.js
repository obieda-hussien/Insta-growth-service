/**
 * Main JavaScript for Instagram Growth Service Website
 * Handles core functionality, navigation, forms, and user interactions
 */

class InstagramGrowthApp {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.formData = {};
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        if (this.isInitialized) return;
        
        this.setupNavigation();
        this.setupForms();
        this.setupFAQ();
        this.setupSmoothScrolling();
        this.setupUserTracking();
        this.setupFormValidation();
        this.setupModalSystem();
        this.setupNotificationSystem();
        this.loadUserPreferences();
        
        this.isInitialized = true;
        
        // Analytics
        this.trackPageView();
        
        console.log('Instagram Growth Service App initialized successfully');
    }

    /**
     * Setup responsive navigation
     */
    setupNavigation() {
        const navToggle = DOM.select('.nav-toggle');
        const navMenu = DOM.select('.nav-menu');
        const navLinks = DOM.selectAll('.nav-link');

        // Mobile menu toggle
        DOM.on(navToggle, 'click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            DOM.on(link, 'click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        DOM.on(document, 'click', (e) => {
            const isClickInsideNav = navMenu.contains(e.target) || navToggle.contains(e.target);
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Handle scroll-based navbar styling
        this.setupScrollNavbar();
    }

    /**
     * Setup scroll-based navbar behavior
     */
    setupScrollNavbar() {
        const navbar = DOM.select('.navbar');
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (scrollY > lastScrollY && scrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        DOM.on(window, 'scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }

    /**
     * Setup form handling
     */
    setupForms() {
        this.setupGrowthForm();
        this.setupNewsletterForm();
        this.setupContactForm();
    }

    /**
     * Setup main growth form
     */
    setupGrowthForm() {
        const growthForm = DOM.select('#growth-form');
        if (!growthForm) return;

        DOM.on(growthForm, 'submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(growthForm);
            const data = {
                username: formData.get('username'),
                package: formData.get('package'),
                email: formData.get('email')
            };

            // Validate form
            const validation = this.validateGrowthForm(data);
            if (!validation.isValid) {
                this.showNotification(validation.message, 'error');
                return;
            }

            // Show loading state
            const submitBtn = DOM.select('button[type="submit"]', growthForm);
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            try {
                // Simulate API call
                await this.submitGrowthRequest(data);
                
                // Show success message
                this.showNotification('Success! Your followers are on the way! 🚀', 'success');
                growthForm.reset();
                
                // Track conversion
                this.trackConversion('growth_request', data.package);
                
            } catch (error) {
                this.showNotification('Something went wrong. Please try again.', 'error');
                console.error('Growth form submission error:', error);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });

        // Real-time username validation
        const usernameInput = DOM.select('#username', growthForm);
        if (usernameInput) {
            DOM.on(usernameInput, 'input', Utils.debounce((e) => {
                this.validateUsernameField(e.target);
            }, 500));
        }
    }

    /**
     * Setup newsletter form
     */
    setupNewsletterForm() {
        const newsletterForms = DOM.selectAll('.newsletter-form');
        
        newsletterForms.forEach(form => {
            DOM.on(form, 'submit', async (e) => {
                e.preventDefault();
                
                const emailInput = DOM.select('input[type="email"]', form);
                const email = emailInput.value.trim();
                
                if (!Utils.isValidEmail(email)) {
                    this.showNotification('Please enter a valid email address', 'error');
                    return;
                }

                try {
                    await this.subscribeToNewsletter(email);
                    this.showNotification('Thanks for subscribing! 📧', 'success');
                    form.reset();
                } catch (error) {
                    this.showNotification('Subscription failed. Please try again.', 'error');
                }
            });
        });
    }

    /**
     * Setup contact form
     */
    setupContactForm() {
        const contactForms = DOM.selectAll('.contact-form');
        
        contactForms.forEach(form => {
            DOM.on(form, 'submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message')
                };

                try {
                    await this.submitContactForm(data);
                    this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                    form.reset();
                } catch (error) {
                    this.showNotification('Failed to send message. Please try again.', 'error');
                }
            });
        });
    }

    /**
     * Validate growth form data
     * @param {Object} data - Form data
     * @returns {Object} - Validation result
     */
    validateGrowthForm(data) {
        if (!data.username) {
            return { isValid: false, message: 'Instagram username is required' };
        }

        if (!Utils.isValidInstagramUsername(data.username)) {
            return { isValid: false, message: 'Please enter a valid Instagram username' };
        }

        if (!data.package) {
            return { isValid: false, message: 'Please select a package' };
        }

        if (data.email && !Utils.isValidEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }

        return { isValid: true, message: 'Valid' };
    }

    /**
     * Validate username field in real-time
     * @param {Element} input - Username input element
     */
    validateUsernameField(input) {
        const username = input.value.trim();
        const feedbackElement = this.getOrCreateFeedback(input);
        
        if (!username) {
            this.showFieldFeedback(feedbackElement, '', '');
            return;
        }

        if (Utils.isValidInstagramUsername(username)) {
            this.showFieldFeedback(feedbackElement, 'Username looks good! ✓', 'success');
        } else {
            this.showFieldFeedback(feedbackElement, 'Invalid username format', 'error');
        }
    }

    /**
     * Get or create feedback element for form field
     * @param {Element} input - Input element
     * @returns {Element} - Feedback element
     */
    getOrCreateFeedback(input) {
        let feedback = input.parentNode.querySelector('.field-feedback');
        if (!feedback) {
            feedback = DOM.create('div', { className: 'field-feedback' });
            input.parentNode.appendChild(feedback);
        }
        return feedback;
    }

    /**
     * Show field feedback
     * @param {Element} element - Feedback element
     * @param {string} message - Feedback message
     * @param {string} type - Feedback type (success, error, warning)
     */
    showFieldFeedback(element, message, type) {
        element.textContent = message;
        element.className = `field-feedback ${type}`;
        
        // Add styles
        const styles = {
            success: { color: '#4ecdc4', fontSize: '0.8rem' },
            error: { color: '#ff6b6b', fontSize: '0.8rem' },
            warning: { color: '#ffa726', fontSize: '0.8rem' }
        };
        
        Object.assign(element.style, styles[type] || {});
    }

    /**
     * Setup FAQ accordion
     */
    setupFAQ() {
        const faqItems = DOM.selectAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = DOM.select('.faq-question', item);
            
            DOM.on(question, 'click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active', !isActive);
                
                // Track FAQ interaction
                this.trackEvent('faq_interaction', question.textContent.trim());
            });
        });
    }

    /**
     * Setup smooth scrolling for navigation links with modern scroll snapping
     */
    setupSmoothScrolling() {
        const navLinks = DOM.selectAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            DOM.on(link, 'click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = DOM.select(`#${targetId}`);
                
                if (targetElement) {
                    const navbarHeight = DOM.select('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                    
                    // Enhanced smooth scroll with better easing
                    this.smoothScrollTo(targetPosition, 800);
                    
                    // Track navigation
                    this.trackEvent('navigation', targetId);
                }
            });
        });

        // Setup scroll spy for active navigation
        this.setupScrollSpy();
        
        // Setup parallax scrolling
        this.setupParallaxScrolling();
    }

    /**
     * Enhanced smooth scroll with custom easing
     * @param {number} target - Target scroll position
     * @param {number} duration - Animation duration
     */
    smoothScrollTo(target, duration = 800) {
        const start = window.pageYOffset;
        const distance = target - start;
        const startTime = performance.now();

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = easeInOutCubic(progress);
            const currentPosition = start + (distance * easeProgress);
            
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }

    /**
     * Setup parallax scrolling effects
     */
    setupParallaxScrolling() {
        const parallaxElements = DOM.selectAll('.parallax, .particles-container');
        
        if (parallaxElements.length === 0) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            const rateAlt = scrolled * -0.5;

            parallaxElements.forEach((element, index) => {
                const speed = index % 2 === 0 ? rate : rateAlt;
                element.style.transform = `translate3d(0, ${speed}px, 0)`;
            });

            ticking = false;
        };

        DOM.on(window, 'scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    /**
     * Setup scroll spy for navigation
     */
    setupScrollSpy() {
        const sections = DOM.selectAll('section[id]');
        const navLinks = DOM.selectAll('.nav-link');
        
        const updateActiveNav = Utils.throttle(() => {
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                
                if (scrollPos >= top && scrollPos < bottom) {
                    const id = section.getAttribute('id');
                    
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100);

        DOM.on(window, 'scroll', updateActiveNav);
    }

    /**
     * Setup user tracking and analytics
     */
    setupUserTracking() {
        // Track page interactions
        this.trackUserInteractions();
        
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track time on page
        this.trackTimeOnPage();
    }

    /**
     * Track user interactions
     */
    trackUserInteractions() {
        // Track button clicks
        const buttons = DOM.selectAll('button, .btn');
        buttons.forEach(button => {
            DOM.on(button, 'click', () => {
                const buttonText = button.textContent.trim();
                this.trackEvent('button_click', buttonText);
            });
        });

        // Track link clicks
        const externalLinks = DOM.selectAll('a[href^="http"]');
        externalLinks.forEach(link => {
            DOM.on(link, 'click', () => {
                this.trackEvent('external_link_click', link.href);
            });
        });
    }

    /**
     * Track scroll depth
     */
    trackScrollDepth() {
        const milestones = [25, 50, 75, 100];
        const tracked = new Set();

        const checkScrollDepth = Utils.throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackEvent('scroll_depth', `${milestone}%`);
                }
            });
        }, 500);

        DOM.on(window, 'scroll', checkScrollDepth);
    }

    /**
     * Track time on page
     */
    trackTimeOnPage() {
        const startTime = Date.now();
        
        const intervals = [30, 60, 120, 300]; // seconds
        const tracked = new Set();

        setInterval(() => {
            const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
            
            intervals.forEach(interval => {
                if (timeOnPage >= interval && !tracked.has(interval)) {
                    tracked.add(interval);
                    this.trackEvent('time_on_page', `${interval}s`);
                }
            });
        }, 10000);
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        const forms = DOM.selectAll('form');
        
        forms.forEach(form => {
            const inputs = DOM.selectAll('input, select, textarea', form);
            
            inputs.forEach(input => {
                DOM.on(input, 'blur', () => this.validateField(input));
                DOM.on(input, 'input', Utils.debounce(() => this.clearFieldError(input), 300));
            });
        });
    }

    /**
     * Validate individual form field
     * @param {Element} field - Form field to validate
     */
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        let isValid = true;
        let message = '';

        if (required && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (value) {
            switch (type) {
                case 'email':
                    if (!Utils.isValidEmail(value)) {
                        isValid = false;
                        message = 'Please enter a valid email address';
                    }
                    break;
                case 'text':
                    if (field.name === 'username' && !Utils.isValidInstagramUsername(value)) {
                        isValid = false;
                        message = 'Please enter a valid Instagram username';
                    }
                    break;
            }
        }

        this.showFieldValidation(field, isValid, message);
        return isValid;
    }

    /**
     * Show field validation state
     * @param {Element} field - Form field
     * @param {boolean} isValid - Validation state
     * @param {string} message - Validation message
     */
    showFieldValidation(field, isValid, message) {
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid);
        
        const feedback = this.getOrCreateFeedback(field);
        this.showFieldFeedback(feedback, message, isValid ? 'success' : 'error');
    }

    /**
     * Clear field error state
     * @param {Element} field - Form field
     */
    clearFieldError(field) {
        field.classList.remove('invalid');
        const feedback = field.parentNode.querySelector('.field-feedback');
        if (feedback && feedback.classList.contains('error')) {
            feedback.textContent = '';
            feedback.className = 'field-feedback';
        }
    }

    /**
     * Setup modal system
     */
    setupModalSystem() {
        // Modal triggers
        const modalTriggers = DOM.selectAll('[data-modal]');
        modalTriggers.forEach(trigger => {
            DOM.on(trigger, 'click', (e) => {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                this.openModal(modalId);
            });
        });

        // Close modal on backdrop click or ESC key
        DOM.on(document, 'click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal();
            }
        });

        DOM.on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    /**
     * Open modal
     * @param {string} modalId - Modal ID
     */
    openModal(modalId) {
        const modal = DOM.select(`#${modalId}`);
        if (!modal) return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.trackEvent('modal_open', modalId);
    }

    /**
     * Close modal
     */
    closeModal() {
        const activeModal = DOM.select('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Setup notification system
     */
    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!DOM.select('.notification-container')) {
            const container = DOM.create('div', { className: 'notification-container' });
            document.body.appendChild(container);
        }
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {number} duration - Duration in ms
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = DOM.select('.notification-container');
        if (!container) return;

        const notification = DOM.create('div', {
            className: `notification ${type}`,
            innerHTML: `
                <div class="notification-content">
                    <i class="notification-icon fas ${this.getNotificationIcon(type)}"></i>
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `
        });

        // Add styles
        notification.style.cssText = `
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-md);
            margin-bottom: var(--space-sm);
            color: white;
            box-shadow: var(--glass-shadow);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid ${this.getNotificationColor(type)};
        `;

        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button
        const closeBtn = DOM.select('.notification-close', notification);
        DOM.on(closeBtn, 'click', () => {
            this.removeNotification(notification);
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
    }

    /**
     * Remove notification
     * @param {Element} notification - Notification element
     */
    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    /**
     * Get notification icon by type
     * @param {string} type - Notification type
     * @returns {string} - Icon class
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get notification color by type
     * @param {string} type - Notification type
     * @returns {string} - Color value
     */
    getNotificationColor(type) {
        const colors = {
            success: '#4ecdc4',
            error: '#ff6b6b',
            warning: '#ffa726',
            info: '#00d4ff'
        };
        return colors[type] || colors.info;
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        const preferences = Storage.get('userPreferences', {});
        
        // Apply saved preferences
        if (preferences.reducedMotion) {
            document.documentElement.style.setProperty('--transition-duration', '0s');
        }
        
        if (preferences.theme) {
            document.body.setAttribute('data-theme', preferences.theme);
        }
    }

    /**
     * Save user preferences
     * @param {Object} preferences - User preferences
     */
    saveUserPreferences(preferences) {
        const current = Storage.get('userPreferences', {});
        const updated = { ...current, ...preferences };
        Storage.set('userPreferences', updated);
    }

    /**
     * Submit growth request (API simulation)
     * @param {Object} data - Form data
     * @returns {Promise} - Request promise
     */
    async submitGrowthRequest(data) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true, message: 'Request submitted successfully' });
                } else {
                    reject(new Error('API error'));
                }
            }, 2000);
        });
    }

    /**
     * Subscribe to newsletter (API simulation)
     * @param {string} email - Email address
     * @returns {Promise} - Subscription promise
     */
    async subscribeToNewsletter(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.05) { // 95% success rate
                    resolve({ success: true });
                } else {
                    reject(new Error('Subscription failed'));
                }
            }, 1000);
        });
    }

    /**
     * Submit contact form (API simulation)
     * @param {Object} data - Contact data
     * @returns {Promise} - Submission promise
     */
    async submitContactForm(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.05) { // 95% success rate
                    resolve({ success: true });
                } else {
                    reject(new Error('Contact form submission failed'));
                }
            }, 1500);
        });
    }

    /**
     * Track page view
     */
    trackPageView() {
        this.trackEvent('page_view', window.location.pathname);
    }

    /**
     * Track conversion
     * @param {string} type - Conversion type
     * @param {string} value - Conversion value
     */
    trackConversion(type, value) {
        this.trackEvent('conversion', `${type}:${value}`);
    }

    /**
     * Track custom event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Event label
     */
    trackEvent(category, action, label = '') {
        // Analytics tracking (replace with your analytics service)
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: 1
            });
        }
        
        // Console log for development
        console.log('Event tracked:', { category, action, label });
    }

    /**
     * Handle errors gracefully
     * @param {Error} error - Error object
     * @param {string} context - Error context
     */
    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        // Track error
        this.trackEvent('error', context, error.message);
        
        // Show user-friendly message
        this.showNotification('Something went wrong. Please try again.', 'error');
    }
}

// Quick access buttons functionality
function setupQuickActions() {
    // Start growing button actions
    const startGrowingBtns = DOM.selectAll('#start-growing-btn, .btn-primary');
    startGrowingBtns.forEach(btn => {
        DOM.on(btn, 'click', () => {
            const contactSection = DOM.select('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Focus on username input
                setTimeout(() => {
                    const usernameInput = DOM.select('#username');
                    if (usernameInput) {
                        usernameInput.focus();
                    }
                }, 500);
            }
        });
    });

    // Learn more button actions
    const learnMoreBtns = DOM.selectAll('#learn-more-btn, .btn-secondary');
    learnMoreBtns.forEach(btn => {
        DOM.on(btn, 'click', () => {
            const featuresSection = DOM.select('#features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.instagramGrowthApp = new InstagramGrowthApp();
        setupQuickActions();
        
        // Additional initialization
        Performance.mark('app-ready');
        
    } catch (error) {
        console.error('Failed to initialize Instagram Growth App:', error);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page became visible
        if (window.instagramGrowthApp) {
            window.instagramGrowthApp.trackEvent('page_visibility', 'visible');
        }
    } else {
        // Page became hidden
        if (window.instagramGrowthApp) {
            window.instagramGrowthApp.trackEvent('page_visibility', 'hidden');
        }
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.instagramGrowthApp) {
        window.instagramGrowthApp.showNotification('Connection restored! 🌐', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.instagramGrowthApp) {
        window.instagramGrowthApp.showNotification('You\'re offline. Some features may not work.', 'warning');
    }
});

// Export for external use
window.InstagramGrowthApp = InstagramGrowthApp;