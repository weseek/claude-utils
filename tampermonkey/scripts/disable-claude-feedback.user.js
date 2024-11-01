// ==UserScript==
// @name         Hide Claude Feedback Buttons
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Hides feedback buttons on Claude interface with console logging
// @author       takuya fujisawa
// @match        https://claude.ai/*
// @updateURL    https://raw.githubusercontent.com/weseek/claude-utils/refs/heads/main/tampermonkey/scripts/disable-claude-feedback.js
// @downloadURL  https://raw.githubusercontent.com/weseek/claude-utils/refs/heads/main/tampermonkey/scripts/disable-claude-feedback.js
// @grant        none
// @run-at       document-body
// ==/UserScript==


// 更新時には↑の @version を足してください
(function() {
    'use strict';

    const SCRIPT_NAME = '🎭 Hide Claude Feedback';
    const STYLE_ID = 'hide-claude-feedback-style';

    // コンソールログのスタイル設定
    const logStyles = {
        info: 'background: #2196F3; color: white; padding: 2px 5px; border-radius: 3px;',
        success: 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;',
        hide: 'background: #FF5722; color: white; padding: 2px 5px; border-radius: 3px;'
    };

    // スタイルを作成して適用する関数
    function addStyle() {
        // 既存のスタイルを確認
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const styleSheet = document.createElement("style");
        styleSheet.id = STYLE_ID;
        styleSheet.textContent = `
            button[title="Share positive feedback"],
            button[title="Report issue"] {
                display: none !important;
            }
        `;
        document.head.appendChild(styleSheet);
        console.log(`%c${SCRIPT_NAME}%c スタイルシートを追加しました`, logStyles.info, '');
    }

    // フィードバックボタンを監視して非表示にする
    function hideFeedbackButtons() {
        const buttons = document.querySelectorAll('button[title="Share positive feedback"], button[title="Report issue"]');
        if (buttons.length > 0) {
            buttons.forEach(button => {
                if (button.style.display !== 'none') {
                    button.style.display = 'none';
                    console.log(
                        `%c${SCRIPT_NAME}%c フィードバックボタンを非表示にしました: %c${button.title}`,
                        logStyles.hide,
                        '',
                        'color: #FF5722;'
                    );
                }
            });
        }
    }

    // ページロード時に実行
    function init() {
        console.log(`%c${SCRIPT_NAME}%c 初期化中...`, logStyles.info, '');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                addStyle();
                hideFeedbackButtons();
            });
        } else {
            addStyle();
            hideFeedbackButtons();
        }

        // 動的に追加される要素のために監視を設定
        const observer = new MutationObserver((mutations) => {
            const hasNewButtons = mutations.some(mutation =>
                Array.from(mutation.addedNodes).some(node =>
                    node.nodeType === 1 &&
                    (node.querySelector?.('button[title="Share positive feedback"]') ||
                     node.querySelector?.('button[title="Report issue"]'))
                )
            );

            if (hasNewButtons) {
                hideFeedbackButtons();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log(`%c${SCRIPT_NAME}%c 正常に初期化されました`, logStyles.success, '');
    }

    // スクリプトの実行開始
    console.log(`%c${SCRIPT_NAME}%c スクリプトを開始します`, logStyles.info, '');
    init();
})();
