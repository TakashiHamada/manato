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

        // タッチ操作のサポート（モバイル対応）
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
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

// 射的ゲーム
class ShootingGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Shooting game canvas not found:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        console.log('Shooting game canvas size:', this.width, 'x', this.height);

        // ゲーム状態
        this.isRunning = false;
        this.score = 0;
        this.bullets = 10;
        this.totalTargets = 5;
        this.targetsRemaining = 5;

        // 的のリスト
        this.targets = [];

        // 弾のリスト
        this.activeBullets = [];

        this.initTargets();
        this.setupControls();
        this.setupEventListeners();
        console.log('Initial targets:', this.targets.length);
        this.draw();
    }

    initTargets() {
        this.targets = [];
        // 画面サイズに応じて的のサイズと距離を調整
        const targetSize = Math.min(50, this.width / 10);
        const minDistance = Math.min(100, this.width / 5);

        // 的を5個ランダムに配置（まばらに）
        for (let i = 0; i < this.totalTargets; i++) {
            let validPosition = false;
            let x, y;
            let attempts = 0;

            while (!validPosition && attempts < 100) {
                // 上半分のエリアにランダムに配置
                const margin = targetSize;
                const maxX = this.width - margin;
                const maxY = this.height / 2 - margin;

                if (maxX <= margin || maxY <= margin) {
                    // 画面が小さすぎる場合、中央に配置
                    x = this.width / 2;
                    y = this.height / 4;
                } else {
                    x = Math.random() * (maxX - margin) + margin;
                    y = Math.random() * (maxY - margin) + margin;
                }

                // 他の的との距離をチェック
                validPosition = true;
                for (let j = 0; j < this.targets.length; j++) {
                    const dx = x - this.targets[j].x;
                    const dy = y - this.targets[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }

                // 100回試行しても配置できない場合は、距離制限を無視
                if (attempts >= 99) {
                    validPosition = true;
                }

                attempts++;
            }

            // 的を追加
            this.targets.push({
                x: x,
                y: y,
                width: targetSize,
                height: targetSize,
                isHit: false,
                fallAngle: 0,
                fallSpeed: 0,
                isFalling: false
            });
        }
    }

    setupControls() {
        const startButton = document.getElementById('shootingStartButton');
        const resetButton = document.getElementById('shootingResetButton');

        if (startButton) {
            startButton.addEventListener('click', () => this.start());
        }
        if (resetButton) {
            resetButton.addEventListener('click', () => this.reset());
        }
    }

    setupEventListeners() {
        // クリックイベント
        this.canvas.addEventListener('click', (e) => {
            if (this.isRunning) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.shoot(x, y);
            }
        });

        // タッチイベント（モバイル対応）
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.isRunning) {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.shoot(x, y);
            }
        });
    }

    shoot(targetX, targetY) {
        if (this.bullets <= 0) {
            return;
        }

        this.bullets--;
        this.updateBullets();

        // 画面下部から弾を発射
        const startX = this.width / 2;
        const startY = this.height - 20;

        // 目標地点への方向を計算
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 正規化して速度を設定
        const speed = 15;
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;

        this.activeBullets.push({
            x: startX,
            y: startY,
            vx: vx,
            vy: vy,
            radius: 5
        });
    }

    updateBullets() {
        const bulletsElement = document.getElementById('shootingBullets');
        if (bulletsElement) {
            bulletsElement.textContent = this.bullets;
        }
    }

    updateScore() {
        const scoreElement = document.getElementById('shootingScore');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    updateTargets() {
        const targetsElement = document.getElementById('shootingTargets');
        if (targetsElement) {
            targetsElement.textContent = this.targetsRemaining;
        }
    }

    drawGun() {
        // 画面下部に銃を表示
        const gunX = this.width / 2;
        const gunY = this.height - 10;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(gunX - 15, gunY - 30, 30, 30);
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(gunX - 5, gunY - 50, 10, 25);
    }

    drawTargets() {
        for (let i = 0; i < this.targets.length; i++) {
            const target = this.targets[i];
            const fontSize = Math.floor(target.width * 0.4);
            const padding = target.width * 0.2;

            if (target.isHit) {
                // 倒れるアニメーション
                if (target.isFalling) {
                    target.fallAngle += target.fallSpeed;
                    target.fallSpeed += 0.5; // 重力的な加速

                    if (target.fallAngle >= 90) {
                        target.fallAngle = 90;
                        target.isFalling = false;
                    }
                }

                this.ctx.save();
                this.ctx.translate(target.x + target.width / 2, target.y + target.height);
                this.ctx.rotate((target.fallAngle * Math.PI) / 180);
                this.ctx.translate(-(target.x + target.width / 2), -(target.y + target.height));

                // 的を描画（景品風）
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(target.x, target.y, target.width, target.height);
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.fillRect(target.x + padding, target.y + padding, target.width - padding * 2, target.height - padding * 2);
                this.ctx.fillStyle = '#333';
                this.ctx.font = `${fontSize}px Arial`;
                this.ctx.fillText('景品', target.x + padding / 2, target.y + target.height / 2 + fontSize / 3);

                this.ctx.restore();
            } else {
                // 通常の的
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(target.x, target.y, target.width, target.height);
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.fillRect(target.x + padding, target.y + padding, target.width - padding * 2, target.height - padding * 2);
                this.ctx.fillStyle = '#333';
                this.ctx.font = `${fontSize}px Arial`;
                this.ctx.fillText('景品', target.x + padding / 2, target.y + target.height / 2 + fontSize / 3);
            }
        }
    }

    drawBullets() {
        for (let i = 0; i < this.activeBullets.length; i++) {
            const bullet = this.activeBullets[i];
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#FFF';
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    updateBulletPositions() {
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // 画面外に出た弾を削除
            if (bullet.x < 0 || bullet.x > this.width || bullet.y < 0 || bullet.y > this.height) {
                this.activeBullets.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];

            for (let j = 0; j < this.targets.length; j++) {
                const target = this.targets[j];

                if (!target.isHit) {
                    // 当たり判定
                    if (bullet.x > target.x &&
                        bullet.x < target.x + target.width &&
                        bullet.y > target.y &&
                        bullet.y < target.y + target.height) {

                        // 的に当たった
                        target.isHit = true;
                        target.isFalling = true;
                        target.fallSpeed = 2;
                        this.score += 100;
                        this.targetsRemaining--;
                        this.updateScore();
                        this.updateTargets();

                        // 弾を削除
                        this.activeBullets.splice(i, 1);

                        // すべての的を倒したかチェック
                        if (this.targetsRemaining === 0) {
                            this.gameWin();
                        }

                        break;
                    }
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#FFE4B5');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawTargets();
        this.drawBullets();
        this.drawGun();

        if (this.isRunning) {
            this.updateBulletPositions();
            this.checkCollisions();

            // 弾切れチェック
            if (this.bullets <= 0 && this.activeBullets.length === 0 && this.targetsRemaining > 0) {
                this.gameOver();
                return;
            }

            requestAnimationFrame(() => this.draw());
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.draw();
            ManatoApp.log('Shooting game started');
        }
    }

    reset() {
        this.isRunning = false;
        this.score = 0;
        this.bullets = 10;
        this.targetsRemaining = this.totalTargets;
        this.activeBullets = [];
        this.initTargets();
        this.updateScore();
        this.updateBullets();
        this.updateTargets();
        this.draw();
        ManatoApp.log('Shooting game reset');
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
        ManatoApp.log('Shooting game over');
    }

    gameWin() {
        this.isRunning = false;
        setTimeout(() => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.font = '48px Arial';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PERFECT!', this.width / 2, this.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(`スコア: ${this.score}`, this.width / 2, this.height / 2 + 40);
            this.ctx.fillText(`残弾: ${this.bullets}`, this.width / 2, this.height / 2 + 70);
            ManatoApp.log('Shooting game won');
        }, 500);
    }
}

// ゲームの初期化
document.addEventListener('DOMContentLoaded', function() {
    // 射的ゲームの初期化
    const shootingCanvas = document.getElementById('shootingCanvas');
    if (shootingCanvas) {
        if (window.innerWidth < 768) {
            const containerWidth = Math.min(window.innerWidth - 40, 480);
            shootingCanvas.width = containerWidth;
            shootingCanvas.height = Math.floor(containerWidth * 1.25); // 4:5の比率を維持
            ManatoApp.log(`Shooting canvas resized for mobile: ${shootingCanvas.width}x${shootingCanvas.height}`);
        }

        const shootingGame = new ShootingGame('shootingCanvas');
        window.shootingGame = shootingGame;
        ManatoApp.log('Shooting game initialized');
    }

    // モバイル対応: キャンバスサイズの最適化
    const canvas = document.getElementById('breakoutCanvas');
    if (canvas && window.innerWidth < 768) {
        const containerWidth = Math.min(window.innerWidth - 40, 480);
        canvas.width = containerWidth;
        canvas.height = Math.floor(containerWidth * 0.833); // 6:5の比率を維持
        ManatoApp.log(`Canvas resized for mobile: ${canvas.width}x${canvas.height}`);
    }

    const game = new BreakoutGame('breakoutCanvas');
    window.breakoutGame = game;
    ManatoApp.log('Breakout game initialized');
});
