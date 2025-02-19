// ==UserScript==
// @name         Hide Claude Feedback Buttons
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Hides feedback buttons on Claude interface with console logging
// @author       takuya fujisawa
// @match        https://claude.ai/*
// @updateURL    https://raw.githubusercontent.com/weseek/claude-utils/refs/heads/main/disable-claude-feedback/tampermonkey/disable-claude-feedback.user.js
// @downloadURL  https://raw.githubusercontent.com/weseek/claude-utils/refs/heads/main/disable-claude-feedback/tampermonkey/disable-claude-feedback.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

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

    // フィードバックボタンを特定するセレクタ配列
    const BUTTON_SELECTORS = [
        // title属性でのマッチング
        'button[title="Share positive feedback"]',
        'button[title="Report issue"]',
        // aria-label属性でのマッチング（下位互換性用）
        'button[aria-label="Share positive feedback"]',
        'button[aria-label="Report issue"]',
        // クラス名でのマッチング（下位互換性用）
        '.claude-feedback-buttons',
        // SVGのパスパターンでのマッチング（新規追加）
        'button:has(svg path[d^="M234,80.12"])',  // Positive feedback SVG
        'button:has(svg path[d^="M239.82,157"])', // Negative feedback SVG
        // 追加のSVGマッチング
        'button:has(svg[data-state="closed"])'
    ];

    // スタイルを作成して適用する関数
    function addStyle() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const styleSheet = document.createElement("style");
        styleSheet.id = STYLE_ID;
        styleSheet.textContent = `
            ${BUTTON_SELECTORS.join(',')} {
                display: none !important;
            }
            /* SVGを直接含むボタンの非表示 */
            button svg[data-state="closed"],
            button:has(svg[data-state="closed"]) {
                display: none !important;
            }
        `;
        document.head.appendChild(styleSheet);
        console.log(`%c${SCRIPT_NAME}%c スタイルシートを追加しました`, logStyles.info, '');
    }

    // SVGのパスパターンをチェックする関数
    function hasFeedbackSVG(element) {
        const svgPaths = element.querySelectorAll('svg path');
        const feedbackPathPatterns = [
            'M234,80.12',  // Positive feedback SVG pattern
            'M239.82,157'  // Negative feedback SVG pattern
        ];

        return Array.from(svgPaths).some(path => {
            const d = path.getAttribute('d');
            return feedbackPathPatterns.some(pattern => d && d.startsWith(pattern));
        });
    }

    // フィードバックボタンを監視して非表示にする
    function hideFeedbackButtons() {
        // セレクタベースの検索
        const buttons = document.querySelectorAll(BUTTON_SELECTORS.join(','));

        if (buttons.length > 0) {
            buttons.forEach(button => {
                if (button.style.display !== 'none') {
                    button.style.display = 'none';
                    console.log(
                        `%c${SCRIPT_NAME}%c フィードバックボタンを非表示にしました: %c${button.getAttribute('title') || button.getAttribute('aria-label') || 'SVG Feedback Button'}`,
                        logStyles.hide,
                        '',
                        'color: #FF5722;'
                    );
                }
            });
        }

        // SVGパターンベースの検索
        document.querySelectorAll('button').forEach(button => {
            if (hasFeedbackSVG(button)) {
                button.style.display = 'none';
                console.log(
                    `%c${SCRIPT_NAME}%c SVGパターンによりフィードバックボタンを非表示にしました`,
                    logStyles.hide,
                    ''
                );
            }
        });
    }

    // ボタンが見つかるまで定期的にチェック
    function checkForButtons() {
        const checkInterval = setInterval(() => {
            const buttons = document.querySelectorAll(BUTTON_SELECTORS.join(','));
            const svgButtons = Array.from(document.querySelectorAll('button')).filter(hasFeedbackSVG);

            if (buttons.length > 0 || svgButtons.length > 0) {
                hideFeedbackButtons();
                clearInterval(checkInterval);
                setupMutationObserver();
            }
        }, 500); // 500ミリ秒ごとにチェック

        // 30秒後にチェックを停止
        setTimeout(() => {
            clearInterval(checkInterval);
            setupMutationObserver();
        }, 30000);
    }

    // 動的な変更を監視するMutationObserverの設定
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldHideButtons = false;

            mutations.forEach(mutation => {
                // 新しく追加されたノードのチェック
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // セレクタまたはSVGパターンでのマッチをチェック
                        if (node.matches?.(BUTTON_SELECTORS.join(',')) ||
                            (node.tagName === 'BUTTON' && hasFeedbackSVG(node)) ||
                            node.querySelector?.(BUTTON_SELECTORS.join(',')) ||
                            Array.from(node.querySelectorAll('button')).some(hasFeedbackSVG)) {
                            shouldHideButtons = true;
                        }
                    }
                });

                // 属性の変更をチェック
                if (mutation.type === 'attributes' &&
                    (mutation.target.tagName === 'BUTTON' || mutation.target.tagName === 'SVG')) {
                    shouldHideButtons = true;
                }
            });

            if (shouldHideButtons) {
                hideFeedbackButtons();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['title', 'aria-label', 'd', 'data-state']
        });

        console.log(`%c${SCRIPT_NAME}%c MutationObserver を設定しました`, logStyles.info, '');
    }

    // ページロード時に実行
    function init() {
        console.log(`%c${SCRIPT_NAME}%c 初期化中...`, logStyles.info, '');
        addStyle();
        checkForButtons();
        console.log(`%c${SCRIPT_NAME}%c 正常に初期化されました`, logStyles.success, '');
    }

    // スクリプトの実行開始
    console.log(`%c${SCRIPT_NAME}%c スクリプトを開始します`, logStyles.info, '');
    init();
})();
