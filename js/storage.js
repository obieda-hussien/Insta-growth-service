// Storage Management (Database-Free)
class StorageManager {
    static STORAGE_KEYS = {
        USER_SESSION: 'insta_user_session',
        GROWTH_DATA: 'insta_growth_data',
        SETTINGS: 'insta_settings',
        INITIAL_STATS: 'insta_initial_stats',
        ANALYTICS_DATA: 'insta_analytics_data',
        ACCOUNT_DATA: 'insta_account_data'
    };

    // Encrypt data before storing
    static encrypt(data, key = 'default_secret_key') {
        try {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            return JSON.stringify(data);
        }
    }

    // Decrypt data after retrieving
    static decrypt(encryptedData, key = 'default_secret_key') {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
            return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            console.error('Decryption error:', error);
            return JSON.parse(encryptedData);
        }
    }

    // Save data to localStorage with encryption
    static save(key, data, encrypt = true) {
        try {
            const dataToStore = encrypt ? this.encrypt(data) : JSON.stringify(data);
            localStorage.setItem(key, dataToStore);
            return true;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }

    // Load data from localStorage with decryption
    static load(key, decrypt = true) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            
            return decrypt ? this.decrypt(data) : JSON.parse(data);
        } catch (error) {
            console.error('Load error:', error);
            return null;
        }
    }

    // Remove data from localStorage
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Remove error:', error);
            return false;
        }
    }

    // Clear all app data
    static clearAll() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Clear all error:', error);
            return false;
        }
    }

    // Save to GitHub Gist as external backup
    static async saveToGist(data, filename, description = 'Instagram Growth Data') {
        if (DEMO_MODE) {
            console.log('Demo mode: Would save to GitHub Gist:', { filename, data });
            return 'demo_gist_id';
        }

        try {
            const gistData = {
                description: description,
                public: false,
                files: {
                    [filename]: {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            };

            const response = await axios.post('https://api.github.com/gists', gistData, {
                headers: {
                    'Authorization': `token ${API_CONFIG.storage.githubGists.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            return response.data.id;
        } catch (error) {
            console.error('GitHub Gist save error:', error);
            return null;
        }
    }

    // Load from GitHub Gist
    static async loadFromGist(gistId, filename) {
        if (DEMO_MODE) {
            console.log('Demo mode: Would load from GitHub Gist:', gistId);
            return null;
        }

        try {
            const response = await axios.get(`https://api.github.com/gists/${gistId}`, {
                headers: {
                    'Authorization': `token ${API_CONFIG.storage.githubGists.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const fileContent = response.data.files[filename]?.content;
            return fileContent ? JSON.parse(fileContent) : null;
        } catch (error) {
            console.error('GitHub Gist load error:', error);
            return null;
        }
    }

    // Save user session
    static saveSession(userData) {
        const sessionData = {
            ...userData,
            loginTime: Date.now(),
            lastActivity: Date.now()
        };
        return this.save(this.STORAGE_KEYS.USER_SESSION, sessionData);
    }

    // Get user session
    static getSession() {
        const session = this.load(this.STORAGE_KEYS.USER_SESSION);
        if (!session) return null;

        // Check if session is expired (24 hours)
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - session.loginTime > maxAge) {
            this.remove(this.STORAGE_KEYS.USER_SESSION);
            return null;
        }

        // Update last activity
        session.lastActivity = now;
        this.save(this.STORAGE_KEYS.USER_SESSION, session);
        
        return session;
    }

    // Save growth data
    static saveGrowthData(growthData) {
        return this.save(this.STORAGE_KEYS.GROWTH_DATA, growthData);
    }

    // Get growth data
    static getGrowthData() {
        return this.load(this.STORAGE_KEYS.GROWTH_DATA) || {
            history: [],
            current: {
                followers: 0,
                following: 0,
                posts: 0
            },
            initial: {
                followers: 0,
                following: 0,
                posts: 0,
                date: Date.now()
            },
            settings: {
                followersPerDay: 50,
                speed: 'medium',
                targetGoal: 1000
            }
        };
    }

    // Save settings
    static saveSettings(settings) {
        return this.save(this.STORAGE_KEYS.SETTINGS, settings);
    }

    // Get settings
    static getSettings() {
        return this.load(this.STORAGE_KEYS.SETTINGS) || {
            notifications: {
                email: true,
                browser: true,
                sound: true
            },
            growth: {
                followersPerDay: 50,
                speed: 'medium',
                targetGoal: 1000,
                autoStart: false
            },
            privacy: {
                dataCollection: true,
                analytics: true
            }
        };
    }

    // Save account data
    static saveAccountData(accountData) {
        return this.save(this.STORAGE_KEYS.ACCOUNT_DATA, accountData);
    }

    // Get account data
    static getAccountData() {
        return this.load(this.STORAGE_KEYS.ACCOUNT_DATA);
    }

    // Backup all data
    static async backupAllData() {
        try {
            const allData = {
                session: this.getSession(),
                growthData: this.getGrowthData(),
                settings: this.getSettings(),
                accountData: this.getAccountData(),
                backupDate: new Date().toISOString()
            };

            const filename = `instagram_growth_backup_${Date.now()}.json`;
            const gistId = await this.saveToGist(allData, filename, 'Instagram Growth Service Backup');
            
            if (gistId) {
                // Save backup reference
                this.save('backup_reference', { gistId, filename, date: Date.now() });
                return gistId;
            }
            
            return null;
        } catch (error) {
            console.error('Backup error:', error);
            return null;
        }
    }

    // Restore from backup
    static async restoreFromBackup(gistId, filename) {
        try {
            const backupData = await this.loadFromGist(gistId, filename);
            if (!backupData) return false;

            // Restore each data type
            if (backupData.session) this.saveSession(backupData.session);
            if (backupData.growthData) this.saveGrowthData(backupData.growthData);
            if (backupData.settings) this.saveSettings(backupData.settings);
            if (backupData.accountData) this.saveAccountData(backupData.accountData);

            return true;
        } catch (error) {
            console.error('Restore error:', error);
            return false;
        }
    }

    // Get storage usage info
    static getStorageInfo() {
        let totalSize = 0;
        let itemCount = 0;

        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && key.startsWith('insta_')) {
                    totalSize += localStorage[key].length;
                    itemCount++;
                }
            }

            return {
                totalSize: totalSize,
                itemCount: itemCount,
                sizeFormatted: this.formatBytes(totalSize),
                maxSize: 5 * 1024 * 1024, // 5MB typical localStorage limit
                usagePercent: (totalSize / (5 * 1024 * 1024)) * 100
            };
        } catch (error) {
            console.error('Storage info error:', error);
            return null;
        }
    }

    // Format bytes to human readable
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}