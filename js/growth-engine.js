// Growth Engine Implementation
class GrowthEngine {
    constructor() {
        this.isRunning = false;
        this.settings = {
            followersPerDay: 50,
            speed: 'medium',
            targetUsername: null,
            targetGoal: 1000
        };
        this.growthData = [];
        this.growthInterval = null;
        this.lastGrowthTime = null;
        this.todayGrowth = 0;
        this.startDate = null;
    }

    // Initialize growth engine
    init() {
        this.loadSettings();
        this.loadGrowthData();
        this.setupEventListeners();
        this.updateUI();
    }

    // Load settings from storage
    loadSettings() {
        const savedSettings = StorageManager.getSettings();
        if (savedSettings && savedSettings.growth) {
            this.settings = { ...this.settings, ...savedSettings.growth };
        }
    }

    // Save settings to storage
    saveSettings() {
        const allSettings = StorageManager.getSettings();
        allSettings.growth = this.settings;
        StorageManager.saveSettings(allSettings);
    }

    // Load growth data from storage
    loadGrowthData() {
        const data = StorageManager.getGrowthData();
        if (data) {
            this.growthData = data.history || [];
            this.todayGrowth = this.calculateTodayGrowth();
            this.startDate = data.initial?.date || Date.now();
        }
    }

    // Save growth data to storage
    saveGrowthData() {
        const data = StorageManager.getGrowthData();
        data.history = this.growthData;
        data.settings = this.settings;
        StorageManager.saveGrowthData(data);
    }

    // Start growth simulation
    async startGrowth(username) {
        if (this.isRunning) return;

        try {
            this.settings.targetUsername = username || this.settings.targetUsername;
            
            if (!this.settings.targetUsername) {
                throw new Error('Username is required to start growth');
            }

            // Get initial stats if not already saved
            await this.initializeStats();

            this.isRunning = true;
            this.lastGrowthTime = Date.now();
            
            // Start growth simulation
            this.startGrowthInterval();
            
            // Update UI
            this.updateGrowthStatus('running');
            this.saveSettings();
            
            // Show notification
            this.showNotification('Growth started successfully!', 'success');
            
            // Log activity
            this.logActivity('Growth started', `Target: ${this.settings.followersPerDay} followers/day`);
            
            // Dispatch event
            this.dispatchEvent('growthStarted', {
                username: this.settings.targetUsername,
                settings: this.settings
            });
            
        } catch (error) {
            console.error('Start growth error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // Stop growth simulation
    stopGrowth() {
        if (!this.isRunning) return;

        this.isRunning = false;
        
        if (this.growthInterval) {
            clearInterval(this.growthInterval);
            this.growthInterval = null;
        }

        // Update UI
        this.updateGrowthStatus('stopped');
        this.saveSettings();
        
        // Show notification
        this.showNotification('Growth paused', 'info');
        
        // Log activity
        this.logActivity('Growth paused', 'Manual stop');
        
        // Dispatch event
        this.dispatchEvent('growthStopped');
    }

    // Initialize stats for new account
    async initializeStats() {
        const data = StorageManager.getGrowthData();
        
        if (!data.initial.followers || data.initial.date === 0) {
            try {
                // Get current Instagram profile data
                const profile = await instagramAPI.getProfile(this.settings.targetUsername);
                
                if (profile) {
                    data.initial = {
                        followers: profile.follower_count,
                        following: profile.following_count,
                        posts: profile.media_count,
                        date: Date.now()
                    };
                    
                    data.current = { ...data.initial };
                    
                    StorageManager.saveGrowthData(data);
                    this.startDate = data.initial.date;
                    
                    // Update profile preview
                    this.updateProfilePreview(profile);
                }
            } catch (error) {
                console.error('Initialize stats error:', error);
                // Use default values if API fails
                data.initial = {
                    followers: 1000,
                    following: 500,
                    posts: 50,
                    date: Date.now()
                };
                data.current = { ...data.initial };
                StorageManager.saveGrowthData(data);
            }
        }
    }

    // Start growth interval
    startGrowthInterval() {
        if (this.growthInterval) {
            clearInterval(this.growthInterval);
        }

        const interval = this.getGrowthInterval();
        
        this.growthInterval = setInterval(() => {
            this.simulateGrowth();
        }, interval);
    }

    // Calculate growth interval based on speed
    getGrowthInterval() {
        const intervals = {
            slow: 60 * 60 * 1000, // 1 hour
            medium: 30 * 60 * 1000, // 30 minutes
            fast: 15 * 60 * 1000 // 15 minutes
        };
        
        return intervals[this.settings.speed] || intervals.medium;
    }

    // Simulate follower growth
    simulateGrowth() {
        if (!this.isRunning) return;

        try {
            // Calculate growth amount
            const growthAmount = this.calculateGrowthAmount();
            
            if (growthAmount > 0) {
                // Add followers
                this.addFollowers(growthAmount);
                
                // Save growth point
                this.saveGrowthPoint(growthAmount);
                
                // Update dashboard
                this.updateDashboard();
                
                // Check if target reached
                this.checkTargetReached();
                
                // Log activity
                this.logActivity('Followers gained', `+${growthAmount} followers`);
            }
            
        } catch (error) {
            console.error('Growth simulation error:', error);
        }
    }

    // Calculate growth amount for this interval
    calculateGrowthAmount() {
        const { followersPerDay, speed } = this.settings;
        
        // Growth intervals per day based on speed
        const intervalsPerDay = {
            slow: 24, // Every hour
            medium: 48, // Every 30 minutes
            fast: 96 // Every 15 minutes
        };
        
        const intervalCount = intervalsPerDay[speed] || intervalsPerDay.medium;
        const baseGrowth = followersPerDay / intervalCount;
        
        // Add randomness for realistic growth (±30%)
        const randomFactor = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
        
        // Consider time of day (higher growth during peak hours)
        const timeMultiplier = this.getTimeMultiplier();
        
        // Calculate final amount
        let amount = Math.round(baseGrowth * randomFactor * timeMultiplier);
        
        // Ensure we don't exceed daily limit
        const remainingToday = followersPerDay - this.todayGrowth;
        if (amount > remainingToday) {
            amount = Math.max(0, remainingToday);
        }
        
        return amount;
    }

    // Get time-based growth multiplier
    getTimeMultiplier() {
        const hour = new Date().getHours();
        
        // Peak hours: 12-2pm and 7-9pm (higher growth)
        // Off-peak hours: 11pm-7am (lower growth)
        if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
            return 1.5; // 50% more growth during peak hours
        } else if (hour >= 23 || hour <= 7) {
            return 0.5; // 50% less growth during off-peak hours
        }
        
        return 1.0; // Normal growth
    }

    // Add followers to current count
    addFollowers(amount) {
        const data = StorageManager.getGrowthData();
        data.current.followers += amount;
        this.todayGrowth += amount;
        
        // Save updated data
        StorageManager.saveGrowthData(data);
        
        // Trigger real-time updates
        this.dispatchEvent('followersUpdated', {
            amount: amount,
            total: data.current.followers,
            todayTotal: this.todayGrowth
        });
    }

    // Save growth point for analytics
    saveGrowthPoint(amount) {
        const now = Date.now();
        
        this.growthData.push({
            timestamp: now,
            amount: amount,
            total: StorageManager.getGrowthData().current.followers,
            speed: this.settings.speed,
            hour: new Date(now).getHours()
        });

        // Keep only last 90 days of data
        const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
        this.growthData = this.growthData.filter(point => point.timestamp > ninetyDaysAgo);
        
        this.saveGrowthData();
    }

    // Calculate today's growth
    calculateTodayGrowth() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        
        return this.growthData
            .filter(point => point.timestamp >= todayStart)
            .reduce((sum, point) => sum + point.amount, 0);
    }

    // Check if target goal is reached
    checkTargetReached() {
        const data = StorageManager.getGrowthData();
        const currentFollowers = data.current.followers;
        
        if (currentFollowers >= this.settings.targetGoal) {
            this.stopGrowth();
            this.showNotification(`🎉 Target reached! You now have ${currentFollowers} followers!`, 'success');
            this.logActivity('Target reached!', `${currentFollowers} followers`);
            
            this.dispatchEvent('targetReached', {
                current: currentFollowers,
                target: this.settings.targetGoal
            });
        }
    }

    // Update dashboard UI
    updateDashboard() {
        const data = StorageManager.getGrowthData();
        const current = data.current.followers;
        const initial = data.initial.followers;
        const growth = current - initial;
        const growthPercentage = initial > 0 ? ((growth / initial) * 100).toFixed(2) : '0.00';

        // Update stat cards
        this.updateElement('current-followers', current.toLocaleString());
        this.updateElement('gained-today', this.todayGrowth.toLocaleString());
        this.updateElement('growth-amount', `+${growth.toLocaleString()}`);
        this.updateElement('growth-percentage', `${growthPercentage}%`);
        this.updateElement('target-followers', this.settings.targetGoal.toLocaleString());
        
        // Update sidebar follower count
        this.updateElement('follower-count', current.toLocaleString());
        this.updateElement('growth-amount', `+${this.todayGrowth}`);
        
        // Update progress
        const targetProgress = ((current / this.settings.targetGoal) * 100).toFixed(1);
        this.updateElement('target-progress', `${targetProgress}%`);
        
        // Update completion time estimate
        this.updateCompletionTime();
    }

    // Update completion time estimate
    updateCompletionTime() {
        const data = StorageManager.getGrowthData();
        const current = data.current.followers;
        const remaining = Math.max(0, this.settings.targetGoal - current);
        
        if (remaining === 0) {
            this.updateElement('completion-time', 'Target reached!');
            return;
        }
        
        const dailyRate = this.settings.followersPerDay;
        const daysRemaining = Math.ceil(remaining / dailyRate);
        
        let timeText;
        if (daysRemaining === 1) {
            timeText = '1 day';
        } else if (daysRemaining < 7) {
            timeText = `${daysRemaining} days`;
        } else if (daysRemaining < 30) {
            const weeks = Math.ceil(daysRemaining / 7);
            timeText = `${weeks} week${weeks > 1 ? 's' : ''}`;
        } else {
            const months = Math.ceil(daysRemaining / 30);
            timeText = `${months} month${months > 1 ? 's' : ''}`;
        }
        
        this.updateElement('completion-time', timeText);
    }

    // Update growth status UI
    updateGrowthStatus(status) {
        const statusElement = document.getElementById('growth-status');
        const toggleButton = document.getElementById('toggle-growth');
        const startButton = document.getElementById('start-growth');
        const stopButton = document.getElementById('stop-growth');
        
        if (status === 'running') {
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="status-circle running">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="status-text">
                        <h4>Growth Active</h4>
                        <p>Gaining followers automatically</p>
                    </div>
                `;
            }
            
            if (toggleButton) {
                toggleButton.innerHTML = '<i class="fas fa-pause"></i><span>Pause Growth</span>';
                toggleButton.className = 'btn btn-danger btn-large';
            }
            
            if (startButton) startButton.disabled = true;
            if (stopButton) stopButton.disabled = false;
            
        } else {
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="status-circle stopped">
                        <i class="fas fa-pause"></i>
                    </div>
                    <div class="status-text">
                        <h4>Growth Stopped</h4>
                        <p>Click to start growing</p>
                    </div>
                `;
            }
            
            if (toggleButton) {
                toggleButton.innerHTML = '<i class="fas fa-play"></i><span>Start Growth</span>';
                toggleButton.className = 'btn btn-primary btn-large';
            }
            
            if (startButton) startButton.disabled = false;
            if (stopButton) stopButton.disabled = true;
        }
    }

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Restart growth interval if running
        if (this.isRunning) {
            this.startGrowthInterval();
        }
        
        // Update UI
        this.updateDashboard();
        
        this.dispatchEvent('settingsUpdated', this.settings);
    }

    // Setup event listeners
    setupEventListeners() {
        // Start/Stop buttons
        const startBtn = document.getElementById('start-growth');
        const stopBtn = document.getElementById('stop-growth');
        const toggleBtn = document.getElementById('toggle-growth');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const username = authManager?.getCurrentUser()?.username;
                this.startGrowth(username);
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopGrowth());
        }
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.isRunning) {
                    this.stopGrowth();
                } else {
                    const username = authManager?.getCurrentUser()?.username;
                    this.startGrowth(username);
                }
            });
        }
        
        // Settings controls
        this.setupSettingsControls();
        
        // Auto-save on window unload
        window.addEventListener('beforeunload', () => {
            this.saveGrowthData();
            this.saveSettings();
        });
    }

    // Setup settings controls
    setupSettingsControls() {
        const followersPerDaySlider = document.getElementById('followers-per-day');
        const speedSelect = document.getElementById('growth-speed');
        const targetGoalInput = document.getElementById('target-goal');
        
        if (followersPerDaySlider) {
            followersPerDaySlider.value = this.settings.followersPerDay;
            followersPerDaySlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('followers-per-day-value').textContent = value;
                this.updateSettings({ followersPerDay: value });
            });
        }
        
        if (speedSelect) {
            speedSelect.value = this.settings.speed;
            speedSelect.addEventListener('change', (e) => {
                this.updateSettings({ speed: e.target.value });
            });
        }
        
        if (targetGoalInput) {
            targetGoalInput.value = this.settings.targetGoal;
            targetGoalInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value > 0) {
                    this.updateSettings({ targetGoal: value });
                }
            });
        }
    }

    // Update profile preview
    updateProfilePreview(profile) {
        const elements = {
            avatar: document.getElementById('preview-avatar'),
            name: document.getElementById('preview-name'),
            bio: document.getElementById('preview-bio'),
            website: document.getElementById('preview-website'),
            posts: document.getElementById('preview-posts'),
            followers: document.getElementById('preview-followers'),
            following: document.getElementById('preview-following')
        };

        if (elements.avatar && profile.profile_pic_url) {
            elements.avatar.src = profile.profile_pic_url;
        }
        
        if (elements.name) {
            elements.name.textContent = profile.full_name || profile.username;
        }
        
        if (elements.bio) {
            elements.bio.textContent = profile.biography || 'No bio available';
        }
        
        if (elements.website && profile.external_url) {
            elements.website.href = profile.external_url;
            elements.website.textContent = profile.external_url;
            elements.website.style.display = 'block';
        }
        
        if (elements.posts) {
            elements.posts.textContent = profile.media_count?.toLocaleString() || '0';
        }
        
        if (elements.followers) {
            elements.followers.textContent = profile.follower_count?.toLocaleString() || '0';
        }
        
        if (elements.following) {
            elements.following.textContent = profile.following_count?.toLocaleString() || '0';
        }
    }

    // Utility functions
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

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
                backgroundColor: colors[type] || colors.info
            }).showToast();
        }
    }

    logActivity(action, details) {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="fas fa-chart-line activity-icon"></i>
            <div class="activity-content">
                <p><strong>${action}</strong> ${details}</p>
                <span class="activity-time">${this.formatTime(Date.now())}</span>
            </div>
        `;

        activityFeed.insertBefore(activityItem, activityFeed.firstChild);

        // Keep only last 10 activities
        while (activityFeed.children.length > 10) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }

    dispatchEvent(eventType, data = null) {
        const event = new CustomEvent(`growth:${eventType}`, { detail: data });
        window.dispatchEvent(event);
    }

    // Get growth statistics
    getGrowthStats() {
        const data = StorageManager.getGrowthData();
        const current = data.current.followers;
        const initial = data.initial.followers;
        const growth = current - initial;
        
        return {
            current: current,
            initial: initial,
            growth: growth,
            growthPercentage: initial > 0 ? ((growth / initial) * 100).toFixed(2) : '0.00',
            todayGrowth: this.todayGrowth,
            targetGoal: this.settings.targetGoal,
            targetProgress: ((current / this.settings.targetGoal) * 100).toFixed(1),
            isRunning: this.isRunning,
            startDate: this.startDate,
            daysActive: Math.floor((Date.now() - this.startDate) / (24 * 60 * 60 * 1000))
        };
    }
}

// Create global instance
let growthEngine;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    growthEngine = new GrowthEngine();
    growthEngine.init();
});

// Export for use in other files
if (typeof window !== 'undefined') {
    window.GrowthEngine = GrowthEngine;
}