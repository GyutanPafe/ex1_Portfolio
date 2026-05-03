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

    // --- 2. Custom Cursor Glow & Lantern ---
    const cursorGlow = document.querySelector(".cursor-glow");
    const lanternCursor = document.querySelector(".lantern-cursor");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let lanternX = mouseX;
    let lanternY = mouseY;

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor follow
        function animateCursor() {
            // Glow follows slower
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
            
            // Lantern follows a bit faster
            lanternX += (mouseX - lanternX) * 0.15;
            lanternY += (mouseY - lanternY) * 0.15;
            if (lanternCursor) {
                lanternCursor.style.transform = `translate(${lanternX}px, ${lanternY}px)`;
            }

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.addEventListener("mousedown", () => {
            if (lanternCursor) lanternCursor.classList.add("clicked");
        });
        document.addEventListener("mouseup", () => {
            if (lanternCursor) lanternCursor.classList.remove("clicked");
        });

        // Expand glow on clickable elements
        const clickables = document.querySelectorAll("a, button, .menu-item, .secret-trigger, .night-menu-close, .keyhole-icon, .cryptic-text, .reaction-spot");
        clickables.forEach(el => {
            el.addEventListener("mouseenter", () => {
                cursorGlow.style.width = "400px";
                cursorGlow.style.height = "400px";
                cursorGlow.style.background = "radial-gradient(circle, rgba(197, 169, 97, 0.15) 0%, rgba(74, 48, 109, 0.1) 40%, transparent 70%)";
                if (lanternCursor) lanternCursor.classList.add("active");
            });
            el.addEventListener("mouseleave", () => {
                cursorGlow.style.width = "300px";
                cursorGlow.style.height = "300px";
                cursorGlow.style.background = "radial-gradient(circle, rgba(197, 169, 97, 0.08) 0%, rgba(74, 48, 109, 0.05) 40%, transparent 70%)";
                if (lanternCursor) lanternCursor.classList.remove("active");
            });
        });
    }

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

    // --- 5. Secret Interactions ---
    const letterTrigger = document.getElementById("secret-letter-trigger");
    const letterOverlay = document.getElementById("secret-letter-overlay");
    const letterTextEl = document.getElementById("letter-text");

    const menuTrigger = document.getElementById("secret-menu-trigger");
    const nightMenuOverlay = document.getElementById("night-menu-overlay");
    const nightMenuClose = document.querySelector(".night-menu-close");

    const conceptTrigger = document.getElementById("secret-concept-trigger");
    const conceptOverlay = document.getElementById("secret-concept-overlay");

    // Tea trigger variables
    const teaTrigger = document.getElementById("secret-tea-trigger");
    const lastDrinkDefault = document.getElementById("last-drink-default");
    const lastDrinkSecret = document.getElementById("last-drink-secret");

    const letters = [
        "ここは、誰かが置き忘れた時間の吹き溜まり。\n時計の針は動かないのに、なぜか脈打つ音が聞こえる。\n…私はいったい、いつからここにいるのだろう。",
        "あの時、選ばなかった道の先で、誰かが私を待っていた気がする。\nここは、そんな「もしも」が沈澱する場所。\n冷めた珈琲に映るのは、もう一人の私の顔だった。",
        "『どうしても伝えたいことがあった』\nそう呟いて席を立ったあの客は、もう二度と現れないだろう。\nテーブルには、触れると熱を帯びる冷たい鍵だけが残されていた。",
        "手元の灯りが、少し静かになった気がする。\n何かを思い出すたび、この光は記憶を燃料にして燃えるらしい。\n…外に出る頃には、私の何が消えているのだろうか。"
    ];

    if (letterTrigger && letterOverlay) {
        letterTrigger.addEventListener("click", () => {
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            letterTextEl.textContent = randomLetter;
            letterOverlay.classList.add("show");
            document.body.style.overflow = "hidden"; // Prevent scroll
        });

        letterOverlay.addEventListener("click", () => {
            letterOverlay.classList.remove("show");
            document.body.style.overflow = "";
        });
    }

    if (conceptTrigger && conceptOverlay) {
        conceptTrigger.addEventListener("click", () => {
            conceptOverlay.classList.add("show");
            document.body.style.overflow = "hidden";
        });

        conceptOverlay.addEventListener("click", (e) => {
            if (e.target === conceptOverlay) {
                conceptOverlay.classList.remove("show");
                document.body.style.overflow = "";
            }
        });
    }

    if (menuTrigger && nightMenuOverlay) {
        menuTrigger.addEventListener("click", () => {
            nightMenuOverlay.classList.add("show");
            document.body.style.overflow = "hidden";
        });

        nightMenuOverlay.addEventListener("click", (e) => {
            // Close on background click or close button
            if (e.target === nightMenuOverlay || e.target === nightMenuClose) {
                nightMenuOverlay.classList.remove("show");
                document.body.style.overflow = "";
                if (lastDrinkDefault && lastDrinkSecret) {
                    lastDrinkDefault.style.display = "block";
                    lastDrinkSecret.style.display = "none";
                }
            }
        });
    }

    if (teaTrigger && lastDrinkDefault && lastDrinkSecret) {
        teaTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // Reset cursor styles since the trigger element will be hidden
            if (cursorGlow) {
                cursorGlow.style.width = "300px";
                cursorGlow.style.height = "300px";
                cursorGlow.style.background = "radial-gradient(circle, rgba(197, 169, 97, 0.08) 0%, rgba(74, 48, 109, 0.05) 40%, transparent 70%)";
            }
            if (lanternCursor) {
                lanternCursor.classList.remove("active");
            }
            
            lastDrinkDefault.style.display = "none";
            lastDrinkSecret.style.display = "block";
        });
    }

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (letterOverlay && letterOverlay.classList.contains("show")) {
                letterOverlay.classList.remove("show");
                document.body.style.overflow = "";
            }
            if (nightMenuOverlay && nightMenuOverlay.classList.contains("show")) {
                nightMenuOverlay.classList.remove("show");
                document.body.style.overflow = "";
                if (lastDrinkDefault && lastDrinkSecret) {
                    lastDrinkDefault.style.display = "block";
                    lastDrinkSecret.style.display = "none";
                }
            }
            if (conceptOverlay && conceptOverlay.classList.contains("show")) {
                conceptOverlay.classList.remove("show");
                document.body.style.overflow = "";
            }
        }
    });

    // --- 6. Lantern Reaction Spots ---
    const reactionSpots = document.querySelectorAll(".reaction-spot");
    
    if (reactionSpots.length > 0) {
        const reactionTextEl = document.createElement("div");
        reactionTextEl.id = "reaction-text-container";
        reactionTextEl.className = "reaction-text";
        document.body.appendChild(reactionTextEl);

        const reactionMessages = [
            "誰かが、ここに立っていた気がする。",
            "さっきまで、何かがあった。",
            "ここは、少し静かすぎる。",
            "触れない方がいい。",
            "見ないふりをしてください。",
            "あまり長く見ない方がいい。",
            "灯りが、少し揺れた。",
            "ここは、よく見えない。",
            "あなたの灯りが反応している。"
        ];

        let reactionTimeout;

        reactionSpots.forEach(spot => {
            spot.addEventListener("click", (e) => {
                // Position text near click
                reactionTextEl.style.left = e.clientX + "px";
                reactionTextEl.style.top = (e.clientY - 20) + "px"; 

                // Reset animation state
                reactionTextEl.classList.remove("show");
                
                // Choose text
                if (Math.random() < 0.05) {
                    reactionTextEl.textContent = "見つけましたね。";
                } else {
                    reactionTextEl.textContent = reactionMessages[Math.floor(Math.random() * reactionMessages.length)];
                }

                // Show text with slight delay to ensure reset applies
                setTimeout(() => {
                    reactionTextEl.classList.add("show");
                }, 10);

                // Hide after 3.5s
                clearTimeout(reactionTimeout);
                reactionTimeout = setTimeout(() => {
                    reactionTextEl.classList.remove("show");
                }, 3500);
            });
        });
    }

    // --- 7. Holiday Creepy Effects ---
    const holidayText = document.getElementById("holiday-text");
    if (holidayText) {
        const today = new Date();
        const day = today.getDay();
        // 0 = Sunday, 6 = Saturday (or you can add logic for public holidays if needed)
        const isHoliday = (day === 0 || day === 6);
        
        if (isHoliday) {
            document.body.classList.add("is-holiday");
            holidayText.classList.add("creepy-holiday-text");
            
            setInterval(() => {
                if (Math.random() < 0.15) { // 15% chance every 2.5s
                    const original = "Holiday";
                    const creeps = ["Holi...day?", "逃げて", "終わらない日", "■■■■", "Never", "Eternity"];
                    holidayText.textContent = creeps[Math.floor(Math.random() * creeps.length)];
                    holidayText.style.color = "rgba(180, 20, 20, 0.9)";
                    
                    setTimeout(() => {
                        holidayText.textContent = original;
                        holidayText.style.color = "";
                    }, 800 + Math.random() * 600);
                }
            }, 2500);
        }
    }

    // --- 8. Hero Intro Creepy Glitch ---
    const heroGlitch1 = document.getElementById("hero-glitch-1");
    const heroGlitch2 = document.getElementById("hero-glitch-2");

    if (heroGlitch1 && heroGlitch2) {
        const originalText1 = heroGlitch1.innerHTML;
        const creeps1 = [
            "本日の生贄は、あなたです。",
            "ここはもう、現実ではありません。",
            "帰り道は、もうありません。",
            "もう、引き返せません。"
        ];

        const originalText2 = heroGlitch2.innerHTML;
        const creeps2 = [
            "見てはいけない。<br>気づかないふりをしてください。",
            "あなたの灯りも、<br>いずれ消えてしまう。",
            "彼らがあなたを<br>見つけてしまう前に。"
        ];

        // Glitch Line 1
        setInterval(() => {
            if (Math.random() < 0.15) { // 15% chance every 3s
                heroGlitch1.innerHTML = creeps1[Math.floor(Math.random() * creeps1.length)];
                heroGlitch1.classList.add("creepy-holiday-text");
                heroGlitch1.style.color = "rgba(180, 20, 20, 0.9)";
                
                setTimeout(() => {
                    heroGlitch1.innerHTML = originalText1;
                    heroGlitch1.classList.remove("creepy-holiday-text");
                    heroGlitch1.style.color = "";
                }, 1000 + Math.random() * 800);
            }
        }, 3000);

        // Glitch Line 2
        setInterval(() => {
            if (Math.random() < 0.15) { // 15% chance every 3.5s
                heroGlitch2.innerHTML = creeps2[Math.floor(Math.random() * creeps2.length)];
                heroGlitch2.classList.add("creepy-holiday-text");
                heroGlitch2.style.color = "rgba(180, 20, 20, 0.9)";
                
                setTimeout(() => {
                    heroGlitch2.innerHTML = originalText2;
                    heroGlitch2.classList.remove("creepy-holiday-text");
                    heroGlitch2.style.color = "";
                }, 1200 + Math.random() * 800);
            }
        }, 3500);
    }

});
