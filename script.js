// DOMの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Manato App initialized');

    // デモボタンの機能
    const demoButton = document.getElementById('demoButton');
    const demoOutput = document.getElementById('demoOutput');
    let clickCount = 0;

    if (demoButton && demoOutput) {
        demoButton.addEventListener('click', function() {
            clickCount++;

            const messages = [
                '素晴らしい！',
                'いい感じです！',
                '完璧です！',
                'やりましたね！',
                '最高です！'
            ];

            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            demoOutput.textContent = `${randomMessage} (クリック回数: ${clickCount})`;

            // アニメーション効果
            demoOutput.style.opacity = '0';
            setTimeout(() => {
                demoOutput.style.transition = 'opacity 0.3s';
                demoOutput.style.opacity = '1';
            }, 50);
        });
    }

    // ここに追加の機能を実装できます
    console.log('Demo button initialized');
});

// グローバルに使用できるユーティリティ関数
const ManatoApp = {
    // 将来の機能拡張のためのプレースホルダー
    version: '1.0.0',

    // メッセージを表示する汎用関数
    showMessage: function(message, elementId = 'demoOutput') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
        }
    },

    // ログを出力する関数
    log: function(message) {
        console.log(`[Manato App] ${message}`);
    }
};

// アプリケーションのバージョンをコンソールに出力
ManatoApp.log(`Version ${ManatoApp.version} loaded successfully`);

// ブロック崩しゲーム
class BreakoutGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // ゲーム状態
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;

        // パドル
        this.paddleHeight = 10;
        this.paddleWidth = 75;
        this.paddleX = (this.width - this.paddleWidth) / 2;
        this.paddleSpeed = 7;

        // ボール
        this.ballRadius = 8;
        this.ballX = this.width / 2;
        this.ballY = this.height - 30;
        this.ballDX = 3;
        this.ballDY = -3;

        // ブロック
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickWidth = 50;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.brickOffsetTop = 30;
        this.brickOffsetLeft = 30;
        this.bricks = [];

        // 操作
        this.rightPressed = false;
        this.leftPressed = false;
        this.mouseX = 0;

        this.initBricks();
        this.setupControls();
        this.setupEventListeners();
    }

    initBricks() {
        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = {
                    x: 0,
                    y: 0,
                    status: 1,
                    color: this.getBrickColor(r)
                };
            }
        }
    }

    getBrickColor(row) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
        return colors[row % colors.length];
    }

    setupControls() {
        const startButton = document.getElementById('startButton');
        const pauseButton = document.getElementById('pauseButton');
        const resetButton = document.getElementById('resetButton');

        if (startButton) {
            startButton.addEventListener('click', () => this.start());
        }
        if (pauseButton) {
            pauseButton.addEventListener('click', () => this.togglePause());
        }
        if (resetButton) {
            resetButton.addEventListener('click', () => this.reset());
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                this.rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                this.leftPressed = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                this.rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                this.leftPressed = false;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddleX, this.height - this.paddleHeight - 10, this.paddleWidth, this.paddleHeight);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;

                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = this.bricks[c][r].color;
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#FFFFFF';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        }
    }

    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                    if (this.ballX > b.x &&
                        this.ballX < b.x + this.brickWidth &&
                        this.ballY > b.y &&
                        this.ballY < b.y + this.brickHeight) {
                        this.ballDY = -this.ballDY;
                        b.status = 0;
                        this.score += 10;
                        this.updateScore();

                        // すべてのブロックが壊れたらレベルアップ
                        if (this.checkLevelComplete()) {
                            this.levelUp();
                        }
                    }
                }
            }
        }
    }

    checkLevelComplete() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    return false;
                }
            }
        }
        return true;
    }

    levelUp() {
        this.level++;
        this.ballDX *= 1.1;
        this.ballDY *= 1.1;
        this.initBricks();
        this.resetBall();
        this.updateLevel();
    }

    resetBall() {
        this.ballX = this.width / 2;
        this.ballY = this.height - 30;
        this.ballDX = (this.ballDX > 0 ? 1 : -1) * (3 + this.level * 0.5);
        this.ballDY = -Math.abs(this.ballDY);
    }

    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    updateLives() {
        const livesElement = document.getElementById('lives');
        if (livesElement) {
            livesElement.textContent = this.lives;
        }
    }

    updateLevel() {
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }

    movePaddle() {
        if (this.rightPressed && this.paddleX < this.width - this.paddleWidth) {
            this.paddleX += this.paddleSpeed;
        } else if (this.leftPressed && this.paddleX > 0) {
            this.paddleX -= this.paddleSpeed;
        }

        // マウス操作
        if (this.mouseX > 0) {
            const targetX = this.mouseX - this.paddleWidth / 2;
            if (targetX >= 0 && targetX <= this.width - this.paddleWidth) {
                this.paddleX = targetX;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        this.collisionDetection();

        // 壁との衝突
        if (this.ballX + this.ballDX > this.width - this.ballRadius || this.ballX + this.ballDX < this.ballRadius) {
            this.ballDX = -this.ballDX;
        }
        if (this.ballY + this.ballDY < this.ballRadius) {
            this.ballDY = -this.ballDY;
        } else if (this.ballY + this.ballDY > this.height - this.ballRadius) {
            // パドルとの衝突判定
            if (this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleWidth) {
                this.ballDY = -this.ballDY;
                // パドルのどこに当たったかで角度を変える
                const hitPos = (this.ballX - this.paddleX) / this.paddleWidth;
                this.ballDX = (hitPos - 0.5) * 8;
            } else {
                // ボールを落とした
                this.lives--;
                this.updateLives();
                if (this.lives === 0) {
                    this.gameOver();
                    return;
                } else {
                    this.resetBall();
                }
            }
        }

        this.ballX += this.ballDX;
        this.ballY += this.ballDY;
        this.movePaddle();

        if (this.isRunning && !this.isPaused) {
            requestAnimationFrame(() => this.draw());
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.draw();
            ManatoApp.log('Game started');
        }
    }

    togglePause() {
        if (this.isRunning) {
            this.isPaused = !this.isPaused;
            if (!this.isPaused) {
                this.draw();
            }
            ManatoApp.log(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paddleX = (this.width - this.paddleWidth) / 2;
        this.ballDX = 3;
        this.ballDY = -3;
        this.resetBall();
        this.initBricks();
        this.updateScore();
        this.updateLives();
        this.updateLevel();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        ManatoApp.log('Game reset');
    }

    gameOver() {
        this.isRunning = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`スコア: ${this.score}`, this.width / 2, this.height / 2 + 40);
        ManatoApp.log('Game over');
    }
}

// ゲームの初期化
document.addEventListener('DOMContentLoaded', function() {
    const game = new BreakoutGame('breakoutCanvas');
    window.breakoutGame = game;
    ManatoApp.log('Breakout game initialized');
});
