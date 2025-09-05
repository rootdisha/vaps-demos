'use strict';

/**
 * VAPS Website Interactive Components
 * Handles scroll animations, ribbon slider, and navigation
 */

// Configuration object for better maintainability
const CONFIG = {
    SCROLL_THRESHOLD: 0.1,
    SCROLL_ROOT_MARGIN: '0px 0px -50px 0px',
    SLIDER_INTERVAL: 5000,
    SWIPE_THRESHOLD: 50,
    COUNTER_FRAMES: 60,
    COUNTER_FPS: 16
};

/**
 * Scroll Animations Handler
 */
class ScrollAnimations {
    constructor() {
        this.initScrollObserver();
    }

    initScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                } else {
                    // Remove revealed class when element leaves viewport
                    entry.target.classList.remove('revealed');
                }
            });
        }, {
            threshold: CONFIG.SCROLL_THRESHOLD,
            rootMargin: CONFIG.SCROLL_ROOT_MARGIN
        });

        // Observe all scroll-reveal elements
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });

        // Specifically observe the hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            observer.observe(heroSection);
        }
    }
}

/**
 * Header Scroll Effects Handler
 */
class HeaderController {
    constructor() {
        this.header = document.querySelector('.header');
        this.initScrollEffect();
    }

    initScrollEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 100;
            this.header.style.background = scrolled 
                ? 'rgba(229, 221, 200, 0.98)' 
                : 'rgba(229, 221, 200, 0.95)';
        });
    }
}

/**
 * Smooth Scrolling Navigation
 */
class SmoothScrolling {
    constructor() {
        this.initSmoothScroll();
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleClick.bind(this));
        });
    }

    handleClick(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

/**
 * Ribbon Slider Component
 */
class RibbonSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.ribbon-item');
        this.dots = document.querySelectorAll('.nav-dot');
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.progressBar = document.querySelector('.progress-fill');
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoPlay();
    }

    bindEvents() {
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.restartAutoPlay();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        // Touch/swipe support
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleKeydown(e) {
        if (e.key === 'ArrowLeft') {
            this.prevSlide();
            this.restartAutoPlay();
        } else if (e.key === 'ArrowRight') {
            this.nextSlide();
            this.restartAutoPlay();
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
    }

    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > CONFIG.SWIPE_THRESHOLD) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
            this.restartAutoPlay();
        }
    }

    goToSlide(slideIndex) {
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if (index === slideIndex) {
                slide.classList.add('active');
            } else if (index < slideIndex) {
                slide.classList.add('prev');
            } else {
                slide.classList.add('next');
            }
        });

        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === slideIndex);
        });

        this.currentSlide = slideIndex;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(next);
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prev);
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, CONFIG.SLIDER_INTERVAL);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
        this.restartProgressBar();
    }

    restartProgressBar() {
        this.progressBar.style.animation = 'none';
        setTimeout(() => {
            this.progressBar.style.animation = `progressFill ${CONFIG.SLIDER_INTERVAL}ms linear infinite`;
        }, 10);
    }
}

/**
 * Counter Animation Handler
 */
class CounterAnimations {
    constructor() {
        this.initCounterObserver();
    }

    initCounterObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const whySection = document.querySelector('#why-choose');
        if (whySection) {
            observer.observe(whySection);
        }
    }

    animateCounters(section) {
        const counters = section.querySelectorAll('.why-number');
        
        counters.forEach((counter, index) => {
            setTimeout(() => {
                this.animateCounter(counter);
            }, index * 200);
        });
    }

    animateCounter(element) {
        element.classList.add('counting');
        const text = element.textContent;
        
        const { targetNumber, suffix } = this.parseCounterText(text);
        
        let current = 0;
        const increment = targetNumber / CONFIG.COUNTER_FRAMES;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                element.textContent = targetNumber + suffix;
                clearInterval(timer);
                element.classList.remove('counting');
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, CONFIG.COUNTER_FPS);
    }

    parseCounterText(text) {
        let targetNumber, suffix;
        
        if (text.includes('M+')) {
            targetNumber = parseInt(text.replace('M+', ''));
            suffix = 'M+';
        } else if (text.includes('+')) {
            targetNumber = parseInt(text.replace('+', ''));
            suffix = '+';
        } else {
            targetNumber = parseInt(text);
            suffix = '';
        }
        
        return { targetNumber, suffix };
    }
}

/**
 * Footer Animation Handler
 */
class FooterAnimations {
    constructor() {
        this.initFooterObserver();
    }

    initFooterObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateFooterSections(entry.target);
                }
            });
        }, { threshold: 0.2 });

        const footer = document.querySelector('.footer-container');
        if (footer) {
            observer.observe(footer);
        }
    }

    animateFooterSections(footer) {
        const sections = footer.querySelectorAll('.footer-section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

/**
 * Page Visibility Handler
 */
class VisibilityController {
    constructor(slider) {
        this.slider = slider;
        this.initVisibilityHandler();
    }

    initVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.slider.stopAutoPlay();
            } else {
                this.slider.startAutoPlay();
            }
        });
    }
}

/**
 * Application Initialization
 */
class VAPSWebsite {
    constructor() {
        this.init();
    }

    init() {
        // Initialize all components when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.scrollAnimations = new ScrollAnimations();
            this.headerController = new HeaderController();
            this.smoothScrolling = new SmoothScrolling();
            this.ribbonSlider = new RibbonSlider();
            this.counterAnimations = new CounterAnimations();
            this.footerAnimations = new FooterAnimations();
            this.visibilityController = new VisibilityController(this.ribbonSlider);
        });
    }
}

// Initialize the application
new VAPSWebsite();
