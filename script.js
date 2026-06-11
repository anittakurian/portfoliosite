document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // THEME TOGGLE
    // ==========================================================================
    const themeToggle = document.getElementById('theme-toggle');
    const toggleIcon = themeToggle.querySelector('i');
    
    // Check local storage or system preference
    const currentTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (currentTheme === 'dark' || (!currentTheme && systemPrefersDark)) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        toggleIcon.className = 'fa-solid fa-sun';
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        toggleIcon.className = 'fa-solid fa-moon';
    }

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
            toggleIcon.className = 'fa-solid fa-sun';
        } else {
            document.body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
            toggleIcon.className = 'fa-solid fa-moon';
        }
    });

    // ==========================================================================
    // NAVBAR STICKY STATE
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial call in case user loads page scrolled down
    handleScroll();

    // ==========================================================================
    // MOBILE NAVIGATION DRAWER
    // ==========================================================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMobileMenu = () => {
        mobileMenuToggle.classList.toggle('active');
        mobileNavDrawer.classList.toggle('active');
    };

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileNavDrawer.classList.remove('active');
        });
    });

    // Close menu when clicking outside of drawer on mobile
    document.addEventListener('click', (e) => {
        if (mobileNavDrawer.classList.contains('active') && 
            !mobileNavDrawer.contains(e.target) && 
            !mobileMenuToggle.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // ==========================================================================
    // SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================================================
    const reveals = document.querySelectorAll('.reveal');
    
    // Check if motion preferences allow animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Stop observing once revealed
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null, // viewport
            threshold: 0.1, // trigger when 10% visible
            rootMargin: '0px 0px -50px 0px' // offset trigger slightly
        });
        
        reveals.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for reduced motion
        reveals.forEach(el => el.classList.add('revealed'));
    }

    // ==========================================================================
    // EMAIL COPY TO CLIPBOARD
    // ==========================================================================
    const emailCard = document.getElementById('email-card');
    const emailValue = document.getElementById('email-value');
    const emailHint = document.getElementById('email-hint');

    emailCard.addEventListener('click', () => {
        const textToCopy = emailValue.textContent;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            emailHint.innerHTML = '<i class="fa-solid fa-check"></i> Address Copied!';
            emailCard.classList.add('copied');
            
            // Revert message after 2.5s
            setTimeout(() => {
                emailHint.innerHTML = '<i class="fa-regular fa-copy"></i> Click to copy';
                emailCard.classList.remove('copied');
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback: Mailto link triggers
            window.location.href = `mailto:${textToCopy}`;
        });
    });

    // ==========================================================================
    // INTERACTIVE PARTICLE CANVAS
    // ==========================================================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = Math.min(50, Math.floor((width * height) / 25000)); // Dynamic particle density
        
        let mouse = {
            x: null,
            y: null,
            radius: 120 // Interaction distance
        };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Soft, slow speeds
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 3 + 1.5;
                this.baseAlpha = Math.random() * 0.4 + 0.15;
                this.alpha = this.baseAlpha;
            }

            update() {
                // Regular drift movement
                this.x += this.vx;
                this.y += this.vy;

                // Screen boundary wrapping
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                // Mouse interaction (repelling effect)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < mouse.radius) {
                        // Force calculation (stronger when closer)
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        
                        // Push away gently
                        this.x += Math.cos(angle) * force * 1.5;
                        this.y += Math.sin(angle) * force * 1.5;
                        // Brighten particle slightly on approach
                        this.alpha = Math.min(0.8, this.baseAlpha + force * 0.4);
                    } else {
                        // Return to base opacity
                        if (this.alpha > this.baseAlpha) {
                            this.alpha -= 0.01;
                        }
                    }
                } else {
                    // Return to base opacity if mouse out
                    if (this.alpha > this.baseAlpha) {
                        this.alpha -= 0.01;
                    }
                }
            }

            draw() {
                // Dynamic theme detection for dot colors
                const isDark = document.body.classList.contains('dark-theme');
                // Light theme: lavender dot (#7C6BC9), Dark theme: lavender glow (#907EEB)
                const colorHex = isDark ? '144, 126, 235' : '115, 97, 208';
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${colorHex}, ${this.alpha})`;
                ctx.fill();
            }
        }

        // Initialize particles
        const init = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // Render loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Loop through and update/draw particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            
            requestAnimationFrame(animate);
        };

        init();
        animate();
    }
});
