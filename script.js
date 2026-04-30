document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Loader & Initialization ---
    const loader = document.getElementById("loader");
    
    // Minimum loading time for atmospheric effect
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
            // Trigger particle init after load to avoid stutter
            initParticles();
        }, 1500);
    }, 2500);

    // --- 2. Custom Cursor Glow ---
    const cursorGlow = document.querySelector(".cursor-glow");
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor follow
    function animateCursor() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand glow on clickable elements
    const clickables = document.querySelectorAll("a, .menu-item");
    clickables.forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursorGlow.style.width = "400px";
            cursorGlow.style.height = "400px";
            cursorGlow.style.background = "radial-gradient(circle, rgba(197, 169, 97, 0.15) 0%, rgba(74, 48, 109, 0.1) 40%, transparent 70%)";
        });
        el.addEventListener("mouseleave", () => {
            cursorGlow.style.width = "300px";
            cursorGlow.style.height = "300px";
            cursorGlow.style.background = "radial-gradient(circle, rgba(197, 169, 97, 0.08) 0%, rgba(74, 48, 109, 0.05) 40%, transparent 70%)";
        });
    });

    // --- 3. Scroll Reveal Animation ---
    const fadeElements = document.querySelectorAll(".fade-on-scroll");

    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // --- 4. Particle Background (Stars/Dust) ---
    function initParticles() {
        const canvas = document.getElementById("particle-canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particlesArray = [];
        const numberOfParticles = window.innerWidth < 768 ? 50 : 120;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * -0.5 - 0.1; // Float upwards
                
                // Randomly choose between white/gold and slight purple tint
                const colors = [
                    'rgba(255, 255, 255, 0.6)',
                    'rgba(197, 169, 97, 0.5)',
                    'rgba(168, 143, 219, 0.3)'
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                
                if (this.y < 0) {
                    this.y = canvas.height;
                    this.x = Math.random() * canvas.width;
                }
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        animateParticles();

        // Handle resize
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
});
