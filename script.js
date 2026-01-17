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
