/**
 * Utility Functions for Instagram Growth Service Website
 * Provides common functionality used across the application
 */

// DOM utility functions
const DOM = {
    /**
     * Safely select a single element
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element to search within
     * @returns {Element|null} - Found element or null
     */
    select(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * Safely select multiple elements
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element to search within
     * @returns {NodeList} - Found elements
     */
    selectAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

    /**
     * Create element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Attributes to set
     * @param {string|Element} content - Content to add
     * @returns {Element} - Created element
     */
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Element) {
                    element.appendChild(child);
                }
            });
        }

        return element;
    },

    /**
     * Add event listener with options
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    on(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
        }
    },

    /**
     * Remove event listener
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    off(element, event, handler) {
        if (element && typeof handler === 'function') {
            element.removeEventListener(event, handler);
        }
    },

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @param {number} threshold - Threshold for visibility (0-1)
     * @returns {boolean} - Is element visible
     */
    isInViewport(element, threshold = 0.1) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
        const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
        
        return vertInView && horInView;
    }
};

// Animation utilities
const Animation = {
    /**
     * Add CSS class with animation
     * @param {Element} element - Target element
     * @param {string} className - CSS class to add
     * @param {number} duration - Animation duration in ms
     * @returns {Promise} - Resolves when animation completes
     */
    addClassAnimated(element, className, duration = 1000) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }

            element.classList.add(className);
            
            setTimeout(() => {
                resolve();
            }, duration);
        });
    },

    /**
     * Remove CSS class after animation
     * @param {Element} element - Target element
     * @param {string} className - CSS class to remove
     * @param {number} delay - Delay before removal in ms
     */
    removeClassDelayed(element, className, delay = 0) {
        if (!element) return;
        
        setTimeout(() => {
            element.classList.remove(className);
        }, delay);
    },

    /**
     * Animate number counting
     * @param {Element} element - Element containing number
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Animation duration in ms
     * @param {Function} formatter - Number formatter function
     */
    countUp(element, start, end, duration = 2000, formatter = null) {
        if (!element) return;

        const startTime = performance.now();
        const range = end - start;

        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (range * easeOut));
            
            element.textContent = formatter ? formatter(current) : current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    },

    /**
     * Typing animation effect
     * @param {Element} element - Target element
     * @param {string} text - Text to type
     * @param {number} speed - Typing speed in ms per character
     * @returns {Promise} - Resolves when typing completes
     */
    typeWriter(element, text, speed = 100) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }

            element.textContent = '';
            let index = 0;

            const type = () => {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };

            type();
        });
    }
};

// Utility functions
const Utils = {
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @param {boolean} immediate - Execute immediately
     * @returns {Function} - Debounced function
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} - Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Generate random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random number
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Generate random color
     * @returns {string} - Random hex color
     */
    randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} - Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate Instagram username
     * @param {string} username - Username to validate
     * @returns {boolean} - Is valid username
     */
    isValidInstagramUsername(username) {
        // Remove @ symbol if present
        const cleanUsername = username.replace(/^@/, '');
        
        // Instagram username rules: 1-30 characters, letters, numbers, periods, underscores
        const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/;
        
        // Cannot start or end with period
        const noPeriodEdges = !cleanUsername.startsWith('.') && !cleanUsername.endsWith('.');
        
        // Cannot have consecutive periods
        const noConsecutivePeriods = !cleanUsername.includes('..');
        
        return usernameRegex.test(cleanUsername) && noPeriodEdges && noConsecutivePeriods;
    },

    /**
     * Format number with suffixes (K, M, B)
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const success = document.execCommand('copy');
                textArea.remove();
                return success;
            }
        } catch (error) {
            console.error('Failed to copy text to clipboard:', error);
            return false;
        }
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} - Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Get device information
     * @returns {Object} - Device info
     */
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isTablet: /iPad|Android|Tablet/i.test(userAgent),
            isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /Android/.test(userAgent),
            isChrome: /Chrome/.test(userAgent),
            isFirefox: /Firefox/.test(userAgent),
            isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
            isEdge: /Edge/.test(userAgent),
            supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    },

    /**
     * Get browser capabilities
     * @returns {Object} - Browser capabilities
     */
    getBrowserCapabilities() {
        return {
            supportsIntersectionObserver: 'IntersectionObserver' in window,
            supportsWebGL: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
                } catch (e) {
                    return false;
                }
            })(),
            supportsLocalStorage: (() => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            supportsServiceWorker: 'serviceWorker' in navigator,
            supportsWebP: (() => {
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
            })()
        };
    }
};

// Local storage utilities
const Storage = {
    /**
     * Set item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} - Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to set localStorage item:', error);
            return false;
        }
    },

    /**
     * Get item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} - Retrieved value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to get localStorage item:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove localStorage item:', error);
            return false;
        }
    },

    /**
     * Clear all localStorage items
     * @returns {boolean} - Success status
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
};

// Performance monitoring
const Performance = {
    /**
     * Mark performance timing
     * @param {string} name - Mark name
     */
    mark(name) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
        }
    },

    /**
     * Measure performance between marks
     * @param {string} name - Measure name
     * @param {string} startMark - Start mark name
     * @param {string} endMark - End mark name
     * @returns {number} - Duration in milliseconds
     */
    measure(name, startMark, endMark) {
        if (window.performance && window.performance.measure) {
            window.performance.measure(name, startMark, endMark);
            const measures = window.performance.getEntriesByName(name);
            return measures.length > 0 ? measures[measures.length - 1].duration : 0;
        }
        return 0;
    },

    /**
     * Get page load metrics
     * @returns {Object} - Load metrics
     */
    getLoadMetrics() {
        if (!window.performance || !window.performance.timing) {
            return {};
        }

        const timing = window.performance.timing;
        return {
            totalLoadTime: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: window.performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: window.performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        };
    }
};

// Export utilities for use in other modules
window.Utils = Utils;
window.DOM = DOM;
window.Animation = Animation;
window.Storage = Storage;
window.Performance = Performance;