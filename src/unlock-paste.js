/**
 * 学习通粘贴限制解除 v4 — 纯解锁，无粘贴面板
 *
 * 学习通用 UEditor（百度编辑器），编辑器在 <iframe> 内。
 * 策略：
 *   1. 父页面 document 添加捕获阶段 paste 拦截
 *   2. 遍历所有 iframe，在 contentDocument 上也添加拦截
 *   3. 清除内联事件属性
 *   4. MutationObserver 监听新增 iframe（切题时）
 */
void function () {
  'use strict';

  // 在指定 document 上解除粘贴限制
  function freeDocument(doc) {
    if (!doc || doc.__pasteFreed) return;
    doc.__pasteFreed = true;

    // 捕获阶段拦截 paste，早于页面自己的处理器
    doc.addEventListener('paste', function (e) {
      e.stopImmediatePropagation();
    }, true);

    // 恢复右键和复制
    doc.oncontextmenu = null;
    doc.oncopy = null;
    doc.oncut = null;
    doc.onselectstart = null;

    // 清除所有输入元素的内联事件属性
    try {
      var list = doc.querySelectorAll('textarea, input, [contenteditable]');
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        el.removeAttribute('onpaste');
        el.removeAttribute('oncopy');
        el.removeAttribute('oncut');
        el.removeAttribute('oncontextmenu');
        el.removeAttribute('onselectstart');
      }
    } catch (e) {}
  }

  // 遍历所有 iframe 并解锁
  function freeAllIframes() {
    var frames = document.querySelectorAll('iframe');
    for (var i = 0; i < frames.length; i++) {
      try {
        var doc = frames[i].contentDocument;
        if (doc) freeDocument(doc);
      } catch (e) {}
    }
  }

  // 监听新增 iframe（切题时动态加载）
  new MutationObserver(function () {
    freeAllIframes();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // 执行
  freeDocument(document);
  freeAllIframes();

  // Toast 提示
  var toast = document.createElement('div');
  toast.textContent = '✅ 粘贴限制已解除，可直接 Ctrl+V 粘贴';
  toast.style.cssText =
    'position:fixed;bottom:24px;right:24px;z-index:2147483647;' +
    'background:#43a047;color:#fff;padding:12px 22px;border-radius:8px;' +
    'font:14px -apple-system,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15);' +
    'pointer-events:none;';
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
    setTimeout(function () { toast.remove(); }, 400);
  }, 2000);
}();
