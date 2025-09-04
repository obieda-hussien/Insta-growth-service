// Main JavaScript for Instagram Growth Service Website

class InstagramGrowthApp {
    constructor() {
        this.isLoaded = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupSmoothScrolling();
        this.setupUserTracking();
        this.loadUserPreferences();
        this.setupModalHandlers();
        this.setupFormHandlers();
    }

    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.isLoaded = true;
            this.initializeApp();
        });

        // Window events
        window.addEventListener('resize', utils.debounce(() => {
            this.handleResize();
        }, 250));

        window.addEventListener('scroll', utils.throttle(() => {
            this.handleScroll();
        }, 10));

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.saveUserSession();
        });
    }

    initializeApp() {
        console.log('🚀 Instagram Growth Service - App Initialized');
        
        // Show welcome message for new users
        this.checkFirstVisit();
        
        // Initialize features
        this.setupCTAButtons();
        this.setupGrowthDemo();
        this.setupPricingCards();
        this.setupContactForm();
        
        // Track page view
        this.trackPageView();
    }

    setupNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });
        }

        // Close mobile menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.classList.remove('nav-open');
                }
            });
        });

        // Update active nav link on scroll
        const sections = document.querySelectorAll('section[id]');
        const observer = utils.createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveNavLink(entry.target.id);
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(section => observer.observe(section));
    }

    updateActiveNavLink(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    utils.smoothScrollTo(targetElement, 80);
                }
            });
        });
    }

    setupCTAButtons() {
        const startGrowingBtn = document.querySelector('#start-growing');
        const learnMoreBtn = document.querySelector('#learn-more');

        if (startGrowingBtn) {
            startGrowingBtn.addEventListener('click', () => {
                this.showGrowthModal();
                this.trackEvent('cta_click', 'start_growing');
            });
        }

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                this.showDemoModal();
                this.trackEvent('cta_click', 'learn_more');
            });
        }

        // Pricing buttons
        const pricingButtons = document.querySelectorAll('.pricing-card .btn');
        pricingButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.selectPlan(index);
                this.trackEvent('pricing_click', `plan_${index}`);
            });
        });
    }

    setupGrowthDemo() {
        const growthDemo = document.querySelector('.growth-demo');
        if (!growthDemo) return;

        // Animate demo stats when in view
        const observer = utils.createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateGrowthDemo();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(growthDemo);
    }

    animateGrowthDemo() {
        const beforeCounter = document.querySelector('.followers-before');
        const afterCounter = document.querySelector('.followers-after');

        if (beforeCounter && afterCounter) {
            // Animate before count
            utils.animateNumber(beforeCounter, 0, 1250, 1500);
            
            // Animate after count with delay
            setTimeout(() => {
                utils.animateNumber(afterCounter, 1250, 15750, 2000);
            }, 1000);
        }
    }

    setupPricingCards() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                this.trackEvent('pricing_hover', `plan_${index}`);
            });
            
            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('popular')) {
                    card.style.transform = '';
                }
            });
        });
    }

    setupContactForm() {
        const contactForm = document.querySelector('#contact-form');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleContactSubmission(contactForm);
        });
    }

    async handleContactSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!this.validateContactForm(data)) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            utils.loading.show(submitBtn, 'Sending...');
            
            // Simulate API call (replace with actual API endpoint)
            await this.simulateFormSubmission(data);
            
            // Show success
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            submitBtn.classList.add('success');
            
            utils.notification.success('Thank you! Your message has been sent successfully.');
            
            // Reset form
            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('success');
            }, 3000);
            
            this.trackEvent('contact_form_submit', 'success');
            
        } catch (error) {
            console.error('Form submission error:', error);
            utils.notification.error('Sorry, there was an error sending your message. Please try again.');
            submitBtn.innerHTML = originalText;
            this.trackEvent('contact_form_submit', 'error');
        }
    }

    validateContactForm(data) {
        const errors = [];

        if (!utils.validation.required(data.name)) {
            errors.push('Name is required');
        }

        if (!utils.validation.required(data.email)) {
            errors.push('Email is required');
        } else if (!utils.validation.email(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!utils.validation.required(data.message)) {
            errors.push('Message is required');
        } else if (!utils.validation.minLength(data.message, 10)) {
            errors.push('Message must be at least 10 characters long');
        }

        if (data.instagram && !utils.validation.instagram(data.instagram)) {
            errors.push('Please enter a valid Instagram username');
        }

        if (errors.length > 0) {
            utils.notification.error(errors.join('<br>'));
            return false;
        }

        return true;
    }

    async simulateFormSubmission(data) {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted:', data);
                resolve({ success: true });
            }, 2000);
        });
    }

    showGrowthModal() {
        this.createModal({
            title: 'Start Your Instagram Growth Journey',
            content: `
                <div class="growth-modal">
                    <div class="modal-step active" data-step="1">
                        <h3>Enter Your Instagram Username</h3>
                        <div class="form-group">
                            <input type="text" id="instagram-username" placeholder="your_username" required>
                            <label for="instagram-username">Instagram Username</label>
                        </div>
                        <p class="modal-note">
                            <i class="fas fa-shield-alt"></i>
                            We never ask for your password. Your account is 100% safe.
                        </p>
                        <button class="btn btn-primary" onclick="instagramApp.nextModalStep()">
                            Continue <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    
                    <div class="modal-step" data-step="2">
                        <h3>Choose Your Growth Package</h3>
                        <div class="modal-packages">
                            <div class="package-option" data-package="starter">
                                <h4>Starter</h4>
                                <p>100-500 followers</p>
                                <span class="package-price">FREE</span>
                            </div>
                            <div class="package-option popular" data-package="growth">
                                <h4>Growth</h4>
                                <p>500-2000 followers</p>
                                <span class="package-price">FREE</span>
                                <div class="popular-badge">Most Popular</div>
                            </div>
                            <div class="package-option" data-package="pro">
                                <h4>Pro</h4>
                                <p>2000-10000 followers</p>
                                <span class="package-price">FREE</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="instagramApp.startGrowthProcess()">
                            Start Growing Now <i class="fas fa-rocket"></i>
                        </button>
                    </div>
                </div>
            `,
            className: 'growth-modal-container'
        });
    }

    nextModalStep() {
        const usernameInput = document.querySelector('#instagram-username');
        const username = usernameInput?.value.trim();

        if (!username) {
            utils.notification.error('Please enter your Instagram username');
            return;
        }

        if (!utils.validation.instagram(username)) {
            utils.notification.error('Please enter a valid Instagram username');
            return;
        }

        // Hide current step and show next
        const currentStep = document.querySelector('.modal-step.active');
        const nextStep = document.querySelector('.modal-step[data-step="2"]');

        if (currentStep && nextStep) {
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
        }

        this.trackEvent('modal_step', 'username_entered');
    }

    startGrowthProcess() {
        const selectedPackage = document.querySelector('.package-option.selected');
        const packageType = selectedPackage?.dataset.package || 'growth';

        this.closeModal();
        utils.notification.success(`🎉 Great! Your ${packageType} package is being activated. You'll start seeing results within 24-48 hours!`);
        
        this.trackEvent('growth_started', packageType);
    }

    showDemoModal() {
        this.createModal({
            title: 'Watch Our Growth Demo',
            content: `
                <div class="demo-modal">
                    <div class="demo-video">
                        <div class="video-placeholder">
                            <i class="fas fa-play-circle"></i>
                            <p>Demo Video Coming Soon</p>
                        </div>
                    </div>
                    <div class="demo-features">
                        <h3>What You'll See:</h3>
                        <ul>
                            <li><i class="fas fa-check"></i> Real-time follower growth</li>
                            <li><i class="fas fa-check"></i> Engagement rate improvements</li>
                            <li><i class="fas fa-check"></i> Safe growth methods</li>
                            <li><i class="fas fa-check"></i> Results within 24-48 hours</li>
                        </ul>
                    </div>
                </div>
            `,
            className: 'demo-modal-container'
        });
    }

    selectPlan(planIndex) {
        const plans = ['starter', 'growth', 'pro'];
        const selectedPlan = plans[planIndex] || 'growth';
        
        this.showGrowthModal();
        
        // Pre-select the plan in the modal
        setTimeout(() => {
            const packageOptions = document.querySelectorAll('.package-option');
            packageOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.package === selectedPlan) {
                    option.classList.add('selected');
                }
            });
        }, 100);
    }

    setupModalHandlers() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    createModal({ title, content, className = '' }) {
        const modal = document.createElement('div');
        modal.className = `modal-overlay ${className}`;
        modal.innerHTML = `
            <div class="modal glass">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="instagramApp.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.classList.add('modal-open');

        // Animation
        setTimeout(() => modal.classList.add('show'), 10);

        // Setup package selection if in growth modal
        this.setupPackageSelection(modal);
    }

    setupPackageSelection(modal) {
        const packageOptions = modal.querySelectorAll('.package-option');
        packageOptions.forEach(option => {
            option.addEventListener('click', () => {
                packageOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Pre-select most popular
        const popularOption = modal.querySelector('.package-option.popular');
        if (popularOption) {
            popularOption.classList.add('selected');
        }
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.classList.remove('modal-open');
            }, 300);
        }
    }

    setupFormHandlers() {
        // Real-time validation for all forms
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        let isValid = true;
        let errorMessage = '';

        switch (input.type) {
            case 'email':
                isValid = utils.validation.email(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'text':
                if (input.id === 'instagram-username' || input.name === 'instagram') {
                    isValid = !value || utils.validation.instagram(value);
                    errorMessage = 'Please enter a valid Instagram username';
                }
                break;
        }

        if (input.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        formGroup.classList.toggle('error', !isValid && value);
        
        // Show/hide error message
        let errorElement = formGroup.querySelector('.error-message');
        if (!isValid && value && errorMessage) {
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        } else if (errorElement) {
            errorElement.remove();
        }
    }

    setupUserTracking() {
        // Get or create user ID
        let userId = utils.storage.get('user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            utils.storage.set('user_id', userId);
        }

        this.currentUser = {
            id: userId,
            sessionStart: Date.now(),
            visits: utils.storage.get('visit_count', 0) + 1,
            lastVisit: utils.storage.get('last_visit', Date.now())
        };

        utils.storage.set('visit_count', this.currentUser.visits);
        utils.storage.set('last_visit', Date.now());
    }

    trackEvent(event, data = {}) {
        const eventData = {
            event,
            data,
            timestamp: Date.now(),
            userId: this.currentUser?.id,
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        console.log('📊 Event tracked:', eventData);
        
        // Store events locally for analytics
        const events = utils.storage.get('user_events', []);
        events.push(eventData);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        utils.storage.set('user_events', events);
    }

    trackPageView() {
        this.trackEvent('page_view', {
            title: document.title,
            referrer: document.referrer,
            deviceType: utils.getDeviceType()
        });
    }

    checkFirstVisit() {
        const isFirstVisit = this.currentUser.visits === 1;
        
        if (isFirstVisit) {
            setTimeout(() => {
                utils.notification.success('🎉 Welcome! Get your first 1000 Instagram followers completely FREE!', 8000);
            }, 3000);
            
            this.trackEvent('first_visit');
        }
    }

    loadUserPreferences() {
        const preferences = utils.storage.get('user_preferences', {});
        
        // Apply saved preferences
        if (preferences.theme) {
            document.body.classList.add(`theme-${preferences.theme}`);
        }
    }

    saveUserSession() {
        const sessionData = {
            sessionDuration: Date.now() - this.currentUser.sessionStart,
            scrollDepth: this.getScrollDepth(),
            interactions: utils.storage.get('user_events', []).length
        };

        this.trackEvent('session_end', sessionData);
    }

    getScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        
        return Math.round((scrollTop / documentHeight) * 100);
    }

    handleResize() {
        // Handle responsive changes
        const deviceType = utils.getDeviceType();
        document.body.className = document.body.className.replace(/device-\w+/g, '');
        document.body.classList.add(`device-${deviceType}`);
    }

    handleScroll() {
        // Additional scroll handling if needed
        this.trackScrollMilestones();
    }

    trackScrollMilestones() {
        const scrollDepth = this.getScrollDepth();
        const milestones = [25, 50, 75, 100];
        
        milestones.forEach(milestone => {
            const tracked = utils.storage.get(`scroll_${milestone}`, false);
            if (scrollDepth >= milestone && !tracked) {
                this.trackEvent('scroll_milestone', { depth: milestone });
                utils.storage.set(`scroll_${milestone}`, true);
            }
        });
    }
}

// Initialize the app
window.instagramApp = new InstagramGrowthApp();

// Add some additional CSS for modals and notifications
const additionalStyles = `
<style>
/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-overlay.show {
    opacity: 1;
}

.modal {
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    transform: scale(0.8);
    transition: transform 0.3s ease;
}

.modal-overlay.show .modal {
    transform: scale(1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
    margin: 0;
    color: #ffffff;
}

.modal-close {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.3s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

.modal-content {
    padding: 2rem;
}

.modal-step {
    display: none;
}

.modal-step.active {
    display: block;
}

.modal-packages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
}

.package-option {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.package-option:hover,
.package-option.selected {
    border-color: var(--neon-blue);
    background: rgba(0, 212, 255, 0.1);
    transform: translateY(-5px);
}

.package-option.popular {
    border-color: var(--neon-pink);
}

.package-option h4 {
    margin: 0 0 0.5rem 0;
    color: #ffffff;
}

.package-option p {
    margin: 0 0 1rem 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
}

.package-price {
    font-weight: bold;
    color: var(--neon-green);
    font-size: 1.2rem;
}

.popular-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--neon-pink);
    color: #ffffff;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: bold;
}

.modal-note {
    background: rgba(78, 205, 196, 0.1);
    border: 1px solid rgba(78, 205, 196, 0.3);
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 1rem 0;
    color: var(--neon-green);
    font-size: 0.9rem;
}

.demo-modal {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
}

.video-placeholder {
    aspect-ratio: 16/9;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.7);
}

.video-placeholder i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--neon-blue);
}

.demo-features ul {
    list-style: none;
    padding: 0;
}

.demo-features li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    color: rgba(255, 255, 255, 0.8);
}

.demo-features i {
    color: var(--neon-green);
}

/* Notification Styles */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(26, 26, 46, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1rem 1.5rem;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
    border: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 10001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #ffffff;
}

.notification-success {
    border-left: 4px solid var(--neon-green);
}

.notification-error {
    border-left: 4px solid var(--neon-pink);
}

.notification-warning {
    border-left: 4px solid #ffd700;
}

.notification-info {
    border-left: 4px solid var(--neon-blue);
}

.notification-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 0.25rem;
}

/* Form Error States */
.form-group.error input,
.form-group.error textarea {
    border-bottom-color: var(--neon-pink);
}

.error-message {
    display: block;
    color: var(--neon-pink);
    font-size: 0.8rem;
    margin-top: 0.5rem;
}

/* Loading States */
.loading-state {
    opacity: 0.7;
    pointer-events: none;
}

body.modal-open {
    overflow: hidden;
}

body.nav-open {
    overflow: hidden;
}

/* Responsive Modal */
@media (max-width: 768px) {
    .modal {
        width: 95%;
        margin: 1rem;
    }
    
    .modal-content {
        padding: 1rem;
    }
    
    .demo-modal {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .modal-packages {
        grid-template-columns: 1fr;
    }
    
    .notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);