// ===== Trigger Grand Opening =====
function triggerGrandOpening() {
    const container = document.querySelector('.grand-opening-container');
    if (!container) return;

    // Start the animation
    container.classList.add('active');

    // After animation is complete (approx 4 seconds), show the next step
    setTimeout(() => {
        // Automatically show password page or you can add a button
        showPasswordPage();
    }, 5000);
}

// ===== Page Navigation =====
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    // Always scroll to top when switching pages
    window.scrollTo(0, 0);

    // Trigger gift opening automatically if it's the gift page
    if (pageId === 'giftPage') {
        const giftContainer = document.querySelector('.grand-opening-container');
        if (giftContainer) {
            giftContainer.classList.remove('active');
            setTimeout(() => triggerGrandOpening(), 100);
        }
    }
}

// ===== Landing Page to Game =====
function startGame() {
    showPage('gamePage');
    initGame();
}

// ===== No Play Button Escape =====
function initNoPlayButton() {
    const noPlayBtn = document.getElementById('noPlayBtn');
    if (!noPlayBtn) return;

    // Position the button initially
    positionNoPlayButton();

    // Make button escape on hover
    noPlayBtn.addEventListener('mouseenter', () => {
        moveButtonAway();
    });

    // Also try on mobile touch & click
    noPlayBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveButtonAway();
    });

    noPlayBtn.addEventListener('click', (e) => {
        // On mobile, click follows touch, so make sure it jumps here too
        moveButtonAway();
    });
}

function positionNoPlayButton() {
    const noPlayBtn = document.getElementById('noPlayBtn');
    if (!noPlayBtn) return;

    // Get the container dimensions
    const container = noPlayBtn.closest('.container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const btnWidth = noPlayBtn.offsetWidth;
    const btnHeight = noPlayBtn.offsetHeight;

    // Set initial position (to the right of play button)
    noPlayBtn.style.position = 'relative';
    noPlayBtn.style.left = '0px';
    noPlayBtn.style.top = '0px';
}

function moveButtonAway() {
    const noPlayBtn = document.getElementById('noPlayBtn');
    if (!noPlayBtn) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const btnWidth = noPlayBtn.offsetWidth;
    const btnHeight = noPlayBtn.offsetHeight;

    // Calculate safe random position within viewport
    const maxX = viewportWidth - btnWidth - 40;
    const maxY = viewportHeight - btnHeight - 40;

    const randomX = Math.random() * maxX - (viewportWidth / 2) + 20;
    const randomY = Math.random() * maxY - (viewportHeight / 2) + 20;

    // Apply the new position
    noPlayBtn.style.position = 'fixed';
    noPlayBtn.style.left = '50%';
    noPlayBtn.style.top = '50%';
    noPlayBtn.style.transform = `translate(calc(-50% + ${randomX}px), calc(-50% + ${randomY}px))`;
}

// ===== Game Variables =====
let canvas, ctx;
let basket = { x: 0, y: 0, width: 120, height: 60 };
let hearts = [];
let score = 0;
const targetScore = 2;
let gameRunning = false;
let animationId;
let keys = {};

// ===== Game Initialization =====
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize basket position
    basket.x = canvas.width / 2 - basket.width / 2;
    basket.y = canvas.height - basket.height - 20;

    // Reset game state
    score = 0;
    hearts = [];
    gameRunning = true;
    updateLoveMeter();

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Start game loop
    gameLoop();

    // Spawn hearts periodically
    setInterval(() => {
        if (gameRunning && score < targetScore) {
            spawnHeart();
        }
    }, 1200);
}

// ===== Input Handlers =====
function handleKeyDown(e) {
    keys[e.key] = true;
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    basket.x = mouseX - basket.width / 2;
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
}

function handleTouchMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    basket.x = touchX - basket.width / 2;
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
}

// ===== Heart Spawning =====
function spawnHeart() {
    const heart = {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        speed: 6 + Math.random() * 1,
        size: 30 + Math.random() * 10,
        rotation: Math.random() * 360
    };
    hearts.push(heart);
}

// ===== Game Loop =====
function gameLoop() {
    if (!gameRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update basket position with keyboard
    if (keys['ArrowLeft']) {
        basket.x -= 8;
    }
    if (keys['ArrowRight']) {
        basket.x += 8;
    }
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));

    // Draw and update hearts
    for (let i = hearts.length - 1; i >= 0; i--) {
        const heart = hearts[i];
        heart.y += heart.speed;
        heart.rotation += 2;

        // Check collision with basket
        if (heart.y + heart.size >= basket.y &&
            heart.y <= basket.y + basket.height &&
            heart.x + heart.size >= basket.x &&
            heart.x <= basket.x + basket.width) {

            // Heart caught!
            score++;
            updateLoveMeter();
            hearts.splice(i, 1);

            // Show particle effect
            createParticles(heart.x, heart.y);

            // Check win condition
            if (score >= targetScore) {
                winGame();
                return;
            }
            continue;
        }

        // Remove hearts that fell off screen
        if (heart.y > canvas.height) {
            hearts.splice(i, 1);
            continue;
        }

        // Draw heart
        drawHeart(heart);
    }

    // Draw basket
    drawBasket();

    animationId = requestAnimationFrame(gameLoop);
}

// ===== Drawing Functions =====
function drawHeart(heart) {
    ctx.save();
    ctx.translate(heart.x + heart.size / 2, heart.y + heart.size / 2);
    ctx.rotate((heart.rotation * Math.PI) / 180);

    // Draw heart emoji
    ctx.font = `${heart.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💕', 0, 0);

    ctx.restore();
}

function drawBasket() {
    // Basket body (semi-circle)
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(basket.x + basket.width / 2, basket.y + basket.height, basket.width / 2, Math.PI, 0, false);
    ctx.fill();

    // Basket handle
    ctx.strokeStyle = '#be185d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(basket.x + basket.width / 2, basket.y + basket.height / 2, basket.width / 2.5, Math.PI, 0, false);
    ctx.stroke();

    // Basket pattern
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const x = basket.x + (basket.width / 5) * i + basket.width / 10;
        ctx.beginPath();
        ctx.moveTo(x, basket.y + basket.height * 0.3);
        ctx.lineTo(x, basket.y + basket.height);
        ctx.stroke();
    }
}

function createParticles(x, y) {
    // Simple visual feedback
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💖', x, y);
    ctx.restore();
}

// ===== Love Meter =====
function updateLoveMeter() {
    const percentage = (score / targetScore) * 100;
    document.getElementById('loveMeterFill').style.width = percentage + '%';
    document.getElementById('loveMeterText').textContent = `${score} / ${targetScore}`;
}

// ===== Win Game =====
function winGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('touchmove', handleTouchMove);

    // Show gift page after a short delay
    setTimeout(() => {
        showPage('giftPage');
    }, 1000);
}

// ===== Gift Page to Password Page =====
function showPasswordPage() {
    showPage('passwordPage');
    setupPasswordInputs();
}

// ===== Password Input Logic =====
function setupPasswordInputs() {
    const inputs = document.querySelectorAll('.password-input');

    inputs.forEach((input, index) => {
        input.value = '';

        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Only allow numbers
            if (!/^\d$/.test(value)) {
                e.target.value = '';
                return;
            }

            // Move to next input
            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            // Auto-verify when all 6 digits are entered
            if (index === inputs.length - 1 && value) {
                setTimeout(() => {
                    verifyPassword();
                }, 200);
            }
        });

        input.addEventListener('keydown', (e) => {
            // Handle backspace
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').slice(0, 6);

            if (/^\d+$/.test(pasteData)) {
                pasteData.split('').forEach((char, i) => {
                    if (inputs[i]) {
                        inputs[i].value = char;
                    }
                });

                if (pasteData.length === 6) {
                    setTimeout(() => {
                        verifyPassword();
                    }, 200);
                } else if (pasteData.length < 6) {
                    inputs[pasteData.length].focus();
                }
            }
        });
    });

    // Focus first input
    inputs[0].focus();
}

// ===== Verify Password =====
function verifyPassword() {
    const inputs = document.querySelectorAll('.password-input');
    const password = Array.from(inputs).map(input => input.value).join('');
    const correctPassword = '251025';

    const errorMessage = document.getElementById('errorMessage');
    const passwordCard = document.querySelector('.password-card');

    if (password.length !== 6) {
        return; // Don't verify if not all digits are entered
    }

    if (password === correctPassword) {
        errorMessage.textContent = '✓ ถูกต้อง!';
        errorMessage.style.color = '#10b981';

        // Show cards page
        setTimeout(() => {
            showPage('cardsPage');
        }, 800);
    } else {
        // Show error
        errorMessage.textContent = '✗ รหัสผ่านไม่ถูกต้อง';
        errorMessage.style.color = '#db2777';

        // Add shake animation
        passwordCard.style.animation = 'shake 0.5s';

        // Clear inputs after shake
        setTimeout(() => {
            inputs.forEach(input => {
                input.value = '';
                input.style.borderColor = '#f9a8d4';
            });
            inputs[0].focus();
            errorMessage.textContent = '';
            passwordCard.style.animation = '';
        }, 600);

        // Flash inputs red
        inputs.forEach(input => {
            input.style.borderColor = '#db2777';
        });
    }
}

// ===== Card Content Data =====
const cardContents = [
    {
        icon: '🍒',
        title: 'เราดับกันมานาน เท่าให้รันลิ้วนะ',
        content: `
            <p>เวลาที่เราอยู่ด้วยกันทำให้ทุกวันมีความสุข และทุกช่วงเวลาล้วนมีค่าสำหรับเรา</p>
            
            <h4>ความทรงจำที่สวยงาม:</h4>
            <ul>
                <li>วันแรกที่เราพบกัน เหมือนเวทมนตร์ที่ทำให้ชีวิตสดใส</li>
                <li>ทุกครั้งที่เรายิ้มให้กัน หัวใจก็เต้นแรงขึ้น</li>
                <li>การเดินเคียงข้างกันในทุกย่างก้าว</li>
                <li>ทุกคำพูดที่เราแบ่งปันกัน</li>
            </ul>
            
            <p style="margin-top: 20px; font-weight: 600; color: #ec4899;">
                และเราจะสร้างความทรงจำดีๆ ต่อไปอีกมากมายในอนาคต 💕
            </p>
        `
    },
    {
        icon: '🐰',
        title: 'จุดหมาย ถึงตอนนำรัก',
        content: `
            <p>เธอคือจุดหมายปลายทางของหัวใจฉัน คนที่ทำให้ทุกวันมีความหมาย</p>
            
            <h4>สิ่งที่ฉันรักในตัวเธอ:</h4>
            <ul>
                <li>รอยยิ้มที่ทำให้โลกสดใสขึ้นทันที</li>
                <li>ความเข้าใจที่มีให้กันเสมอ</li>
                <li>การดูแลเอาใจใส่ในทุกรายละเอียด</li>
                <li>ความอ่อนโยนและใจดีที่มีให้</li>
                <li>ทุกสิ่งที่ทำให้เธอเป็นเธอ</li>
            </ul>
            
            <p style="margin-top: 20px; font-weight: 600; color: #ec4899;">
                เธอคือของขวัญที่ดีที่สุดที่ชีวิตมอบให้ฉัน 🐰💖
            </p>
        `
    },
    {
        icon: '🧁',
        title: 'เรารู้ใจกัน มากแต่ไหน',
        type: 'quiz',
        quiz: {
            questions: [
                {
                    question: 'เจอกันครั้งแรกที่ไหน',
                    options: ['คอนเสิร์ต', 'คอนเฟลก', 'คอนโดเดอะไว้ลาย', 'คอนโดเดอะไลน์ไวบ์'],
                    correct: 3
                },
                {
                    question: 'หนังที่ดูด้วยกันเรื่องแรก',
                    options: ['ซูซูซูปาโนว่า', 'ซูเปอร์แมน', 'ซูโทเปีย', 'ซูลูปาก้า ตาปาเฮ้'],
                    correct: 2
                },
                {
                    question: 'วันที่รู้จักกันครั้งแรก',
                    options: ['วันเพ็ญเดือนสิบสอง', 'วันที่ 30 ยังแจ๋ว', 'วันที่ 30 ก.ย.15 มิ้ลกี้โลชั่นทากันยุง', 'วันที่ 30 ก.ค'],
                    correct: 3
                },
                {
                    question: 'วันที่จดทะเบียนกัน',
                    options: ['วันๆเอาแต่คิดถึงเธอ', 'วัน ทูว ทรี โฟร์ ไฟฟ์ ไอเลิฟยู', 'วันศุกร์ที่ 30 มกราคม', 'วันนี้รวย 99 สาธุ'],
                    correct: 2
                },
                {
                    question: 'ร้านแรกที่ไปกินด้วยกัน2คน',
                    options: ['กับแกล้ม', 'กับข้าวกับปลา', 'กับคนรู้ใจ', 'กับระเบิด'],
                    correct: 1
                }
            ]
        }
    },
    {
        icon: '📷',
        title: 'ความทรงจำ',
        type: 'memory',
        content: '' // Will be generated dynamically
    }
];


// Quiz state
let currentQuizQuestion = 0;
let quizScore = 0;

// ===== Open Card - Navigate to Page =====
function openCard(cardIndex) {
    const content = cardContents[cardIndex];

    // Handle different card types
    if (content.type === 'quiz') {
        // Reset quiz state and render quiz in the page
        currentQuizQuestion = 0;
        quizScore = 0;
        renderQuizInPage(content.quiz);
    } else if (content.type === 'memory') {
        renderMemoryInPage();
    }

    // Navigate to the card page
    showPage(`card${cardIndex}Page`);
}

// ===== Back to Cards =====
function backToCards() {
    showPage('cardsPage');
}

// ===== Render Quiz in Page =====
function renderQuizInPage(quizData) {
    const question = quizData.questions[currentQuizQuestion];
    const totalQuestions = quizData.questions.length;

    const quizHTML = `
        <div class="quiz-container">
            <div class="quiz-progress">ข้อ ${currentQuizQuestion + 1}/${totalQuestions}</div>
            
            <div class="quiz-question-box">
                <h3 class="quiz-question">${question.question}</h3>
                
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" onclick="selectQuizAnswerInPage(${index})">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div id="quizFeedback" class="quiz-feedback"></div>
        </div>
    `;

    document.getElementById('quizContent').innerHTML = quizHTML;
}

// ===== Select Quiz Answer in Page =====
function selectQuizAnswerInPage(selectedIndex) {
    const content = cardContents[2]; // Quiz card
    const question = content.quiz.questions[currentQuizQuestion];
    const isCorrect = selectedIndex === question.correct;

    if (isCorrect) {
        quizScore++;
    }

    // Show feedback
    const feedback = document.getElementById('quizFeedback');
    feedback.innerHTML = isCorrect
        ? '<span style="color: #10b981;">✓ ถูกต้อง!</span>'
        : '<span style="color: #db2777;">✗ ไม่ถูกต้อง</span>';

    // Disable buttons
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((btn, index) => {
        btn.disabled = true;
        if (index === question.correct) {
            btn.style.background = 'linear-gradient(135deg, #86efac, #10b981)';
            btn.style.borderColor = '#10b981';
        } else if (index === selectedIndex && !isCorrect) {
            btn.style.background = 'linear-gradient(135deg, #fca5a5, #dc2626)';
            btn.style.borderColor = '#dc2626';
        }
    });

    // Show next button or result
    setTimeout(() => {
        if (currentQuizQuestion < content.quiz.questions.length - 1) {
            currentQuizQuestion++;
            renderQuizInPage(content.quiz);
        } else {
            showQuizResultInPage();
        }
    }, 1500);
}

// ===== Show Quiz Result in Page =====
function showQuizResultInPage() {
    const totalQuestions = cardContents[2].quiz.questions.length;
    const percentage = (quizScore / totalQuestions) * 100;

    let resultMessage = '';
    let resultEmoji = '';

    if (percentage === 100) {
        resultMessage = 'สุดยอด! เธอรู้จักฉันดีมาก 💕';
        resultEmoji = '🎉';
    } else if (percentage >= 60) {
        resultMessage = 'ดีมาก! เธอเข้าใจฉันดีเลย 😊';
        resultEmoji = '💖';
    } else {
        resultMessage = 'ไม่เป็นไร เราจะรู้จักกันมากขึ้นเรื่อยๆ 💕';
        resultEmoji = '🤗';
    }

    const resultHTML = `
        <div class="quiz-result">
            <div class="quiz-result-emoji">${resultEmoji}</div>
            <h3>คะแนนของคุณ</h3>
            <div class="quiz-score">${quizScore}/${totalQuestions}</div>
            <p class="quiz-result-message">${resultMessage}</p>
            <button class="btn-quiz-retry" onclick="retryQuizInPage()">ทำแบบทดสอบอีกครั้ง</button>
        </div>
    `;

    document.getElementById('quizContent').innerHTML = resultHTML;
}

// ===== Retry Quiz in Page =====
function retryQuizInPage() {
    currentQuizQuestion = 0;
    quizScore = 0;
    renderQuizInPage(cardContents[2].quiz);
}

// ===== Render Memory in Page =====
function renderMemoryInPage() {
    const memoryHTML = `
        <div class="memory-story-card">
            <div class="memory-story-content">
                <p class="story-paragraph">เราเจอกันในโลกออนไลน์
                เค้าไม่เคยคิดมาก่อนเลยว่า
                คนคนหนึ่งที่อยู่แค่ในหน้าจอ
                จะเข้ามามีบทบาทในชีวิตจริงของเค้า
                ได้มากขนาดนี้</p>

                <p class="story-paragraph">เค้าขอบคุณโชคชะตา
                พรหมลิขิต หรืออะไรก็ตาม
                ที่ทำให้เราปัดขวาเจอกันในวันนั้น
                มันเป็นจุดเริ่มต้นเล็ก ๆ
                ที่พาเราเข้ามารู้จักกัน</p>

                <div class="story-image-container">
                    <img src="img/tinder.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">และเค้ายังจำได้ดีเลย…
                ว่าเธอเป็นคน
                Super Like เค้าด้วยนะ 😊</p>

                <p class="story-paragraph">เราคุยกันไปสักพัก
                เค้าก็หอบผ้าหอบผ่อนไปหาเธอ
                แบบไม่ลังเลเลย
                ทั้งที่ยังไม่เคยเจอกันจริง ๆ มาก่อน</p>

                <div class="story-image-container">
                    <img src="img/01.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">แต่เค้ากลับไม่รู้สึกกลัวเลยสักนิด
                เพราะตั้งแต่ได้รู้จักเธอ
                ได้คุยกับเธอ
                เค้ารู้สึกสบายใจมาก ๆ</p>

                <p class="story-paragraph">เราคุยกันผ่านจอมาตลอด
                และในที่สุด…
                วันที่จะได้เจอกันจริง ๆ ก็มาถึง
                เค้าตื่นเต้นมากเลยนะ</p>

                <p class="story-paragraph">วันนั้นมีอุปสรรคเต็มไปหมด
                ประชุมเลิกดึก
                ฝนตก
                รถติด</p>

                <p class="story-paragraph">แผนที่วางไว้
                ต้องเปลี่ยนแทบทั้งหมด ฮ่า ๆ
                แต่สุดท้ายเราก็ได้เจอกัน</p>

                <p class="story-paragraph">ได้กอดแรก
                ได้จูบแรก</p>

                <p class="story-paragraph">มันทำให้เค้ารู้สึกว่า
                ทุกอย่างที่ผ่านมามันคุ้มค่ามาก
                การได้เจอเธอในวันนั้น
                กลายเป็นหนึ่งใน
                ความทรงจำที่ดีที่สุดของเค้า</p>

                <p class="story-paragraph">หลังจากเจอกันครั้งแรก
                อีเวนต์ก็ถาโถมเข้ามาไม่หยุดเลย
                เรายังได้ไปร้านเหล้าต่อด้วยกัน</p>

                <div class="story-image-container">
                    <img src="img/02.jpg" alt="Memory Photo 1" class="story-image">
                </div>

                <p class="story-paragraph">และมันยิ่งพิเศษเข้าไปอีก
                เพราะเค้าได้อยู่ข้ามคืน
                ในวันเกิดของเธอ
                ได้อวยพรวันเกิดเธอต่อหน้า
                ได้กระซิบข้างหูว่า
                เค้ารักเธอ</p>

                <p class="story-paragraph">วันนั้นเป็นครั้งแรก
                ที่เค้าเมามาก ๆ
                ทิ้งตัวสุด ๆ</p>

                <p class="story-paragraph">แต่เธอก็ดูแลเค้าดีมาก
                ตั้งแต่วันแรกที่เราเจอกัน
                ทั้งเก็บอ้วก
                พากลับบ้าน
                พาไปนอน</p>

                <p class="story-paragraph">ตื่นเช้ามา
                ก็มีข้าวให้กินแล้ว
                มันเป็นอะไรที่
                น่าประทับใจมากจริง ๆ</p>

                <p class="story-paragraph">และตั้งแต่วันนั้นมา
                เค้าก็รู้เลยว่า
                การได้เจอเธอ…
                ไม่ใช่เรื่องบังเอิญธรรมดา ๆ 🤍</p>

                <p class="story-paragraph">หลังจากนั้น
                เราได้ไปฉลองวันเกิดเธอ
                กับเพื่อน ๆ ของเธอ
                ได้กินอาหารอร่อย ๆ</p>

                <p class="story-paragraph">แล้วก็ได้ถ่ายรูปคู่ด้วยกัน
                แบบจริงจังครั้งแรก
                เค้าเขินมากเลยนะ
                เขินจนทำตัวไม่ถูก</p>

                <div class="story-image-container">
                    <img src="img/03.jpg" alt="Memory Photo 1" class="story-image">
                </div>

                <p class="story-paragraph">อีกอย่างหนึ่ง
                ที่ทำให้เค้าหลงเธอเข้าไปอีก
                คือฝีมือการทำอาหารของเธอ</p>

                <p class="story-paragraph">เธอเป็นคนที่ทำกับข้าวอร่อยมาก
                มีทั้งฝีมือ
                และเสน่ห์ปลายจวัก</p>

                <div class="story-image-container">
                    <img src="img/04.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">เมนูใหม่ ๆ
                เธอก็ทำออกมาได้ดีเสมอ
                โดยเฉพาะ
                ข้าวผัดปลาแซลมอน
                เค้าชอบมากเลย</p>

                <p class="story-paragraph">หรือจะเป็นเมนูที่เธอถนัด
                อย่างหม่าล่า
                เธอทำอร่อยมาก</p>

                <p class="story-paragraph">และถึงเค้าจะชอบกินหม่าล่า
                แต่ที่ชอบมากกว่า คือ…
                คนทำ 💕</p>

                <p class="story-paragraph">นอกจากจะเป็นนักทำอาหาร
                เธอยังเป็นนักช้อปตัวยงอีกด้วย</p>

                <p class="story-paragraph">ทุกครั้งที่เธอไปช้อปปิ้ง
                เธอมักจะซื้อของมาให้เค้าตลอดเลย
                ทั้งขนม ของใช้</p>

                <div class="story-image-container">
                    <img src="img/tops.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">อีกสิ่งหนึ่ง
                ที่เค้ารู้สึกว่าน่ารักมาก
                คือทุกครั้งที่เธอมาหาเค้า
                เธอจะมีของติดไม้ติดมือมาให้
                ทุกครั้งเลย</p>

                <p class="story-paragraph">ครั้งแรก
                เป็นตุ๊กตาอองฟอง
                กับของกิน ชาเอยใด</p>

                <p class="story-paragraph">ครั้งที่สอง…
                เหมือนจะรักเค้ามากขึ้น ถึงขั้นซื้อแหวน
                มาจองเค้าเลย</p>

                <div class="story-image-container">
                    <img src="img/ring.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">และเค้าก็ใส่มัน
                มาจนถึงทุกวันนี้
                นอกจากจะใส่แล้วหล่อ
                มันยังทำให้เค้ารู้สึกอบอุ่น
                เหมือนมีเธออยู่ข้าง ๆ
                เหมือนบอกกับตัวเองว่า
                “มีเจ้าของแล้วนะ”</p>

                <p class="story-paragraph">อีกของขวัญ
                ที่เค้าชอบมาก
                คือกระเป๋าโน้ตบุ๊ก

                มันถูกใจโปรแกรมเมอร์
                อย่างเค้ามากจริง ๆ
                ใช้ทุกวัน ใช้ได้จริง</p>

                <div class="story-image-container">
                    <img src="img/bag.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">และทุกครั้งที่ใช้
                เค้าก็นึกถึงเธอเสมอ</p>

                <p class="story-paragraph">ช่วงที่เธออยู่เชียงราย
                เค้าคิดถึงเธอมาก ๆ เลยนะ</p>

                <p class="story-paragraph">ถึงเราจะอยู่ไกลกัน
                แต่เธอก็ทำให้เค้ารู้สึกว่า
                เราอยู่ใกล้กันตลอดเวลา</p>

                <p class="story-paragraph">เธอส่งข้าว
                ส่งอาหารมาให้เค้ากินตลอด
                ทั้งคาว ทั้งหวาน
                ไม่เคยขาด</p>

                <div class="story-image-container">
                    <img src="img/sweet.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">ดูแลเค้า
                แม้จะอยู่ไกลกัน
                เธอดูแลเค้าดีขนาดนี้
                เค้าจะไม่รักเธอได้ยังไงไหว</p>

                <p class="story-paragraph">เธอเปลี่ยนเค้าหลายอย่างมาก
                ทำให้เค้าใจเย็นลง
                เป็นผู้ใหญ่มากขึ้น
                รู้จักวางแผนอนาคตมากขึ้น</p>

                <div class="story-image-container">
                    <img src="img/05.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">แถมยังพาเค้า
                เข้าวัด ทำบุญ
                ซึ่งมันทำให้เค้ารู้สึกดี
                ไปอีกแบบ</p>

                <div class="story-image-container">
                    <img src="img/temple.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">เธอยังพาเค้า
                ไปทำกิจกรรมใหม่ ๆ
                ทั้งทำเค้ก
                จัดดอกไม้
                ไปคอนเสิร์ต</p>

                <div class="story-image-container">
                    <img src="img/06.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">อะไรที่คู่รักเขาทำกัน
                เค้าไม่เคยทำมาก่อนเลย
                แต่พอได้ทำกับเธอ
                มันทั้งสนุก
                ทั้งมีความสุขมากจริง ๆ</p>

                <p class="story-paragraph">ขอบคุณนะ…
                My new journey 🤍</p>

                <p class="story-paragraph">อีกอย่างหนึ่ง
                ที่ทำให้เค้ารู้สึกดีมาก
                คือครอบครัวของเรา
                เข้ากันได้ดี</p>

                <p class="story-paragraph">ทุกอย่างดูลงตัวดูใช่
                และดูราบรื่นไปหมด เค้าชอบที่เราเข้ากันได้ทุกเรื่อง
                คุยกันได้ทุกอย่าง วัยเดียวกัน คุยภาษาเดียวกัน</p>

                <div class="story-image-container">
                    <img src="img/star.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">จนกระทั่งปีใหม่นี้
                เราตัดสินใจ
                จะสร้างอนาคตร่วมกันจริง ๆ
                เริ่มต้นจาก
                การจดทะเบียนสมรสด้วยกัน</p>

                <div class="story-image-container">
                    <img src="img/married.jpg" alt="Memory Photo 2" class="story-image">
                </div>

                <p class="story-paragraph">ตอนนี้
                เรากำลังสร้างครอบครัว
                ด้วยกันแล้วนะคะ
                เริ่มจากคอนโด</p>

                <p class="story-paragraph">เค้าเชื่อว่า
                ทุกอย่างจะผ่านไปได้ด้วยดี
                ปีนี้จะเป็นปีของเรา
                เราจะสู้ไปด้วยกัน
                สร้างไปด้วยกันนะ</p>

                <p class="story-paragraph">ความทรงจำ
                ที่เค้ามีต่อเธอ
                มันเยอะมากจริง ๆ</p>

                <p class="story-paragraph">ทุกตัวอักษร
                ที่เขียนมาทั้งหมด
                ออกมาจาก
                ความรู้สึก
                และความทรงจำของเค้า
                จริง ๆ</p>

                <div class="story-conclusion">
                    <p>วาเลนไทน์ปีนี้
                    มาร่วมสร้าง
                    ความทรงจำดี ๆ
                    ไปด้วยกันเรื่อย ๆ
                    และตลอดไปเลยนะ</p>
                    <p>เค้ารักเธอนะคะ
                    คนดีของเค้า 🤍</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('memoryContent').innerHTML = memoryHTML;
}

// ===== Render Quiz =====
function renderQuiz(quizData) {
    const question = quizData.questions[currentQuizQuestion];
    const totalQuestions = quizData.questions.length;

    const quizHTML = `
        <div class="quiz-container">
            <div class="quiz-progress">ข้อ ${currentQuizQuestion + 1}/${totalQuestions}</div>
            
            <div class="quiz-question-box">
                <h3 class="quiz-question">${question.question}</h3>
                
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" onclick="selectQuizAnswer(${index})">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div id="quizFeedback" class="quiz-feedback"></div>
        </div>
    `;

    document.getElementById('modalBody').innerHTML = quizHTML;
}

// ===== Select Quiz Answer =====
function selectQuizAnswer(selectedIndex) {
    const content = cardContents[2]; // Quiz card
    const question = content.quiz.questions[currentQuizQuestion];
    const isCorrect = selectedIndex === question.correct;

    if (isCorrect) {
        quizScore++;
    }

    // Show feedback
    const feedback = document.getElementById('quizFeedback');
    feedback.innerHTML = isCorrect
        ? '<span style="color: #10b981;">✓ ถูกต้อง!</span>'
        : '<span style="color: #db2777;">✗ ไม่ถูกต้อง</span>';

    // Disable buttons
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((btn, index) => {
        btn.disabled = true;
        if (index === question.correct) {
            btn.style.background = 'linear-gradient(135deg, #86efac, #10b981)';
            btn.style.borderColor = '#10b981';
        } else if (index === selectedIndex && !isCorrect) {
            btn.style.background = 'linear-gradient(135deg, #fca5a5, #dc2626)';
            btn.style.borderColor = '#dc2626';
        }
    });

    // Show next button or result
    setTimeout(() => {
        if (currentQuizQuestion < content.quiz.questions.length - 1) {
            currentQuizQuestion++;
            renderQuiz(content.quiz);
        } else {
            showQuizResult();
        }
    }, 1500);
}

// ===== Show Quiz Result =====
function showQuizResult() {
    const totalQuestions = cardContents[2].quiz.questions.length;
    const percentage = (quizScore / totalQuestions) * 100;

    let resultMessage = '';
    let resultEmoji = '';

    if (percentage === 100) {
        resultMessage = 'สุดยอด! เธอรู้จักฉันดีมาก 💕';
        resultEmoji = '🎉';
    } else if (percentage >= 60) {
        resultMessage = 'ดีมาก! เธอเข้าใจฉันดีเลย 😊';
        resultEmoji = '💖';
    } else {
        resultMessage = 'ไม่เป็นไร เราจะรู้จักกันมากขึ้นเรื่อยๆ 💕';
        resultEmoji = '🤗';
    }

    const resultHTML = `
        <div class="quiz-result">
            <div class="quiz-result-emoji">${resultEmoji}</div>
            <h3>คะแนนของคุณ</h3>
            <div class="quiz-score">${quizScore}/${totalQuestions}</div>
            <p class="quiz-result-message">${resultMessage}</p>
            <button class="btn-quiz-retry" onclick="retryQuiz()">ทำแบบทดสอบอีกครั้ง</button>
        </div>
    `;

    document.getElementById('modalBody').innerHTML = resultHTML;
}

// ===== Retry Quiz =====
function retryQuiz() {
    currentQuizQuestion = 0;
    quizScore = 0;
    renderQuiz(cardContents[2].quiz);
}

// ===== Render Memory Card =====
function renderMemory() {
    const memoryHTML = `
        <div class="memory-container">
            <div class="memory-item">
                <div class="memory-image" style="background: linear-gradient(135deg, #67e8f9, #0891b2);">
                    <div class="memory-placeholder">🌊</div>
                </div>
                <div class="memory-text">
                    <h4>เย็นวันนั้น ที่เราเนื่องด้วยด้วยกัน</h4>
                    <p>ท่องฟ้าใกล้ผิด แต่บรรยากาศดินฐานมาก แต่ได้ใช้เท้าท่าพลาสติก ธรรมดามาก ข้างเธอ มองนา ไม่ประตินเหนื่อติ้ม และเมื่องเชียทุกๆ ตรงหน้า มันกลายเป็นหนึ่งในความทรงจำที่เรารอบที่สุดเลย</p>
                </div>
            </div>
            
            <div class="memory-item">
                <div class="memory-image" style="background: linear-gradient(135deg, #a78bfa, #7c3aed);">
                    <div class="memory-placeholder">🚴</div>
                </div>
                <div class="memory-text">
                    <h4>ปั่นจักรยานในส่วนด้วยกัน</h4>
                    <p>วันท้องกาศดี ลมเย็น พวกเดินล็อกปีป๊าาๆ เราคอยเธอข้างหลัง ดำหนดึง รู้สึกปลอดภัยและมีความสุขมาก ไม่มีที่เที่ยวหรู ไม่มื่อใร้ หีช่องจานเป็นมันใั้นเวลานี้สุดเลย</p>
                </div>
            </div>
            
            <div class="memory-item">
                <div class="memory-image" style="background: linear-gradient(135deg, #fbbf24, #f59e0b);">
                    <div class="memory-placeholder">⭐</div>
                </div>
                <div class="memory-text">
                    <h4>เอ็นเล่นรื่ขายเอลแบบไม่ต้องรู้บ</h4>
                    <p>เราดอยตามตีแล้คเอแว่แต๋งส้างกันไม่เรื่อยๆ ลมขายเลฉิงๆ ทับใช้ใจคบาย นนอจขยธรรมดา แต่เวื่ายจเครงตรงหน้าและอะคม ท่าให้งานนี้นเป็นงานที่เรียยง้ายแต๋งใด้เลยมาก</p>
                </div>
            </div>
            
            <div class="memory-footer">
                <p style="font-size: 1.3rem; font-weight: 700; color: #ec4899; margin-top: 20px;">
                    ความทรงจำ<br>
                    ที่จรักมากจากจา
                </p>
                <button class="btn-close-memory" onclick="closeCardModal()">ปิด</button>
            </div>
        </div>
    `;

    document.getElementById('modalBody').innerHTML = memoryHTML;
}

// ===== Close Card Modal =====
function closeCardModal() {
    const modal = document.getElementById('cardModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('cardModal');
    if (e.target === modal) {
        closeCardModal();
    }
});

// ===== Handle Window Resize for Canvas =====
window.addEventListener('resize', () => {
    if (gameRunning && canvas) {
        const oldWidth = canvas.width;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Adjust basket position proportionally
        basket.x = (basket.x / oldWidth) * canvas.width;
        basket.y = canvas.height - basket.height - 20;
    }
});

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', () => {
    // Show landing page first
    showPage('landingPage');

    // Initialize no-play button
    initNoPlayButton();
});
