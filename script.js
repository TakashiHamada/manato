// DOMの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Manato App initialized');
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

// 射的ゲーム
class ShootingGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // ゲーム状態
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.missedTargets = 0;
        this.maxMissed = 10;

        // プレイヤー（銃）
        this.gunWidth = 40;
        this.gunHeight = 60;
        this.gunX = (this.width - this.gunWidth) / 2;
        this.gunY = this.height - this.gunHeight - 20;
        this.gunSpeed = 8;

        // 操作
        this.rightPressed = false;
        this.leftPressed = false;
        this.mouseX = 0;
        this.shootPressed = false;

        // 弾丸
        this.bullets = [];
        this.bulletWidth = 4;
        this.bulletHeight = 12;
        this.bulletSpeed = 8;
        this.canShoot = true;
        this.shootCooldown = 300; // ミリ秒

        // ターゲット
        this.targets = [];
        this.targetWidth = 40;
        this.targetHeight = 40;
        this.targetSpeed = 2;
        this.targetSpawnRate = 1000; // ミリ秒
        this.lastTargetSpawn = 0;

        this.setupControls();
        this.setupEventListeners();
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
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                this.shootPressed = true;
                this.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                this.rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                this.leftPressed = false;
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                this.shootPressed = false;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.isRunning && !this.isPaused && !this.isGameOver) {
                this.shoot();
            }
        });

        // タッチ操作のサポート（モバイル対応）
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
            if (this.isRunning && !this.isPaused && !this.isGameOver) {
                this.shoot();
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
        });
    }

    shoot() {
        if (!this.isRunning || this.isPaused || this.isGameOver || !this.canShoot) return;

        this.bullets.push({
            x: this.gunX + this.gunWidth / 2 - this.bulletWidth / 2,
            y: this.gunY,
            width: this.bulletWidth,
            height: this.bulletHeight
        });

        this.canShoot = false;
        setTimeout(() => {
            this.canShoot = true;
        }, this.shootCooldown);
    }

    spawnTarget(currentTime) {
        if (currentTime - this.lastTargetSpawn > this.targetSpawnRate) {
            const x = Math.random() * (this.width - this.targetWidth);
            this.targets.push({
                x: x,
                y: -this.targetHeight,
                width: this.targetWidth,
                height: this.targetHeight,
                color: this.getRandomColor()
            });
            this.lastTargetSpawn = currentTime;
        }
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawGun() {
        // 銃身
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.gunX + this.gunWidth / 2 - 5, this.gunY, 10, 30);

        // 銃本体
        this.ctx.fillStyle = '#5C4033';
        this.ctx.fillRect(this.gunX, this.gunY + 30, this.gunWidth, 30);

        // ハイライト
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(this.gunX + 5, this.gunY + 35, 10, 20);
    }

    drawBullets() {
        this.ctx.fillStyle = '#FFD700';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    drawTargets() {
        this.targets.forEach(target => {
            // ターゲット本体（円形）
            this.ctx.beginPath();
            this.ctx.arc(target.x + target.width / 2, target.y + target.height / 2, target.width / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = target.color;
            this.ctx.fill();

            // ターゲットの中心円
            this.ctx.beginPath();
            this.ctx.arc(target.x + target.width / 2, target.y + target.height / 2, target.width / 4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fill();

            // ターゲットの中心点
            this.ctx.beginPath();
            this.ctx.arc(target.x + target.width / 2, target.y + target.height / 2, target.width / 8, 0, Math.PI * 2);
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fill();
            this.ctx.closePath();
        });
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bulletSpeed;

            // 画面外の弾を削除
            if (this.bullets[i].y + this.bullets[i].height < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateTargets() {
        for (let i = this.targets.length - 1; i >= 0; i--) {
            this.targets[i].y += this.targetSpeed;

            // 画面下に到達したターゲット
            if (this.targets[i].y > this.height) {
                this.targets.splice(i, 1);
                this.missedTargets++;
                this.updateMissed();

                if (this.missedTargets >= this.maxMissed) {
                    this.gameOver();
                }
            }
        }
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.targets.length - 1; j >= 0; j--) {
                const bullet = this.bullets[i];
                const target = this.targets[j];

                // 円と矩形の衝突判定
                const distX = Math.abs(bullet.x + bullet.width / 2 - (target.x + target.width / 2));
                const distY = Math.abs(bullet.y + bullet.height / 2 - (target.y + target.height / 2));

                if (distX < (bullet.width / 2 + target.width / 2) &&
                    distY < (bullet.height / 2 + target.height / 2)) {
                    this.bullets.splice(i, 1);
                    this.targets.splice(j, 1);
                    this.score += 10;
                    this.updateScore();
                    break;
                }
            }
        }
    }

    moveGun() {
        if (this.rightPressed && this.gunX < this.width - this.gunWidth) {
            this.gunX += this.gunSpeed;
        } else if (this.leftPressed && this.gunX > 0) {
            this.gunX -= this.gunSpeed;
        }

        // マウス/タッチ操作
        if (this.mouseX > 0) {
            const targetX = this.mouseX - this.gunWidth / 2;
            if (targetX >= 0 && targetX <= this.width - this.gunWidth) {
                this.gunX = targetX;
            }
        }
    }

    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    updateMissed() {
        const missedElement = document.getElementById('missed');
        if (missedElement) {
            missedElement.textContent = `${this.missedTargets}/${this.maxMissed}`;
        }
    }

    draw(currentTime) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 背景グラデーション
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawTargets();
        this.drawBullets();
        this.drawGun();

        if (!this.isPaused && !this.isGameOver) {
            this.spawnTarget(currentTime);
            this.updateBullets();
            this.updateTargets();
            this.checkCollisions();
            this.moveGun();
        }

        if (this.isRunning && !this.isGameOver) {
            requestAnimationFrame((time) => this.draw(time));
        }
    }

    start() {
        if (!this.isRunning || this.isGameOver) {
            this.isRunning = true;
            this.isPaused = false;
            this.isGameOver = false;
            this.draw(performance.now());
            ManatoApp.log('Shooting game started');
        }
    }

    togglePause() {
        if (this.isRunning && !this.isGameOver) {
            this.isPaused = !this.isPaused;
            if (!this.isPaused) {
                this.draw(performance.now());
            }
            ManatoApp.log(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.missedTargets = 0;
        this.gunX = (this.width - this.gunWidth) / 2;
        this.bullets = [];
        this.targets = [];
        this.lastTargetSpawn = 0;
        this.canShoot = true;

        this.updateScore();
        this.updateMissed();

        this.ctx.clearRect(0, 0, this.width, this.height);
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.drawGun();

        ManatoApp.log('Shooting game reset');
    }

    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 40);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`スコア: ${this.score}`, this.width / 2, this.height / 2 + 10);
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText('リセットボタンでリスタート', this.width / 2, this.height / 2 + 50);

        ManatoApp.log('Shooting game over');
    }
}

// ゲームの初期化
document.addEventListener('DOMContentLoaded', function() {
    // モバイル対応: キャンバスサイズの最適化
    const canvas = document.getElementById('shootingCanvas');
    if (canvas && window.innerWidth < 768) {
        const containerWidth = Math.min(window.innerWidth - 40, 480);
        canvas.width = containerWidth;
        canvas.height = Math.floor(containerWidth * 0.833); // 6:5の比率を維持
        ManatoApp.log(`Canvas resized for mobile: ${canvas.width}x${canvas.height}`);
    }

    const game = new ShootingGame('shootingCanvas');
    window.shootingGame = game;
    ManatoApp.log('Shooting game initialized');
});
