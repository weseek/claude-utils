// ==UserScript==
// @name         Hide Claude Feedback Buttons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hides feedback buttons on Claude interface
// @author       Your name
// @match        https://claude.ai/*
// @grant        none
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    // スタイルを作成して適用する関数
    function addStyle() {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            button[title="Share positive feedback"],
            button[title="Report issue"] {
                display: none !important;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // ページロード時に実行
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addStyle);
        } else {
            addStyle();
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
                addStyle();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    init();
})();