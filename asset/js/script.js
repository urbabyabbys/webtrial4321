document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Karakter Mengikuti Kursor (Head / Eye Tracking)
    // ----------------------------------------------------
    const characterImg = document.getElementById('characterImg');

    if (characterImg) {
        // Simpan referensi ke folder aset
        const imagePaths = {
            'center': 'asset/image/char-center.png',
            'up-left': 'asset/image/char-up-left.png',
            'up': 'asset/image/char-up.png',
            'up-right': 'asset/image/char-up-right.png',
            'left': 'asset/image/char-left.png',
            'right': 'asset/image/char-right.png',
            'down-left': 'asset/image/char-down-left.png',
            'down': 'asset/image/char-down.png',
            'down-right': 'asset/image/char-down-right.png'
        };

        // Preload gambar agar transisi halus tanpa flicker
        Object.values(imagePaths).forEach(src => {
            const img = new Image();
            img.src = src;
        });

        document.addEventListener('mousemove', (e) => {
            const rect = characterImg.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            // Toleransi area tengah
            const thresholdX = 150;
            const thresholdY = 150;

            let dirX = 'center';
            if (deltaX > thresholdX) dirX = 'right';
            else if (deltaX < -thresholdX) dirX = 'left';

            let dirY = 'center';
            if (deltaY > thresholdY) dirY = 'down';
            else if (deltaY < -thresholdY) dirY = 'up';

            let state;
            if (dirX === 'center' && dirY === 'center') {
                state = 'center';
            } else if (dirX === 'center') {
                state = dirY;
            } else if (dirY === 'center') {
                state = dirX;
            } else {
                state = `${dirY}-${dirX}`;
            }

            if (imagePaths[state]) {
                if (!characterImg.src.includes(imagePaths[state])) {
                    characterImg.src = imagePaths[state];
                }
            }
        });
    }

    // ----------------------------------------------------
    // 2. Ornamen Matrix Angka pada Canvas Latar
    // ----------------------------------------------------
    const canvas = document.getElementById('matrixCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const nums = '0123456789';
        const fontSize = 16;
        let columns = 0;
        let drops = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            drops = [];
            for (let x = 0; x < columns; x++) {
                drops[x] = Math.floor(Math.random() * -50); // staggered starting drops
            }
        }

        resizeCanvas();

        function drawMatrix() {
            // Latar semi-transparan putih untuk efek trail
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Warna font tosca
            ctx.fillStyle = '#a6c0bb';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = nums.charAt(Math.floor(Math.random() * nums.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(drawMatrix, 50);

        window.addEventListener('resize', () => {
            resizeCanvas();
        });
    }

    // ----------------------------------------------------
    // 3. Logika Draggable Lanyard (Mouse & Touch)
    // ----------------------------------------------------
    const lanyard = document.getElementById('draggableLanyard');

    if (lanyard) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let currentX = 0, currentY = 0;
        let previousX = 0;

        function startDrag(clientX, clientY) {
            isDragging = true;
            startX = clientX - currentX;
            startY = clientY - currentY;
            previousX = clientX;
            lanyard.style.transition = 'transform 0.1s ease-out';
        }

        function onDrag(clientX, clientY) {
            if (!isDragging) return;

            currentX = clientX - startX;
            currentY = clientY - startY;

            const velocityX = clientX - previousX;
            previousX = clientX;

            let rotation = velocityX * 0.8;
            if (rotation > 45) rotation = 45;
            if (rotation < -45) rotation = -45;

            lanyard.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
        }

        function endDrag() {
            if (isDragging) {
                isDragging = false;
                lanyard.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
                lanyard.style.transform = `translate(${currentX}px, ${currentY}px) rotate(0deg)`;
            }
        }

        // Mouse Events
        lanyard.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', (e) => onDrag(e.clientX, e.clientY));
        document.addEventListener('mouseup', endDrag);

        // Touch Events
        lanyard.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches && e.touches[0]) {
                onDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        document.addEventListener('touchend', endDrag);
    }

    // ----------------------------------------------------
    // 4. Update Navigasi Aktif saat Scroll & Efek Ketik
    // ----------------------------------------------------
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');
    const typingText = document.getElementById('typing-text');
    const textToType = "Hi, I'm Cheishar Abdil Adzani";
    let hasTyped = false;

    function typeWriter() {
        if (hasTyped || !typingText) return;
        hasTyped = true;
        typingText.innerHTML = '';
        let i = 0;
        typingText.classList.add('typing-cursor');

        function type() {
            if (i < textToType.length) {
                typingText.innerHTML += textToType.charAt(i);
                i++;
                setTimeout(type, 80);
            }
        }
        type();
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.4
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navItems.forEach(item => item.classList.remove('active'));
                const activeId = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-item[href="#${activeId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }

                if (activeId === 'about') {
                    typeWriter();
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // ----------------------------------------------------
    // 5. Popup Modal untuk Detail Card Project
    // ----------------------------------------------------
    const modal = document.getElementById('imageModal');
    const modalContent = document.getElementById('modalImageContainer');
    const closeModal = document.querySelector('.modal-close');

    if (modal && modalContent) {
        document.querySelectorAll('.card-img-placeholder').forEach(placeholder => {
            placeholder.addEventListener('click', () => {
                modalContent.innerHTML = placeholder.innerHTML;
                modal.classList.add('show');
            });
        });

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                modal.classList.remove('show');
            }
        });
    }

    // ----------------------------------------------------
    // 6. Navigasi Slider Card Project (Prev / Next)
    // ----------------------------------------------------
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');

    if (sliderWrapper && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const card = sliderWrapper.querySelector('.project-card');
            const scrollStep = card ? card.offsetWidth + 40 : 300;
            sliderWrapper.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            const card = sliderWrapper.querySelector('.project-card');
            const scrollStep = card ? card.offsetWidth + 40 : 300;
            sliderWrapper.scrollBy({ left: scrollStep, behavior: 'smooth' });
        });
    }
});
