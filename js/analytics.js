// Analytics Engine
class AnalyticsEngine {
    constructor() {
        this.charts = {};
        this.timeframes = {
            7: 'Last 7 days',
            30: 'Last 30 days',
            90: 'Last 90 days'
        };
        this.currentTimeframe = 30;
    }

    // Initialize analytics system
    init() {
        this.initializeCharts();
        this.setupEventListeners();
        this.updateAnalytics();
        
        // Listen for growth updates
        window.addEventListener('growth:followersUpdated', () => {
            this.updateAnalytics();
        });
    }

    // Initialize all charts
    initializeCharts() {
        this.initializeGrowthChart();
        this.initializeOverviewChart();
        this.updateMetrics();
    }

    // Initialize main growth chart
    initializeGrowthChart() {
        const ctx = document.getElementById('growth-chart');
        if (!ctx) return;

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0.05)');

        this.charts.growth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getDateLabels(this.currentTimeframe),
                datasets: [{
                    label: 'Followers',
                    data: this.getGrowthData(this.currentTimeframe),
                    borderColor: '#00d4ff',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: '#00d4ff',
                        borderWidth: 1,
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: (context) => {
                                return this.formatTooltipDate(context[0].label);
                            },
                            label: (context) => {
                                return `Followers: ${context.parsed.y.toLocaleString()}`;
                            },
                            afterLabel: (context) => {
                                const growth = this.getDailyGrowth(context.dataIndex);
                                return growth > 0 ? `Growth: +${growth}` : '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: (value) => value.toLocaleString()
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxTicksLimit: 8
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Initialize overview mini chart
    initializeOverviewChart() {
        const ctx = document.getElementById('overview-chart');
        if (!ctx) return;

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(78, 205, 196, 0.3)');
        gradient.addColorStop(1, 'rgba(78, 205, 196, 0.05)');

        this.charts.overview = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getDateLabels(7),
                datasets: [{
                    label: 'Followers',
                    data: this.getGrowthData(7),
                    borderColor: '#4ecdc4',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    y: {
                        display: false,
                        beginAtZero: false
                    },
                    x: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }

    // Get date labels for charts
    getDateLabels(days) {
        const labels = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            if (days <= 7) {
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            } else if (days <= 30) {
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            } else {
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }
        }
        
        return labels;
    }

    // Get growth data for charts
    getGrowthData(days) {
        const growthData = StorageManager.getGrowthData();
        const now = Date.now();
        const startTime = now - (days * 24 * 60 * 60 * 1000);
        
        // Create daily data points
        const dailyData = [];
        const currentFollowers = growthData.current.followers;
        const initialFollowers = growthData.initial.followers;
        
        // If we have historical data, use it
        if (growthData.history && growthData.history.length > 0) {
            const history = growthData.history.filter(point => point.timestamp >= startTime);
            
            // Group by day and calculate cumulative followers
            const dailyTotals = new Map();
            
            for (let i = 0; i < days; i++) {
                const date = new Date(now - ((days - 1 - i) * 24 * 60 * 60 * 1000));
                const dateKey = date.toDateString();
                dailyTotals.set(dateKey, initialFollowers);
            }
            
            // Calculate cumulative totals
            let runningTotal = initialFollowers;
            history.forEach(point => {
                const date = new Date(point.timestamp);
                const dateKey = date.toDateString();
                runningTotal = point.total || (runningTotal + point.amount);
                dailyTotals.set(dateKey, runningTotal);
            });
            
            // Convert to array
            for (let i = 0; i < days; i++) {
                const date = new Date(now - ((days - 1 - i) * 24 * 60 * 60 * 1000));
                const dateKey = date.toDateString();
                dailyData.push(dailyTotals.get(dateKey) || initialFollowers);
            }
        } else {
            // Generate simulated historical data for demo
            const totalGrowth = currentFollowers - initialFollowers;
            const dailyGrowth = totalGrowth / days;
            
            for (let i = 0; i < days; i++) {
                const followers = initialFollowers + (dailyGrowth * i);
                // Add some randomness
                const randomVariation = followers * 0.1 * (Math.random() - 0.5);
                dailyData.push(Math.max(initialFollowers, Math.round(followers + randomVariation)));
            }
            
            // Ensure the last point matches current followers
            dailyData[dailyData.length - 1] = currentFollowers;
        }
        
        return dailyData;
    }

    // Get daily growth for tooltip
    getDailyGrowth(dataIndex) {
        const data = this.getGrowthData(this.currentTimeframe);
        if (dataIndex === 0 || !data[dataIndex - 1]) return 0;
        return data[dataIndex] - data[dataIndex - 1];
    }

    // Update all analytics
    updateAnalytics() {
        this.updateCharts();
        this.updateMetrics();
        this.updateComparison();
        this.updatePerformanceMetrics();
    }

    // Update chart data
    updateCharts() {
        // Update growth chart
        if (this.charts.growth) {
            this.charts.growth.data.labels = this.getDateLabels(this.currentTimeframe);
            this.charts.growth.data.datasets[0].data = this.getGrowthData(this.currentTimeframe);
            this.charts.growth.update('none');
        }
        
        // Update overview chart
        if (this.charts.overview) {
            this.charts.overview.data.labels = this.getDateLabels(7);
            this.charts.overview.data.datasets[0].data = this.getGrowthData(7);
            this.charts.overview.update('none');
        }
    }

    // Update metrics
    updateMetrics() {
        const stats = growthEngine?.getGrowthStats() || this.getDefaultStats();
        
        // Update week growth summary
        const weekData = this.getGrowthData(7);
        const weekGrowth = weekData[weekData.length - 1] - weekData[0];
        this.updateElement('week-growth', `+${weekGrowth.toLocaleString()}`);
        
        // Update daily progress
        const dailyTarget = growthEngine?.settings.followersPerDay || 50;
        const todayGrowth = stats.todayGrowth || 0;
        this.updateElement('daily-progress', `${todayGrowth}/${dailyTarget}`);
    }

    // Update before/after comparison
    updateComparison() {
        const data = StorageManager.getGrowthData();
        const initial = data.initial;
        const current = data.current;
        const growth = current.followers - initial.followers;
        const growthPercentage = initial.followers > 0 ? 
            ((growth / initial.followers) * 100).toFixed(2) : '0.00';

        // Before stats
        this.updateElement('before-followers', initial.followers.toLocaleString());
        this.updateElement('before-following', initial.following.toLocaleString());
        this.updateElement('before-posts', initial.media_count || initial.posts || 0);

        // After stats
        this.updateElement('after-followers', current.followers.toLocaleString());
        this.updateElement('growth-amount-display', `+${growth.toLocaleString()}`);
        this.updateElement('growth-percentage', `${growthPercentage}%`);
    }

    // Update performance metrics
    updatePerformanceMetrics() {
        const stats = growthEngine?.getGrowthStats() || this.getDefaultStats();
        const growthData = StorageManager.getGrowthData();
        
        // Calculate average daily growth
        const history = growthData.history || [];
        const daysActive = Math.max(1, stats.daysActive || 1);
        const avgDailyGrowth = Math.round(stats.growth / daysActive);
        
        // Find best day
        const dailyGrowthMap = new Map();
        history.forEach(point => {
            const date = new Date(point.timestamp).toDateString();
            dailyGrowthMap.set(date, (dailyGrowthMap.get(date) || 0) + point.amount);
        });
        
        let bestDay = '--';
        let maxGrowth = 0;
        for (const [date, growth] of dailyGrowthMap) {
            if (growth > maxGrowth) {
                maxGrowth = growth;
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                bestDay = dayName;
            }
        }
        
        // Record growth (max daily growth)
        const recordGrowth = Math.max(...Array.from(dailyGrowthMap.values()), 0);
        
        // Update elements
        this.updateElement('avg-daily-growth', avgDailyGrowth.toLocaleString());
        this.updateElement('best-day', bestDay);
        this.updateElement('record-growth', `+${recordGrowth.toLocaleString()}`);
        this.updateElement('growth-duration', `${daysActive} day${daysActive !== 1 ? 's' : ''}`);
    }

    // Setup event listeners
    setupEventListeners() {
        // Chart timeframe selector
        const timeframeSelect = document.getElementById('chart-timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                this.currentTimeframe = parseInt(e.target.value);
                this.updateCharts();
            });
        }
        
        // Auto-refresh every minute
        setInterval(() => {
            this.updateAnalytics();
        }, 60000);
    }

    // Format tooltip date
    formatTooltipDate(label) {
        try {
            const date = new Date(label);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return label;
        }
    }

    // Calculate growth percentage
    calculateGrowthPercentage(before, after) {
        if (before === 0) return after > 0 ? '∞' : '0.00';
        return ((after - before) / before * 100).toFixed(2);
    }

    // Get engagement metrics
    calculateEngagementMetrics() {
        const data = StorageManager.getGrowthData();
        const followers = data.current.followers;
        
        // Simulate engagement metrics based on follower count
        const avgLikes = Math.round(followers * (0.03 + Math.random() * 0.02)); // 3-5% engagement
        const avgComments = Math.round(avgLikes * (0.1 + Math.random() * 0.1)); // 10-20% of likes
        const engagementRate = ((avgLikes + avgComments) / followers * 100).toFixed(2);
        
        return {
            avgLikes,
            avgComments,
            engagementRate: parseFloat(engagementRate)
        };
    }

    // Export growth data as CSV
    exportGrowthData() {
        const data = StorageManager.getGrowthData();
        const history = data.history || [];
        
        let csv = 'Date,Time,Followers Added,Total Followers,Growth Speed\n';
        
        history.forEach(point => {
            const date = new Date(point.timestamp);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString();
            csv += `${dateStr},${timeStr},${point.amount},${point.total},${point.speed}\n`;
        });
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instagram_growth_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Generate growth report
    generateGrowthReport() {
        const stats = growthEngine?.getGrowthStats() || this.getDefaultStats();
        const engagement = this.calculateEngagementMetrics();
        
        return {
            summary: {
                totalGrowth: stats.growth,
                growthPercentage: stats.growthPercentage,
                daysActive: stats.daysActive,
                currentFollowers: stats.current,
                targetProgress: stats.targetProgress
            },
            performance: {
                avgDailyGrowth: Math.round(stats.growth / Math.max(1, stats.daysActive)),
                todayGrowth: stats.todayGrowth,
                recordDayGrowth: this.getRecordDayGrowth(),
                engagementRate: engagement.engagementRate
            },
            projections: {
                estimatedCompletion: this.getEstimatedCompletion(),
                monthlyGrowthRate: this.getMonthlyGrowthRate()
            }
        };
    }

    // Get record day growth
    getRecordDayGrowth() {
        const growthData = StorageManager.getGrowthData();
        const history = growthData.history || [];
        
        const dailyGrowthMap = new Map();
        history.forEach(point => {
            const date = new Date(point.timestamp).toDateString();
            dailyGrowthMap.set(date, (dailyGrowthMap.get(date) || 0) + point.amount);
        });
        
        return Math.max(...Array.from(dailyGrowthMap.values()), 0);
    }

    // Get estimated completion date
    getEstimatedCompletion() {
        const stats = growthEngine?.getGrowthStats() || this.getDefaultStats();
        const remaining = Math.max(0, stats.targetGoal - stats.current);
        const dailyRate = growthEngine?.settings.followersPerDay || 50;
        const daysRemaining = Math.ceil(remaining / dailyRate);
        
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + daysRemaining);
        
        return completionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Get monthly growth rate
    getMonthlyGrowthRate() {
        const stats = growthEngine?.getGrowthStats() || this.getDefaultStats();
        const daysActive = Math.max(1, stats.daysActive);
        const dailyRate = stats.growth / daysActive;
        return Math.round(dailyRate * 30);
    }

    // Get default stats for fallback
    getDefaultStats() {
        return {
            current: 1000,
            initial: 1000,
            growth: 0,
            growthPercentage: '0.00',
            todayGrowth: 0,
            targetGoal: 1000,
            targetProgress: '0.0',
            isRunning: false,
            startDate: Date.now(),
            daysActive: 0
        };
    }

    // Utility function to update elements
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    // Destroy charts (for cleanup)
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Create global instance
let analyticsEngine;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Chart.js to be available
    if (typeof Chart !== 'undefined') {
        analyticsEngine = new AnalyticsEngine();
        analyticsEngine.init();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                analyticsEngine = new AnalyticsEngine();
                analyticsEngine.init();
            }
        }, 1000);
    }
});

// Export for use in other files
if (typeof window !== 'undefined') {
    window.AnalyticsEngine = AnalyticsEngine;
}