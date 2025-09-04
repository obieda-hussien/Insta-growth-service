// Authentication System
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check for existing session
        const session = StorageManager.getSession();
        if (session) {
            this.isAuthenticated = true;
            this.currentUser = session;
            this.handleAuthSuccess(session);
        }

        // Check for GitHub OAuth callback
        this.handleOAuthCallback();
    }

    // GitHub OAuth login
    initiateGitHubLogin() {
        if (DEMO_MODE) {
            // Demo mode - simulate successful authentication
            setTimeout(() => {
                const demoUser = {
                    username: 'demo_user',
                    email: 'demo@example.com',
                    name: 'Demo User',
                    avatar: 'assets/images/default-avatar.svg',
                    provider: 'demo',
                    id: 'demo_123'
                };
                this.handleAuthSuccess(demoUser);
            }, 1000);
            return;
        }

        const params = new URLSearchParams({
            client_id: API_CONFIG.github.clientId,
            redirect_uri: API_CONFIG.github.redirectUri,
            scope: API_CONFIG.github.scope,
            state: this.generateState()
        });

        const authUrl = `https://github.com/login/oauth/authorize?${params}`;
        window.location.href = authUrl;
    }

    // Handle OAuth callback
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state) {
            // Verify state to prevent CSRF attacks
            const savedState = localStorage.getItem('oauth_state');
            if (state === savedState) {
                this.exchangeCodeForToken(code);
            } else {
                console.error('OAuth state mismatch');
                this.handleAuthError('Invalid authentication state');
            }
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Exchange code for token
    async exchangeCodeForToken(code) {
        if (DEMO_MODE) {
            // Demo mode - simulate token exchange
            const demoUser = {
                username: 'demo_user',
                email: 'demo@example.com',
                name: 'Demo User',
                avatar: 'assets/images/default-avatar.svg',
                provider: 'github',
                id: 'demo_123'
            };
            this.handleAuthSuccess(demoUser);
            return;
        }

        try {
            // In a real implementation, this would need to be done server-side
            // due to CORS restrictions and to keep client secret secure
            console.log('Token exchange would happen on backend');
            
            // For demo purposes, simulate successful authentication
            const demoUser = {
                username: 'github_user',
                email: 'user@github.com',
                name: 'GitHub User',
                avatar: 'assets/images/default-avatar.svg',
                provider: 'github',
                id: 'github_123'
            };
            this.handleAuthSuccess(demoUser);
        } catch (error) {
            console.error('Token exchange error:', error);
            this.handleAuthError('Authentication failed');
        }
    }

    // Manual authentication (username only)
    async authenticateManually(username) {
        try {
            if (!username || username.trim() === '') {
                throw new Error('Username is required');
            }

            // Clean username (remove @ if present)
            const cleanUsername = username.replace('@', '').trim();

            // Validate username format
            if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername)) {
                throw new Error('Invalid username format');
            }

            // Create user object
            const user = {
                username: cleanUsername,
                email: null,
                name: cleanUsername,
                avatar: 'assets/images/default-avatar.svg',
                provider: 'manual',
                id: `manual_${cleanUsername}`
            };

            this.handleAuthSuccess(user);
        } catch (error) {
            console.error('Manual authentication error:', error);
            this.handleAuthError(error.message);
        }
    }

    // Handle successful authentication
    handleAuthSuccess(userData) {
        this.isAuthenticated = true;
        this.currentUser = userData;
        
        // Save session
        StorageManager.saveSession(userData);
        
        // Update UI
        this.updateAuthUI();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Show success notification
        this.showNotification('Successfully logged in!', 'success');
        
        // Trigger auth success event
        this.dispatchAuthEvent('authSuccess', userData);
    }

    // Handle authentication error
    handleAuthError(message) {
        console.error('Authentication error:', message);
        
        // Show error notification
        this.showNotification(message || 'Authentication failed', 'error');
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Trigger auth error event
        this.dispatchAuthEvent('authError', { message });
    }

    // Logout user
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        
        // Clear session storage
        StorageManager.remove(StorageManager.STORAGE_KEYS.USER_SESSION);
        
        // Clear temporary data
        localStorage.removeItem('oauth_state');
        
        // Update UI
        this.updateAuthUI();
        
        // Show notification
        this.showNotification('Logged out successfully', 'info');
        
        // Trigger logout event
        this.dispatchAuthEvent('logout');
        
        // Redirect to main page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Update authentication UI
    updateAuthUI() {
        const loadingScreen = document.getElementById('loading-screen');
        const dashboardContainer = document.getElementById('dashboard-container');
        const authModal = document.getElementById('auth-modal');

        if (this.isAuthenticated && this.currentUser) {
            // Show dashboard
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (dashboardContainer) dashboardContainer.style.display = 'flex';
            if (authModal) authModal.classList.remove('active');
            
            // Update user info in sidebar
            this.updateUserProfile();
        } else {
            // Show auth modal or redirect to login
            if (dashboardContainer) dashboardContainer.style.display = 'none';
            if (authModal) authModal.classList.add('active');
        }
    }

    // Update user profile in sidebar
    updateUserProfile() {
        if (!this.currentUser) return;

        const elements = {
            username: document.getElementById('username-display'),
            avatar: document.getElementById('avatar-img'),
            instagramUsername: document.getElementById('instagram-username')
        };

        if (elements.username) {
            elements.username.textContent = `@${this.currentUser.username}`;
        }
        
        if (elements.avatar && this.currentUser.avatar) {
            elements.avatar.src = this.currentUser.avatar;
            elements.avatar.alt = this.currentUser.name || this.currentUser.username;
        }
        
        if (elements.instagramUsername) {
            elements.instagramUsername.value = this.currentUser.username;
        }
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }, 1000);
        }
    }

    // Generate OAuth state for security
    generateState() {
        const state = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        localStorage.setItem('oauth_state', state);
        return state;
    }

    // Show notification
    showNotification(message, type = 'info') {
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
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Dispatch authentication events
    dispatchAuthEvent(eventType, data = null) {
        const event = new CustomEvent(`auth:${eventType}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // Update session activity
    updateActivity() {
        if (this.isAuthenticated && this.currentUser) {
            this.currentUser.lastActivity = Date.now();
            StorageManager.saveSession(this.currentUser);
        }
    }

    // Setup activity tracking
    setupActivityTracking() {
        // Update activity every 5 minutes
        setInterval(() => {
            this.updateActivity();
        }, 5 * 60 * 1000);

        // Update activity on user interaction
        ['click', 'keypress', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            }, { passive: true });
        });
    }
}

// Initialize authentication manager
let authManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    
    // Setup activity tracking
    authManager.setupActivityTracking();
    
    // Setup auth modal event listeners
    setupAuthModalEvents();
});

// Setup authentication modal events
function setupAuthModalEvents() {
    // GitHub auth button
    const githubAuthBtn = document.getElementById('github-auth');
    if (githubAuthBtn) {
        githubAuthBtn.addEventListener('click', () => {
            authManager.initiateGitHubLogin();
        });
    }

    // Manual auth form
    const manualAuthForm = document.querySelector('.manual-auth-form');
    if (manualAuthForm) {
        manualAuthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('manual-username').value;
            authManager.authenticateManually(username);
        });
    }

    // Close modal button
    const closeModalBtn = document.getElementById('close-auth-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('auth-modal').classList.remove('active');
        });
    }

    // Connect account button
    const connectAccountBtn = document.getElementById('connect-account-btn');
    if (connectAccountBtn) {
        connectAccountBtn.addEventListener('click', () => {
            document.getElementById('auth-modal').classList.add('active');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            authManager.logout();
        });
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
}