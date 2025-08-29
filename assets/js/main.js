/**
 * DataHub APK Website - Main JavaScript File
 * Version: 2.0.0
 * Description: Core functionality for the DataHub APK download website
 */

// ===== GLOBAL VARIABLES =====
const DOM = {
    // Navigation
    navToggle: document.getElementById('nav-toggle'),
    navMenu: document.querySelector('.nav__menu'),
    header: document.querySelector('.header'),
    
    // Sections
    sections: document.querySelectorAll('section[id]'),
    
    // Buttons
    fab: document.querySelector('.fab'),
    downloadBtn: document.querySelector('.btn--primary'),
    
    // Overlays
    loadingOverlay: document.getElementById('loading-overlay'),
    
    // FAQ
    faqItems: document.querySelectorAll('.faq__item'),
    
    // Stats
    statNumbers: document.querySelectorAll('.stat__number'),
    
    // Elements for animation
    animatedElements: document.querySelectorAll('.feature__card, .service__card, .testimonial__card')
};

// ===== UTILITY FUNCTIONS =====
const utils = {
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle: (func, limit) => {
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
    },

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is in viewport
     */
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Check if element is partially in viewport
     * @param {Element} element - Element to check
     * @param {number} threshold - Threshold percentage (0-1)
     * @returns {boolean} True if element is partially in viewport
     */
    isPartiallyInViewport: (element, threshold = 0.1) => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
        
        const visibleArea = visibleHeight * visibleWidth;
        const totalArea = rect.height * rect.width;
        
        return visibleArea / totalArea >= threshold;
    },

    /**
     * Smooth scroll to element
     * @param {string|Element} target - Target element or selector
     * @param {number} offset - Offset from top
     */
    smoothScrollTo: (target, offset = 0) => {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Generate random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    randomNumber: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// ===== NAVIGATION FUNCTIONS =====
const navigation = {
    /**
     * Initialize navigation functionality
     */
    init: () => {
        navigation.handleMobileMenu();
        navigation.handleScrollEffects();
        navigation.handleActiveLinks();
    },

    /**
     * Handle mobile menu toggle
     */
    handleMobileMenu: () => {
        if (DOM.navToggle) {
            DOM.navToggle.addEventListener('click', () => {
                DOM.navMenu.classList.toggle('show');
                DOM.navToggle.classList.toggle('active');
            });

            // Close menu when clicking on links
            const navLinks = document.querySelectorAll('.nav__link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Handle anchor links
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const targetId = href.substring(1);
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            utils.smoothScrollTo(targetElement, 80);
                        }
                    }
                    
                    DOM.navMenu.classList.remove('show');
                    DOM.navToggle.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!DOM.navToggle.contains(e.target) && !DOM.navMenu.contains(e.target)) {
                    DOM.navMenu.classList.remove('show');
                    DOM.navToggle.classList.remove('active');
                }
            });
        }
    },

    /**
     * Handle scroll effects on header
     */
    handleScrollEffects: () => {
        const handleScroll = utils.throttle(() => {
            if (window.scrollY > 100) {
                DOM.header.classList.add('scrolled');
            } else {
                DOM.header.classList.remove('scrolled');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
    },

    /**
     * Handle active navigation links
     */
    handleActiveLinks: () => {
        const handleScroll = utils.throttle(() => {
            const scrollY = window.pageYOffset;

            DOM.sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 100;
                const sectionId = current.getAttribute('id');

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    document.querySelector(`.nav__link[href*=${sectionId}]`)?.classList.add('active');
                } else {
                    document.querySelector(`.nav__link[href*=${sectionId}]`)?.classList.remove('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }
};

// ===== ANIMATION FUNCTIONS =====
const animations = {
    /**
     * Initialize animations
     */
    init: () => {
        animations.handleScrollAnimations();
        animations.handleStatsAnimation();
        animations.handleFloatingButton();
    },

    /**
     * Handle scroll-triggered animations
     */
    handleScrollAnimations: () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.animatedElements.forEach(element => {
            observer.observe(element);
        });
    },

    /**
     * Handle statistics counter animation
     */
    handleStatsAnimation: () => {
        const statsSection = document.querySelector('.stats');
        if (!statsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animations.animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    },

    /**
     * Animate statistics counters
     */
    animateStats: () => {
        DOM.statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }

                // Format the number based on its type
                if (target >= 1000) {
                    stat.textContent = utils.formatNumber(Math.floor(current)) + '+';
                } else if (target % 1 !== 0) {
                    stat.textContent = current.toFixed(1);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 16);
        });
    },

    /**
     * Handle floating action button
     */
    handleFloatingButton: () => {
        if (!DOM.fab) return;

        const handleScroll = utils.throttle(() => {
            if (window.scrollY > 500) {
                DOM.fab.classList.add('show');
            } else {
                DOM.fab.classList.remove('show');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);

        // Scroll to top functionality
        DOM.fab.addEventListener('click', () => {
            utils.smoothScrollTo('body', 0);
        });
    }
};

// ===== FAQ FUNCTIONS =====
const faq = {
    /**
     * Initialize FAQ functionality
     */
    init: () => {
        faq.handleToggle();
    },

    /**
     * Handle FAQ toggle functionality
     */
    handleToggle: () => {
        DOM.faqItems.forEach(item => {
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');
            const icon = item.querySelector('.faq__icon');

            question.addEventListener('click', () => {
                const isActive = answer.classList.contains('active');

                // Close all other FAQ items
                DOM.faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherAnswer = otherItem.querySelector('.faq__answer');
                        const otherIcon = otherItem.querySelector('.faq__icon');
                        otherAnswer.classList.remove('active');
                        otherIcon.textContent = '+';
                    }
                });

                // Toggle current item
                if (isActive) {
                    answer.classList.remove('active');
                    icon.textContent = '+';
                } else {
                    answer.classList.add('active');
                    icon.textContent = '−';
                }
            });
        });
    }
};

// ===== DOWNLOAD FUNCTIONS =====
const download = {
    /**
     * Initialize download functionality
     */
    init: () => {
        download.handleDownloadButton();
        download.handleDownloadTracking();
    },

    /**
     * Handle download button click
     */
    handleDownloadButton: () => {
        if (DOM.downloadBtn) {
            DOM.downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                download.startDownload();
            });
        }
    },

    /**
     * Start download process
     */
    startDownload: () => {
        // Show loading overlay
        download.showLoading();

        // Simulate download preparation
        setTimeout(() => {
            download.hideLoading();
            download.triggerDownload();
            download.trackDownload();
        }, 2000);
    },

    /**
     * Show loading overlay
     */
    showLoading: () => {
        if (DOM.loadingOverlay) {
            DOM.loadingOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Hide loading overlay
     */
    hideLoading: () => {
        if (DOM.loadingOverlay) {
            DOM.loadingOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    /**
     * Trigger actual download
     */
    triggerDownload: () => {
        // Create download link
        const link = document.createElement('a');
        link.href = '/assets/downloads/datahub-v2.0.0.apk';
        link.download = 'datahub-v2.0.0.apk';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        download.showSuccessMessage();
    },

    /**
     * Show success message
     */
    showSuccessMessage: () => {
        const message = document.createElement('div');
        message.className = 'download-success';
        message.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <h3>Download Started!</h3>
                <p>Your DataHub APK download has begun. Check your downloads folder.</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        // Add styles
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(message);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 5000);
    },

    /**
     * Track download event
     */
    trackDownload: () => {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'engagement',
                'event_label': 'DataHub APK v2.0.0'
            });
        }

        // Custom tracking
        console.log('Download tracked: DataHub APK v2.0.0');
    },

    /**
     * Handle download tracking
     */
    handleDownloadTracking: () => {
        // Track all download button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn--primary')) {
                const buttonText = e.target.closest('.btn--primary').textContent;
                if (buttonText.includes('Download')) {
                    download.trackDownload();
                }
            }
        });
    }
};

// ===== ANALYTICS FUNCTIONS =====
const analytics = {
    /**
     * Initialize analytics
     */
    init: () => {
        analytics.trackPageViews();
        analytics.trackUserEngagement();
        analytics.trackScrollDepth();
    },

    /**
     * Track page views
     */
    trackPageViews: () => {
        // Google Analytics page view
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_TRACKING_ID', {
                'page_title': document.title,
                'page_location': window.location.href
            });
        }

        // Custom page view tracking
        console.log('Page view tracked:', window.location.href);
    },

    /**
     * Track user engagement
     */
    trackUserEngagement: () => {
        let startTime = Date.now();
        let maxScrollDepth = 0;

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - startTime;
            analytics.trackEvent('engagement', 'time_on_page', Math.round(timeOnPage / 1000));
        });

        // Track scroll depth
        const trackScroll = utils.throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                if (maxScrollDepth % 25 === 0) { // Track every 25%
                    analytics.trackEvent('engagement', 'scroll_depth', maxScrollDepth);
                }
            }
        }, 1000);

        window.addEventListener('scroll', trackScroll);
    },

    /**
     * Track scroll depth
     */
    trackScrollDepth: () => {
        const trackScroll = utils.throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            // Track specific scroll milestones
            const milestones = [25, 50, 75, 100];
            milestones.forEach(milestone => {
                if (scrollPercent >= milestone) {
                    analytics.trackEvent('engagement', 'scroll_milestone', milestone);
                }
            });
        }, 1000);

        window.addEventListener('scroll', trackScroll);
    },

    /**
     * Track custom events
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string|number} label - Event label
     */
    trackEvent: (category, action, label) => {
        // Google Analytics event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }

        // Custom event tracking
        console.log('Event tracked:', { category, action, label });
    }
};

// ===== PERFORMANCE FUNCTIONS =====
const performance = {
    /**
     * Initialize performance optimizations
     */
    init: () => {
        performance.optimizeImages();
        performance.handleLazyLoading();
        performance.optimizeAnimations();
    },

    /**
     * Optimize images
     */
    optimizeImages: () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading="lazy" to images below the fold
            if (!utils.isInViewport(img)) {
                img.loading = 'lazy';
            }

            // Handle image load errors
            img.addEventListener('error', () => {
                img.style.display = 'none';
                console.warn('Image failed to load:', img.src);
            });
        });
    },

    /**
     * Handle lazy loading
     */
    handleLazyLoading: () => {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    },

    /**
     * Optimize animations for performance
     */
    optimizeAnimations: () => {
        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduce-motion');
        }

        // Use requestAnimationFrame for smooth animations
        const smoothScroll = (target) => {
            const targetPosition = target.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1000;
            let start = null;

            const animation = (currentTime) => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = ease(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            };

            const ease = (t, b, c, d) => {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            };

            requestAnimationFrame(animation);
        };
    }
};

// ===== ACCESSIBILITY FUNCTIONS =====
const accessibility = {
    /**
     * Initialize accessibility features
     */
    init: () => {
        accessibility.handleKeyboardNavigation();
        accessibility.handleFocusManagement();
        accessibility.handleScreenReader();
    },

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation: () => {
        // Handle escape key for modals and menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close mobile menu
                if (DOM.navMenu.classList.contains('show')) {
                    DOM.navMenu.classList.remove('show');
                    DOM.navToggle.classList.remove('active');
                }

                // Close loading overlay
                if (DOM.loadingOverlay.classList.contains('show')) {
                    download.hideLoading();
                }
            }
        });

        // Handle tab navigation
        const focusableElements = document.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );

        focusableElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    },

    /**
     * Handle focus management
     */
    handleFocusManagement: () => {
        // Trap focus in modals
        const trapFocus = (element) => {
            const focusableElements = element.querySelectorAll(
                'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            });
        };

        // Apply to loading overlay
        if (DOM.loadingOverlay) {
            trapFocus(DOM.loadingOverlay);
        }
    },

    /**
     * Handle screen reader announcements
     */
    handleScreenReader: () => {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);

        // Announce important events
        const announce = (message) => {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };

        // Announce download start
        if (DOM.downloadBtn) {
            DOM.downloadBtn.addEventListener('click', () => {
                announce('Download started. Please check your downloads folder.');
            });
        }
    }
};

// ===== ERROR HANDLING =====
const errorHandling = {
    /**
     * Initialize error handling
     */
    init: () => {
        errorHandling.handleGlobalErrors();
        errorHandling.handleNetworkErrors();
    },

    /**
     * Handle global JavaScript errors
     */
    handleGlobalErrors: () => {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            errorHandling.logError('Global error', e.error.message, e.filename, e.lineno);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            errorHandling.logError('Unhandled promise rejection', e.reason);
        });
    },

    /**
     * Handle network errors
     */
    handleNetworkErrors: () => {
        // Handle image load errors
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                console.warn('Image failed to load:', e.target.src);
                errorHandling.logError('Image load error', e.target.src);
            }
        }, true);
    },

    /**
     * Log errors for debugging
     * @param {string} type - Error type
     * @param {string} message - Error message
     * @param {string} file - File name
     * @param {number} line - Line number
     */
    logError: (type, message, file = '', line = '') => {
        const errorData = {
            type,
            message,
            file,
            line,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        // Log to console
        console.error('Error logged:', errorData);

        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': `${type}: ${message}`,
                'fatal': false
            });
        }
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DataHub APK Website initialized');

    // Initialize all modules
    navigation.init();
    animations.init();
    faq.init();
    download.init();
    analytics.init();
    performance.init();
    accessibility.init();
    errorHandling.init();

    // Add global functions for external use
    window.DataHubWebsite = {
        downloadAPK: download.startDownload,
        scrollToTop: () => utils.smoothScrollTo('body', 0),
        toggleFAQ: (element) => {
            const answer = element.nextElementSibling;
            const icon = element.querySelector('.faq__icon');
            
            if (answer.classList.contains('active')) {
                answer.classList.remove('active');
                icon.textContent = '+';
            } else {
                // Close all other FAQ items
                DOM.faqItems.forEach(item => {
                    const otherAnswer = item.querySelector('.faq__answer');
                    const otherIcon = item.querySelector('.faq__icon');
                    if (otherAnswer !== answer) {
                        otherAnswer.classList.remove('active');
                        otherIcon.textContent = '+';
                    }
                });
                
                answer.classList.add('active');
                icon.textContent = '−';
            }
        }
    };

    console.log('DataHub APK Website ready');
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== EXPORT FOR MODULE SYSTEMS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigation,
        animations,
        faq,
        download,
        analytics,
        performance,
        accessibility,
        errorHandling,
        utils
    };
}
