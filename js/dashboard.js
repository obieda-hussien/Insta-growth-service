// Dashboard Main Controller
class Dashboard {
    constructor() {
        this.currentSection = 'overview';
        this.isInitialized = false;
        this.updateInterval = null;
    }

    // Initialize dashboard
    init() {
        if (this.isInitialized) return;
        
        this.setupNavigation();
        this.setupRealtimeUpdates();
        this.setupSettingsForms();
        this.setupNotifications();
        this.loadInitialData();
        
        this.isInitialized = true;
        
        // Start real-time updates
        this.startRealtimeUpdates();
        
        console.log('Dashboard initialized successfully');
    }

    // Setup navigation between sections
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.getAttribute('data-section');
                this.showSection(sectionId);
            });
        });

        // Initialize with overview section
        this.showSection('overview');
    }

    // Show specific section
    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Update page title
        this.updatePageTitle(sectionId);
        
        // Load section-specific data
        this.loadSectionData(sectionId);
        
        this.currentSection = sectionId;
    }

    // Update page title based on section
    updatePageTitle(sectionId) {
        const titles = {
            overview: { title: 'Dashboard Overview', subtitle: 'Monitor your Instagram growth in real-time' },
            'growth-tools': { title: 'Growth Tools', subtitle: 'Control and configure your follower growth' },
            analytics: { title: 'Analytics', subtitle: 'Detailed growth analytics and insights' },
            'account-preview': { title: 'Account Preview', subtitle: 'See how your Instagram profile looks' },
            settings: { title: 'Settings', subtitle: 'Configure your account and preferences' }
        };

        const titleInfo = titles[sectionId] || titles.overview;
        
        const titleElement = document.getElementById('page-title');
        const subtitleElement = document.getElementById('page-subtitle');
        
        if (titleElement) titleElement.textContent = titleInfo.title;
        if (subtitleElement) subtitleElement.textContent = titleInfo.subtitle;
    }

    // Load section-specific data
    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'analytics':
                if (analyticsEngine) {
                    analyticsEngine.updateAnalytics();
                }
                break;
            case 'account-preview':
                this.loadAccountPreview();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Load overview data
    loadOverviewData() {
        const stats = growthEngine?.getGrowthStats() || {
            current: 0,
            todayGrowth: 0,
            isRunning: false
        };

        // Update overview stats
        this.updateElement('current-followers', stats.current.toLocaleString());
        this.updateElement('gained-today', stats.todayGrowth.toLocaleString());
        
        // Update growth status
        if (growthEngine) {
            growthEngine.updateGrowthStatus(stats.isRunning ? 'running' : 'stopped');
        }
    }

    // Load account preview
    async loadAccountPreview() {
        const user = authManager?.getCurrentUser();
        if (!user || !user.username) return;

        try {
            const profile = await instagramAPI.getProfile(user.username);
            if (profile && growthEngine) {
                growthEngine.updateProfilePreview(profile);
                this.loadProfilePosts(profile);
            }
        } catch (error) {
            console.error('Failed to load account preview:', error);
        }
    }

    // Load profile posts
    loadProfilePosts(profile) {
        const postsGrid = document.getElementById('preview-posts-grid');
        if (!postsGrid || !profile.recent_posts) return;

        if (profile.recent_posts.length === 0) {
            postsGrid.innerHTML = `
                <div class="post-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No posts available</span>
                </div>
            `;
            return;
        }

        postsGrid.innerHTML = '';
        profile.recent_posts.slice(0, 6).forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.style.backgroundImage = `url(${post.thumbnail_url})`;
            postElement.title = `${post.like_count} likes, ${post.comment_count} comments`;
            postsGrid.appendChild(postElement);
        });
    }

    // Load settings
    loadSettings() {
        const settings = StorageManager.getSettings();
        
        // Load form values
        const emailInput = document.getElementById('notification-email');
        const emailNotifications = document.getElementById('email-notifications');
        const browserNotifications = document.getElementById('browser-notifications');
        const instagramUsername = document.getElementById('instagram-username');

        if (emailInput && settings.email) {
            emailInput.value = settings.email;
        }
        
        if (emailNotifications) {
            emailNotifications.checked = settings.notifications?.email ?? true;
        }
        
        if (browserNotifications) {
            browserNotifications.checked = settings.notifications?.browser ?? true;
        }
        
        if (instagramUsername) {
            const user = authManager?.getCurrentUser();
            instagramUsername.value = user?.username || '';
        }
    }

    // Setup settings forms
    setupSettingsForms() {
        const settingsForm = document.querySelector('.settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Reset data button
        const resetDataBtn = document.getElementById('reset-data');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                this.showConfirmDialog(
                    'Reset All Data',
                    'Are you sure you want to reset all growth data? This action cannot be undone.',
                    () => this.resetAllData()
                );
            });
        }

        // Delete account button
        const deleteAccountBtn = document.getElementById('delete-account');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                this.showConfirmDialog(
                    'Delete Account',
                    'Are you sure you want to delete your account? All data will be permanently lost.',
                    () => this.deleteAccount()
                );
            });
        }
    }

    // Save settings
    saveSettings() {
        try {
            const settings = StorageManager.getSettings();
            
            // Get form values
            const emailInput = document.getElementById('notification-email');
            const emailNotifications = document.getElementById('email-notifications');
            const browserNotifications = document.getElementById('browser-notifications');
            
            // Update settings
            if (emailInput) settings.email = emailInput.value;
            if (emailNotifications) settings.notifications.email = emailNotifications.checked;
            if (browserNotifications) settings.notifications.browser = browserNotifications.checked;
            
            // Save to storage
            StorageManager.saveSettings(settings);
            
            // Show success message
            this.showNotification('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    // Reset all data
    resetAllData() {
        try {
            // Stop growth if running
            if (growthEngine?.isRunning) {
                growthEngine.stopGrowth();
            }
            
            // Clear all storage
            StorageManager.clearAll();
            
            // Reinitialize with default data
            if (growthEngine) {
                growthEngine.loadGrowthData();
                growthEngine.updateDashboard();
            }
            
            if (analyticsEngine) {
                analyticsEngine.updateAnalytics();
            }
            
            this.showNotification('All data has been reset', 'success');
            
        } catch (error) {
            console.error('Failed to reset data:', error);
            this.showNotification('Failed to reset data', 'error');
        }
    }

    // Delete account
    deleteAccount() {
        try {
            // Stop growth if running
            if (growthEngine?.isRunning) {
                growthEngine.stopGrowth();
            }
            
            // Clear all storage
            StorageManager.clearAll();
            
            // Logout user
            if (authManager) {
                authManager.logout();
            }
            
        } catch (error) {
            console.error('Failed to delete account:', error);
            this.showNotification('Failed to delete account', 'error');
        }
    }

    // Setup real-time updates
    setupRealtimeUpdates() {
        // Listen for follower updates
        window.addEventListener('growth:followersUpdated', (e) => {
            this.handleFollowerUpdate(e.detail);
        });

        // Listen for auth events
        window.addEventListener('auth:authSuccess', (e) => {
            this.handleAuthSuccess(e.detail);
        });

        // Listen for settings updates
        window.addEventListener('growth:settingsUpdated', (e) => {
            this.handleSettingsUpdate(e.detail);
        });
    }

    // Handle follower update
    handleFollowerUpdate(data) {
        // Update UI with animation
        this.animateCounterUpdate('current-followers', data.total);
        this.animateCounterUpdate('gained-today', data.todayTotal);
        this.animateCounterUpdate('follower-count', data.total);
        
        // Update growth badge
        const growthBadge = document.getElementById('growth-badge');
        if (growthBadge && data.amount > 0) {
            growthBadge.classList.add('positive');
            this.updateElement('growth-amount', `+${data.amount}`);
            
            // Animate the badge
            growthBadge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                growthBadge.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Show notification for significant growth
        if (data.amount >= 10) {
            this.showNotification(`🎉 +${data.amount} new followers!`, 'success');
        }
    }

    // Handle auth success
    handleAuthSuccess(userData) {
        this.loadInitialData();
        
        // Auto-start growth if enabled
        const settings = StorageManager.getSettings();
        if (settings.growth?.autoStart && growthEngine) {
            setTimeout(() => {
                growthEngine.startGrowth(userData.username);
            }, 2000);
        }
    }

    // Handle settings update
    handleSettingsUpdate(settings) {
        // Update UI elements that depend on settings
        this.updateElement('followers-per-day-value', settings.followersPerDay);
        
        if (growthEngine) {
            growthEngine.updateCompletionTime();
        }
    }

    // Start real-time updates
    startRealtimeUpdates() {
        // Update every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateRealtimeData();
        }, 30000);
    }

    // Update real-time data
    updateRealtimeData() {
        if (!authManager?.isUserAuthenticated()) return;
        
        // Update current section data
        this.loadSectionData(this.currentSection);
        
        // Update activity timestamp
        if (authManager) {
            authManager.updateActivity();
        }
    }

    // Load initial data
    async loadInitialData() {
        try {
            const user = authManager?.getCurrentUser();
            if (!user) return;

            // Load growth data
            if (growthEngine) {
                growthEngine.updateDashboard();
            }

            // Load analytics
            if (analyticsEngine) {
                analyticsEngine.updateAnalytics();
            }

            // Load current section data
            this.loadSectionData(this.currentSection);
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    // Setup notifications
    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Show toast notification
        if (typeof Toastify !== 'undefined') {
            const colors = {
                success: '#4ecdc4',
                error: '#ff6b6b',
                info: '#00d4ff',
                warning: '#ffc107'
            };

            Toastify({
                text: message,
                duration: 3000,
                close: true,
                gravity: 'top',
                position: 'right',
                backgroundColor: colors[type] || colors.info,
                stopOnFocus: true
            }).showToast();
        }

        // Show browser notification for important events
        if (type === 'success' && 'Notification' in window && Notification.permission === 'granted') {
            const settings = StorageManager.getSettings();
            if (settings.notifications?.browser) {
                new Notification('InstaGrow', {
                    body: message,
                    icon: 'assets/icons/favicon.svg',
                    tag: 'instagrow-notification'
                });
            }
        }
    }

    // Show confirm dialog
    showConfirmDialog(title, message, onConfirm) {
        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content glass">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-outline modal-cancel">Cancel</button>
                        <button class="btn btn-danger modal-confirm">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            onConfirm();
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Animate counter updates
    animateCounterUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const difference = newValue - currentValue;
        
        if (difference === 0) return;

        const duration = 1000;
        const steps = 30;
        const stepValue = difference / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        
        const timer = setInterval(() => {
            currentStep++;
            const value = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = value.toLocaleString();
            
            if (currentStep >= steps) {
                clearInterval(timer);
                element.textContent = newValue.toLocaleString();
            }
        }, stepDuration);

        // Add animation class
        element.classList.add('updating');
        setTimeout(() => {
            element.classList.remove('updating');
        }, duration);
    }

    // Utility function to update elements
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Clean up event listeners
        window.removeEventListener('growth:followersUpdated', this.handleFollowerUpdate);
        window.removeEventListener('auth:authSuccess', this.handleAuthSuccess);
        window.removeEventListener('growth:settingsUpdated', this.handleSettingsUpdate);
    }
}

// Create global dashboard instance
let dashboard;

// Initialize dashboard when DOM is loaded and all dependencies are ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all other modules to be ready
    setTimeout(() => {
        dashboard = new Dashboard();
        
        // Initialize only if user is authenticated
        window.addEventListener('auth:authSuccess', () => {
            dashboard.init();
        });
        
        // If already authenticated, initialize immediately
        if (authManager?.isUserAuthenticated()) {
            dashboard.init();
        }
    }, 1000);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});

// Export for use in other files
if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
}