/* LC Debug 入口脚本
 * @license CC BY-SA 4.0 and MIT
 * @source https://github.com/zauberviolino/lc-debug
 * @model Claude Sonnet 5.5 Medium
 */
(function () {
'use strict';
if (window.__lcEntry) return; window.__lcEntry = true;

const MAIN = 'User:魔琴/vibe/LC-debug/index.js';
const VER = '3';            // 更新完整脚本后把它加 1：换一个 URL，浏览器缓存才会失效
const MAXAGE = 86400 * 30;  // 完整脚本的缓存时间（秒）；=VER 不变时，一个月内不会重新下载

function loadMain() {
  const q = new URLSearchParams({ title: MAIN, action: 'raw', ctype: 'text/javascript', maxage: MAXAGE, smaxage: MAXAGE, lcv: VER });
  mw.loader.load(mw.config.get('wgScript') + '?' + q.toString());
}

mw.loader.using(['mediawiki.util']).then(() => {
  $(() => {
    // 进入校对模式：此时才下载完整脚本（它读到 ?lcdebug=1 会自己 init）
    if (new URLSearchParams(location.search).get('lcdebug') === '1') { loadMain(); return; }
    // 平时只放一个工具箱链接，不下载任何别的东西
    if (mw.config.get('wgNamespaceNumber') < 0 || mw.config.get('wgPageContentModel') !== 'wikitext') return;
    const u = new URL(location.href); u.searchParams.set('lcdebug', '1');
    mw.util.addPortletLink('p-tb', u.href, '校对字词转换', 't-lcdebug', '进入字词转换校对（LC Debug）模式');
  });
});
})();
