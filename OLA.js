// ==UserScript==
// @name         在线学习助手 - 自动处理学习提示-deepseek
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动处理学习网站的提示框，保持学习状态
// @author       希威亚
// @match        */Moudle/NetLearning/Student/FreeLearning/WareLearnIndex_New.aspx*
// @match        */Moudle/NetLearning/Student/FreeLearning/WareLearnIndex.aspx*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edge.microsoft.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 防挂机：定期模拟用户操作
    let activityInterval = null;

    // 检测并处理提示框
    function checkAndHandleAlerts() {
        console.log('[学习助手] 正在检查提示框...');

        // 1. 检查"达到学时跳转到下一课件"的提示
        const alertElements = document.querySelectorAll('.es_nettrmp-alert, .es_nettrmp-confirm, [class*="alert"], [class*="confirm"], .modal, .dialog');

        alertElements.forEach(element => {
            const text = element.textContent || element.innerText;

            // 检测达到学时的提示
            if (text.includes('当前课件学习时间已达到系统设置时间') &&
                text.includes('是否继续学习下一课件')) {
                console.log('[学习助手] 检测到达到学时提示，自动点击确定');

                // 查找确定按钮并点击
                const confirmButtons = element.querySelectorAll('button, input[type="button"], a');
                confirmButtons.forEach(btn => {
                    const btnText = btn.textContent || btn.innerText || btn.value;
                    if (btnText.includes('确定') || btnText.includes('确认') || btnText.includes('OK') || btnText.includes('是')) {
                        console.log('[学习助手] 点击确定按钮');
                        btn.click();
                    }
                });

                // 如果没找到标准按钮，尝试查找并点击第一个按钮
                const allButtons = element.querySelectorAll('button');
                if (allButtons.length > 0) {
                    console.log('[学习助手] 点击第一个按钮');
                    allButtons[0].click();
                }
            }

            // 检测其他需要处理的提示
            else if (text.includes('挂机') ||
                     text.includes('暂停') ||
                     text.includes('继续学习') ||
                     text.includes('是否继续')) {
                console.log('[学习助手] 检测到其他提示，尝试处理');

                // 查找并点击继续/确定按钮
                const continueButtons = element.querySelectorAll('button');
                continueButtons.forEach(btn => {
                    const btnText = btn.textContent || btn.innerText || btn.value;
                    if (btnText.includes('继续') || btnText.includes('确定') ||
                        btnText.includes('确认') || btnText.includes('是')) {
                        console.log('[学习助手] 点击继续按钮');
                        btn.click();
                    }
                });
            }
        });

        // 2. 检查系统原生alert/confirm（通过重写检测）
        checkNativeAlerts();
    }

    // 检查并处理原生alert/confirm
    function checkNativeAlerts() {
        // 检查是否有遮罩层
        const overlays = document.querySelectorAll('.es_nettrmp-overlay, [class*="overlay"], .modal-backdrop');
        overlays.forEach(overlay => {
            const modal = overlay.closest('.es_nettrmp-modal, .modal, .dialog');
            if (modal) {
                const text = modal.textContent;
                if (text && text.includes('当前课件学习时间已达到系统设置时间')) {
                    console.log('[学习助手] 检测到遮罩层提示');
                    // 触发确定操作
                    setTimeout(() => {
                        const event = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13
                        });
                        document.dispatchEvent(event);
                    }, 100);
                }
            }
        });
    }

    // 模拟用户活动（防挂机）
    function simulateUserActivity() {
        // 随机时间间隔（1-5分钟）
        const interval = Math.floor(Math.random() * 4 * 60000) + 60000;

        activityInterval = setInterval(() => {
            console.log('[学习助手] 模拟用户活动，保持在线状态');

            // 模拟鼠标移动
            const mouseMoveEvent = new MouseEvent('mousemove', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: Math.random() * window.innerWidth,
                clientY: Math.random() * window.innerHeight
            });
            document.dispatchEvent(mouseMoveEvent);

            // 模拟轻微滚动
            const scrollEvent = new Event('scroll');
            window.dispatchEvent(scrollEvent);

            // 模拟键盘事件
            const keyEvent = new KeyboardEvent('keydown', {
                key: 'Shift',
                code: 'ShiftLeft',
                keyCode: 16,
                bubbles: true
            });
            document.dispatchEvent(keyEvent);

            // 自动检查并处理可能出现的提示框
            checkAndHandleAlerts();

        }, interval);
    }

    // 监控DOM变化以捕获动态生成的提示框
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    setTimeout(checkAndHandleAlerts, 500); // 延迟检查以确保元素完全加载
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[学习助手] DOM变化监听已启动');
    }

    // 重写alert和confirm方法以捕获系统提示
    function overrideAlertMethods() {
        // 保存原始方法
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;

        // 重写alert
        window.alert = function(message) {
            console.log('[学习助手] 捕获到alert:', message);

            // 检测达到学时的提示
            if (message && message.includes('当前课件学习时间已达到系统设置时间')) {
                console.log('[学习助手] 自动处理达到学时提示');
                return; // 直接返回，模拟点击了确定
            }

            // 调用原始方法处理其他提示
            return originalAlert(message);
        };

        // 重写confirm
        window.confirm = function(message) {
            console.log('[学习助手] 捕获到confirm:', message);

            // 检测达到学时的提示
            if (message && message.includes('当前课件学习时间已达到系统设置时间') &&
                message.includes('是否继续学习下一课件')) {
                console.log('[学习助手] 自动确认达到学时提示');
                return true; // 返回true模拟点击了确定
            }

            // 检测其他需要自动确定的提示
            if (message && (message.includes('是否继续学习') ||
                          message.includes('是否要') && message.includes('继续'))) {
                console.log('[学习助手] 自动确认继续学习提示');
                return true;
            }

            // 调用原始方法处理其他确认框
            return originalConfirm(message);
        };

        // 如果网站使用自定义的弹窗库，也尝试重写
        if (window.es_nettrmp && window.es_nettrmp.confirm) {
            const originalEsConfirm = window.es_nettrmp.confirm;
            window.es_nettrmp.confirm = function(title, message, type, confirmCallback, cancelCallback) {
                console.log('[学习助手] 捕获到es_nettrmp.confirm:', message);

                if (message && message.includes('当前课件学习时间已达到系统设置时间')) {
                    console.log('[学习助手] 自动触发es_nettrmp确认回调');
                    if (confirmCallback && typeof confirmCallback === 'function') {
                        setTimeout(() => confirmCallback(), 100);
                    }
                    return;
                }

                // 调用原始方法
                return originalEsConfirm.call(this, title, message, type, confirmCallback, cancelCallback);
            };
        }
    }

    // 自动切换到下一个课件（备用方案）
    function autoSwitchToNextWare() {
        // 查找下一个课件元素
        const currentWareTr = document.querySelector('.tr_courseWare.div_checked');
        if (currentWareTr) {
            const nextWareTr = currentWareTr.nextElementSibling;
            if (nextWareTr && nextWareTr.classList.contains('tr_courseWare')) {
                console.log('[学习助手] 自动切换到下一个课件');
                setTimeout(() => {
                    if (nextWareTr.click) nextWareTr.click();
                }, 2000); // 2秒后自动切换
            }
        }
    }

    // 监听页面卸载事件，清理定时器
    window.addEventListener('beforeunload', () => {
        if (activityInterval) {
            clearInterval(activityInterval);
            console.log('[学习助手] 已清理活动定时器');
        }
    });

    // 页面加载完成后初始化
    function init() {
        console.log('[学习助手] 脚本初始化开始...');

        // 等待页面完全加载
        setTimeout(() => {
            // 1. 重写弹窗方法
            overrideAlertMethods();

            // 2. 设置DOM变化监听
            setupMutationObserver();

            // 3. 启动防挂机模拟活动
            simulateUserActivity();

            // 4. 初始检查一次
            checkAndHandleAlerts();

            // 5. 设置定期检查
            setInterval(checkAndHandleAlerts, 30000); // 每30秒检查一次

            console.log('[学习助手] 脚本初始化完成！');

            // 显示友好提示
            showNotification();

        }, 3000); // 等待3秒确保页面完全加载
    }

    // 显示通知
    function showNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 99999;
            font-family: Arial, sans-serif;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = '✅ 学习助手已启用 - 自动处理提示中';
        document.body.appendChild(notification);

        // 5秒后自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 1s';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 1000);
            }
        }, 5000);
    }

    // 启动脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
