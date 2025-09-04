// Growth Engine Implementation
class GrowthEngine {
    constructor() {
        this.isRunning = false;
        this.settings = {
            followersPerDay: 100, // Increased default for personal use
            speed: 'fast',        // Default to fast for personal use
            targetUsername: null,
            targetGoal: 10000,    // Higher default target
            growthMode: 'aggressive', // New aggressive mode
            engagementBoost: true,    // Auto-engagement features
            smartTiming: true         // Optimal timing algorithms
        };
        this.growthData = [];
        this.growthInterval = null;
        this.lastGrowthTime = null;
        this.todayGrowth = 0;
        this.startDate = null;
        this.growthMultiplier = 1.0;
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
            slow: 30 * 60 * 1000,  // 30 minutes (faster than before)
            medium: 15 * 60 * 1000, // 15 minutes
            fast: 5 * 60 * 1000,   // 5 minutes (much faster)
            turbo: 2 * 60 * 1000   // 2 minutes (new turbo mode)
        };
        
        return intervals[this.settings.speed] || intervals.fast;
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
        const { followersPerDay, speed, growthMode } = this.settings;
        
        // Growth intervals per day based on speed
        const intervalsPerDay = {
            slow: 48,   // Every 30 minutes
            medium: 96, // Every 15 minutes
            fast: 288,  // Every 5 minutes
            turbo: 720  // Every 2 minutes
        };
        
        const intervalCount = intervalsPerDay[speed] || intervalsPerDay.fast;
        let baseGrowth = followersPerDay / intervalCount;
        
        // Apply growth mode multipliers
        const modeMultipliers = {
            conservative: 0.7,
            normal: 1.0,
            aggressive: 1.8,
            turbo: 2.5
        };
        
        baseGrowth *= (modeMultipliers[growthMode] || 1.0);
        
        // Add randomness for realistic growth (±50% for more variation)
        const randomFactor = 0.5 + (Math.random() * 1.0); // 0.5 to 1.5
        
        // Consider time of day (higher growth during peak hours)
        const timeMultiplier = this.getTimeMultiplier();
        
        // Smart growth algorithm - burst patterns
        const burstMultiplier = this.getBurstMultiplier();
        
        // Calculate final amount
        let amount = Math.round(baseGrowth * randomFactor * timeMultiplier * burstMultiplier);
        
        // Personal mode - more aggressive growth patterns
        if (window.PERSONAL_MODE) {
            amount = Math.round(amount * 1.5); // 50% boost for personal use
        }
        
        // Ensure we don't exceed reasonable daily limit but allow bursts
        const maxBurst = Math.round(followersPerDay * 0.3); // Allow 30% daily limit in bursts
        if (amount > maxBurst) {
            amount = maxBurst;
        }
        
        return Math.max(0, amount);
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

    // Enhanced growth algorithms for personal mode
    getBurstMultiplier() {
        // Create burst patterns for more realistic growth
        const now = Date.now();
        const hoursSinceStart = (now - (this.startDate || now)) / (1000 * 60 * 60);
        
        // Burst every 6-12 hours with random timing
        const burstCycle = 8 + (Math.random() * 4); // 8-12 hours
        const cyclePosition = (hoursSinceStart % burstCycle) / burstCycle;
        
        // Create wave pattern with bursts
        if (cyclePosition > 0.7 && cyclePosition < 0.9) {
            return 2.0 + Math.random(); // Burst phase: 2x-3x multiplier
        } else if (cyclePosition > 0.9 || cyclePosition < 0.1) {
            return 1.5 + (Math.random() * 0.5); // Post-burst: 1.5x-2x
        }
        
        return 0.8 + (Math.random() * 0.4); // Normal: 0.8x-1.2x
    }

    // Smart timing algorithms
    getTimeMultiplier() {
        const hour = new Date().getHours();
        
        // Peak engagement hours: 6-9 AM, 12-2 PM, 7-10 PM
        const peakHours = [6, 7, 8, 9, 12, 13, 14, 19, 20, 21, 22];
        const isPeakHour = peakHours.includes(hour);
        
        // Weekend vs weekday
        const dayOfWeek = new Date().getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        let multiplier = 1.0;
        
        if (isPeakHour) {
            multiplier *= 1.8; // 80% boost during peak hours
        } else if (hour >= 22 || hour <= 5) {
            multiplier *= 0.4; // Reduced activity during night
        }
        
        if (isWeekend) {
            multiplier *= 1.2; // 20% boost on weekends
        }
        
        return multiplier;
    }

    // Organic growth suggestions
    getGrowthSuggestions() {
        const suggestions = [
            "🎯 Post consistently at peak engagement hours (7-9 AM, 7-9 PM)",
            "📱 Use trending hashtags relevant to your niche",
            "💬 Engage with your target audience's posts",
            "📸 Share high-quality, visually appealing content",
            "🤝 Collaborate with accounts in your niche",
            "📊 Analyze your best-performing posts and replicate the strategy",
            "🎬 Create engaging Stories and Reels for better reach",
            "💡 Share valuable tips and insights in your field",
            "🌟 Host giveaways and contests to boost engagement",
            "🔄 Cross-promote on other social media platforms"
        ];
        
        return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    // Enhanced settings for personal mode
    getAdvancedSettings() {
        return {
            growthModes: [
                { value: 'conservative', label: 'Conservative (Slow & Steady)', multiplier: 0.7 },
                { value: 'normal', label: 'Normal (Balanced)', multiplier: 1.0 },
                { value: 'aggressive', label: 'Aggressive (Fast Growth)', multiplier: 1.8 },
                { value: 'turbo', label: 'Turbo (Maximum Speed)', multiplier: 2.5 }
            ],
            speedSettings: [
                { value: 'slow', label: 'Slow (50-100/day)', interval: 30 },
                { value: 'medium', label: 'Medium (100-200/day)', interval: 15 },
                { value: 'fast', label: 'Fast (200-500/day)', interval: 5 },
                { value: 'turbo', label: 'Turbo (500-1000/day)', interval: 2 }
            ],
            targetOptions: [
                { value: 1000, label: '1K Followers' },
                { value: 5000, label: '5K Followers' },
                { value: 10000, label: '10K Followers' },
                { value: 50000, label: '50K Followers' },
                { value: 100000, label: '100K Followers' }
            ]
        };
    }
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