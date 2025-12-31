const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let width, height;

// Resize handling
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Particle System
class Particle {
    constructor(isCyber) {
        this.reset(isCyber, true);
    }

    reset(isCyber, firstRun = false) {
        this.x = Math.random() * width;
        this.y = firstRun ? Math.random() * height : height + 10;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -(Math.random() * 3 + 2);
        this.alpha = 1;
        this.life = Math.random() * 100 + 50;
        this.isCyber = isCyber;

        if (this.isCyber) {
            this.color = Math.random() > 0.5 ? '#00f3ff' : '#ff00ff';
            this.size = Math.random() * 3 + 1;
            this.vy = -(Math.random() * 5 + 4); // Faster in cyber mode
        } else {
            this.color = `hsla(${Math.random() * 40 + 10}, 100%, 70%, 1)`; // Gold/Orange/Red
            this.size = Math.random() * 4 + 2;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = this.life / 100;

        if (this.isCyber && Math.random() > 0.95) {
            // Glitch movement
            this.x += (Math.random() - 0.5) * 20;
        }

        if (this.life <= 0 || this.y < -10) {
            this.reset(document.body.classList.contains('cyberpunk'));
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;

        if (this.isCyber) {
            ctx.fillRect(this.x, this.y, this.size, this.size); // Square pixels
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
    }
}

// Fireworks
class Firework {
    constructor(isCyber) {
        this.reset(isCyber);
    }

    reset(isCyber) {
        this.x = Math.random() * width;
        this.y = height;
        this.targetY = Math.random() * (height / 2);
        this.speed = Math.random() * 3 + 5;
        this.color = isCyber
            ? Math.random() > 0.5
                ? '#00f3ff'
                : '#ff00ff'
            : `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.exploded = false;
        this.particles = [];
        this.isCyber = isCyber;
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            this.particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.02;
                p.vy += 0.05; // Gravity
                if (p.alpha <= 0) this.particles.splice(index, 1);
            });
        }
    }

    explode() {
        this.exploded = true;
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: this.color,
            });
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 3, 10);
        } else {
            this.particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                if (this.isCyber) {
                    ctx.fillRect(p.x, p.y, 3, 3);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }
}

const particles = [];
const fireworks = [];
const particleCount = 100;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(false));
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height); // Clear screen

    // Draw particles (lanterns/floating lights)
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Random fireworks
    if (Math.random() < 0.02) {
        fireworks.push(
            new Firework(document.body.classList.contains('cyberpunk'))
        );
    }

    fireworks.forEach((f, index) => {
        f.update();
        f.draw();
        if (f.exploded && f.particles.length === 0) {
            fireworks.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

animate();

// Interaction
const trigger = document.querySelector('.cyber-trigger');
const app = document.getElementById('app');
const icon = document.querySelector('.lantern-icon');

trigger.addEventListener('click', () => {
    document.body.classList.toggle('cyberpunk');
    const isCyber = document.body.classList.contains('cyberpunk');

    // Change icon based on mode
    icon.textContent = isCyber ? '👾' : '🏮';

    // Force reset particles to match new theme immediately
    particles.forEach(p => p.reset(isCyber, true));
});
