// Utility Functions for Instagram Growth Service Website

// Debounce function for performance optimization
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
    const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
    
    return vertInView && horInView;
}

// Intersection Observer for animations
function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    return new IntersectionObserver(callback, observerOptions);
}

// Smooth scroll to element
function smoothScrollTo(element, offset = 0, duration = 1000) {
    const targetPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Generate random number between min and max
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Animate number counter
function animateNumber(element, start, end, duration = 2000, callback = null) {
    const startTime = Date.now();
    const difference = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (difference * easeOut));
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = formatNumber(end);
            if (callback) callback();
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Add class with animation delay
function addClassWithDelay(elements, className, delay = 100) {
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(className);
        }, index * delay);
    });
}

// Remove class from all elements
function removeClassFromAll(elements, className) {
    elements.forEach(element => {
        element.classList.remove(className);
    });
}

// Create ripple effect
function createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Check if device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if device is touch enabled
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Get device type
function getDeviceType() {
    const width = window.innerWidth;
    if (width <= 600) return 'mobile';
    if (width <= 768) return 'tablet';
    if (width <= 992) return 'laptop';
    return 'desktop';
}

// Local storage helpers
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// Cookie helpers
const cookies = {
    set: (name, value, days = 30) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
    },
    
    get: (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    remove: (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
};

// URL helpers
const url = {
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    getParam: (name) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },
    
    setParam: (name, value) => {
        const params = new URLSearchParams(window.location.search);
        params.set(name, value);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    },
    
    removeParam: (name) => {
        const params = new URLSearchParams(window.location.search);
        params.delete(name);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    }
};

// Form validation helpers
const validation = {
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    username: (username) => {
        const re = /^[a-zA-Z0-9_]{3,20}$/;
        return re.test(username);
    },
    
    instagram: (username) => {
        const re = /^[a-zA-Z0-9_.]{1,30}$/;
        return re.test(username);
    },
    
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    minLength: (value, min) => {
        return value && value.toString().length >= min;
    },
    
    maxLength: (value, max) => {
        return value && value.toString().length <= max;
    }
};

// API helpers
const api = {
    request: async (url, options = {}) => {
        try {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            
            const config = { ...defaultOptions, ...options };
            
            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    get: (url, options = {}) => {
        return api.request(url, { ...options, method: 'GET' });
    },
    
    post: (url, data, options = {}) => {
        return api.request(url, { ...options, method: 'POST', body: data });
    },
    
    put: (url, data, options = {}) => {
        return api.request(url, { ...options, method: 'PUT', body: data });
    },
    
    delete: (url, options = {}) => {
        return api.request(url, { ...options, method: 'DELETE' });
    }
};

// Performance helpers
const performance = {
    measureTime: (name, func) => {
        const start = Date.now();
        const result = func();
        const end = Date.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },
    
    measureAsyncTime: async (name, func) => {
        const start = Date.now();
        const result = await func();
        const end = Date.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }
};

// Loading helpers
const loading = {
    show: (element, text = 'Loading...') => {
        element.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner loading"></i>
                <span>${text}</span>
            </div>
        `;
        element.classList.add('loading-state');
    },
    
    hide: (element, originalContent = '') => {
        element.innerHTML = originalContent;
        element.classList.remove('loading-state');
    }
};

// Notification helpers
const notification = {
    show: (message, type = 'info', duration = 5000) => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        const autoRemove = setTimeout(() => {
            notification.remove();
        }, duration);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            notification.remove();
        });
        
        return notification;
    },
    
    success: (message, duration) => notification.show(message, 'success', duration),
    error: (message, duration) => notification.show(message, 'error', duration),
    warning: (message, duration) => notification.show(message, 'warning', duration),
    info: (message, duration) => notification.show(message, 'info', duration)
};

// Export utilities for use in other files
window.utils = {
    debounce,
    throttle,
    isInViewport,
    createIntersectionObserver,
    smoothScrollTo,
    random,
    formatNumber,
    animateNumber,
    addClassWithDelay,
    removeClassFromAll,
    createRipple,
    isMobile,
    isTouchDevice,
    getDeviceType,
    storage,
    cookies,
    url,
    validation,
    api,
    performance,
    loading,
    notification
};