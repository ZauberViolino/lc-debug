/* @preserve
 * LC Debug user script
 * <nowiki> <= Don't remove this.
 * @license CC BY-SA 4.0 and MIT
 * @source https://github.com/zauberviolino/lc-debug
 * @model Claude Sonnet 5.5 Medium
 * @endpreserve
 */
(function () {
'use strict';

// ═════════════════════════ i18n：界面消息（简体 / 繁体） ═════════════════════════
// 界面语言只看 MediaWiki 的界面语言（wgUserLanguage 为 zh-hant / zh-tw / zh-hk / zh-mo 时用繁体），不看内容变体。
// 所有界面文字都在下面的 MSG 里定义，简繁并排；全脚本用 _M('key') 或 _M('key', 参数1, 参数2…) 引用。
// 消息里用 $1、$2… 占位，调用时按顺序传参（简繁语序不同时，各自调整占位符位置即可）。一句话写成一条消息，不要拆成几段再用 + 拼。
// key 按「区域.含义」命名（如 nta.rule.tag.dormant、rm.compare.variantFailed）；改文案、加消息都只动这一处。
// 只有界面文字走这里；页面源码、规则文本、条目名等数据一律不翻译。
const LC_HANT = (() => {
  try {
    if (typeof mw !== 'undefined' && mw.config) return /^zh-(hant|tw|hk|mo)$/i.test(String(mw.config.get('wgUserLanguage') || ''));
  } catch (e) { /* 忽略 */ }
  return false;
})();
const MSG = {
  // ── layer 规则来源标签 ──
  'layer.core': { hans: '核心', hant: '核心' },
  'layer.siteTable': { hans: '站点表', hant: '站點表' },
  'layer.convGroup': { hans: '转换组', hant: '轉換組' },
  'layer.pageManual': { hans: '本页/手动', hant: '本頁/手動' },
  'layer.inlineManual': { hans: '行内手动', hant: '行內手動' },
  // ── scan / source / token ──
  'scan.templateFallback': { hans: '模板', hant: '模板' },
  'source.templatePrefix': { hans: '模板:', hant: '模板:' },
  'token.original': { hans: '原文', hant: '原文' },
  'token.expandParamValue': { hans: '展开检查此参数值', hant: '展開檢查此參數值' },
  // ── manual -{ }- 块解析提示 ──
  'manual.removed': { hans: '规则已移除 $1 条，只影响此后的文本', hant: '規則已移除 $1 條，只影響此後的文字' },
  'manual.activated': { hans: '规则已激活 $1 条，只影响此后的文本', hant: '規則已啟用 $1 條，只影響此後的文字' },
  'manual.noRules': { hans: '没有解析到规则', hant: '沒有解析到規則' },
  'manual.unsupportedFlags': { hans: '暂不支持的标志：$1，已跳过', hant: '暫不支援的標誌：$1，已跳過' },
  'manual.uncovered': { hans: '规则没有覆盖：$1（回退链也无可用项）', hant: '規則沒有覆蓋：$1（回退鏈也無可用項）' },
  // ── noteTA 块解析提示 ──
  'noteTA.groupNotFound': { hans: '找不到公共转换组 $1', hant: '找不到公共轉換組 $1' },
  'noteTA.titleConversion': { hans: 'T标题转换', hant: 'T標題轉換' },
  'noteTA.groupsSummary': { hans: '公共转换组 $1 共 $2 条', hant: '公共轉換組 $1 共 $2 條' },
  'noteTA.localRulesSummary': { hans: '局部规则 $1 条', hant: '局部規則 $1 條' },
  'noteTA.note': { hans: '$1，只影响此后的文本', hant: '$1，只影響此後的文字' },
  // ── 选择 / 菜单 / 提示框 ──
  'selection.startPicked': { hans: '已选起点，点击另一处选终点，Esc 取消', hant: '已選起點，點擊另一處選終點，Esc 取消' },
  'selection.sameSpot': { hans: '起点和终点是同一个位置，请换一处选终点（Esc 取消）', hant: '起點和終點是同一個位置，請換一處選終點（Esc 取消）' },
  'inline.unsafeResult': { hans: '这个块的转换结果含有 ; | -{ }- 或首尾空白，无法安全写成行内转换，请手动编辑。', hant: '這個塊的轉換結果含有 ; | -{ }- 或首尾空白，無法安全寫成行內轉換，請手動編輯。' },
  'blind.restore': { hans: '⮌ 恢复屏蔽', hant: '⮌ 恢復遮蔽' },
  'blind.restoreTip': { hans: '点击：恢复为屏蔽状态', hant: '點擊：恢復為遮蔽狀態' },
  'link.hasMarkup': { hans: '链接目标含 -{ }-，无法直接打开', hant: '連結目標含 -{ }-，無法直接開啟' },
  'menu.editSelection': { hans: '编辑所选', hant: '編輯所選' },
  'common.cancel': { hans: '取消', hant: '取消' },
  'menu.selectUntilHere': { hans: '选择至此', hant: '選擇至此' },
  'menu.cancelSelection': { hans: '取消选择', hant: '取消選擇' },
  'menu.editBlock': { hans: '编辑本块', hant: '編輯本塊' },
  'menu.startSelection': { hans: '开始选择', hant: '開始選擇' },
  'menu.editInline': { hans: '改行内转换', hant: '改行內轉換' },
  'menu.blindCheck': { hans: '盲检', hant: '盲檢' },
  'menu.openLink': { hans: '打开链接↗', hant: '開啟連結↗' },
  'tip.link': { hans: '链接：$1', hant: '連結：$1' },
  'tip.pinned': { hans: '已固定 · 点击空白处或按 Esc 关闭', hant: '已固定 · 點擊空白處或按 Esc 關閉' },
  'tip.charCount': { hans: '$1（$2 字符）', hant: '$1（$2 字元）' },
  'tip.blank': { hans: '（空白）', hant: '（空白）' },
  'tip.blockText': { hans: '本块纯文本', hant: '本塊純文字' },
  'tip.selectedText': { hans: '选中的纯文本', hant: '選中的純文字' },
  // ── 数据页 / 转换表 / 源码 ──
  'data.pageNotFound': { hans: '找不到数据页：$1', hant: '找不到資料頁：$1' },
  'data.downloadFailed': { hans: '下载数据页失败：HTTP $1', hant: '下載資料頁失敗：HTTP $1' },
  'tables.checkingVersion': { hans: '检查数据页版本…', hant: '檢查資料頁版本…' },
  'tables.usingCache': { hans: '使用本地缓存（rev $1）', hant: '使用本地快取（rev $1）' },
  'tables.downloading': { hans: '下载转换表…', hant: '下載轉換表…' },
  'tables.readingSite': { hans: '读取站点转换表…', hant: '讀取站點轉換表…' },
  'tables.building': { hans: '建表 $1 / $2', hant: '建表 $1 / $2' },
  'source.pageMissing': { hans: '页面不存在', hant: '頁面不存在' },
  'source.downloadFailed': { hans: '下载全文失败：HTTP $1', hant: '下載全文失敗：HTTP $1' },
  // ── common 通用 ──
  'common.all': { hans: '全部', hant: '全部' },
  'common.remove': { hans: '移除', hant: '移除' },
  'common.empty': { hans: '（空）', hant: '（空）' },
  'common.committing': { hans: '提交中…', hant: '提交中…' },
  'common.moreWords': { hans: '…另有 $1 个词', hant: '…另有 $1 個詞' },
  'common.moreItems': { hans: '…另有 $1 个', hant: '…另有 $1 個' },
  // ── nta 检查面板：跳转 / 逐处查看 / 名称 ──
  'nta.jump.notFoundInBody': { hans: '正文里找不到这个位置', hant: '正文裡找不到這個位置' },
  'nta.jump.insideFoldedRef': { hans: '这一处在折叠的 ref 里，勾上“展开全部”再点', hant: '這一處在摺疊的 ref 裡，勾上“展開全部”再點' },
  'nta.go.notice': { hans: '$1 · 第 $2 / $3 处$4（[ ] 键翻页）', hant: '$1 · 第 $2 / $3 處$4（[ ] 鍵翻頁）' },
  'nta.go.inRef': { hans: '（在 ref 内）', hant: '（在 ref 內）' },
  'nta.hitCount': { hans: '$1 处', hant: '$1 處' },
  'nta.localRuleName': { hans: '全页规则 #$1', hant: '全頁規則 #$1' },
  'nta.convGroupRuleName': { hans: '转换组 $1', hant: '轉換組 $1' },
  'nta.noConvert': { hans: '不转换', hant: '不轉換' },
  // ── nta 检查面板：“被谁挡 / 来源” ──
  'nta.blocker.tag': { hans: '挡', hant: '擋' },
  'nta.blocker.tip': { hans: '核心 / 站点表里本来就有同样的转换，这条规则其实是在挡住上面这条规则', hant: '核心 / 站點表裡本來就有同樣的轉換，這條規則其實是在擋住上面這條規則' },
  'nta.source.core': { hans: '核心 $1', hant: '核心 $1' },
  'nta.source.siteTable': { hans: '站点表 $1', hant: '站點表 $1' },
  'nta.source.splitConversion': { hans: '拆分后转换', hant: '拆分後轉換' },
  // ── nta 检查面板：差异表格 ──
  'nta.box.needTitle': { hans: '活跃：删去会改变 $1 个词', hant: '活躍：刪去會改變 $1 個詞' },
  'nta.box.shadowTitle': { hans: '被覆盖：$1 个词不起作用', hant: '被覆蓋：$1 個詞不起作用' },
  'nta.box.colWord': { hans: '词', hant: '詞' },
  'nta.box.colVariant': { hans: '变体', hant: '變體' },
  'nta.box.colNow': { hans: '现在', hant: '現在' },
  'nta.box.colAfterRemoval': { hans: '删后', hant: '刪後' },
  'nta.box.colAfterRemovalBy': { hans: '删后由', hant: '刪後由' },
  // ── nta 检查面板：单条规则 ──
  'nta.rule.commentLabel': { hans: '注释 ', hant: '註釋 ' },
  'nta.rule.commentTip': { hans: '\n注释：$1', hant: '\n註釋：$1' },
  'nta.rule.tag.refOnly': { hans: '唯ref$1', hant: '唯ref$1' },
  'nta.rule.tag.bodyHas': { hans: '正文有 $1', hant: '正文有 $1' },
  'nta.rule.tip.hitOnlyInRef': { hans: '正文里未命中，仅在 ref 里命中', hant: '正文裡未命中，僅在 ref 裡命中' },
  'nta.rule.tip.noHitInRef': { hans: 'ref 里未命中，正文存在命中之处', hant: 'ref 裡未命中，正文存在命中之處' },
  'nta.rule.tag.unused': { hans: '未用', hant: '未用' },
  'nta.rule.tag.shadowed': { hans: '见覆', hant: '見覆' },
  'nta.rule.tip.shadowed': { hans: '本规则被覆盖。展开查看详情。', hant: '本規則被覆蓋。展開檢視詳情。' },
  'nta.rule.tag.allInRef': { hans: '全在 ref 内', hant: '全在 ref 內' },
  'nta.rule.tip.allInRef': { hans: '这条规则的命中全部在 ref 里', hant: '這條規則的命中全部在 ref 裡' },
  'nta.rule.tip.refHits': { hans: '$1 处命中在 ref 里', hant: '$1 處命中在 ref 裡' },
  'nta.rule.tag.partlyShadowed': { hans: '部分见覆', hant: '部分見覆' },
  'nta.rule.tip.partlyShadowed': { hans: '本规则有词条被别的规则覆盖。展开查看详情。', hant: '本規則有詞條被別的規則覆蓋。展開檢視詳情。' },
  'nta.rule.tag.active': { hans: '活跃', hant: '活躍' },
  'nta.rule.tip.active': { hans: '本规则活跃，删去后将影响字词转换。展开查看详情。', hant: '本規則活躍，刪去後將影響字詞轉換。展開檢視詳情。' },
  'nta.rule.tag.dormant': { hans: '休眠', hant: '休眠' },
  'nta.rule.tip.dormant': { hans: '本规则虽命中但未起到实际作用，似可删去。', hant: '本規則雖命中但未起到實際作用，似可刪去。' },
  'nta.rule.itemLabel': { hans: '条目名 ', hant: '條目名 ' },
  'nta.rule.stepButton': { hans: '▶ 逐处查看', hant: '▶ 逐處檢視' },
  'nta.rule.stepTip': { hans: '自首处跳转；之后用顶部的 ◀ ▶ 或 [ ] 键翻看', hant: '自首處跳轉；之後用頂部的 ◀ ▶ 或 [ ] 鍵翻看' },
  'nta.rule.tip.jumpFromRef': { hans: '这一处在 ref 内，点击跳到正文', hant: '這一處在 ref 內，點擊跳到正文' },
  'nta.rule.tip.jumpToBody': { hans: '跳到正文这一处', hant: '跳到正文這一處' },
  'nta.rule.showMore': { hans: '再显示 $1 处（还剩 $2）', hant: '再顯示 $1 處（還剩 $2）' },
  'nta.rule.showMoreRemaining': { hans: '再显示更多（还剩 $1）', hant: '再顯示更多（還剩 $1）' },
  // ── nta 检查面板：复制 / 移除按钮 ──
  'nta.copy.button': { hans: '复制到数字参数', hant: '複製到數字參數' },
  'nta.copy.tip': { hans: '把这条规则复制成 noteTA 数字参数（从 30 号往下取空闲编号），转换组保持不变。数字参数优先级更高，会盖过转换组里的同名词条；不做渲染对比，直接提交', hant: '把這條規則複製成 noteTA 數字參數（從 30 號往下取空閒編號），轉換組保持不變。數字參數優先順序更高，會蓋過轉換組裡的同名詞條；不做渲染對比，直接提交' },
  'nta.copy.tipNotParsable': { hans: '这条规则无法解析成数字参数', hant: '這條規則無法解析成數字參數' },
  'nta.copy.confirm': { hans: '把转换组「$1」里的这条规则复制到 noteTA 数字参数：\n\n$2\n\n· 转换组保持不变\n· 使用空闲的最大编号（从 30 往下取），数字参数优先级高于转换组，会盖过转换组里的同名词条\n· 复制出来的规则不再随公共转换组更新\n\n不会做渲染对比，确认后直接提交编辑。确定继续？', hant: '把轉換組「$1」裡的這條規則複製到 noteTA 數字參數：\n\n$2\n\n· 轉換組保持不變\n· 使用空閒的最大編號（從 30 往下取），數字參數優先順序高於轉換組，會蓋過轉換組裡的同名詞條\n· 複製出來的規則不再隨公共轉換組更新\n\n不會做渲染對比，確認後直接提交編輯。確定繼續？' },
  'nta.remove.directly': { hans: '直接$1', hant: '直接$1' },
  'nta.remove.tipUsed': { hans: '这条规则存在命中之处，移除前需二次确认；之后还会逐变体对比渲染结果', hant: '這條規則存在命中之處，移除前需二次確認；之後還會逐變體對比渲染結果' },
  'nta.remove.tipUnused': { hans: '移除这条没用到的规则（先逐变体对比渲染结果）', hant: '移除這條沒用到的規則（先逐變體對比渲染結果）' },
  'nta.remove.confirmUsed': { hans: '「$1」目前有 $2 处命中，移除后这些位置的转换结果会变化。\n\n接下来会逐变体对比渲染结果，有差异时还需再确认一次才会提交。\n\n确定要继续移除吗？', hant: '「$1」目前有 $2 處命中，移除後這些位置的轉換結果會變化。\n\n接下來會逐變體對比渲染結果，有差異時還需再確認一次才會提交。\n\n確定要繼續移除嗎？' },
  // ── nta 检查面板：汇总 / 计数 ──
  'nta.sum.byState': { hans: '$1/$2 处 · $3 $4/$5 条', hant: '$1/$2 處 · $3 $4/$5 條' },
  'nta.sum.unused': { hans: '未命中 $1/$2 条', hant: '未命中 $1/$2 條' },
  'nta.sum.used': { hans: '$1 处 · 命中 $2/$3 条', hant: '$1 處 · 命中 $2/$3 條' },
  'nta.shownCount': { hans: '$1 / $2 条', hant: '$1 / $2 條' },
  // ── nta 检查面板：转换组 ──
  'nta.group.tag.refOnlyAll': { hans: '整组只在 ref 内', hant: '整組只在 ref 內' },
  'nta.group.tag.noRefHit': { hans: '整组 ref 内无命中', hant: '整組 ref 內無命中' },
  'nta.group.tag.unused': { hans: '整组没用到', hant: '整組沒用到' },
  'nta.group.tag.fewUses': { hans: '少用', hant: '少用' },
  'nta.group.viaTemplate': { hans: '（模板展开）', hant: '（模板展開）' },
  'nta.group.moveButton': { hans: '展开并移除…', hant: '展開並移除…' },
  'nta.group.moveTip': { hans: '把命中的规则复制成 noteTA 数字参数（最多 30 个），再去掉这个 G 参数', hant: '把命中的規則複製成 noteTA 數字參數（最多 30 個），再去掉這個 G 參數' },
  'nta.group.notFoundInSource': { hans: '在源码里没找到这个转换组（页面可能已变化），请重新转换后再试', hant: '在原始碼裡沒找到這個轉換組（頁面可能已變化），請重新轉換後再試' },
  'nta.group.moveConfirm': { hans: '把转换组「$1」里命中的 $2 条规则（共 $3 条）移到 noteTA 的数字参数$4，并去掉这个转换组。\n\n· 没命中的 $5 条规则会被丢弃\n· 数字参数的优先级高于转换组，可能改变与其它转换组同名词条的取舍\n· 之后这些规则不再随公共转换组更新\n\n接下来会逐变体对比渲染结果，有差异时还需再确认一次才会提交。确定继续？', hant: '把轉換組「$1」裡命中的 $2 條規則（共 $3 條）移到 noteTA 的數字參數$4，並去掉這個轉換組。\n\n· 沒命中的 $5 條規則會被丟棄\n· 數字參數的優先順序高於轉換組，可能改變與其它轉換組同名詞條的取捨\n· 之後這些規則不再隨公共轉換組更新\n\n接下來會逐變體對比渲染結果，有差異時還需再確認一次才會提交。確定繼續？' },
  'nta.group.unusedRules': { hans: '未命中的规则（$1 条）', hant: '未命中的規則（$1 條）' },
  // ── nta 检查面板：工具栏 / 筛选 ──
  'nta.search.placeholder': { hans: '搜索规则、词条、转换组…', hant: '搜尋規則、詞條、轉換組…' },
  'nta.filter.tipActive': { hans: '只看删去影响转换结果的规则', hant: '只看刪去影響轉換結果的規則' },
  'nta.filter.tipDormant': { hans: '只看删去后不会影响转换结果的规则', hant: '只看刪去後不會影響轉換結果的規則' },
  'nta.filter.hit': { hans: '命中', hant: '命中' },
  'nta.filter.tipHit': { hans: '只看命中的规则', hant: '只看命中的規則' },
  'nta.filter.unused': { hans: '未命中', hant: '未命中' },
  'nta.filter.tipUnused': { hans: '只看未命中的规则', hant: '只看未命中的規則' },
  'nta.bar.label': { hans: '条形', hant: '條形' },
  'nta.bar.byGroup': { hans: '按组', hant: '按組' },
  'nta.bar.byGroupTip': { hans: '每个转换组 / 块内，以组内最大命中数为满', hant: '每個轉換組 / 塊內，以組內最大命中數為滿' },
  'nta.bar.global': { hans: '全局', hant: '全域' },
  'nta.bar.globalTip': { hans: '所有规则以全局最大命中数为满', hant: '所有規則以全域最大命中數為滿' },
  'nta.bar.linear': { hans: '线性', hant: '線性' },
  'nta.bar.log': { hans: '对数', hant: '對數' },
  'nta.bar.logTip': { hans: '按 log(1+命中数) 缩放，命中数悬殊时小的也看得见', hant: '按 log(1+命中數) 縮放，命中數懸殊時小的也看得見' },
  'nta.bar.menuButton': { hans: '条形 ▾', hant: '條形 ▾' },
  'nta.bar.menuTip': { hans: '命中数条形的比例设置', hant: '命中數條形的比例設定' },
  'nta.scope.label': { hans: '位置', hant: '位置' },
  'nta.scope.body': { hans: '正文', hant: '正文' },
  'nta.scope.bodyTip': { hans: '只统计 ref 以外的命中', hant: '只統計 ref 以外的命中' },
  'nta.scope.refTip': { hans: '只统计 <ref> 里的命中（cite 系列模板的 title 通常强制不转换）', hant: '只統計 <ref> 裡的命中（cite 系列模板的 title 通常強制不轉換）' },
  'nta.step.prevTip': { hans: '上一处（快捷键 [）', hant: '上一處（快捷鍵 [）' },
  'nta.step.nextTip': { hans: '下一处（快捷键 ]）', hant: '下一處（快捷鍵 ]）' },
  'nta.step.endTip': { hans: '结束逐处查看', hant: '結束逐處檢視' },
  'nta.step.nameTip': { hans: '点一下，面板滚到这条规则', hant: '點一下，面板滾到這條規則' },
  // ── nta 检查面板：空状态 / 统计 / 分区 ──
  'nta.notConvertedYet': { hans: '还没转换完', hant: '還沒轉換完' },
  'nta.notConvertedYetHelp': { hans: '转换完成后，这里会列出每个转换组 / 全页规则用到了哪些、用在哪里。', hant: '轉換完成後，這裡會列出每個轉換組 / 全頁規則用到了哪些、用在哪裡。' },
  'nta.noRules': { hans: '本页没有可检查的规则', hant: '本頁沒有可檢查的規則' },
  'nta.noRulesHelp': { hans: '没有 {{noteTA}} 引用的转换组 / 全页规则，也没有 -{H|}- 隐藏规则。', hant: '沒有 {{noteTA}} 引用的轉換組 / 全頁規則，也沒有 -{H|}- 隱藏規則。' },
  'nta.error.checkFailed': { hans: '[LC Debug] 规则关系检查失败', hant: '[LC Debug] 規則關係檢查失敗' },
  'nta.stat.bodyHits': { hans: '正文命中', hant: '正文命中' },
  'nta.stat.refHits': { hans: 'ref 内命中', hant: 'ref 內命中' },
  'nta.stat.hitsTip': { hans: '实际生效的转换命中次数', hant: '實際生效的轉換命中次數' },
  'nta.stat.groupsUsed': { hans: '转换组有用', hant: '轉換組有用' },
  'nta.stat.groupsUsedTip': { hans: '有命中的转换组 / 全部转换组', hant: '有命中的轉換組 / 全部轉換組' },
  'nta.stat.numericUsed': { hans: '数字参数有用', hant: '數字參數有用' },
  'nta.stat.numericUsedTip': { hans: '有命中的 noteTA 数字参数规则 / 全部数字参数规则', hant: '有命中的 noteTA 數字參數規則 / 全部數字參數規則' },
  'nta.stat.cleanable': { hans: '可清理', hant: '可清理' },
  'nta.stat.cleanableTip': { hans: '整组 / 整条都没命中、可以自动移除', hant: '整組 / 整條都沒命中、可以自動移除' },
  'nta.stat.cleanableNone': { hans: '没有可自动移除的规则', hant: '沒有可自動移除的規則' },
  'nta.reorder.label': { hans: '重新排序', hant: '重新排序' },
  'nta.reorder.tip': { hans: '调整公共转换组与个别转换的先后顺序（也就是优先级），并重新编号', hant: '調整公共轉換組與個別轉換的先後順序（也就是優先順序），並重新編號' },
  'nta.cleanup.title': { hans: '可清理（$1）', hant: '可清理（$1）' },
  'nta.cleanup.note': { hans: '从没被命中。移除前会先逐变体对比渲染结果，有差异不会自动提交。', hant: '從沒被命中。移除前會先逐變體對比渲染結果，有差異不會自動提交。' },
  'nta.cleanup.groupLabel': { hans: '$1（$2 条规则）', hant: '$1（$2 條規則）' },
  'nta.cleanup.localRulesTag': { hans: '全页规则', hant: '全頁規則' },
  'nta.section.commonGroups': { hans: '公共转换组', hant: '公共轉換組' },
  'nta.section.commonGroupsHint': { hans: '来自 {{noteTA}} 的 G 参数', hant: '來自 {{noteTA}} 的 G 參數' },
  'nta.section.pageConversion': { hans: '全页转换', hant: '全頁轉換' },
  'nta.section.pageConversionHint': { hans: '直接写在本页的规则', hant: '直接寫在本頁的規則' },
  'nta.section.numericParams': { hans: 'noteTA 数字参数', hant: 'noteTA 數字參數' },
  'nta.section.hiddenRules': { hans: '-{H|}- / -{A|}- 隐藏规则', hant: '-{H|}- / -{A|}- 隱藏規則' },
  'nta.search.noMatch': { hans: '没有匹配的规则', hant: '沒有匹配的規則' },
  'nta.search.noMatchHelp': { hans: '换个关键词，或把上面的“命中 / 位置”筛选切到“全部”。', hant: '換個關鍵詞，或把上面的“命中 / 位置”篩選切到“全部”。' },
  'nta.conflict.title': { hans: '冲突检查', hant: '衝突檢查' },
  'nta.conflict.subtitle': { hans: '同一个 key 被多条规则定义', hant: '同一個 key 被多條規則定義' },
  'nta.conflict.heading': { hans: '同名 key 冲突', hant: '同名 key 衝突' },
  'nta.conflict.count': { hans: '$1 个', hant: '$1 個' },
  'nta.conflict.note': { hans: '层级高的生效，同层后写入的生效；落败的那条在这个 key 上不会命中（页中间的 -{H|}- 只管它之后的文本，这里没单独算）。', hant: '層級高的生效，同層後寫入的生效；落敗的那條在這個 key 上不會命中（頁中間的 -{H|}- 只管它之後的文字，這裡沒單獨算）。' },
  'nta.help.title': { hans: '怎么用', hant: '怎麼用' },
  'nta.help.body': { hans: '只统计实际生效的命中（被更高层覆盖、被更长的词截胡的不算）。规则显示的是各变体转换结果的简写（A/B/C）；简写相同而规则不同的，会显示完整规则。展开一条规则，点任意一处跳到正文；“▶ 逐处查看”后用顶部 ◀ ▶ 或 [ ] 键依次翻看。“位置”可只看正文或只看 ref 里的命中——cite 系列模板的 title 在 ref 里通常是强制不转换的，“全在 ref 内”的规则值得再核对。红色“删了会变”＝删掉这条规则后本页有词的转换结果会变（展开看是哪些词、删后变成什么；看似和核心重复但在挡别的规则的也在此列）；橙色“被盖住”＝这条规则的词条被层级更高或同层更晚的同名定义盖住，所以不起作用（展开看是谁）。只比到整词、只看本页命中的词，别的页面用到的不在内。搜索框按 Esc 清空。', hant: '只統計實際生效的命中（被更高層覆蓋、被更長的詞截胡的不算）。規則顯示的是各變體轉換結果的簡寫（A/B/C）；簡寫相同而規則不同的，會顯示完整規則。展開一條規則，點任意一處跳到正文；“▶ 逐處檢視”後用頂部 ◀ ▶ 或 [ ] 鍵依次翻看。“位置”可只看正文或只看 ref 裡的命中——cite 系列模板的 title 在 ref 裡通常是強制不轉換的，“全在 ref 內”的規則值得再核對。紅色“刪了會變”＝刪掉這條規則後本頁有詞的轉換結果會變（展開看是哪些詞、刪後變成什麼；看似和核心重複但在擋別的規則的也在此列）；橙色“被蓋住”＝這條規則的詞條被層級更高或同層更晚的同名定義蓋住，所以不起作用（展開看是誰）。只比到整詞、只看本頁命中的詞，別的頁面用到的不在內。搜尋框按 Esc 清空。' },
  // ── nta 徽标 / 侧栏 ──
  'nta.badge.toggleTip': { hans: '打开 / 关闭 noteTA 检查（转换完成后可用）', hant: '開啟 / 關閉 noteTA 檢查（轉換完成後可用）' },
  'nta.badge.cleanable': { hans: '$1 项可清理', hant: '$1 項可清理' },
  'dock.ntaTitle': { hans: 'noteTA 检查', hant: 'noteTA 檢查' },
  'dock.tocTitle': { hans: '目录', hant: '目錄' },
  'dock.collapse': { hans: '收起侧栏', hant: '收起側欄' },
  'dock.resizeTip': { hans: '拖动调整宽度', hant: '拖動調整寬度' },
  'dock.tocEmpty': { hans: '没有可显示的标题（转换中，或本页没有标题）', hant: '沒有可顯示的標題（轉換中，或本頁沒有標題）' },
  'dock.tocToggleTip': { hans: '打开 / 关闭目录', hant: '開啟 / 關閉目錄' },
  'dock.leftButton': { hans: '左栏', hant: '左欄' },
  'dock.leftTip': { hans: '展开 / 收起站点自带的左栏（主菜单等；原生目录始终隐藏）', hant: '展開 / 收起站點自帶的左欄（主選單等；原生目錄始終隱藏）' },
  // ── nta 规则移到数字参数 ──
  'nta.move.topLevelPipe': { hans: '有规则含有顶层的 |，无法作为数字参数写入：$1', hant: '有規則含有頂層的 |，無法作為數字參數寫入：$1' },
  'nta.move.alreadyThere': { hans: '数字参数里已经有相同的规则了，无需复制。', hant: '數字參數裡已經有相同的規則了，無需複製。' },
  'nta.move.tooMany': { hans: 'noteTA 只接受 30 个数字参数：已有 $1 个，还能放 $2 个，而要移入 $3 条。', hant: 'noteTA 只接受 30 個數字參數：已有 $1 個，還能放 $2 個，而要移入 $3 條。' },
  // ── retry / compare / quick 渲染对比用的状态文字 ──
  'retry.attempt': { hans: '$1（第 $2 次尝试）', hant: '$1（第 $2 次嘗試）' },
  'retry.rateLimited': { hans: '$1 被站点拒绝（并发/限流），$2 秒后重试', hant: '$1 被站點拒絕（併發/限流），$2 秒後重試' },
  'compare.noHtml': { hans: '接口没有返回 HTML', hant: '介面沒有返回 HTML' },
  'compare.renderBefore': { hans: '渲染原本', hant: '渲染原本' },
  'compare.renderAfter': { hans: '渲染删去后', hant: '渲染刪去後' },
  'compare.skipped': { hans: '已跳过：前一个变体超时，整页渲染超过站点时限，其它变体不会更快', hant: '已跳過：前一個變體超時，整頁渲染超過站點時限，其它變體不會更快' },
  'quick.noTables': { hans: '还没有转换过页面（缺少转换表），请先转换一次', hant: '還沒有轉換過頁面（缺少轉換表），請先轉換一次' },
  'quick.noExpansion': { hans: '接口没有返回展开结果', hant: '介面沒有返回展開結果' },
  'quick.locating': { hans: '定位命中位置（第 $1–$2 行）', hant: '定位命中位置（第 $1–$2 行）' },
  'quick.expanding': { hans: '展开模板 $1/$2', hant: '展開模板 $1/$2' },
  // ── spec 移除 / 复制任务的描述 ──
  'spec.groupLabel': { hans: '公共转换组 $1', hant: '公共轉換組 $1' },
  'spec.groupMoveLabel': { hans: '公共转换组 $1（移到数字参数）', hant: '公共轉換組 $1（移到數字參數）' },
  'spec.groupMoveTip': { hans: '把转换组的规则移到数字参数', hant: '把轉換組的規則移到數字參數' },
  'spec.groupMoveSummary': { hans: '校对字词转换：将公共转换组 $1 中生效的 $2 条规则移到 noteTA 数字参数，并移除该转换组', hant: '校對字詞轉換：將公共轉換組 $1 中生效的 $2 條規則移到 noteTA 數字參數，並移除該轉換組' },
  'spec.groupMoveDone': { hans: '已把 $1 的 $2 条规则移到数字参数', hant: '已把 $1 的 $2 條規則移到數字參數' },
  'spec.ruleCopyLabel': { hans: '公共转换组 $1 · $2（复制到数字参数）', hant: '公共轉換組 $1 · $2（複製到數字參數）' },
  'spec.ruleCopyVerb': { hans: '复制', hant: '複製' },
  'spec.ruleCopyTip': { hans: '把转换组里的规则复制到数字参数（不做渲染对比）', hant: '把轉換組裡的規則複製到數字參數（不做渲染對比）' },
  'spec.ruleCopySummary': { hans: '校对字词转换：将公共转换组 $1 中的规则复制到 noteTA 数字参数（$2）', hant: '校對字詞轉換：將公共轉換組 $1 中的規則複製到 noteTA 數字參數（$2）' },
  'spec.ruleCopyDone': { hans: '已把规则复制到数字参数', hant: '已把規則複製到數字參數' },
  // ── rm 移除 / 复制流程：差异详情 ──
  'rm.detail.copyDiff': { hans: '⚠ 复制后渲染结果有变化（$1 组差异），未自动提交。数字参数的优先级高于转换组，这条规则会压过其它转换组 / 核心表里的同名词条，请核对。', hant: '⚠ 複製後渲染結果有變化（$1 組差異），未自動提交。數字參數的優先順序高於轉換組，這條規則會壓過其它轉換組 / 核心表裡的同名詞條，請核對。' },
  'rm.detail.moveDiff': { hans: '⚠ 移动后渲染结果有变化（$1 组差异），未自动提交。数字参数的优先级高于转换组，可能压过了其它转换组的同名词条；没命中而被丢弃的规则也可能在模板里生效，请核对。', hant: '⚠ 移動後渲染結果有變化（$1 組差異），未自動提交。數字參數的優先順序高於轉換組，可能壓過了其它轉換組的同名詞條；沒命中而被丟棄的規則也可能在模板裡生效，請核對。' },
  'rm.detail.removeDiff': { hans: '⚠ 删去后渲染结果有变化（$1 组差异），未自动提交。多半是模板、导航框等没写在本页源码里的内容用到了这条规则，请核对。', hant: '⚠ 刪去後渲染結果有變化（$1 組差異），未自動提交。多半是模板、導航框等沒寫在本頁原始碼裡的內容用到了這條規則，請核對。' },
  'rm.moreGroupsHidden': { hans: '…另有 $1 组未显示', hant: '…另有 $1 組未顯示' },
  'rm.moreLocationsHidden': { hans: '…另有 $1 处未显示', hant: '…另有 $1 處未顯示' },
  'rm.detail.variants': { hans: '变体：$1', hant: '變體：$1' },
  'rm.detail.before': { hans: '原本：$1', hant: '原本：$1' },
  'rm.detail.after': { hans: '删去后：$1', hant: '刪去後：$1' },
  'rm.detail.domPath': { hans: 'DOM 路径：$1', hant: 'DOM 路徑：$1' },
  'rm.detail.root': { hans: '（根）', hant: '（根）' },
  'rm.detail.possibleRules': { hans: '可能匹配的转换规则：$1', hant: '可能匹配的轉換規則：$1' },
  'rm.detail.noRuleMatched': { hans: '（没有匹配到被删规则里的词，可能是回退链或其它层造成的差异）', hant: '（沒有匹配到被刪規則裡的詞，可能是回退鏈或其它層造成的差異）' },
  // ── rm 移除 / 复制流程：主流程 ──
  'rm.busy': { hans: '已有一个移除任务在进行中', hant: '已有一個移除任務在進行中' },
  'rm.unavailable': { hans: '无法移除：$1', hant: '無法移除：$1' },
  'rm.editorOpen': { hans: '请先提交或取消当前的编辑器', hant: '請先提交或取消當前的編輯器' },
  'rm.notFoundInSource': { hans: '在源码里没找到这条规则（页面可能已变化），请重新转换后再试', hant: '在原始碼裡沒找到這條規則（頁面可能已變化），請重新轉換後再試' },
  'rm.defaultVerb': { hans: '移动', hant: '移動' },
  'rm.forceVerb': { hans: '仍要$1', hant: '仍要$1' },
  'rm.forceRemove': { hans: '仍要移除', hant: '仍要移除' },
  'rm.preparing': { hans: '准备中…', hant: '準備中…' },
  'rm.slowButton': { hans: '整页渲染对比（很慢，可能超时）', hant: '整頁渲染對比（很慢，可能超時）' },
  'rm.slowTip': { hans: '逐变体请求整页渲染；大页面常因站点时限失败', hant: '逐變體請求整頁渲染；大頁面常因站點時限失敗' },
  'rm.title': { hans: '移除无用的 noteTA 规则', hant: '移除無用的 noteTA 規則' },
  'rm.summary': { hans: '校对字词转换：移除未使用的 noteTA 规则（$1）', hant: '校對字詞轉換：移除未使用的 noteTA 規則（$1）' },
  'rm.staleDuringCompare': { hans: '源码在对比期间发生了变化，已中止', hant: '原始碼在對比期間發生了變化，已中止' },
  'rm.removedDone': { hans: '已移除 $1', hant: '已移除 $1' },
  'rm.afterVerb': { hans: '$1后', hant: '$1後' },
  'rm.afterRemoval': { hans: '删去后', hant: '刪去後' },
  'rm.commitWithoutCompare': { hans: '不对比，直接$1', hant: '不對比，直接$1' },
  'rm.confirmNoCompare': { hans: '没有做渲染对比，确定直接提交？', hant: '沒有做渲染對比，確定直接提交？' },
  'rm.copyingNoCompare': { hans: '复制到数字参数（不做渲染对比）', hant: '複製到數字參數（不做渲染對比）' },
  'rm.largeNoCompare': { hans: '页面较大：尚未做渲染对比', hant: '頁面較大：尚未做渲染對比' },
  'rm.largeUnverifiable': { hans: '页面较大（$1 KB），整页渲染对比很可能超时。$2规则无法用“展开模板后查词”来验证。可以尝试整页渲染对比，或不对比直接提交。', hant: '頁面較大（$1 KB），整頁渲染對比很可能超時。$2規則無法用“展開模板後查詞”來驗證。可以嘗試整頁渲染對比，或不對比直接提交。' },
  'rm.check.failed': { hans: '检查失败：$1', hant: '檢查失敗：$1' },
  'rm.retryHint': { hans: '可取消后重试。', hant: '可取消後重試。' },
  // ── rm 逐变体整页渲染对比 ──
  'rm.compare.title': { hans: '逐个变体整页渲染对比（原本 vs $1；已忽略 noteTA 提示框本身）', hant: '逐個變體整頁渲染對比（原本 vs $1；已忽略 noteTA 提示框本身）' },
  'rm.compare.start': { hans: '开始对比：8 个变体依次请求，每个变体先渲染「原本」再渲染「$1」，大页面可能要几十秒到几分钟…', hant: '開始對比：8 個變體依次請求，每個變體先渲染「原本」再渲染「$1」，大頁面可能要幾十秒到幾分鐘…' },
  'rm.compare.waiting': { hans: '$1：等待中', hant: '$1：等待中' },
  'rm.compare.progress': { hans: '逐变体对比进行中：已完成 $1 / $2…', hant: '逐變體對比進行中：已完成 $1 / $2…' },
  'rm.compare.variantFailed': { hans: '$1：失败 $2', hant: '$1：失敗 $2' },
  'rm.compare.variantChanged': { hans: '$1：有变化（$2 处）', hant: '$1：有變化（$2 處）' },
  'rm.compare.variantSame': { hans: '$1：无变化', hant: '$1：無變化' },
  'rm.compare.finished': { hans: '逐变体对比结束（$1 / $2）。', hant: '逐變體對比結束（$1 / $2）。' },
  'rm.compare.failedSomeVariants': { hans: '有变体请求失败，已中止，不会提交。可取消后重试。', hant: '有變體請求失敗，已中止，不會提交。可取消後重試。' },
  'rm.compare.noDiffCommitting': { hans: '八个变体前后都没有变化，正在提交…', hant: '八個變體前後都沒有變化，正在提交…' },
  'rm.compare.confirmDiff': { hans: '渲染结果有差异，确定仍要$1这条规则？', hant: '渲染結果有差異，確定仍要$1這條規則？' },
  'rm.compare.failed': { hans: '对比失败：$1', hant: '對比失敗：$1' },
  // ── rm 展开模板后查词（大页面） ──
  'rm.quick.title': { hans: '快速检查：展开模板后查词（页面较大，不做整页渲染）', hant: '快速檢查：展開模板後查詞（頁面較大，不做整頁渲染）' },
  'rm.quick.failed': { hans: '快速检查失败：$1', hant: '快速檢查失敗：$1' },
  'rm.quick.largePage': { hans: '页面较大（$1 KB），没有逐变体整页渲染，改为展开模板后查词（共 $2 段）。', hant: '頁面較大（$1 KB），沒有逐變體整頁渲染，改為展開模板後查詞（共 $2 段）。' },
  'rm.quick.noHit': { hans: '✓ 展开模板后，用本地转换引擎处理整页文本，这条规则一次都没有生效（最长匹配、同长先后、链接目标等都按引擎现有逻辑处理），可以移除。这不是站点的渲染对比。', hant: '✓ 展開模板後，用本地轉換引擎處理整頁文字，這條規則一次都沒有生效（最長匹配、同長先後、連結目標等都按引擎現有邏輯處理），可以移除。這不是站點的渲染對比。' },
  'rm.quick.activeWarning': { hans: '⚠ 展开模板后，这些规则在 $1 处实际生效（共发出 $2 次展开请求）。本页源码里没有用到它们，所以多半来自模板 / 导航框；下面是它们在源码中的位置。$3', hant: '⚠ 展開模板後，這些規則在 $1 處實際生效（共發出 $2 次展開請求）。本頁原始碼裡沒有用到它們，所以多半來自模板 / 導航框；下面是它們在原始碼中的位置。$3' },
  'rm.quick.locateLimit': { hans: '定位请求已达上限，标“范围”的条目只能给出行号区间。', hant: '定位請求已達上限，標“範圍”的條目只能給出行號區間。' },
  'rm.quick.confirmHits': { hans: '展开后的文本里命中了这些词，确定仍要移除这条规则？', hant: '展開後的文字裡命中了這些詞，確定仍要移除這條規則？' },
  'rm.loc.lines': { hans: '第 $1 行', hant: '第 $1 行' },
  'rm.loc.rangeNote': { hans: '（范围，未细分）', hant: '（範圍，未細分）' },
  'rm.loc.section': { hans: ' · 章节「$1」', hant: ' · 章節「$1」' },
  'rm.loc.top': { hans: ' · 页首', hant: ' · 頁首' },
  'rm.loc.template': { hans: ' · 模板 $1', hant: ' · 模板 $1' },
  'rm.loc.source': { hans: '源码：$1', hant: '原始碼：$1' },
  'rm.hit.expanded': { hans: '$1：「$2」×$3　展开后：', hant: '$1：「$2」×$3　展開後：' },
  // ── 保存 / 同步（移除、重排、编辑共用） ──
  'save.captcha': { hans: '站点要求验证码，请到编辑页保存', hant: '站點要求驗證碼，請到編輯頁儲存' },
  'save.failed': { hans: '保存没有成功', hant: '儲存沒有成功' },
  'save.noChange': { hans: '内容与当前版本相同，没有产生新版本。', hant: '內容與當前版本相同，沒有產生新版本。' },
  'save.savedVersion': { hans: '$1（版本 $2）', hant: '$1（版本 $2）' },
  'sync.savedButSyncFailed': { hans: '已保存，但同步新版本失败：$1。请刷新页面。', hant: '已儲存，但同步新版本失敗：$1。請重新整理頁面。' },
  'sync.savedButSyncFailedReconvert': { hans: '已保存，但同步新版本失败：$1。请点“重新转换”或刷新页面。', hant: '已儲存，但同步新版本失敗：$1。請點“重新轉換”或重新整理頁面。' },
  'sync.failed': { hans: '同步失败：$1', hant: '同步失敗：$1' },
  // ── reorder 重新排序 noteTA 参数 ──
  'reorder.busy': { hans: '已有一个移除 / 修改任务在进行中', hant: '已有一個移除 / 修改任務在進行中' },
  'reorder.unavailable': { hans: '无法修改：$1', hant: '無法修改：$1' },
  'reorder.noNoteTA': { hans: '在源码里没找到可以重新排序的 {{noteTA}}（页面可能已变化），请重新转换后再试', hant: '在原始碼裡沒找到可以重新排序的 {{noteTA}}（頁面可能已變化），請重新轉換後再試' },
  'reorder.save': { hans: '保存', hant: '儲存' },
  'reorder.subtitle': { hans: ' · noteTA 的转换组与数字参数', hant: ' · noteTA 的轉換組與數字參數' },
  'reorder.help': { hans: '排在后面的优先级更高，个别转换的优先级高于公共转换组。保存时按新顺序重新编号，空的参数会丢掉（包括注释）。', hant: '排在後面的優先順序更高，個別轉換的優先順序高於公共轉換組。儲存時按新順序重新編號，空的參數會丟掉（包括註釋）。' },
  'reorder.moveUpTip': { hans: '上移（优先级降低 / 前移）', hant: '上移（優先順序降低 / 前移）' },
  'reorder.moveDownTip': { hans: '下移（优先级升高 / 后移）', hant: '下移（優先順序升高 / 後移）' },
  'reorder.from': { hans: '　原 $1', hant: '　原 $1' },
  'reorder.noteTAAt': { hans: '{{noteTA}}（第 $1 行）', hant: '{{noteTA}}（第 $1 行）' },
  'reorder.individualConversions': { hans: '个别字词转换', hant: '個別字詞轉換' },
  'reorder.unchanged': { hans: '顺序与编号都没有变化。', hant: '順序與編號都沒有變化。' },
  'reorder.staleDuringEdit': { hans: '源码在编辑期间发生了变化，已中止', hant: '原始碼在編輯期間發生了變化，已中止' },
  'reorder.summary': { hans: '校对字词转换：重新排序 noteTA 的转换组与数字参数（G1…Gn / 1…n）', hant: '校對字詞轉換：重新排序 noteTA 的轉換組與數字參數（G1…Gn / 1…n）' },
  'reorder.done': { hans: '已重新排序 noteTA 参数（版本 $1）', hant: '已重新排序 noteTA 參數（版本 $1）' },
  // ── convert 转换主流程 ──
  'convert.reading': { hans: '读取全文…', hant: '讀取全文…' },
  'convert.readingGroups': { hans: '读取公共转换组…', hant: '讀取公共轉換組…' },
  'convert.loadFailed': { hans: '加载失败：$1', hant: '載入失敗：$1' },
  'convert.tables': { hans: '核心 $1 条 + 站点表 $2 条（$3 页）', hant: '核心 $1 條 + 站點表 $2 條（$3 頁）' },
  'convert.missingTables': { hans: '；缺 $1', hant: '；缺 $1' },
  'convert.groupsLoaded': { hans: '；公共转换组 $1/$2', hant: '；公共轉換組 $1/$2' },
  'convert.groupsViaTemplate': { hans: '（$1 来自模板）', hant: '（$1 來自模板）' },
  'convert.groupsNotFoundInline': { hans: '（找不到：$1）', hant: '（找不到：$1）' },
  'convert.groupsNotFound': { hans: '；找不到公共转换组：$1', hant: '；找不到公共轉換組：$1' },
  'convert.converting': { hans: '转换中…', hant: '轉換中…' },
  'convert.error.checkSummaryFailed': { hans: '[LC Debug] noteTA 检查汇总失败', hant: '[LC Debug] noteTA 檢查彙總失敗' },
  'convert.phases': { hans: '清空 $1、读取 $2、转换渲染 $3、挂载 $4、排版 $5、目录与检查 $6', hant: '清空 $1、讀取 $2、轉換渲染 $3、掛載 $4、排版 $5、目錄與檢查 $6' },
  'convert.done': { hans: '完成，$1 个片段，$2 个标题$3', hant: '完成，$1 個片段，$2 個標題$3' },
  'convert.logSummary': { hans: '$1；完成，$2 个片段，$3 个标题；用时 $4 ms（计算 $5 ms，$6 字符；$7 ms）', hant: '$1；完成，$2 個片段，$3 個標題；用時 $4 ms（計算 $5 ms，$6 字元；$7 ms）' },
  // ── edit 编辑模式 ──
  'edit.unavailable.inEditPage': { hans: '编辑页里不可用，请在阅读页使用', hant: '編輯頁裡不可用，請在閱讀頁使用' },
  'edit.unavailable.readViewOnly': { hans: '仅在阅读页可用', hant: '僅在閱讀頁可用' },
  'edit.unavailable.diffView': { hans: '差异视图不可用', hant: '差異檢視不可用' },
  'edit.unavailable.oldRevision': { hans: '正在查看旧版本', hant: '正在檢視舊版本' },
  'edit.unavailable.noPermission': { hans: '你无权编辑此页（可能被保护或已被封禁）', hant: '你無權編輯此頁（可能被保護或已被封禁）' },
  'edit.toggleTip': { hans: '开启后，点击页面即可就地编辑', hant: '開啟後，點擊頁面即可就地編輯' },
  'edit.cannotEnable': { hans: '无法开启编辑模式：$1', hant: '無法開啟編輯模式：$1' },
  'edit.confirmDiscard': { hans: '编辑器里有尚未提交的内容，关闭编辑模式会丢弃它。确定关闭？', hant: '編輯器裡有尚未提交的內容，關閉編輯模式會丟棄它。確定關閉？' },
  'edit.buttonOn': { hans: '✎ 编辑中（点此关闭）', hant: '✎ 編輯中（點此關閉）' },
  'edit.buttonOff': { hans: '✎ 开启编辑模式', hant: '✎ 開啟編輯模式' },
  // ── api 错误文字 ──
  'api.error.editConflict': { hans: '编辑冲突，且无法自动合并。', hant: '編輯衝突，且無法自動合併。' },
  'api.error.protectedPage': { hans: '页面受保护，你没有权限编辑。', hant: '頁面受保護，你沒有權限編輯。' },
  'api.error.permissionDenied': { hans: '没有权限执行此编辑。', hant: '沒有權限執行此編輯。' },
  'api.error.blocked': { hans: '你的帐号或 IP 被封禁。', hant: '你的帳號或 IP 被封禁。' },
  'api.error.readOnly': { hans: '站点当前只读。', hant: '站點當前只讀。' },
  'api.error.badToken': { hans: '编辑令牌失效，请刷新页面后重试。', hant: '編輯令牌失效，請重新整理頁面後重試。' },
  'api.error.rateLimited': { hans: '操作太频繁，请稍后再试。', hant: '操作太頻繁，請稍後再試。' },
  'api.error.contentTooBig': { hans: '内容超过站点大小上限。', hant: '內容超過站點大小上限。' },
  'api.error.pageChanged': { hans: '页面状态已变化。', hant: '頁面狀態已變化。' },
  'api.error.pageDeleted': { hans: '页面已被删除。', hant: '頁面已被刪除。' },
  'api.error.abuseFilterDisallowed': { hans: '被防滥用过滤器拒绝。', hant: '被防濫用過濾器拒絕。' },
  'api.error.abuseFilterWarning': { hans: '被防滥用过滤器警告。', hant: '被防濫用過濾器警告。' },
  'api.error.spam': { hans: '被垃圾内容过滤器拒绝。', hant: '被垃圾內容過濾器拒絕。' },
  'api.httpFailed': { hans: 'HTTP 请求失败（$1）', hant: 'HTTP 請求失敗（$1）' },
  'api.failed': { hans: '失败：$1', hant: '失敗：$1' },
  'api.failedWithInfo': { hans: '失败：$1（$2）', hant: '失敗：$1（$2）' },
  'api.unknownError': { hans: '未知错误', hant: '未知錯誤' },
  'rev.downloadFailed': { hans: '下载新版本失败：HTTP $1', hant: '下載新版本失敗：HTTP $1' },
  // ── editor 就地编辑器 ──
  'editor.confirmDiscardCurrent': { hans: '当前编辑器里有未提交的修改，要放弃它并打开新的吗？', hant: '當前編輯器裡有未提交的修改，要放棄它並開啟新的嗎？' },
  'editor.previewButton': { hans: '预览并确认', hant: '預覽並確認' },
  'editor.title': { hans: '编辑 wikitext', hant: '編輯 wikitext' },
  'editor.position': { hans: ' · 第 $1 行 · $2 字符', hant: ' · 第 $1 行 · $2 字元' },
  'editor.tip': { hans: '点别处不会关闭，可以去页面上复制内容 · Ctrl+Enter 预览 · Esc 取消', hant: '點別處不會關閉，可以去頁面上複製內容 · Ctrl+Enter 預覽 · Esc 取消' },
  'editor.confirmDiscard': { hans: '放弃这次修改？', hant: '放棄這次修改？' },
  'editor.error.stalePosition': { hans: '页面已有新版本并已同步，这次修改的位置已失效。请复制你的内容，在新版本上重新选择位置编辑。', hant: '頁面已有新版本並已同步，這次修改的位置已失效。請複製你的內容，在新版本上重新選擇位置編輯。' },
  'editor.noChange': { hans: '没有改动。', hant: '沒有改動。' },
  'editor.error.sourceMismatch': { hans: '校验失败：这一段源码与打开编辑器时不一致（页面已同步过？），已中止。请复制内容后重新编辑。', hant: '校驗失敗：這一段原始碼與開啟編輯器時不一致（頁面已同步過？），已中止。請複製內容後重新編輯。' },
  // ── link 内部链接显示文字被改 ──
  'link.pipeButton': { hans: '改成 [[$1|…]]', hant: '改成 [[$1|…]]' },
  'link.dialogTitle': { hans: '内部链接的显示文字被修改', hant: '內部連結的顯示文字被修改' },
  'link.askKeepTarget': { hans: '你改的是 [[$1]] 里的文字。直接改会连链接目标一起改掉，是否保留原目标？', hant: '你改的是 [[$1]] 裡的文字。直接改會連同連結目標一起改掉，是否保留原目標？' },
  'link.pipePreview': { hans: '管道链接（目标不变）：$1', hant: '管道連結（目標不變）：$1' },
  'link.directPreview': { hans: '直接改（目标随之改变）：[[$1]]', hant: '直接改（目標隨之改變）：[[$1]]' },
  'link.directButton': { hans: '直接改', hant: '直接改' },
  // ── diff 差异视图 ──
  'diff.noResult': { hans: '接口没有返回 diff', hant: '介面沒有返回 diff' },
  'diff.before': { hans: '改前', hant: '改前' },
  'diff.after': { hans: '改后', hant: '改後' },
  'diff.noRenderDifference': { hans: '（渲染结果没有差异：源码变了，但转换出来的各个块都相同）', hant: '（渲染結果沒有差異：原始碼變了，但轉換出來的各個塊都相同）' },
  'diff.skippedBlocks': { hans: '⋯ 省略 $1 个相同块', hant: '⋯ 省略 $1 個相同塊' },
  'diff.none': { hans: '（无）', hant: '（無）' },
  // ── confirm 提交前确认 ──
  'confirm.summary': { hans: '校对字词转换：编辑（第 $1 行）：$2 → $3', hant: '校對字詞轉換：編輯（第 $1 行）：$2 → $3' },
  'confirm.previewFailed': { hans: '预览失败：$1', hant: '預覽失敗：$1' },
  'confirm.requestingDiff': { hans: '正向服务器请求源代码差异…', hant: '正向伺服器請求原始碼差異…' },
  'confirm.back': { hans: '返回修改', hant: '返回修改' },
  'confirm.ok': { hans: '确认编辑', hant: '確認編輯' },
  'confirm.affectsLater': { hans: '⚠ 这次改动涉及 -{ }- 或 noteTA，会影响后文的转换；下面的预览只重转换了这一行，请留意后文。', hant: '⚠ 這次改動涉及 -{ }- 或 noteTA，會影響後文的轉換；下面的預覽只重轉換了這一行，請留意後文。' },
  'confirm.rewrittenAsPipe': { hans: 'ⓘ 已改写成 $1，链接目标保持为 $2', hant: 'ⓘ 已改寫成 $1，連結目標保持為 $2' },
  'confirm.conversionDiff': { hans: '转换差异', hant: '轉換差異' },
  'confirm.sourceDiff': { hans: '源代码差异', hant: '原始碼差異' },
  'confirm.summaryLabel': { hans: '摘要 ', hant: '摘要 ' },
  'confirm.tip': { hans: '差异加载完成后才能确认 · Ctrl+Enter 确认 · Esc 返回修改', hant: '差異載入完成後才能確認 · Ctrl+Enter 確認 · Esc 返回修改' },
  'confirm.staleDuringConfirm': { hans: '源码在确认期间发生了变化，已中止', hant: '原始碼在確認期間發生了變化，已中止' },
  'confirm.saved': { hans: '已保存（版本 $1）。可以继续改下一处。', hant: '已儲存（版本 $1）。可以繼續改下一處。' },
  'confirm.editConflict': { hans: '编辑冲突，已同步到最新版本。你的内容还在框里，请复制后在新版本上重新选位置编辑。', hant: '編輯衝突，已同步到最新版本。你的內容還在框裡，請複製後在新版本上重新選位置編輯。' },
  'confirm.noSourceDiff': { hans: '（源代码没有差异）', hant: '（原始碼沒有差異）' },
  'confirm.diffLoadFailed': { hans: '⚠ 源代码差异加载失败（$1）。仍可确认保存，但请自己核对上面的预览。', hant: '⚠ 原始碼差異載入失敗（$1）。仍可確認儲存，但請自己核對上面的預覽。' },
  'confirm.newVersionDuringEdit': { hans: '页面在你编辑期间有了新版本（$1），已同步。你的内容还在框里，请复制后在新版本上重新选位置编辑。', hant: '頁面在你編輯期間有了新版本（$1），已同步。你的內容還在框裡，請複製後在新版本上重新選位置編輯。' },
  'confirm.newVersionSynced': { hans: '页面已有新版本，已同步。', hant: '頁面已有新版本，已同步。' },
  'confirm.headerLines': { hans: ' · 第 $1 行', hant: ' · 第 $1 行' },
  // ── toolbar / app ──
  'toolbar.reconvert': { hans: '重新转换', hant: '重新轉換' },
  'toolbar.tocToggleTip': { hans: '打开 / 关闭侧栏里的目录', hant: '開啟 / 關閉側欄裡的目錄' },
  'toolbar.edit': { hans: '✎ 编辑', hant: '✎ 編輯' },
  'app.title': { hans: '校对字词转换', hant: '校對字詞轉換' },
  'toolbar.dots': { hans: ' 圆点标记', hant: ' 圓點標記' },
  'toolbar.blind': { hans: ' 盲检模式', hant: ' 盲檢模式' },
  'toolbar.expandAll': { hans: ' 展开全部', hant: ' 展開全部' },
  'toolbar.exit': { hans: '退出', hant: '退出' },
  'app.enterTip': { hans: '进入字词转换校对（LC Debug）模式', hant: '進入字詞轉換校對（LC Debug）模式' },
};
/** 取消息：按界面语言返回简体或繁体；$1、$2… 依次换成后面的参数（只扫一遍，参数里带 $1 之类的字样不会被再次替换）；key 不存在时原样返回 key，方便发现遗漏 */
const _M = (key, ...args) => {
  const m = MSG[key];
  if (!m) return key;
  const s = LC_HANT ? m.hant : m.hans;
  return args.length ? s.replace(/\$([1-9]\d*)/g, (all, i) => (i <= args.length ? String(args[i - 1]) : all)) : s;
};

// ═════════════════════════ lc-core：M1 屏蔽 + M2 分词 + M3 归并（不碰 DOM） ═════════════════════════
/* ===== lc-core.js ===== */
/* LC Debug 核心：M1 屏蔽 + M2 分词 + M3 归并。不碰 DOM，Worker / Node 都能跑。 */

// ───────────────────────── 共用常数 ─────────────────────────
const UI_FONT = LC_HANT
  ? '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"PingFang TC","Microsoft JhengHei","Noto Sans CJK TC","Noto Sans TC","Source Han Sans TC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC","WenQuanYi Micro Hei",sans-serif'
  : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"PingFang SC","PingFang TC","Hiragino Sans GB","Microsoft YaHei","Microsoft JhengHei","Noto Sans CJK SC","Noto Sans CJK TC","Noto Sans SC","Noto Sans TC","Source Han Sans SC","WenQuanYi Micro Hei",sans-serif'; // 小字号一律无衬线
const VARIANTS = ['zh-hans', 'zh-cn', 'zh-sg', 'zh-my', 'zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'];
const SHORT = { 'zh-hans': 'hans', 'zh-cn': 'cn', 'zh-sg': 'sg', 'zh-my': 'my', 'zh-hant': 'hant', 'zh-tw': 'tw', 'zh-hk': 'hk', 'zh-mo': 'mo' }; // 内部键：一律小写，与 ORDER / SIDES / META 一致
const DISPLAY = { hans: 'Hans', cn: 'CN', sg: 'SG', my: 'MY', hant: 'Hant', tw: 'TW', hk: 'HK', mo: 'MO' }; // 界面显示：正规大小写
const disp = k => DISPLAY[k] || k;
const ORDER = ['orig', 'hans', 'cn', 'sg', 'my', 'hant', 'tw', 'hk', 'mo']; // 9 轨 = 原文 + 8 变体
// 回退链已核对
const FALLBACK_CHAINS = {
  'zh-cn':   ['zh-cn',   'zh-hans', 'zh-sg',   'zh-my'],
  'zh-sg':   ['zh-sg',   'zh-my',   'zh-hans', 'zh-cn'],
  'zh-my':   ['zh-my',   'zh-sg',   'zh-hans', 'zh-cn'],
  'zh-tw':   ['zh-tw',   'zh-hant', 'zh-hk',   'zh-mo'],
  'zh-hk':   ['zh-hk',   'zh-mo',   'zh-hant', 'zh-tw'],
  'zh-mo':   ['zh-mo',   'zh-hk',   'zh-hant', 'zh-tw'],
  'zh-hans': ['zh-hans', 'zh-cn',   'zh-sg',   'zh-my'],
  'zh-hant': ['zh-hant', 'zh-tw',   'zh-hk',   'zh-mo']
};
const LAYER_RANK = { core: 1, local: 2, cgroup: 3, manual: 4, inline: 4 }; // inline：行内 -{zh-xx:a}-，只用于显示/配色，不进规则表
const LAYER_LABEL = { core: _M('layer.core'), local: _M('layer.siteTable'), cgroup: _M('layer.convGroup'), manual: _M('layer.pageManual'), inline: _M('layer.inlineManual') };
const ph = n => `\x01_LC_PH_${n}_\x01`;

// ───────────────────────── M1：屏蔽 ─────────────────────────
const NS_RE = /^\[\[\s*(file|image|media|category|文件|档案|檔案|图像|圖像|媒体|媒體|分类|分類)\s*:/i;
const CAT_RE = /^\s*(category|分类|分類)\s*:/i;
const OPT_RE = /^(thumb|thumbnail|frame|framed|frameless|border|right|left|center|centre|none|baseline|sub|super|top|text-top|middle|bottom|text-bottom|upright(=[\d.]+)?|\d*x?\d+px|alt=.*|link=.*|page=.*|class=.*|lang=.*|langtag=.*|start=.*|end=.*|muted|loop|autoplay)$/i;
const TAG_RE = /^<(nowiki|pre|code|syntaxhighlight|source|math|score|templatedata)\b[^>]*?(\/?)>/i;
const ANYTAG_RE = /^<\/?[a-zA-Z][^>]*>/;
// <ref …> / <ref … />：M1 不再把内容整段屏蔽，而是产生“开/合”标记，渲染器负责折叠
const REF_OPEN_RE = /^<ref\b([^>]*?)(\/?)>/i;
/** 结构标记（标题/ref 的开合）也走占位符通道：以 \x02 开头，tokenize 时还原成结构 token */
const mark = o => '\x02' + JSON.stringify(o);
function refLabel(attrs) {
  const parts = [];
  for (const m of attrs.matchAll(/\b(name|group)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'\/>]+))/gi))
    parts.push(m[1].toLowerCase() + '=' + (m[2] != null ? m[2] : m[3] != null ? m[3] : m[4]));
  return parts.length ? ('ref ' + parts.join(' ')).replace(/\sname=/g, ' ') : 'ref';
}

/** MediaWiki 预处理器把注释和扩展标签（<ref>、<nowiki>…）当成不透明的整块：里面的 | = }} 都不参与模板参数的切分。
 *  所以 {{foo|<ref name=x>cite</ref>}} 的第 1 个参数是匿名参数，而不是名为“<ref name”的参数（普通 HTML 标签如 <span style=a=b> 才会有这个问题）。
 *  t[i]==='<' 且开启这样的整块时返回结束下标（闭合之后），否则 -1（没闭合的当普通字符）。 */
const OPAQUE_TAG_RE = /^<(ref|nowiki|pre|math|syntaxhighlight|source|score|templatedata)\b[^>]*?(\/?)>/i;
function opaqueEnd(t, i) {
  const head = t.slice(i, i + 300);
  if (head.startsWith('<!--')) { const e = t.indexOf('-->', i + 4); return e > -1 ? e + 3 : t.length; }
  const m = OPAQUE_TAG_RE.exec(head);
  if (!m) return -1;
  const from = i + m[0].length;
  if (m[2]) return from; // 自闭合 <ref name=x />
  const cr = new RegExp('</' + m[1] + '\\s*>', 'ig'); cr.lastIndex = from;
  const cm = cr.exec(t);
  return cm ? cm.index + cm[0].length : -1;
}

/** t[i..] 以 open 开头，返回匹配 close 之后的下标；没闭合返回 -1（调用方当普通字符，不吞全文） */
function findClose(t, i, open, close) {
  let d = 0, k = i;
  while (k < t.length) {
    if (t.startsWith(open, k)) { d++; k += open.length; }
    else if (t.startsWith(close, k)) { d--; k += close.length; if (d === 0) return k; }
    else if (t[k] === '<') { const e = opaqueEnd(t, k); k = e > k ? e : k + 1; }
    else k++;
  }
  return -1;
}
/** 按最外层的 | 切开（跳过嵌套的 [[ ]] / {{ }}） */
function splitTop(s) {
  const parts = []; let d = 0, last = 0;
  for (let k = 0; k < s.length; k++) {
    if (s.startsWith('[[', k) || s.startsWith('{{', k)) { d++; k++; }
    else if (s.startsWith(']]', k) || s.startsWith('}}', k)) { d--; k++; }
    else if (s[k] === '<') { const e = opaqueEnd(s, k); if (e > k) k = e - 1; } // <ref …>…</ref> 等整块跳过
    else if (s[k] === '|' && d === 0) { parts.push(s.slice(last, k)); last = k + 1; }
  }
  parts.push(s.slice(last));
  return parts;
}

/** part 里最外层（不在 [[ ]] / {{ }} 里）的第一个 =，没有返回 -1 */
function topEq(s) {
  let d = 0;
  for (let k = 0; k < s.length; k++) {
    if (s.startsWith('[[', k) || s.startsWith('{{', k)) { d++; k++; }
    else if (s.startsWith(']]', k) || s.startsWith('}}', k)) { d--; k++; }
    else if (s[k] === '<') { const e = opaqueEnd(s, k); if (e > k) k = e - 1; } // <ref name=x> 里的 = 不是参数名分隔符
    else if (s[k] === '=' && d === 0) return k;
  }
  return -1;
}

/** t[i]==='<' 且开启一个“受保护区间”（注释，或 nowiki/pre/code/syntaxhighlight… 连内容）时，返回区间结束下标；否则 -1。
 *  这些内容在 MediaWiki 里早已变成 strip marker，里面的 ; 和 }- 不会干扰转换规则。 */
function protectedEnd(t, i) {
  const head = t.slice(i, i + 300);
  if (head.startsWith('<!--')) { const e = t.indexOf('-->', i + 4); return e > -1 ? e + 3 : t.length; }
  const m = TAG_RE.exec(head);
  if (!m) return -1;
  let end = i + m[0].length;
  if (!m[2]) {
    const cr = new RegExp('</' + m[1] + '\\s*>', 'ig'); cr.lastIndex = end;
    const cm = cr.exec(t); if (cm) end = cm.index + cm[0].length;
  }
  return end;
}

/** 转义文本 → 源码 的位置映射（游程分段表）。runs 按转义文本位置 o 升序，两种：
 *  k=0 原样复制：转义文本与源码逐字符对应；k=1 占位符：整个占位符对应源码里的一段 [s, s+sl)。
 *  s 已加上 base（该文本在完整源码里的起点）。查询用二分。 */
function makeBuilder(base) {
  const runs = []; let out = '';
  return {
    get out() { return out; },
    copy(s, str) { // str 原样进入转义文本，对应源码从 s（相对 text）起的一段
      if (!str) return;
      const S = base + s, last = runs[runs.length - 1];
      if (last && last.k === 0 && last.s + last.sl === S) { last.ol += str.length; last.sl += str.length; }
      else runs.push({ o: out.length, ol: str.length, s: S, sl: str.length, k: 0 });
      out += str;
    },
    put(s, e, str) { runs.push({ o: out.length, ol: str.length, s: base + s, sl: e - s, k: 1 }); out += str; }, // 占位符 str 对应源码 [s,e)
    map() { return { runs, start: p => mapStart(runs, p, base), end: p => mapEnd(runs, p, base) }; }
  };
}
function findRun(runs, p) { // 最后一个 o <= p 的 run 的下标
  let lo = 0, hi = runs.length - 1, r = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (runs[m].o <= p) { r = m; lo = m + 1; } else hi = m - 1; }
  return r;
}
/** 转义文本位置 p 是某个 token 的起点 → 源码位置 */
function mapStart(runs, p, base) {
  const i = findRun(runs, p); if (i < 0) return base;
  const r = runs[i];
  return r.k === 0 ? r.s + Math.min(p - r.o, r.sl) : (p <= r.o ? r.s : r.s + r.sl);
}
/** 转义文本位置 p 是某个 token 的终点（开区间）→ 源码位置 */
function mapEnd(runs, p, base) {
  if (p <= 0 || !runs.length) return mapStart(runs, 0, base);
  const r = runs[findRun(runs, p - 1)];
  return r.k === 0 ? r.s + Math.min(p - r.o, r.sl) : r.s + r.sl;
}

/** base：text 在完整源码里的起点（盲检单个屏蔽块时，要让 token 的源码位置仍是整页绝对位置）。
 *  返回 { escapedText, placeholders, map }；map.start/end 把“转义文本位置”换成“源码位置”。
 *  约定：转义文本覆盖源码的每一个字符，不丢字（被吞掉的字也包进某个占位符），所以映射是单调连续的。 */
function escapeWikitext(text, mode = 'sim', base = 0, headings = false) {
  const B = makeBuilder(base), placeholders = [];
  if (mode === 'blind') { // 盲检：什么都不屏蔽——只把 {{noteTA}} 摘出来，让公共转换组 / 局部规则照常生效
    const nta = [], re = /\{\{\s*noteta(-lite)?\s*[|}]/ig; let m;
    while ((m = re.exec(text))) {
      const e = findClose(text, m.index, '{{', '}}'); if (e < 0) continue;
      nta.push({ k: 'n', s: m.index, e }); re.lastIndex = e;
    }
    const items = nta.slice();
    if (headings) { // 标题行也认出来（渲染成真正的 <hN>，目录可用），但开头结尾的 = 原样留在文字里，不吞
      let ni = 0;
      for (let i = 0; i < text.length;) {
        let e = text.indexOf('\n', i); if (e < 0) e = text.length;
        if (text.charCodeAt(i) === 61) { // '='
          const hm = /^(=+)(.*?)(=+)[ \t\r]*$/.exec(text.slice(i, e));
          if (hm && hm[2].trim()) {
            while (ni < nta.length && nta[ni].e <= i) ni++;
            if (!(ni < nta.length && nta[ni].s < e)) items.push({ k: 'h', s: i, e, lvl: Math.min(hm[1].length, hm[3].length, 6) }); // 与 noteTA 重叠的不当标题
          }
        }
        i = e + 1;
      }
      items.sort((a, b) => a.s - b.s);
    }
    let last = 0;
    for (const it of items) {
      B.copy(last, text.slice(last, it.s));
      if (it.k === 'n') { placeholders.push(text.slice(it.s, it.e)); B.put(it.s, it.e, ph(placeholders.length - 1)); }
      else { // 零宽的开合标记夹住整行原文（含全部 =）
        placeholders.push(mark({ t: 'hs', level: it.lvl, keep: true })); B.put(it.s, it.s, ph(placeholders.length - 1));
        B.copy(it.s, text.slice(it.s, it.e));
        placeholders.push(mark({ t: 'he' })); B.put(it.e, it.e, ph(placeholders.length - 1));
      }
      last = it.e;
    }
    B.copy(last, text.slice(last));
    return { escapedText: B.out, placeholders, map: B.map() };
  }
  // 把源码 [s,e)（相对 text）整体换成一个占位符；content 是占位符还原后的内容
  const hold = (s, e, content) => { placeholders.push(content); B.put(s, e, ph(placeholders.length - 1)); };

  // sub=true：t 是某段文本的一部分（链接说明、标题内容、ref 内容），开头不算“行首”；off：t 在 text 里的起点
  function scan(t, sub, off) {
    const ls = k => k > 0 ? t[k - 1] === '\n' : !sub;
    const S = k => off + k;
    let i = 0;
    while (i < t.length) {
      const c = t[i];

      // -{ }- 整块原样放行（块内不再处理），留给 M2
      if (c === '-' && t[i + 1] === '{') {
        // 找闭合 }-：跳过块内的 nowiki/代码标签/注释（换成占位符，交给 manualBlock 还原）
        const spans = []; let k = i + 2, closed = false;
        while (k < t.length) {
          if (t[k] === '<') { const pe = protectedEnd(t, k); if (pe > -1) { spans.push([k, pe]); k = pe; continue; } }
          if (t[k] === '}' && t[k + 1] === '-') { closed = true; break; }
          k++;
        }
        if (closed) {
          B.copy(S(i), '-{'); let p = i + 2;
          for (const [a, b] of spans) { B.copy(S(p), t.slice(p, a)); hold(S(a), S(b), t.slice(a, b)); p = b; }
          B.copy(S(p), t.slice(p, k)); B.copy(S(k), '}-'); i = k + 2; continue;
        }
      }
      // 表格语法行：{| 、|- 、|}
      if (ls(i) && (t.startsWith('{|', i) || t.startsWith('|-', i) || t.startsWith('|}', i))) {
        let e = t.indexOf('\n', i); if (e < 0) e = t.length;
        hold(S(i), S(e), t.slice(i, e)); i = e; continue;
      }
      // 标题行：== xx ==。标题文字照常转换，开合用结构标记包起来，渲染成真正的 <hN>（带锚点，供目录导航）
      // 源码切分：[开头 lvl 个 =]（hs）| 中间（含多出来的 =，照常扫描）| [结尾 lvl 个 = + 行尾空白]（he）——三段首尾相接，不丢字
      if (c === '=' && ls(i)) {
        let e = t.indexOf('\n', i); if (e < 0) e = t.length;
        const hm = /^(=+)(.*?)(=+)[ \t\r]*$/.exec(t.slice(i, e));
        if (hm && hm[2].trim()) {
          const a = hm[1].length, b = hm[3].length, lvl = Math.min(a, b, 6);
          const closeAt = i + a + hm[2].length + (b - lvl);
          hold(S(i), S(i + lvl), mark({ t: 'hs', level: lvl }));
          scan(t.slice(i + lvl, closeAt), true, S(i + lvl));
          hold(S(closeAt), S(e), mark({ t: 'he' }));
          i = e; continue;
        }
      }
      if (c === '<') {
        const head = t.slice(i, i + 300);
        if (head.startsWith('<!--')) {
          const e = t.indexOf('-->', i + 4); const end = e > -1 ? e + 3 : t.length;
          hold(S(i), S(end), t.slice(i, end)); i = end; continue;
        }
        const rm = REF_OPEN_RE.exec(head);
        if (rm) {
          const label = refLabel(rm[1]);
          if (rm[2]) { hold(S(i), S(i + rm[0].length), mark({ t: 'rs', label, raw: rm[0], empty: true })); i += rm[0].length; continue; }
          const cs = i + rm[0].length, cr = /<\/ref\s*>/ig; cr.lastIndex = cs;
          const cm = cr.exec(t);
          if (cm) { // 内容照常转换；没有闭合就退回“只屏蔽标签”
            hold(S(i), S(cs), mark({ t: 'rs', label, raw: rm[0] }));
            scan(t.slice(cs, cm.index), true, S(cs));
            hold(S(cm.index), S(cm.index + cm[0].length), mark({ t: 're' }));
            i = cm.index + cm[0].length; continue;
          }
        }
        let m = TAG_RE.exec(head);
        if (m) { // nowiki/code/pre... 连内容一起屏蔽
          let end = i + m[0].length;
          if (!m[2]) {
            const cr = new RegExp('</' + m[1] + '\\s*>', 'ig'); cr.lastIndex = end;
            const cm = cr.exec(t); if (cm) end = cm.index + cm[0].length;
          }
          hold(S(i), S(end), t.slice(i, end)); i = end; continue;
        }
        m = ANYTAG_RE.exec(head); // 其它标签只屏蔽标签本身，里面的字照常转换
        if (m) { hold(S(i), S(i + m[0].length), m[0]); i += m[0].length; continue; }
      }
      if (c === '{') {
        if (t.startsWith('{{{', i)) {
          const e = t.indexOf('}}}', i + 3);
          if (e > -1) { hold(S(i), S(e + 3), t.slice(i, e + 3)); i = e + 3; continue; }
        }
        if (t.startsWith('{{', i)) {
          const e = findClose(t, i, '{{', '}}');
          if (e > -1) {
            const whole = t.slice(i, e);
            if (NOTETA_RE.test(whole)) { hold(S(i), S(e), whole); i = e; continue; } // noteTA 另有专门处理
            // 模板：模板名、参数名屏蔽；参数值在这里就按正式流程解析好（嵌套的模板 / ref / 链接照常处理），渲染时默认折叠，点 + 展开
            const parts = splitTop(t.slice(i + 2, e - 2));
            const pst = []; { let p = i + 2; for (const q of parts) { pst.push(p); p += q.length + 1; } }
            const nameEnd = pst[0] + parts[0].length, label = parts[0].replace(/\s+/g, ' ').trim() || _M('scan.templateFallback');
            const trunc = (x, n) => x.length > n ? x.slice(0, n - 1) + '…' : x;
            if (parts.length < 2) { hold(S(i), S(e), mark({ t: 'ts', label, raw: trunc(whole, 300), empty: true })); i = e; continue; } // 无参数：只显示名字
            hold(S(i), S(nameEnd), mark({ t: 'ts', label, raw: trunc(t.slice(i, nameEnd), 300), multi: whole.includes('\n') }));
            for (let k = 1; k < parts.length; k++) {
              const part = parts[k], at = pst[k], end = at + part.length; // part 起点；它前面还有一个 |
              const eq = topEq(part), vs = eq < 0 ? at : at + eq + 1;     // 值的起点（= 之后）；位置参数整段都是值
              const val = t.slice(vs, end);
              if (!val.trim()) { hold(S(at - 1), S(end), mark({ t: 'pn', text: t.slice(at - 1, end) })); continue; } // 空值：没有 +
              hold(S(at - 1), S(vs), mark({ t: 'pn', text: t.slice(at - 1, vs), hv: true, preview: trunc(val.replace(/\s+/g, ' ').trim(), 24), raw: trunc(val.trim(), 300) }));
              scan(val, true, S(vs));
            }
            hold(S(e - 2), S(e), mark({ t: 'te' }));
            i = e; continue;
          }
        }
      }
      if (c === '[') {
        if (t.startsWith('[[', i)) {
          const e = findClose(t, i, '[[', ']]');
          if (e > -1) {
            const parts = splitTop(t.slice(i + 2, e - 2));
            const pst = []; { let p = i + 2; for (const q of parts) { pst.push(p); p += q.length + 1; } } // 各段在 t 里的起点
            if (NS_RE.test(t.slice(i, i + 24))) {
              // 文件/分类：整体屏蔽，只有文件的“说明文字”放行
              let cap = -1;
              if (!CAT_RE.test(parts[0])) {
                for (let k = parts.length - 1; k >= 1; k--) if (!OPT_RE.test(parts[k].trim())) { cap = k; break; }
              }
              if (cap < 1) hold(S(i), S(e), t.slice(i, e));
              else {
                hold(S(i), S(pst[cap]), '[[' + parts.slice(0, cap).join('|') + '|');
                scan(parts[cap], true, S(pst[cap]));
                const tail = parts.slice(cap + 1), tailAt = pst[cap] + parts[cap].length;
                hold(S(tailAt), S(e), (tail.length ? '|' + tail.join('|') : '') + ']]');
              }
            } else if (parts.length > 1) {          // [[页面|文字]]：页面名屏蔽，文字放行
              hold(S(i), S(i), mark({ t: 'ls', link: parts[0], pipe: true })); // 零宽：开一个链接容器，供点击后「新页打开」
              hold(S(i), S(pst[1]), mark({ t: 'lb', text: '[[' + parts[0] + '|' }));
              scan(parts.slice(1).join('|'), true, S(pst[1]));
              hold(S(e - 2), S(e), mark({ t: 'lb', text: ']]' }));
              hold(S(e), S(e), mark({ t: 'le' }));
            } else if (/^[a-z]{2,3}(-[a-z]{2,8})?:/.test(parts[0])) { // 语言链接 [[en:xx]]
              hold(S(i), S(e), t.slice(i, e));
            } else {                                // [[页面]]：显示的就是页面名，所以放行（链接目标不受影响）
              hold(S(i), S(i), mark({ t: 'ls', link: parts[0] }));
              hold(S(i), S(i + 2), mark({ t: 'lb', text: '[[' })); scan(parts[0], true, S(i + 2)); hold(S(e - 2), S(e), mark({ t: 'lb', text: ']]' }));
              hold(S(e), S(e), mark({ t: 'le' }));
            }
            i = e; continue;
          }
        } else if (t.startsWith('[http', i) || t.startsWith('[//', i)) {
          const m = /^\[(?:https?:)?\/\/[^\s\]]+/i.exec(t.slice(i, i + 2000));
          if (m) { hold(S(i), S(i + m[0].length), m[0]); i += m[0].length; continue; }
        }
      }
      if ((c === 'h' || c === 'H') && /^https?:\/\//i.test(t.slice(i, i + 8))) {
        const m = /^https?:\/\/[^\s<>\[\]"|]+/i.exec(t.slice(i, i + 2000));
        if (m) { hold(S(i), S(i + m[0].length), m[0]); i += m[0].length; continue; }
      }
      if (c === '_' && t.startsWith('__', i)) {
        const m = /^__[A-Z_]+__/.exec(t.slice(i, i + 40));
        if (m) { hold(S(i), S(i + m[0].length), m[0]); i += m[0].length; continue; }
      }
      B.copy(S(i), c); i++;
    }
  }
  scan(text, false, 0);
  return { escapedText: B.out, placeholders, map: B.map() };
}

// ───────────────────────── 规则表 ─────────────────────────
/** 一个变体一张表：key → {from,to,layer,src}。同 key 高层覆盖低层；不同 key 按“最长匹配”竞争。 */
class Table {
  constructor() { this.map = new Map(); this.lens = new Map(); this.dead = new Set(); } // lens: 首字 → 以它开头的 key 长度（降序）
  del(key) { this.map.delete(key); this.dead.add(key); } // -{-|…}-：只用在动态表上，同时遮住静态表里的同名 key
  add(key, to, layer, src, rid) {
    if (!key) return;
    const old = this.map.get(key);
    if (old && LAYER_RANK[old.layer] > LAYER_RANK[layer]) return;
    this.map.set(key, { from: key, to, layer, src, rid }); // rid：规则 id（noteTA 检查用，核心层/站点层没有）
    const f = String.fromCodePoint(key.codePointAt(0));
    let arr = this.lens.get(f);
    if (!arr) this.lens.set(f, arr = []);
    if (!arr.includes(key.length)) { arr.push(key.length); arr.sort((a, b) => b - a); }
  }
}
function createTables() { const t = {}; for (const v of VARIANTS) t[v] = new Table(); return t; }

/** 把“部分变体有值”的对象按回退链补成 8 变体；找不到的为 undefined */
function expand(byVariant) {
  const res = {};
  for (const v of VARIANTS) for (const c of FALLBACK_CHAINS[v]) if (byVariant[c] != null) { res[v] = byVariant[c]; break; }
  return res;
}
/** 用单个变体的表对一段文字做纯字表转换（不含动态规则）。inlineRule 用它判断“繁简差异”是不是纯字形差异 */
function scriptConvert(text, table) {
  let out = '', p = 0;
  for (const h of matchText(text, table, new Table())) { out += text.slice(p, h.s) + h.to; p = h.e; }
  return out + text.slice(p);
}
/** 把一个块各变体的转换结果 out（{zh-cn:文本,…} 共 8 个）写成 -{zh-hans:甲;zh-cn:乙;…}- 形式。
 *  符合 PWVCST：繁简异体（纯字形差异）以 zh-hans / zh-hant 为主；地区词（用语差异）以 zh-cn / zh-tw 为主，
 *  其余变体只在回退链还原不了时才写出（用 expand 校验，保证展开后与 out 完全一致）。
 *  toHant(text)：简体 → 繁体的纯字表转换，用来判断简繁两侧是否只差字形；不给就一律按繁简异体处理。
 *  文本含 ; | -{ }- 或首尾空白时无法安全表示，返回 null。 */
function inlineRule(out, toHant) {
  const ORD = ['zh-hans', 'zh-cn', 'zh-sg', 'zh-my', 'zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'];
  for (const v of VARIANTS) if (out[v] == null || /[;|]|-\{|\}-/.test(out[v]) || out[v] !== out[v].trim()) return null;
  // 简体基线转成繁体后若与繁体基线一致 → 只差字形（繁简异体）；否则两侧用语不同 → 地区词
  const regional = !!toHant && toHant(out['zh-hans']) !== out['zh-hant'];
  const keep = {}; for (const v of VARIANTS) keep[v] = out[v];
  const ok = () => { const e = expand(keep); return VARIANTS.every(v => e[v] === out[v]); };
  // 先试着去掉的变体（顺序有讲究：优先留 zh-sg 而非 zh-my、zh-hk 而非 zh-mo）
  const drop = regional ? ['zh-hans', 'zh-hant', 'zh-my', 'zh-sg', 'zh-mo', 'zh-hk']
                        : ['zh-cn', 'zh-my', 'zh-sg', 'zh-tw', 'zh-mo', 'zh-hk'];
  for (const v of drop) { const val = keep[v]; delete keep[v]; if (!ok()) keep[v] = val; }
  return '-{' + ORD.filter(v => keep[v] != null).map(v => v + ':' + keep[v]).join(';') + '}-';
}
/** 加载核心字位表：obj 是 {源词: 目标词}，variants 是它适用的变体 */
function addTable(tables, variants, obj, layer, src) {
  for (const v of variants) for (const [k, to] of Object.entries(obj)) tables[v].add(k, to, layer, src);
}
/** 加载一条规则。rule = {to:{变体:文本}, from?:源词}
 *  无 from（双向）：所有文本都是 key，各变体取各自的目标（走回退链）
 *  有 from（单向）：只对规则里明确写出的变体生效（不走回退链，待与 MW 核对） */
function addRule(tables, rule, layer, src, rid) {
  if (rule.from != null) {
    for (const v of VARIANTS) if (rule.to[v] != null) tables[v].add(rule.from, rule.to[v], layer, src, rid);
    return;
  }
  const t = expand(rule.to), keys = new Set(Object.values(rule.to));
  for (const v of VARIANTS) if (t[v] != null) for (const k of keys) tables[v].add(k, t[v], layer, src, rid);
}

// ───────────────────────── M2：分词 ─────────────────────────
/** 单个变体：在 text 里从左到右取最长命中（第四层与静态表同台竞争） */
function matchText(text, stat, dyn) {
  const out = []; const n = text.length; let i = 0;
  while (i < n) {
    const cp = text.codePointAt(i), f = String.fromCodePoint(cp);
    const a = stat.lens.get(f), b = dyn.lens.get(f);
    let hit = null;
    if (a || b) {
      const lens = !b ? a : !a ? b : [...new Set([...a, ...b])].sort((x, y) => y - x);
      for (const len of lens) {
        if (i + len > n) continue;
        const key = text.slice(i, i + len);
        const h = dyn.map.get(key) || (dyn.dead.has(key) ? null : stat.map.get(key));
        if (h) { hit = h; break; }
      }
    }
    if (hit) { out.push({ s: i, e: i + hit.from.length, to: hit.to, layer: hit.layer, src: hit.src, from: hit.from, rid: hit.rid }); i += hit.from.length; }
    else i += cp > 0xFFFF ? 2 : 1;
  }
  return out;
}

/** 8 个变体各切各的，再把“互相咬合”的命中合成一个对齐块：
 *  把所有变体的命中区间取并集，重叠的并成一块；块外是 plain，块内每个变体各自拼出输出。 */
function* alignSegment(text, perV) {
  const all = [];
  for (const v of VARIANTS) for (const m of perV[v]) all.push(m);
  if (!all.length) { if (text) yield { kind: 'plain', text, a: 0, b: text.length }; return; }
  all.sort((x, y) => x.s - y.s || y.e - x.e);
  const comps = []; let cs = all[0].s, ce = all[0].e;
  for (let k = 1; k < all.length; k++) {
    const m = all[k];
    if (m.s < ce) { if (m.e > ce) ce = m.e; } else { comps.push([cs, ce]); cs = m.s; ce = m.e; }
  }
  comps.push([cs, ce]);
  const idx = {}; for (const v of VARIANTS) idx[v] = 0;
  let pos = 0;
  for (const [a, b] of comps) {
    if (a > pos) yield { kind: 'plain', text: text.slice(pos, a), a: pos, b: a };
    const out = {}, hits = {};
    for (const v of VARIANTS) {
      const arr = perV[v]; let p = a, s = ''; const hs = [];
      while (idx[v] < arr.length && arr[idx[v]].s < b) {
        const m = arr[idx[v]++]; s += text.slice(p, m.s) + m.to; p = m.e; hs.push(m);
      }
      out[v] = s + text.slice(p, b); hits[v] = hs;
    }
    yield { kind: 'word', raw: text.slice(a, b), out, hits, a, b };
    pos = b;
  }
  if (pos < text.length) yield { kind: 'plain', text: text.slice(pos), a: pos, b: text.length };
}

/** 解析 -{ 标志|规则 }- 的内容 */
function parseManual(body) {
  const flags = new Set(); let rest = body;
  const bar = body.indexOf('|');
  if (bar > -1) {
    const left = body.slice(0, bar).trim();
    if (/^[A-Za-z-](\s*;\s*[A-Za-z-])*$/.test(left)) { left.split(';').forEach(f => flags.add(f.trim().toUpperCase())); rest = body.slice(bar + 1); }
  }
  const bid = {}, uni = {}, keep = []; let zh = null;
  for (const piece of rest.split(';')) {
    let p = piece.trim(); if (!p) continue;
    let from = null; const ar = p.indexOf('=>');
    if (ar > -1) { from = p.slice(0, ar).trim(); p = p.slice(ar + 2).trim(); }
    const c = p.indexOf(':');
    if (c < 0) { if (ar < 0 && !keep.includes(p)) keep.push(p); continue; } // 裸词（如 noteTA 的 |1=才）：这个词不转换

    const v = p.slice(0, c).trim().toLowerCase(), t = p.slice(c + 1).trim();
    if (v === 'zh') { if (from === null) zh = t; continue; } // zh:原文——不是转换目标，只用来指定“原文行”显示什么
    if (!FALLBACK_CHAINS[v]) continue;
    if (from) (uni[from] = uni[from] || {})[v] = t; else if (from === null) bid[v] = t;
  }
  return { flags, bid, uni, keep, zh, body: rest };
}
/** meta（可选）：{rid, kind:'cgroup'|'local'|'hidden', ...}，给 noteTA 检查用：登记规则定义，命中时 matchText 会带回 rid */
const manualKeys = P => [...new Set([...Object.values(P.bid), ...P.keep, ...Object.keys(P.uni)])];
function applyManualRules(P, dyn, layer, src, meta) {
  layer = layer || 'manual'; src = src || '-{}-';
  if (dyn._log) dyn._log.push({ op: 'a', P, layer, src, meta }); // 规则日志：供盲检单个块时重放
  const rid = meta && meta.rid;
  if (rid && dyn._defs && !dyn._defs.has(rid)) dyn._defs.set(rid, Object.assign({ layer, src, keys: manualKeys(P) }, meta));
  let n = 0;
  if (Object.keys(P.bid).length) { addRule(dyn, { to: P.bid }, layer, src, rid); n++; }
  for (const [from, to] of Object.entries(P.uni)) { addRule(dyn, { from, to }, layer, src, rid); n++; }
  for (const w of P.keep) { for (const v of VARIANTS) dyn[v].add(w, w, layer, src, rid); n++; } // 裸词：各变体都“转成自己”，即不转换（高层覆盖核心 / 站点表，仍可被更长的词截胡）
  return n;
}
/** -{-|规则}-：对应 MW 的“移除”动作，镜像 addRule 的取 key 方式，把这些 key 从各变体的表里删掉 */
function removeManualRules(P, dyn) {
  if (dyn._log) dyn._log.push({ op: 'r', P });
  let n = 0;
  if (Object.keys(P.bid).length) {
    const t = expand(P.bid), keys = new Set(Object.values(P.bid));
    for (const v of VARIANTS) if (t[v] != null) for (const k of keys) dyn[v].del(k);
    n++;
  }
  for (const [from, to] of Object.entries(P.uni)) { for (const v of VARIANTS) if (to[v] != null) dyn[v].del(from); n++; }
  for (const w of P.keep) { for (const v of VARIANTS) dyn[v].del(w); n++; }
  return n;
}
function* manualBlock(block, body, dyn, holds, meta) {
  // 先在“屏蔽后”的文本上切分规则（; 不会被代码里的分号干扰），再把占位符还原成原文
  const back = x => holds ? x.replace(/\x01_LC_PH_(\d+)_\x01/g, (m, n) => holds[+n] != null ? holds[+n] : m) : x;
  const P = parseManual(body);
  const fix = o => { const r = {}; for (const k of Object.keys(o)) r[k] = back(o[k]); return r; };
  P.bid = fix(P.bid); P.body = back(P.body); if (P.zh != null) P.zh = back(P.zh);
  P.uni = Object.fromEntries(Object.entries(P.uni).map(([f, t]) => [back(f), fix(t)]));
  block = back(block);

  // MW 的优先级：R > N > - ；有 - 时其它标志都作废
  if (P.flags.has('-') && !P.flags.has('R') && !P.flags.has('N')) {
    const n = removeManualRules(P, dyn);
    yield n ? { kind: 'code', text: block, note: _M('manual.removed', n) }
            : { kind: 'code', text: block, warn: _M('manual.noRules') };
    return;
  }
  if (P.flags.has('H')) { // 隐藏规则：只注册，不显示
    const n = applyManualRules(P, dyn, undefined, undefined, meta);
    yield n ? { kind: 'code', text: block, note: _M('manual.activated', n) }
            : { kind: 'code', text: block, warn: _M('manual.noRules') };
    return;
  }
  const bad = ['T', 'D', 'N'].filter(f => P.flags.has(f));
  if (bad.length) { yield { kind: 'code', text: block, warn: _M('manual.unsupportedFlags', bad.join(',')) }; return; }
  if (P.flags.has('A')) applyManualRules(P, dyn, undefined, undefined, meta);
  const hasBid = Object.keys(P.bid).length > 0;
  const exp = hasBid && !P.flags.has('R') ? expand(P.bid) : null;
  // 有的变体既没写规则、回退链也找不到：直接警报
  const missing = exp ? VARIANTS.filter(v => exp[v] == null) : [];
  if (missing.length) { yield { kind: 'code', text: block, warn: _M('manual.uncovered', missing.join('、')) }; return; }
  const out = {}, hits = {};
  const zhOnly = !exp && P.zh != null && !P.flags.has('R'); // 只写了 zh: → 各变体都显示 zh 的内容
  for (const v of VARIANTS) {
    out[v] = exp ? exp[v] : zhOnly ? P.zh : P.body.trim();
    hits[v] = [{ from: block, to: out[v], layer: 'inline', src: '-{}-' }];
  }
  // 原文行：空内容的 -{}-（断词用）保持原样（undefined → 沿用“显示整个标记”）；
  // 其余行内转换默认不显示原文，只有指定了 zh: 才显示，且只写 zh 的内容
  const origText = P.body.trim() === '' ? undefined : (P.zh != null ? P.zh : null);
  yield { kind: 'word', raw: block, out, hits, inline: true, origText };
}

// ───────────────────────── 第三层：{{noteTA}} 与公共转换组 ─────────────────────────
const NOTETA_RE = /^\{\{\s*noteta(-lite)?\s*[|}]/i;

/** 解析 {{noteTA|G1=IT|1=规则|T=标题规则}}：返回 {groups:[名], items:[{n,rule}], titles:[规则]} */
function parseNoteTA(text) {
  const parts = splitTop(text.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  parts.shift(); // 模板名
  const groups = [], items = [], titles = []; let pos = 0;
  for (const p of parts) {
    const eq = p.indexOf('='); let name, val;
    if (eq > -1 && /^\s*[A-Za-z0-9]+\s*$/.test(p.slice(0, eq))) { name = p.slice(0, eq).trim(); val = p.slice(eq + 1).trim(); }
    else { name = String(++pos); val = p.trim(); }
    if (!val) continue;
    if (/^G\d+$/i.test(name)) { if (groups.length < 30) groups.push(val); }
    else if (/^\d+$/.test(name)) { if (+name >= 1 && +name <= 30) items.push({ n: +name, rule: val }); }
    else if (/^T$/i.test(name)) titles.push(val);
  }
  return { groups, items, titles };
}

/** 最小 Lua 词法：只认字符串（含长括号）、标识符、标点；注释整段跳过 */
function luaTokens(s) {
  const toks = [], n = s.length; let i = 0;
  const longOpen = k => /^\[(=*)\[/.exec(s.slice(k, k + 40));
  while (i < n) {
    const c = s[i];
    if (c === '-' && s[i + 1] === '-') {
      const lm = /^--\[(=*)\[/.exec(s.slice(i, i + 40));
      if (lm) { const close = ']' + lm[1] + ']'; const e = s.indexOf(close, i + lm[0].length); i = e < 0 ? n : e + close.length; }
      else { const e = s.indexOf('\n', i); i = e < 0 ? n : e + 1; }
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1, out = '';
      while (j < n && s[j] !== c) {
        if (s[j] === '\\' && j + 1 < n) { const d = s[j + 1]; out += d === 'n' ? '\n' : d === 't' ? '\t' : d; j += 2; } else out += s[j++];
      }
      toks.push({ t: 's', v: out }); i = j + 1; continue;
    }
    if (c === '[') {
      const lm = longOpen(i);
      if (lm) { const close = ']' + lm[1] + ']'; const e = s.indexOf(close, i + lm[0].length); toks.push({ t: 's', v: s.slice(i + lm[0].length, e < 0 ? n : e) }); i = e < 0 ? n : e + close.length; continue; }
    }
    if (/[A-Za-z_]/.test(c)) { let j = i + 1; while (j < n && /\w/.test(s[j])) j++; toks.push({ t: 'id', v: s.slice(i, j) }); i = j; continue; }
    if (/\s/.test(c)) { i++; continue; }
    toks.push({ t: 'p', v: c }); i++;
  }
  return toks;
}

/** 解析 Module:CGroup/X 的 Lua 源码：取 name 和所有 Item('名', '规则') */
function parseCGroup(lua) {
  const toks = luaTokens(lua), rules = []; let name = '';
  for (let k = 0; k < toks.length; k++) {
    const a = toks[k];
    if (a.t === 'id' && a.v === 'name' && toks[k + 1] && toks[k + 1].v === '=' && toks[k + 2] && toks[k + 2].t === 's' && !name) name = toks[k + 2].v;
    if (a.t === 'id' && a.v === 'Item' && toks[k + 1] && toks[k + 1].t === 'p' && toks[k + 1].v === '(' &&
        toks[k + 2] && (toks[k + 2].t === 's' || (toks[k + 2].t === 'id' && toks[k + 2].v === 'nil')) &&  // 原文可以写 nil
        toks[k + 3] && toks[k + 3].v === ',' && toks[k + 4] && toks[k + 4].t === 's')
      rules.push({ item: toks[k + 2].t === 's' ? toks[k + 2].v : '', rule: toks[k + 4].v });
  }
  return { name, rules, via: 'module' };
}

/** Lua 层重定向：整页只有 `return require('Module:CGroup/X')`（命名空间名可写 Module:/模块:/模組:），返回规范化后的目标标题；不是重定向返回 null */
function luaRedirectTarget(lua) {
  const t = luaTokens(lua); let k = 0;
  const isId = (x, v) => x && x.t === 'id' && x.v === v;
  if (!isId(t[k++], 'return') || !isId(t[k++], 'require')) return null;
  let paren = false;
  if (t[k] && t[k].t === 'p' && t[k].v === '(') { paren = true; k++; }
  if (!(t[k] && t[k].t === 's')) return null;
  const target = t[k++].v;
  if (paren) { if (!(t[k] && t[k].t === 'p' && t[k].v === ')')) return null; k++; }
  if (t[k] && t[k].t === 'p' && t[k].v === ';') k++;
  if (k !== t.length) return null;
  const m = /^\s*(?:module|模块|模組)\s*:\s*(.+?)\s*$/i.exec(target);
  return m ? 'Module:' + m[1] : null;
}

/** 解析展开后的 Template:CGroup/X：展开结果是一大堆 -{H|語法}-，每块一条规则（块内容原样交给 parseManual） */
function parseCGroupTemplate(text) {
  const rules = [];
  for (const m of String(text || '').matchAll(/-\{([\s\S]*?)\}-/g)) if (m[1].trim()) rules.push({ item: '', rule: m[1] });
  return { name: '', rules, via: 'template' };
}

/** 屏蔽之后，找出文中所有 {{noteTA}} 引用的公共转换组名（nowiki/注释里的不算） */
function collectGroups(raw, mode) {
  const names = new Set();
  for (const p of escapeWikitext(raw, mode).placeholders) if (NOTETA_RE.test(p)) for (const g of parseNoteTA(p).groups) names.add(g);
  return [...names];
}

function* noteTABlock(block, dyn, groups, pos) {
  const P = parseNoteTA(block); const ok = [], warns = []; let nG = 0, nL = 0;
  for (const g of P.groups) {
    const data = groups && groups[g];
    if (!data) { warns.push(_M('noteTA.groupNotFound', g)); continue; }
    ok.push(g);
    const page = data.page || ('Module:CGroup/' + g);
    if (dyn._grp) dyn._grp.set(g, { name: g, page, via: data.via, total: data.rules.length, pos });
    data.rules.forEach((it, idx) => {
      nG += applyManualRules(parseManual(it.rule), dyn, 'cgroup', page, { rid: page + '#' + idx, kind: 'cgroup', group: g, idx, item: it.item, text: it.rule, pos });
    });
  }
  for (const it of P.items) nL += applyManualRules(parseManual(it.rule), dyn, 'manual', 'noteTA #' + it.n, { rid: 'L' + pos + '#' + it.n, kind: 'local', num: it.n, text: it.rule, pos });
  if (P.titles.length) warns.push(_M('noteTA.titleConversion'));
  const bits = [];
  if (ok.length) bits.push(_M('noteTA.groupsSummary', ok.join('、'), nG));
  if (nL) bits.push(_M('noteTA.localRulesSummary', nL));
  yield { kind: 'code', text: block, note: _M('noteTA.note', bits.join('；') || 'noteTA'), warn: warns.join('；') };
}

/** 把另一次转换在某一时刻已生效的动态规则（-{H|}-、noteTA、公共转换组）重放进 dyn */
function replayRules(rules, dyn) {
  if (!rules) return;
  for (const e of rules.log.slice(0, rules.n)) { if (e.op === 'a') applyManualRules(e.P, dyn, e.layer, e.src, e.meta); else removeManualRules(e.P, dyn); }
}

/** escapedText → RawToken 流。-{H|}- 与 {{noteTA}} 只影响它之后的文本。
 *  map：escapeWikitext 返回的位置映射，给每个 token 加上源码区间 s/e（没有 map 就当恒等）。
 *  info：传一个空对象进来，会被填上 { log: 规则日志, ruleMarks: [{pos, n}] }——pos 是源码位置，n 是此处之后日志的长度，
 *        要预览某一行时，取 pos <= 行首 的最后一条，就是这一行开始时已生效的规则快照 { log, n }。 */
function* tokenize(escapedText, placeholders, tables, groups, rules, map, info) {
  const dyn = createTables(); dyn._log = []; replayRules(rules, dyn);
  let logN = dyn._log.length;
  if (info) { info.log = dyn._log; info.ruleMarks = []; info.defs = dyn._defs = new Map(); info.grp = dyn._grp = new Map(); }
  const S = p => map ? map.start(p) : p, E = p => map ? map.end(p) : p;
  // noteTA 检查：info.usage 是数组时，记录每条“有 rid 的规则”（转换组 / 全页转换 / -{H|}-）实际生效的位置。
  // 同一位置同一 key 被多个变体命中只记一次；to 记各变体的转换结果。位置是整页源码里的绝对位置。
  const usage = info && info.usage || null, seen = new Map();
  function noteUsage(tk, off) {
    for (const v of VARIANTS) for (const m of tk.hits[v]) {
      if (!m.rid) continue;
      const s0 = S(off + m.s), id = m.rid + '\0' + s0 + '\0' + m.from;
      let u = seen.get(id);
      if (!u) { u = { rid: m.rid, from: m.from, s: s0, e: E(off + m.e), to: {} }; seen.set(id, u); usage.push(u); }
      u.to[SHORT[v]] = m.to;
    }
  }
  const re = /\x01_LC_PH_(\d+)_\x01|-\{([\s\S]*?)\}-/g;
  function* run(text, off) {
    const perV = {};
    for (const v of VARIANTS) perV[v] = matchText(text, tables[v], dyn[v]);
    for (const tk of alignSegment(text, perV)) { tk.s = S(off + tk.a); tk.e = E(off + tk.b); if (usage && tk.kind === 'word') noteUsage(tk, off); yield tk; }
  }
  /** 给 gen 产出的每个 token 标上源码区间（[a,b) 是转义文本里的位置）；产完后若规则日志变长，记一个 ruleMark */
  function* span(gen, a, b) {
    for (const tk of gen) { tk.s = S(a); tk.e = E(b); yield tk; }
    if (info && dyn._log.length > logN) { logN = dyn._log.length; info.ruleMarks.push({ pos: E(b), n: logN }); }
  }
  let pos = 0, m;
  while ((m = re.exec(escapedText))) {
    const a = m.index, b = a + m[0].length;
    if (a > pos) yield* run(escapedText.slice(pos, a), pos);
    if (m[1] !== undefined) {
      const ph0 = placeholders[+m[1]];
      if (ph0.charCodeAt(0) === 2) { // 结构标记：标题 / ref 的开合
        const o = JSON.parse(ph0.slice(1));
        yield* span([o.t === 'hs' ? { kind: 'hs', level: o.level, keep: !!o.keep } : o.t === 'he' ? { kind: 'he' }
            : o.t === 'rs' ? { kind: 'rs', label: o.label, raw: o.raw, empty: !!o.empty }
            : o.t === 'ts' ? { kind: 'ts', label: o.label, raw: o.raw, empty: !!o.empty, multi: !!o.multi } : o.t === 'te' ? { kind: 'te' }
            : o.t === 'pn' ? { kind: 'pn', text: o.text, hv: !!o.hv, preview: o.preview, raw: o.raw } : o.t === 'lb' ? { kind: 'code', text: o.text, lb: true } : o.t === 'ls' ? { kind: 'ls', link: o.link, pipe: !!o.pipe } : o.t === 'le' ? { kind: 'le' } : { kind: 're' }], a, b);
      }
      else if (NOTETA_RE.test(ph0)) yield* span(noteTABlock(ph0, dyn, groups, S(a)), a, b);
      else yield* span([{ kind: 'code', text: ph0, prot: true, rules: { log: dyn._log, n: dyn._log.length } }], a, b); // prot：被屏蔽的原文，可点击单独盲检（带上此刻生效的规则）
    }
    else yield* span(manualBlock(m[0], m[2], dyn, placeholders, { rid: 'H' + S(a), kind: 'hidden', text: m[0], pos: S(a) }), a, b);
    pos = re.lastIndex;
  }
  if (pos < escapedText.length) yield* run(escapedText.slice(pos), pos);
}

// ───────────────────────── M3：归并成“车道” ─────────────────────────
// 竖向车道（从上到下）：cn my sg │ 简体基线 │ 繁体基线 │ hk mo tw │ 原文
// 区域顺序 = 从上到下的顺序；与基线文字不同的区域往外“撑开”，文字相同的并成一行。
const SIDES = { hans: ['cn', 'my', 'sg'], hant: ['hk', 'mo', 'tw'] };

const srcLabel = s => s.replace(/^Module:CGroup\//, '').replace(/^Template:CGroup\//, _M('source.templatePrefix')).replace(/^ZH_/, '');
function toRenderToken(tok) {
  if (tok.kind === 'plain') return { type: 'plain', text: tok.text };
  if (tok.kind === 'code') return { type: 'code', text: tok.text, note: tok.note || '', warn: tok.warn || '', prot: !!tok.prot, rules: tok.rules, lb: !!tok.lb };
  if (tok.kind === 'hs') return { type: 'hs', level: tok.level, keep: !!tok.keep };
  if (tok.kind === 'he') return { type: 'he' };
  if (tok.kind === 'rs') return { type: 'rs', label: tok.label, raw: tok.raw, empty: tok.empty };
  if (tok.kind === 're') return { type: 're' };
  if (tok.kind === 'ts') return { type: 'ts', label: tok.label, raw: tok.raw, empty: tok.empty, multi: tok.multi };
  if (tok.kind === 'te') return { type: 'te' };
  if (tok.kind === 'ls') return { type: 'ls', link: tok.link, pipe: tok.pipe };
  if (tok.kind === 'le') return { type: 'le' };
  if (tok.kind === 'pn') return { type: 'pn', text: tok.text, hv: tok.hv, preview: tok.preview, raw: tok.raw };

  const texts = {}, longOf = {};
  for (const v of VARIANTS) { texts[SHORT[v]] = tok.out[v]; longOf[SHORT[v]] = v; }
  let top = null;
  const tipsOf = keys => { // 同一条规则命中多个变体 → 合并成一行提示
    const lines = new Map();
    for (const k of keys) for (const h of tok.hits[longOf[k]] || []) {
      if (!top || LAYER_RANK[h.layer] > LAYER_RANK[top]) top = h.layer;
      const id1 = tok.inline ? `→${h.to}` : `${h.from}→${h.to}`; // 行内转换：原文已在 tooltip 第一行，这里不重复
      const id2 = `〔${LAYER_LABEL[h.layer] || h.layer}${h.src ? ' ' + srcLabel(h.src) : ''}〕`;
      const id = id1 + id2;
      if (!lines.has(id)) lines.set(id, { ks: [], tt: {id1: id1, id2: id2}, page: h.layer === 'cgroup' || h.layer === 'local' ? h.src : null });
      lines.get(id).ks.push(k);
    }
    return [...lines].map(([id, o]) => ({ text: `${o.tt.id1}${o.ks.map(disp).join('/')} ${o.tt.id2} `, page: o.page })); // page：规则来源页，tooltip 里做成链接
  };
  const origText = tok.origText !== undefined ? tok.origText : tok.raw; // null = 不显示原文行
  const row = (text, keys, marks) => ({ text, marks, isRaw: origText != null && text === origText,
    tips: tok.inline ? [{ text: tok.raw, page: null }, ...tipsOf(keys)] : tipsOf(keys) }); // 行内转换：第一行只放原文（-{…}-），第二行起才是各变体结果

  const side = base => {
    const bt = texts[base], regs = SIDES[base];
    const same = regs.filter(k => texts[k] === bt);
    const groups = new Map();
    for (const k of regs) if (texts[k] !== bt) { const t = texts[k]; if (!groups.has(t)) groups.set(t, []); groups.get(t).push(k); }
    const spreads = [...groups].map(([t, ks]) => row(t, ks, ks));
    // 基线行：只有这一侧确有差异时，才标出“哪些地区与基线相同”
    return { base: row(bt, [base, ...same], spreads.length ? same : []), spreads };
  };
  const S = side('hans'), H = side('hant');
  const merged = S.base.text === H.base.text; // 简繁基线相同 → 合并成一格（跨两行）
  let hans = S.base, hant = H.base;
  if (merged) {
    hans = Object.assign({}, S.base, { marks: [...S.base.marks, ...H.base.marks], tips: [...new Map([...S.base.tips, ...H.base.tips].map(x => [x.text, x])).values()] });
    hant = null;
  }
  // 原文行：只有原文没出现在任何一条车道里（被转换掉了）才需要；出现了的话，对应格子加底色（isRaw）即可
  const orig = origText == null || Object.values(texts).includes(origText) ? null : origText;
  // deep：存在 3、4 级（转换组 / 本页或手动）命中，且本身不是现成的 -{}- 行内转换 → 编辑模式可“改行内转换”
  const deep = !tok.inline && VARIANTS.some(v => (tok.hits[v] || []).some(h => LAYER_RANK[h.layer] >= 3));
  return { type: 'word', raw: tok.raw, layer: top, merged, up: S.spreads, hans, hant, down: H.spreads, orig, out: tok.out, deep,
         };
}

/** 完整管线：M1 → M2 → M3，逐个产出 RenderToken（带源码区间 s/e，绝对位置）。
 *  opts: {mode:'sim'|'blind', groups:{名:parseCGroup 结果}, rules:此刻已生效的规则快照, base:raw 在完整源码里的起点, info:见 tokenize} */
function* tokenizeWikitext(raw, tables, opts = {}) {
  const { escapedText, placeholders, map } = escapeWikitext(raw, opts.mode, opts.base || 0, !!opts.headings);
  for (const t of tokenize(escapedText, placeholders, tables, opts.groups, opts.rules, map, opts.info)) {
    const r = toRenderToken(t); r.s = t.s; r.e = t.e; yield r;
  }
}


// ───────────────────────── noteTA 检查：汇总 ─────────────────────────
/** info：tokenize 填好的 {defs, grp, usage}。返回
 *  { groups:[{name,page,via,rules:[rule],uses,used}], local:[rule], hidden:[rule], dups:[{key,owners:[rule],win}], total }
 *  rule = 登记时的 meta + {uses:[{rid,from,s,e,to}], n, keyCount:{key:次数}}
 *  只统计“实际生效”的命中：同 key 被更高层覆盖、或被更长的词截胡的，不算。 */
function buildNoteTAReport(info) {
  const defs = info.defs || new Map(), usage = info.usage || [], by = new Map();
  for (const u of usage) { let a = by.get(u.rid); if (!a) by.set(u.rid, a = []); a.push(u); }
  const rules = new Map(), groups = new Map(), local = [], hidden = [];
  for (const g of (info.grp || new Map()).values()) groups.set(g.name, Object.assign({ rules: [], uses: 0, used: 0 }, g));
  for (const d of defs.values()) {
    const uses = by.get(d.rid) || [], keyCount = {};
    for (const u of uses) keyCount[u.from] = (keyCount[u.from] || 0) + 1;
    const r = Object.assign({}, d, { uses, n: uses.length, keyCount }); rules.set(d.rid, r);
    if (d.kind === 'cgroup') { const g = groups.get(d.group); if (g) { g.rules.push(r); g.uses += r.n; if (r.n) g.used++; } }
    else if (d.kind === 'local') local.push(r); else hidden.push(r);
  }
  // 同名 key 被多条规则定义：按 Table.add 的规则，层级高的赢，同层后写的赢
  const owners = new Map();
  for (const r of rules.values()) for (const k of r.keys) { let a = owners.get(k); if (!a) owners.set(k, a = []); if (!a.includes(r)) a.push(r); }
  const dups = [];
  for (const [key, a] of owners) if (a.length > 1) {
    let win = a[0]; for (const r of a) if (LAYER_RANK[r.layer] >= LAYER_RANK[win.layer]) win = r;
    dups.push({ key, owners: a, win });
  }
  return { groups: [...groups.values()], local, hidden, dups, total: usage.length, log: info.log || [] };
}

// ───────────────────────── noteTA 检查：哪些规则不能删 ─────────────────────────
/** 一条规则实际写进规则表的 (变体, key, 目标)，取 key 的方式与 addRule / applyManualRules 一致 */
function ruleEntries(P) {
  const out = [];
  if (Object.keys(P.bid).length) {
    const t = expand(P.bid), keys = new Set(Object.values(P.bid));
    for (const v of VARIANTS) if (t[v] != null) for (const k of keys) if (k) out.push({ v, key: k, to: t[v] });
  }
  for (const [from, to] of Object.entries(P.uni)) if (from) for (const v of VARIANTS) if (to[v] != null) out.push({ v, key: from, to: to[v] });
  for (const w of P.keep) if (w) for (const v of VARIANTS) out.push({ v, key: w, to: w });
  return out;
}
/** 两个问题：
 *  need：删掉这条规则，本页现有的命中会变吗？删后的结果 = 别的规则对同一个 key 的定义（赢的那条）；没有就用核心 / 站点表对这个词重新转换。
 *        same：核心 / 站点表里本来就有同样的转换（看似重复，但这条规则正挡着别的规则）。
 *  shadow：这条规则的词条为什么不起作用？被层级更高 / 同层更晚的同名定义盖住了（目标不同才算）。
 *  只比到整词；没考虑其它规则里更短的词、页中 -{-|…}- 移除、规则在页中的先后位置。 */
function noteTANeeded(report, tables) {
  const rules = new Map(), ents = new Map(), ord = new Map(), dynBy = new Map(), need = new Map(), shadow = new Map();
  for (const r of [].concat(...report.groups.map(g => g.rules), report.local, report.hidden)) rules.set(r.rid, r);
  let seq = 0;
  for (const e of report.log || []) {
    const rid = e.op === 'a' && e.meta && e.meta.rid;
    if (!rid || ents.has(rid) || !rules.has(rid)) continue;
    ents.set(rid, ruleEntries(e.P)); ord.set(rid, seq++);
    for (const x of ents.get(rid)) {
      const id = x.v + '\0' + x.key; let a = dynBy.get(id); if (!a) dynBy.set(id, a = []);
      const ex = a.find(y => y.rid === rid); if (ex) ex.to = x.to; else a.push({ rid, to: x.to, layer: rules.get(rid).layer, ord: ord.get(rid) });
    }
  }
  const better = (a, b) => LAYER_RANK[a.layer] > LAYER_RANK[b.layer] || (LAYER_RANK[a.layer] === LAYER_RANK[b.layer] && a.ord > b.ord);
  const push = (map, rid, sig, mk, v) => { let m = map.get(rid); if (!m) map.set(rid, m = new Map()); let g = m.get(sig); if (!g) m.set(sig, g = mk()); g.vs.push(SHORT[v]); };
  for (const [rid, es] of ents) {
    const r = rules.get(rid), me = { layer: r.layer, ord: ord.get(rid) };
    for (const e of es) {
      let win = null; for (const o of dynBy.get(e.v + '\0' + e.key) || []) if (o.rid !== rid && (!win || better(o, win))) win = o;
      if (win && better(win, me)) { // 被盖住
        if (win.to !== e.to) push(shadow, rid, e.key + '\0' + e.to + '\0' + win.rid + '\0' + win.to, () => ({ key: e.key, to: e.to, by: win.rid, byTo: win.to, vs: [] }), e.v);
        continue;
      }
      if (!r.n || !r.keyCount[e.key]) continue; // 本页没命中的词，删了没变化
      const st = tables[e.v].map.get(e.key);
      let after, why;
      if (win) { after = win.to; why = { kind: 'dyn', rid: win.rid }; }
      else { after = scriptConvert(e.key, tables[e.v]); why = st ? { kind: 'stat', layer: st.layer, src: st.src } : { kind: 'split' }; }
      if (after === e.to) continue;
      const same = !!st && st.to === e.to;
      push(need, rid, e.key + '\0' + e.to + '\0' + after + '\0' + (why.rid || why.src || why.kind) + same, () => ({ key: e.key, to: e.to, after, why, same, vs: [] }), e.v);
    }
  }
  const flat = m => new Map([...m].map(([k, v]) => [k, [...v.values()]]));
  return { need: flat(need), shadow: flat(shadow) };
}

// ═════════════════════════ lc-render：M4 渲染器 ═════════════════════════
/* ===== lc-render.js ===== */
/* LC Debug 渲染器 M4：RenderToken[] → DOM。只追加、不清空，所以可以分批喂。
 * 版面：普通文字按正文流动，行高 = 两行车道（简体轨 + 繁体轨）；
 * 有转换的词是一个 inline-block：上撑（简体侧地区）/ 简体轨 / 繁体轨 / 下撑（繁体侧地区）/ 原文。
 * 结构：标题 → 真正的 <hN>（带 id，可导航）；<ref> → 折叠成一个小标签，点击展开；
 */

const LANE_H = 1.7; // 一条车道的高度（em）。所有行必须同字号同高度，车道才能对齐
const META = {
  cn: { label: 'CN', color: '#F98C34' }, my: { label: 'MY', color: '#1971C2' }, sg: { label: 'SG', color: '#FF8787' },
  hk: { label: 'HK', color: '#E03131' }, mo: { label: 'MO', color: '#12B886' }, tw: { label: 'TW', color: '#7dc7ff' }
};
const LAYER_COLOR = { core: '#868e96', local: '#4dabf7', cgroup: '#51cf66', manual: '#fcc419', inline: '#f06595' };
const LAYER_FALLBACK = '#ced4da'; // 未知层不报错

const CSS = `
.lc-flow{white-space:pre-wrap;word-break:break-word;line-height:${2 * LANE_H}em}
.lc-w{display:inline-block;vertical-align:middle;text-align:center;white-space:nowrap;margin:0 1px;
  border-left:3px solid ${LAYER_FALLBACK}}
.lc-r{display:block;box-sizing:border-box;height:${LANE_H}em;line-height:${LANE_H}em;padding:0 5px;overflow:hidden}
.lc-r.merged{height:${2 * LANE_H}em;line-height:${2 * LANE_H}em}
.lc-r.base{}
.lc-r.hans,.lc-r.merged{border-top:1.5px solid rgba(128,128,128,.65)}
.lc-r.hant,.lc-r.merged{border-bottom:1.5px solid rgba(128,128,128,.65)}
.lc-r.hant.nb,.lc-r.merged.nb{border-bottom:none}
.lc-r.spread{opacity:.88}
.lc-r.raw{background:rgba(77,171,247,.3)}
.lc-r.orig-row{border:2px dashed rgba(128,128,128,.6);font-family:monospace;opacity:.8}
.lc-m{display:inline-flex;align-items:center;gap:2px;margin-right:5px;vertical-align:middle}
.lc-dot{display:none;box-sizing:border-box;width:6px;height:6px;border-radius:50%}
.lc-cc{display:inline;font:600 11px/1.3 monospace;padding:0 2px;border:1.5px solid rgba(128,128,128,.55);border-radius:2px}
.lc-dots .lc-dot{display:inline-block}
.lc-dots .lc-cc{display:none}
.lc-code{display:inline-block;vertical-align:middle;box-sizing:border-box;height:${2 * LANE_H}em;line-height:${2 * LANE_H}em;
  padding:0 4px;white-space:nowrap;font-family:monospace;background:rgba(128,128,128,.18);opacity:.85}
.lc-code.warn{outline:1px solid #f59f00;opacity:1}
.lc-prot{cursor:pointer}
.lc-prot:hover{outline:1px solid #4dabf7;opacity:1}
.lc-bl{display:inline;outline:1px dashed #4dabf7;outline-offset:1px}
.lc-bh{display:inline-block;vertical-align:middle;cursor:pointer;font:600 12px/1.6 monospace;padding:0 5px;margin-right:3px;
  background:#4dabf7;color:#fff;border-radius:3px;white-space:nowrap}
.lc-h{line-height:${2 * LANE_H}em;margin:1em 0 .4em;scroll-margin-top:70px;white-space:pre-wrap}
.lc-h .lc-ha{margin-left:.4em;font-size:.65em;opacity:.3;text-decoration:none}
.lc-h:hover .lc-ha{opacity:1}
.lc-lk{text-decoration:underline dotted rgba(77,171,247,.85);text-underline-offset:3px}
.lc-lk>.lc-code{color:#1184d9}
.lc-lkp{text-decoration:none}
.lc-lkp>.lc-code.lc-lb{color:#1184d9}
.lc-code.lc-lb{height:1.45em;line-height:1.45em;padding:0 2px;background:rgba(77,171,247,.1);opacity:1}
.lc-ref{display:inline}
.lc-rh{display:inline-block;vertical-align:middle;cursor:pointer;box-sizing:border-box;padding:0 5px;margin:0 1px;
  font:600 12px/1.6 monospace;border:1px solid rgba(128,128,128,.6);border-radius:4px;background:rgba(120,255,125,.12);
  white-space:nowrap;max-width:26em;overflow:hidden;text-overflow:ellipsis}
.lc-ref.open>.lc-rh{background:rgba(120,255,125,.32)}
.lc-ref0>.lc-rh{cursor:default;border-style:dashed}
.lc-rb{display:none;background:rgba(120,255,125,.08);margin:0 5px;padding:0.6em 5px;border-left:4px dotted rgba(120,255,125,.6);border-right:12px double rgba(120,255,125,.6)}
.lc-ref.open>.lc-rb{display:inline}
.lc-tpl{display:inline}
.lc-th{display:inline-block;vertical-align:middle;cursor:pointer;box-sizing:border-box;padding:0 5px;margin:0 1px;
  font:0.88em/1.6 monospace;border:1px solid rgba(128,128,128,.6);border-radius:4px;background:rgba(190,120,255,.16);
  white-space:nowrap;max-width:26em;overflow:hidden;text-overflow:ellipsis}
.lc-tpl.open>.lc-th{background:rgba(190,120,255,.32)}
.lc-tpl0>.lc-th{cursor:default;border-style:dashed}
.lc-tb{display:none;background:rgba(190,120,255,.08)}
.lc-tpl.inline.open>.lc-tb{display:inline;margin:0 5px;padding:0.6em 5px;border-left:4px dotted rgba(190,120,255,.6);border-right:12px double rgba(190,120,255,.6)}
.lc-tpl.multi.open>.lc-tb{display:block;margin:.15em 0 .15em .5em;border:3px solid rgba(190,120,255,.6)}
.lc-prm{display:inline}
.lc-tpl.multi>.lc-tb>.lc-prm{display:block}
.lc-pp{display:inline-block;vertical-align:middle;cursor:pointer;width:1.5em;margin:0 3px;padding:0;
  font:700 12px/1.5 monospace;text-align:center;color:#fff;background:#20c997;border:0;border-radius:3px}
.lc-vp{cursor:pointer;font-style:italic;opacity:.6;border-bottom:1px dashed rgba(128,128,128,.8);white-space:nowrap}
.lc-vb{display:none;padding-left:5px;border-left:2px solid #20c997}
.lc-prm.open>.lc-vb{display:inline}
.lc-prm.open>.lc-vp{display:none}
.lc-tip{position:fixed;z-index:2147483000;display:none;max-width:min(520px,90vw);box-sizing:border-box;padding:.5em .75em;
  background:Canvas;color:CanvasText;border:1px solid rgba(128,128,128,.7);border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,.35);
  font:15px/1.55 ${UI_FONT};white-space:pre-wrap;word-break:break-word;pointer-events:none}
.lc-tip div+div{margin-top:.3em}
.lc-tip.pinned{pointer-events:auto;border-color:#4dabf7}
.lc-tip a{color:#339af0;text-decoration:underline}
.lc-tip .lc-tip-hint{font-size:12px;opacity:.6}
.lc-tipbar{position:absolute;bottom:calc(100% + 1px);left:0;display:flex;gap:4px;padding:3px 4px;white-space:nowrap;
  background:Canvas;color:CanvasText;border:1px solid #4dabf7;border-radius:6px 6px 0 0;box-shadow:0 -2px 8px rgba(0,0,0,.2)}
.lc-tipbar button{font:600 12px/1.5 ${UI_FONT};padding:0 8px;cursor:pointer;color:inherit;background:rgba(77,171,247,.18);
  border:1px solid rgba(77,171,247,.8);border-radius:4px}
.lc-tipbar button:hover{background:rgba(77,171,247,.4)}
.lc-editing .lc-w,.lc-editing .lc-code{cursor:pointer}
.lc-selstart{outline:2px solid #fab005!important;outline-offset:1px}
.lc-selhint{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:2147483100;padding:.3em .9em;font:600 13px/1.5 ${UI_FONT};
  background:#fab005;color:#000;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none}
.lc-th::before{content:"";display:inline-block;width:1.2em;height:1.2em;background-color:#000;vertical-align:-.3em;margin-right:.3em;-webkit-mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><circle cx="17" cy="10" r="3"/><path d="M10.58 3A3 3 0 0 1 11 4.5a3 3 0 0 1-6 0A3 3 0 0 1 5.42 3H1v12a2 2 0 0 0 2 2h12V3z"/></svg>') center/contain no-repeat;mask:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><circle cx="17" cy="10" r="3"/><path d="M10.58 3A3 3 0 0 1 11 4.5a3 3 0 0 1-6 0A3 3 0 0 1 5.42 3H1v12a2 2 0 0 0 2 2h12V3z"/></svg>') center/contain no-repeat}/*https://commons.wikimedia.org/wiki/File:Codex_icon_puzzle.svg*/
::highlight(lc-edit){background-color:rgba(77,171,247,.4)}
::highlight(lc-flash){background-color:rgba(255,212,59,.75)}
`;

function injectCss(doc) {
  if (doc.getElementById('lc-css')) return;
  const s = doc.createElement('style'); s.id = 'lc-css'; s.textContent = CSS; doc.head.appendChild(s);
}
function mk(doc, tag, cls, text) {
  const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e;
}
/** 设置 tooltip 内容：每项是字符串（可含换行）或 {text, page}；page 是 wiki 页面名，渲染成链接 */
function setTip(e, lines) {
  const out = [];
  for (const l of lines) {
    if (typeof l === 'string') { for (const s of l.split('\n')) out.push({ text: s, page: null }); }
    else out.push(l);
  }
  e._lcTip = out; e.dataset.lcTip = '1';
}
function marksEl(doc, keys) {
  const box = mk(doc, 'span', 'lc-m');
  for (const k of keys) {
    const m = META[k] || { label: k, color: '#999' };
    const dot = mk(doc, 'span', 'lc-dot'); dot.style.background = m.color;
    const cc = mk(doc, 'span', 'lc-cc', m.label); cc.style.borderColor = m.color;
    box.appendChild(dot); box.appendChild(cc); // 字母代码（默认）/ 圆点，靠 .lc-dots 切换
  }
  return box;
}
function rowEl(doc, r, cls) {
  const e = mk(doc, 'span', 'lc-r ' + cls + (r.isRaw ? ' raw' : '')); // raw：和原文相同的格子加底色
  if (r.marks.length) e.appendChild(marksEl(doc, r.marks));
  e.appendChild(doc.createTextNode(r.text));
  if (r.tips.length) setTip(e, r.tips);
  return e;
}
// ── 源码位置：元素用 _lcSrc，Text 节点用 WeakMap（给 DOM 加属性不方便的文本节点） ──
const textPos = new WeakMap();
const withSrc = (e, t) => { if (t.s != null) e._lcSrc = { s: t.s, e: t.e }; return e; };
function tokenEl(doc, t) {
  if (t.type === 'plain') { const n = doc.createTextNode(t.text); if (t.s != null) textPos.set(n, { s: t.s, e: t.e }); return n; }
  if (t.type === 'code') {
    const s = t.text.length > 60 ? t.text.slice(0, 57) + '…' : t.text;
    const e = mk(doc, 'span', 'lc-code' + (t.lb ? ' lc-lb' : '') + (t.warn ? ' warn' : '') + (t.prot ? ' lc-prot' : ''), s + (t.warn ? ' ⚠' : ''));
    setTip(e, [t.lb ? '' : t.text, t.note, t.warn].filter(Boolean)); // 链接括号块：tooltip 里不重复源码，只显示“内部链接：目标”
    if (t.prot) { e._lcText = t.text; e._lcRules = t.rules; }
    return withSrc(e, t);
  }
  const w = withSrc(mk(doc, 'span', 'lc-w'), t);
  if (t.deep) w._lcDeep = t.out; // 供浮动工具栏的“改行内转换”使用
  w.style.borderLeftColor = LAYER_COLOR[t.layer] || LAYER_FALLBACK;
  for (const r of t.up) w.appendChild(rowEl(doc, r, 'spread'));
  const nb = t.orig !== null && !t.down.length ? ' nb' : ''; // 基线行后面紧跟原文行时去掉下边线（原来用 :has(+ .orig-row)，在几万个同级节点里很慢）
  if (t.merged) w.appendChild(rowEl(doc, t.hans, 'base merged' + nb));
  else { w.appendChild(rowEl(doc, t.hans, 'base hans')); w.appendChild(rowEl(doc, t.hant, 'base hant' + nb)); }
  for (const r of t.down) w.appendChild(rowEl(doc, r, 'spread'));
  if (t.orig !== null) { const o = mk(doc, 'span', 'lc-r orig-row', t.orig); setTip(o, [_M('token.original')]); w.appendChild(o); }
  // 让“简体轨/繁体轨的分界线”正好落在正文行的中线：短的一侧用空白补齐（相当于表格里的空行）
  const above = t.up.length, below = t.down.length + (t.orig !== null ? 1 : 0);
  if (above > below) w.style.marginBottom = (above - below) * LANE_H + 'em';
  else if (below > above) w.style.marginTop = (below - above) * LANE_H + 'em';
  return w;
}

// ── 渲染状态（每个容器一份）：打开的标题 / ref 栈、目录、已用 id ──
const states = new WeakMap();
function stateOf(c) {
  let s = states.get(c);
  if (!s) states.set(c, s = { stack: [], toc: [], ids: new Map(), afterH: false });
  return s;
}
const textOf = t => t.type === 'plain' ? t.text : t.type === 'word' ? t.raw : '';

/** 参数值收尾：去掉值末尾的空白（源码位置同步缩短），多行模板里才不会多出空行 */
function trimEnd(el) {
  for (let n = el.lastChild; n && n.nodeType === 3; n = el.lastChild) {
    const m = /\s+$/.exec(n.data); if (m) { const p = textPos.get(n); n.data = n.data.slice(0, m.index); if (p) p.e -= m[0].length; }
    if (n.data) break; n.remove();
  }
}
function renderLC(tokens, container) {
  const doc = container.ownerDocument, frag = doc.createDocumentFragment(), S = stateOf(container);
  const all = !!container._lcAll; // “展开全部”：只是默认状态，每一项仍可单独开合
  const topOf = () => S.stack.length ? S.stack[S.stack.length - 1] : null;
  const into = () => { const t = topOf(); return t ? t.el : frag; };
  const hTop = () => { for (let i = S.stack.length - 1; i >= 0; i--) { const f = S.stack[i]; if (f.k === 'h') return f; if (f.k !== 'l') return null; } return null; }; // 标题里夹着链接：文字仍要计入标题
  /** 弹栈到最近的 k 层（含）。找 v 层时遇到更近的模板层就放弃——那是嵌套模板自己的 */
  const closeIn = k => {
    let i = S.stack.length - 1;
    while (i >= 0 && S.stack[i].k !== k) { if (k !== 't' && S.stack[i].k === 't') return; i--; }
    if (i < 0) return;
    while (S.stack.length > i) { const e = S.stack.pop(); if (e.k === 'v') trimEnd(e.el); }
  };
  for (let t of tokens) {
    const top = topOf(), vt = S.vTrim; S.vTrim = false; // vt：上一个 token 刚打开参数值，开头的空白要去掉
    if (t.type === 'hs') {
      const lvl = Math.min(6, Math.max(1, t.level));
      const h = mk(doc, 'h' + lvl, 'lc-h'); into().appendChild(h);
      S.stack.push({ k: 'h', el: h, text: '', lvl, keep: !!t.keep }); S.afterH = false;
    } else if (t.type === 'he') {
      while (topOf() && topOf().k === 'l') S.stack.pop();
      const top = topOf();
      if (top && top.k === 'h') {
        S.stack.pop();
        let text = top.text.trim(); if (top.keep) text = text.replace(/^=+/, '').replace(/=+$/, '').trim(); // 盲检：= 还在文字里，目录和锚点里不要它
        const base = text.replace(/\s+/g, '_') || 'section';
        let id = base, n = 1; while (S.ids.has(id)) id = base + '_' + (++n);
        S.ids.set(id, 1); top.el.id = id;
        const a = mk(doc, 'a', 'lc-ha', '#'); a.setAttribute('href', '#' + id);
        top.el.appendChild(a);
        S.toc.push({ level: top.lvl, id, text: text || id });
        S.afterH = true; // 标题后面紧跟的那个换行不再显示成空行
      }
    } else if (t.type === 'ls') {
      const w = mk(doc, 'span', 'lc-lk' + (t.pipe ? ' lc-lkp' : '')); w._lcLink = t.link; w.setAttribute('data-lc-link', t.link);
      into().appendChild(w); S.stack.push({ k: 'l', el: w }); S.afterH = false;
    } else if (t.type === 'le') {
      if (top && top.k === 'l') S.stack.pop();
    } else if (t.type === 'rs') {
      const r = mk(doc, 'span', 'lc-ref' + (t.empty ? ' lc-ref0' : all ? ' open' : ''));
      const hd = mk(doc, 'span', 'lc-rh', t.label); setTip(hd, [t.raw]);
      r.appendChild(hd); into().appendChild(r);
      if (!t.empty) { const b = mk(doc, 'span', 'lc-rb'); r.appendChild(b); S.stack.push({ k: 'r', el: b }); }
      S.afterH = false;
    } else if (t.type === 're') {
      if (top && top.k === 'r') S.stack.pop();
    } else if (t.type === 'ts') {
      const r = mk(doc, 'span', 'lc-tpl' + (t.empty ? ' lc-tpl0' : all ? ' open' : '') + (t.multi ? ' multi' : ' inline'));
      const hd = mk(doc, 'span', 'lc-th', t.label); setTip(hd, [t.raw]);
      r.appendChild(hd); into().appendChild(r);
      if (!t.empty) { const b = mk(doc, 'span', 'lc-tb'); r.appendChild(b); S.stack.push({ k: 't', el: b }); }
      S.afterH = false;
    } else if (t.type === 'te') {
      closeIn('v'); closeIn('t'); S.afterH = false;
    } else if (t.type === 'pn') { // 一个参数：|名= 屏蔽；有值的再加 + 和折叠的值
      closeIn('v');
      const row = mk(doc, 'span', 'lc-prm' + (t.hv && all ? ' open' : ''));
      row.appendChild(tokenEl(doc, { type: 'code', text: t.text.trim(), s: t.s, e: t.e }));
      into().appendChild(row);
      if (t.hv) {
        const b = mk(doc, 'button', 'lc-pp', all ? '−' : '+'); b.type = 'button'; setTip(b, [_M('token.expandParamValue')]);
        const p = mk(doc, 'span', 'lc-vp', t.preview); setTip(p, [t.raw]);
        const vb = mk(doc, 'span', 'lc-vb');
        row.appendChild(b); row.appendChild(p); row.appendChild(vb);
        S.stack.push({ k: 'v', el: vb }); S.vTrim = true;
      }
      S.afterH = false;
    } else {
      if (vt && t.type === 'plain') { // 参数值开头的空白不显示（位置同步后移）
        const m = /^\s+/.exec(t.text);
        if (m) { t = Object.assign({}, t, { text: t.text.slice(m[0].length), s: t.s != null ? t.s + m[0].length : t.s }); if (!t.text) { S.vTrim = true; continue; } }
      }
      { const hf = hTop(); if (hf) hf.text += textOf(t); }
      if (S.afterH && t.type === 'plain' && t.text[0] === '\n') { t = Object.assign({}, t, { text: t.text.slice(1), s: t.s != null ? t.s + 1 : t.s }); if (!t.text) { S.afterH = false; continue; } }
      S.afterH = false;
      into().appendChild(tokenEl(doc, t));
    }
  }
  container.appendChild(frag);
}
/** “展开全部”：把容器里现有的 ref / 模板 / 参数值整体设成展开或折叠；之后每一项仍可手动开合 */
function setAllOpen(c, on) {
  c._lcAll = !!on;
  c.querySelectorAll('.lc-ref:not(.lc-ref0),.lc-tpl:not(.lc-tpl0)').forEach(n => n.classList.toggle('open', !!on));
  c.querySelectorAll('.lc-prm').forEach(row => {
    const b = row.querySelector(':scope>.lc-pp'); if (!b) return; // 空值参数没有 +
    row.classList.toggle('open', !!on); b.textContent = on ? '−' : '+';
  });
}
function hideTip(tip) { tip._cur = null; tip._pin = null; tip._tgt = null; tip._bar = null; tip.classList.remove('pinned'); tip.style.display = 'none'; }
function clearLC(c) {
  c.textContent = ''; states.delete(c);
  if (c._lcReset) c._lcReset(); // 编辑相关状态（选择起点等）指向的是被清掉的 DOM
  const tip = c.ownerDocument.getElementById('lc-tip'); if (tip) hideTip(tip);
}
const setDots = (c, on) => c.classList.toggle('lc-dots', !!on);
const getToc = c => stateOf(c).toc;

/** 容器里所有带源码位置的“原子”，按文档顺序：Text 节点（plain，WeakMap 里有位置）+ 带 _lcSrc 的元素（转换词 / 屏蔽块，不再往里走） */
function srcItems(container) {
  const items = [];
  (function walk(n) {
    for (let c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { const p = textPos.get(c); if (p) items.push({ n: c, s: p.s, e: p.e, text: true }); }
      else if (c.nodeType === 1) { if (c._lcSrc) items.push({ n: c, s: c._lcSrc.s, e: c._lcSrc.e, text: false }); else walk(c); }
    }
  })(container);
  return items;
}
/** 源码区间 [s,e) → DOM Range（找不到返回 null）。转换词/屏蔽块整个吞进来，纯文本按字符精确 */
function rangeForSrc(container, s, e) {
  const its = srcItems(container); let ia = -1, ib = -1;
  for (let k = 0; k < its.length; k++) if (its[k].e > s) { ia = k; break; }
  for (let k = its.length - 1; k >= 0; k--) if (its[k].s < e) { ib = k; break; }
  if (ia < 0 || ib < 0) return null;
  if (ib < ia) ib = ia;
  const a = its[ia], b = its[ib], r = container.ownerDocument.createRange();
  if (a.text) r.setStart(a.n, Math.max(0, Math.min(a.n.length, s - a.s))); else r.setStartBefore(a.n);
  if (b.text) r.setEnd(b.n, Math.max(0, Math.min(b.n.length, e - b.s))); else r.setEndAfter(b.n);
  return r;
}
/** 给容器装上交互：DOM tooltip、ref 展开/折叠、屏蔽块点击固定 + 盲检，以及（编辑模式下）就地编辑的入口。
 *  opts.blindFn(text, rules, base) → RenderToken[]；opts.pageUrl(title)
 *  编辑相关（都不传则完全没有编辑行为，预览区就是这样用的）：
 *    opts.isEdit() 编辑模式是否开启；opts.getSrc() 当前完整源码；opts.onEdit({s,e,caret}) 请求打开编辑器
 *  返回 api：{ reset, highlight(s,e), clearHighlight, flash(s,e) } */
function install(container, opts) {
  if (container._lcInstalled) return container._lcApi; container._lcInstalled = true;
  opts = opts || {};
  const doc = container.ownerDocument, win = doc.defaultView;
  let tip = doc.getElementById('lc-tip');
  if (!tip) { tip = mk(doc, 'div', 'lc-tip'); tip.id = 'lc-tip'; doc.body.appendChild(tip); }
  if (!tip._bound) { // document 级监听只装一次（提示框是全页共用的一个）
    tip._bound = true;
    doc.addEventListener('click', ev => { // 点空白处取消固定
      if (!tip._pin || ev._lcHandled) return; // _lcHandled：容器里刚刚固定了一个（纯文本的最小提示没有 data-lc-tip，别被误关）
      const x = ev.target; if (tip.contains(x) || (x.closest && x.closest('[data-lc-tip]'))) return;
      hideTip(tip);
    });
    doc.addEventListener('keydown', ev => { if (ev.key === 'Escape' && tip._pin) hideTip(tip); });
  }
  const urlOf = opts.pageUrl || (t => '/wiki/' + encodeURIComponent(t));
  const editOn = () => !!(opts.isEdit && opts.isEdit());
  const getSrc = () => (opts.getSrc ? opts.getSrc() : '');
  let selStart = null, selHint = null; // 选择状态：起点 { kind, el?, node?, off?, s, e }

  // ── 高亮：原生选区 + CSS Custom Highlight（后者不受输入框抢焦点影响） ──
  const HL = win.CSS && win.CSS.highlights && typeof win.Highlight === 'function' ? win.CSS.highlights : null;
  const setHL = (name, r) => { if (!HL) return; if (r) HL.set(name, new win.Highlight(r)); else HL.delete(name); };
  const showRange = r => {
    setHL('lc-edit', r);
    const sel = win.getSelection && win.getSelection(); if (sel) { sel.removeAllRanges(); sel.addRange(r); }
  };
  const clearHighlight = () => {
    setHL('lc-edit', null);
    const sel = win.getSelection && win.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed && container.contains(sel.anchorNode)) sel.removeAllRanges();
  };
  const highlight = (s, e) => { const r = rangeForSrc(container, s, e); if (r) showRange(r); };
  const flash = (s, e) => {
    const r = rangeForSrc(container, s, e); if (!r) return;
    if (HL) { setHL('lc-flash', r); win.setTimeout(() => setHL('lc-flash', null), 2400); }
    else { const sel = win.getSelection(); sel.removeAllRanges(); sel.addRange(r); win.setTimeout(() => { if (!sel.isCollapsed && container.contains(sel.anchorNode)) sel.removeAllRanges(); }, 1800); }
  };

  // ── 选择状态 ──
  const showHint = msg => {
    if (!selHint) { selHint = mk(doc, 'div', 'lc-selhint'); doc.body.appendChild(selHint); }
    selHint.textContent = msg; selHint.style.display = '';
  };
  const cancelSel = () => {
    if (selStart && selStart.el) selStart.el.classList.remove('lc-selstart');
    if (selStart) setHL('lc-edit', null);
    selStart = null; if (selHint) selHint.style.display = 'none';
  };
  const startSel = t => {
    cancelSel(); selStart = t; hideTip(tip);
    if (t.el) t.el.classList.add('lc-selstart');
    else if (t.node) { // 纯文本起点：整个「本块」（左右两个元素之间的文本节点）高亮
      const r = doc.createRange(); r.selectNodeContents(t.node);
      setHL('lc-edit', r);
    }
    showHint(_M('selection.startPicked'));
  };
  /** 一个端点在 DOM 里的 Range：元素 → 整个元素；纯文本 → 整个文本节点（本块） */
  const rangeOf = t => { const r = doc.createRange(); r.selectNode(t.el || t.node); return r; };
  const finishSel = t => {
    const A = selStart; if (!A) return;
    const s = Math.min(A.s, t.s), e = Math.max(A.e, t.e); // 两端取并集：元素端点吞掉整个元素，纯文本端点吞掉整个本块
    if (s === e) { showHint(_M('selection.sameSpot')); hideTip(tip); return; }
    const ra = rangeOf(A), rb = rangeOf(t), R = win.Range;
    const first = ra.compareBoundaryPoints(R.START_TO_START, rb) <= 0 ? ra : rb;
    const last = ra.compareBoundaryPoints(R.END_TO_END, rb) >= 0 ? ra : rb;
    const rr = doc.createRange(); rr.setStart(first.startContainer, first.startOffset); rr.setEnd(last.endContainer, last.endOffset);
    cancelSel(); hideTip(tip); showRange(rr); // 选中的范围用原生选区显示，然后直接打开编辑器
    if (opts.onEdit) opts.onEdit({ s, e, caret: 0 });
  };
  const editBlock = t => {
    let s = t.s, e = t.e, caret = 0;
    if (t.kind === 'plain') { s = t.ns; e = t.ne; caret = t.off; } // 纯文本：左右两个元素之间的这一段（该文本节点的源码区间），光标预置在点击位置
    cancelSel(); hideTip(tip); highlight(s, e);
    if (opts.onEdit) opts.onEdit({ s, e, caret });
  };
  const editSel = t => { // 选中的那一段纯文本（一定落在单个文本节点内）
    cancelSel(); hideTip(tip); highlight(t.s, t.e);
    if (opts.onEdit) opts.onEdit({ s: t.s, e: t.e, caret: 0 });
  };
  const editInline = t => { // 把这个块的转换改写成 -{zh-xx:…;…}-，预填进编辑器，仍需“预览并确认”
    const rule = inlineRule(t.el._lcDeep, opts.toHant);
    if (!rule) { notify(_M('inline.unsafeResult')); return; }
    cancelSel(); hideTip(tip); highlight(t.s, t.e);
    if (opts.onEdit) opts.onEdit({ s: t.s, e: t.e, caret: rule.length, fill: rule });
  };
  const doBlind = p => {
    if (!opts.blindFn || p._lcText == null) return;
    const w = mk(doc, 'span', 'lc-bl'), hd = mk(doc, 'span', 'lc-bh', _M('blind.restore')), body = mk(doc, 'span', 'lc-bb');
    hd.dataset.lcTip = _M('blind.restoreTip'); w._lcOrig = p;
    w.appendChild(hd); w.appendChild(body);
    renderLC(opts.blindFn(p._lcText, p._lcRules, p._lcSrc ? p._lcSrc.s : 0), body); // base：盲检出来的词和纯文本仍带整页的绝对源码位置，所以也能编辑
    hideTip(tip); p.replaceWith(w);
  };

  const openLink = raw => {
    if (/-\{/.test(raw)) { notify(_M('link.hasMarkup')); return; }
    let t = raw.replace(/_/g, ' ').trim(), frag = ''; const h = t.indexOf('#');
    if (h > -1) { frag = t.slice(h + 1).trim(); t = t.slice(0, h).trim(); }
    t = t.replace(/^:\s*/, '');
    let url = t ? urlOf(t) : win.location.href.split('#')[0];
    if (frag) url += '#' + encodeURIComponent(frag.replace(/ /g, '_'));
    hideTip(tip); win.open(url, '_blank', 'noopener');
  };
  // ── 提示框 ──
  const buildBar = () => {
    const t = tip._tgt; if (!t || (t.kind === 'tip' && !t.link)) return null;
    const items = [], edit = editOn();
    if (t.kind === 'sel') { if (edit) items.push([_M('menu.editSelection'), () => editSel(t)], [_M('common.cancel'), () => hideTip(tip)]); } // 选中了一段纯文本
    else if (edit && selStart) items.push([_M('menu.selectUntilHere'), () => finishSel(t)], [_M('menu.cancelSelection'), () => { cancelSel(); hideTip(tip); }]); // 选择中：盲检隐藏
    else if (t.kind !== 'tip') {
      if (edit) items.push([_M('menu.editBlock'), () => editBlock(t)], [_M('menu.startSelection'), () => startSel(t)]);
      if (edit && t.el && t.el._lcDeep) items.push([_M('menu.editInline'), () => editInline(t)]);
      if (t.prot) items.push([_M('menu.blindCheck'), () => doBlind(t.el)]);
    }
    if (t.link && !(edit && selStart)) items.push([_M('menu.openLink'), () => openLink(t.link)]);
    if (!items.length) return null;
    const bar = mk(doc, 'span', 'lc-tipbar');
    for (const [label, fn] of items) {
      const b = mk(doc, 'button', '', label); b.type = 'button';
      b.addEventListener('click', ev => { ev.stopPropagation(); fn(); });
      bar.appendChild(b);
    }
    return bar;
  };
  const fill = el => {
    tip.textContent = ''; tip._bar = null;
    for (const l of el._lcTip || (tip._tgt && tip._tgt.lines) || []) {
      const d = mk(doc, 'div', '', l.text != null ? l.text : l);
      if (l.page) { d.appendChild(doc.createTextNode(' ')); const a = mk(doc, 'a', '', '↗ ' + l.page); a.href = urlOf(l.page); a.target = '_blank'; a.rel = 'noopener'; d.appendChild(a); }
      tip.appendChild(d);
    }
    { const lk = el.closest ? el.closest('.lc-lk') : null, nm = lk ? lk._lcLink : (tip._tgt && tip._tgt.link); if (nm) tip.appendChild(mk(doc, 'div', '', _M('tip.link', nm))); }
    if (tip._pin) {
      tip.appendChild(mk(doc, 'div', 'lc-tip-hint', _M('tip.pinned')));
      const bar = buildBar(); if (bar) { tip.appendChild(bar); tip._bar = bar; } // 按钮条是 #lc-tip 的子元素：点它不算“点空白处”
    }
  };
  const place = ev => {
    const pad = 14, bar = tip._pin ? tip._bar : null, bh = bar ? bar.offsetHeight + 1 : 0;
    const w = Math.max(tip.offsetWidth, bar ? bar.offsetWidth : 0), h = tip.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY + pad + bh; // 在指针下方时整体下移一个按钮条高度，别盖住被点的元素
    if (x + w > win.innerWidth - 8) x = Math.max(8, ev.clientX - pad - w);
    if (y + h > win.innerHeight - 8) y = Math.max(8 + bh, ev.clientY - pad - h); // 翻到指针上方：按钮条顶部不出视口
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  };
  const pin = (ev, el, info) => {
    if (tip._pin === el) { hideTip(tip); return; }
    tip._cur = el; tip._pin = el; tip._tgt = info; tip.classList.add('pinned');
    fill(el); tip.style.display = 'block'; place(ev);
  };

  /** 点击位置对应的纯文本源码位置：{node, off, s}。点在文本节点之外 / 离文字行太远时返回 null */
  const locate = ev => {
    let node = null, off = 0;
    if (doc.caretPositionFromPoint) { const p = doc.caretPositionFromPoint(ev.clientX, ev.clientY); if (p) { node = p.offsetNode; off = p.offset; } }
    else if (doc.caretRangeFromPoint) { const r = doc.caretRangeFromPoint(ev.clientX, ev.clientY); if (r) { node = r.startContainer; off = r.startOffset; } }
    if (node && node.nodeType === 1) { // 落在元素上（Firefox）：取相邻的文本节点
      const k = node.childNodes[off], p = node.childNodes[off - 1];
      if (k && k.nodeType === 3 && textPos.has(k)) { node = k; off = 0; } else if (p && p.nodeType === 3 && textPos.has(p)) { node = p; off = p.length; } else node = null;
    }
    if (!node || node.nodeType !== 3 || !textPos.has(node) || !container.contains(node)) return null;
    off = Math.max(0, Math.min(node.length, off));
    try { // 点击点离光标所在行太远（比如点在正文下方的空白）就不算
      const r = doc.createRange(); r.setStart(node, off); r.collapse(true); const b = r.getBoundingClientRect();
      if (b && b.height && (ev.clientY < b.top - 6 || ev.clientY > b.bottom + 6)) return null;
    } catch (_) { /* 取不到几何信息就算了 */ }
    return { node, off, s: textPos.get(node).s + off };
  };
  const lineNo = p => { const src = getSrc(); let n = 1; for (let i = src.indexOf('\n'); i > -1 && i < p; i = src.indexOf('\n', i + 1)) n++; return n; };
  /** 纯文本类 tooltip 的两行文案：范围说明 + 字符数；预览 */
  const spanLines = (what, s, e) => {
    const txt = getSrc().slice(s, e).replace(/\s+/g, ' ').trim();
    return [ _M('tip.charCount', what, e - s), txt.length > 60 ? txt.slice(0, 57) + '…' : (txt || _M('tip.blank'))];
  };

  let cur = () => tip._cur; // 悬停中的元素（提示框共用，所以放在 tip 上）
  container.addEventListener('mouseover', ev => {
    if (tip._pin) return; // 已固定：不随悬停切换
    const t = ev.target.closest && ev.target.closest('[data-lc-tip],.lc-lk');
    if (!t || !container.contains(t)) { hideTip(tip); return; }
    if (t !== cur()) { tip._cur = t; fill(t); }
    tip.style.display = 'block'; place(ev);
  });
  container.addEventListener('mousemove', ev => { if (cur() && !tip._pin) place(ev); });
  container.addEventListener('mouseout', ev => { if (!tip._pin && cur() && !(ev.relatedTarget && cur().contains(ev.relatedTarget))) hideTip(tip); });
  if (opts.isEdit) doc.addEventListener('keydown', ev => { if (ev.key === 'Escape' && selStart) { cancelSel(); hideTip(tip); } });

  container.addEventListener('click', ev => {
    const tg = ev.target; if (!tg.closest) return;
    const rh = tg.closest('.lc-rh');
    if (rh) { const r = rh.parentNode; if (!r.classList.contains('lc-ref0')) r.classList.toggle('open'); return; }
    const th = tg.closest('.lc-th');
    if (th) { const r = th.parentNode; if (!r.classList.contains('lc-tpl0')) r.classList.toggle('open'); return; }
    const pp = tg.closest('.lc-pp,.lc-vp');
    if (pp) { const row = pp.parentNode, on = row.classList.toggle('open'), b = row.querySelector(':scope>.lc-pp'); if (b) b.textContent = on ? '−' : '+'; return; }
    const bh = tg.closest('.lc-bh');
    if (bh) { const w = bh.parentNode; if (w._lcOrig) { hideTip(tip); w.replaceWith(w._lcOrig); } return; }

    const edit = editOn();
    if (edit) { const sel = win.getSelection && win.getSelection(); if (sel && !sel.isCollapsed) { if (tip._tgt && tip._tgt.kind === 'sel') ev._lcHandled = true; return; } } // 正在选文字：不打扰（选区工具栏别被误关）
    const atom = tg.closest('.lc-w,.lc-code'), tipped = tg.closest('[data-lc-tip]');
    const lkEl = tg.closest('.lc-lk'), link = lkEl && container.contains(lkEl) ? lkEl._lcLink : null; // 所在的内部链接
    const inTip = tipped && container.contains(tipped) ? tipped : null;
    let el = null, info = null;
    if (atom && atom._lcSrc && container.contains(atom)) {
      const prot = atom.classList.contains('lc-prot');
      if (edit || prot || link) { // 编辑模式：所有元素；否则只有屏蔽块（点击固定，按钮条里有 [盲检]）
        const s = atom._lcSrc.s, e = atom._lcSrc.e, text = getSrc().slice(s, e);
        info = { kind: atom.classList.contains('lc-code') ? 'code' : 'word', el: atom, s, e, prot, link,
                 lines: [(text.length > 60 ? text.slice(0, 57) + '…' : text)] };
        el = inTip || atom;
      }
    }
    if (!info && inTip) { el = inTip; info = { kind: 'tip', link }; } // 其它带提示的元素：固定提示
    if (!info && edit && !tg.closest('a')) { // 纯文本
      const loc = locate(ev);
      if (loc) { // 本块 = 这个文本节点 = 左右两个元素之间的纯文本
        const np = textPos.get(loc.node); el = {};
        info = { kind: 'plain', node: loc.node, off: loc.off, s: np.s, e: np.e, ns: np.s, ne: np.e, link, lines: spanLines(_M('tip.blockText'), np.s, np.e) };
      }
    }
    if (!info && link && !tg.closest('a')) { el = {}; info = { kind: 'tip', link, lines: [] }; } // 非编辑模式点链接文字
    if (!info) return;
    ev._lcHandled = true;
    pin(ev, el, info);
  });
  // 编辑模式下选中了一段纯文本（起止都在同一个文本节点内，不含其它元素）：固定一个带「编辑所选文字」的工具栏
  container.addEventListener('mouseup', ev => {
    if (ev.button !== 0 || !editOn() || selStart) return;
    win.setTimeout(() => { // 等浏览器把选区定稿
      const sel = win.getSelection && win.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
      const r = sel.getRangeAt(0), n = r.startContainer;
      if (n !== r.endContainer || n.nodeType !== 3 || !textPos.has(n) || !container.contains(n)) return;
      const p = textPos.get(n), s = p.s + r.startOffset, e = Math.min(p.e, p.s + r.endOffset);
      if (e <= s) return;
      pin(ev, {}, { kind: 'sel', s, e, link: (n.parentNode.closest && n.parentNode.closest('.lc-lk') || {})._lcLink, lines: spanLines(_M('tip.selectedText'), s, e) });
    }, 0);
  });

  container._lcReset = () => cancelSel();
  const api = { reset() { cancelSel(); clearHighlight(); hideTip(tip); }, highlight, clearHighlight, flash, locate };
  container._lcApi = api;
  return api;
}

// ═════════════════════════ lc-load：ZhConversion 内建表 + 站点转换表 ═════════════════════════
/* ===== lc-load.js ===== */
/* LC Debug 数据加载：ZhConversion 五张内建表（核心层）+ MediaWiki:Conversiontable/* 站点表（local 层）。
 * 不碰 DOM、不碰 mw，Node 里能测。组合方式对照 MediaWiki ZhConverter（master / REL1_39）：
 *   各变体先取自己的内建表：hans=HANS hant=HANT cn/sg/my=CN hk/mo=HK tw=TW；
 *   站点页 MediaWiki:Conversiontable/<变体> 合并进同变体的表（站点页覆盖内建表）；
 *   最后 cn/sg/my 补上 hans 表里缺的词，hk/mo/tw 补上 hant 表里缺的词（已有的不覆盖）。
 * 所以同一个词的优先级（高→低）：本变体站点页 > 本变体内建表 > 基础变体站点页 > 基础变体内建表。
 */

const OWN = { 'zh-hans': 'ZH_TO_HANS', 'zh-hant': 'ZH_TO_HANT', 'zh-cn': 'ZH_TO_CN', 'zh-sg': 'ZH_TO_CN', 'zh-my': 'ZH_TO_CN',
              'zh-hk': 'ZH_TO_HK', 'zh-mo': 'ZH_TO_HK', 'zh-tw': 'ZH_TO_TW' };
const BASE = { 'zh-cn': 'zh-hans', 'zh-sg': 'zh-hans', 'zh-my': 'zh-hans', 'zh-hk': 'zh-hant', 'zh-mo': 'zh-hant', 'zh-tw': 'zh-hant' };
const KEYS = ['ZH_TO_HANS', 'ZH_TO_HANT', 'ZH_TO_CN', 'ZH_TO_HK', 'ZH_TO_TW'];
const siteTitle = v => 'MediaWiki:Conversiontable/' + v;
const defaultYield = () => new Promise(r => setTimeout(r, 0));

/** 解析 MediaWiki:Conversiontable/* 页面：
 *  只认 -{ … }- 之内；先删掉 ' " * # 四种字符；按 ; 切条；按 => 切两半；右半部分 // 之后是注释。 */
function parseConversionTable(text) {
  const ret = new Map(); if (!text) return ret;
  const blocks = text.split('-{'); blocks.shift();
  for (const b of blocks) {
    const e = b.indexOf('}-'); if (e < 0) continue;
    for (const piece of b.slice(0, e).replace(/['"*#]/g, '').split(';')) {
      const m = piece.split('=>'); if (m.length !== 2) continue;
      const key = m[0].trim(); if (!key) continue;
      ret.set(key, m[1].split('//')[0].trim());
    }
  }
  return ret;
}

/** json: ZhConversion 数据页对象；tables: createTables()；opt.site: {变体: 站点页原文}
 *  分块写入，块间让出主线程。返回 { missing: 缺的内建键, count: 内建条目数, siteCount: 站点条目数 } */
async function loadTables(json, tables, opt) {
  opt = opt || {};
  const chunk = opt.chunk || 4000, yieldFn = opt.yieldFn || defaultYield, onProgress = opt.onProgress, site = opt.site || {};
  const builtin = k => (json && json[k] && typeof json[k] === 'object') ? json[k] : null;
  const missing = KEYS.filter(k => !builtin(k));
  let count = 0; for (const k of KEYS) if (builtin(k)) count += Object.keys(builtin(k)).length;
  const sitePages = {}; let siteCount = 0;
  for (const v of VARIANTS) if (site[v]) { sitePages[v] = parseConversionTable(site[v]); siteCount += sitePages[v].size; }

  // 第一步：按优先级（低→高）合并出每个变体的最终表
  const merged = {}; let total = 0;
  for (const v of VARIANTS) {
    const srcs = [];
    const base = BASE[v];
    if (base) { srcs.push(['core', OWN[base], builtin(OWN[base])]); srcs.push(['local', siteTitle(base), sitePages[base]]); }
    srcs.push(['core', OWN[v], builtin(OWN[v])]); srcs.push(['local', siteTitle(v), sitePages[v]]);
    const m = new Map();
    for (const [layer, src, data] of srcs) {
      if (!data) continue;
      for (const [k, to] of (data instanceof Map ? data : Object.entries(data))) m.set(k, { to, layer, src });
    }
    merged[v] = m; total += m.size;
  }
  // 第二步：分块写进规则表
  let done = 0;
  for (const v of VARIANTS) {
    const ents = [...merged[v]]; merged[v] = null; const tb = tables[v];
    for (let i = 0; i < ents.length; i += chunk) {
      const part = ents.slice(i, i + chunk);
      for (const [k, o] of part) tb.add(k, o.to, o.layer, o.src);
      done += part.length;
      if (onProgress) onProgress(done, total);
      await yieldFn();
    }
  }
  return { missing, count, siteCount };
}

// ═════════════════════════ lc-main：用户脚本入口 ═════════════════════════
/* ===== lc-main.js ===== */
/* LC Debug 用户脚本入口：访问任意条目时加 ?lcdebug=1 即启用。
 * 取全文源码 → 取数据页与站点转换表（IndexedDB 缓存，按 revid 失效）→ 建规则表
 * → 转换时按文中 {{noteTA}} 读取公共转换组（先 Module:CGroup/X，没有则展开 Template:CGroup/X） → 用校对结果整体替换页面正文（#mw-content-text），并生成目录。
 * 依赖：mw。四段代码已合并在同一个函数作用域里，不向全局暴露任何东西。 */
if (typeof mw === 'undefined') return; // 不在 MediaWiki 里就什么都不做
const DATA_TITLE = 'User:魔琴/data/ZhConversion php.json';
const CACHE_KEY = 'zhconv:' + DATA_TITLE, BATCH = 300;
const tick = () => new Promise(r => setTimeout(r, 0));

// ── IndexedDB 缓存（失败就当没有缓存） ──
function idbOpen() {
  return new Promise((res, rej) => {
    const q = indexedDB.open('lc-debug', 1);
    q.onupgradeneeded = () => q.result.createObjectStore('kv');
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
  });
}
async function kv(op, key, val) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const st = db.transaction('kv', op === 'get' ? 'readonly' : 'readwrite').objectStore('kv');
    const q = op === 'get' ? st.get(key) : st.put(val, key);
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
  });
}
const cacheGet = async k => { try { return await kv('get', k); } catch (e) { return undefined; } };
const cachePut = async (k, v) => { try { await kv('put', k, v); } catch (e) { /* 忽略 */ } };

// ── 取数据页（JSON 很大，走 action=raw + oldid 让浏览器也能缓存） ──
const rawUrl = params => mw.config.get('wgScript') + '?' + new URLSearchParams(params).toString();
async function latestRevId() {
  const r = await new mw.Api().get({ action: 'query', prop: 'revisions', rvprop: 'ids', rvslots: 'main', titles: DATA_TITLE, formatversion: 2 });
  const p = r.query && r.query.pages && r.query.pages[0];
  if (!p || p.missing || !p.revisions) throw new Error(_M('data.pageNotFound', DATA_TITLE));
  return p.revisions[0].revid;
}
async function fetchData(revid) {
  const res = await fetch(rawUrl({ title: DATA_TITLE, action: 'raw', ctype: 'application/json', oldid: revid }), { credentials: 'same-origin' });
  if (!res.ok) throw new Error(_M('data.downloadFailed', res.status));
  return res.json();
}

// ── 取若干个 wiki 页面的源码（站点转换表、CGroup）：先查 revid，没变就用缓存 ──
// 返回 { 请求的标题: {rev, text} }，不存在的页面不在结果里
async function getPages(titles) {
  const api = new mw.Api(), out = {}, revs = {}, canon = {};
  for (let i = 0; i < titles.length; i += 40) {
    const part = titles.slice(i, i + 40);
    const r = await api.get({ action: 'query', prop: 'revisions', rvprop: 'ids', rvslots: 'main', titles: part.join('|'), redirects: 1, formatversion: 2 });
    const norm = {}, red = {};
    for (const n of (r.query.normalized || [])) norm[n.from] = n.to;
    for (const n of (r.query.redirects || [])) red[n.from] = n.to;
    for (const t of part) { let c = norm[t] || t; for (let k = 0; k < 5 && red[c]; k++) c = red[c]; canon[t] = c; } // 跟随重定向（公共转换组页面常是重定向）
    for (const p of r.query.pages) revs[p.title] = (!p.missing && !p.invalid && p.revisions) ? p.revisions[0].revid : null;
  }
  const stale = [];
  for (const t of titles) {
    const rev = revs[canon[t]]; if (!rev) continue;
    const c = await cacheGet('page:' + canon[t]);
    if (c && c.rev === rev) out[t] = c; else stale.push(t);
  }
  for (let i = 0; i < stale.length; i += 10) {
    const part = stale.slice(i, i + 10);
    const r = await api.get({ action: 'query', prop: 'revisions', rvprop: 'ids|content', rvslots: 'main', titles: part.map(t => canon[t]).join('|'), formatversion: 2 });
    for (const p of r.query.pages) {
      if (p.missing || !p.revisions) continue;
      const rec = { rev: p.revisions[0].revid, text: p.revisions[0].slots.main.content };
      for (const t of part) if (canon[t] === p.title) out[t] = rec; // 多个请求名可能指向同一页
      await cachePut('page:' + p.title, rec);
    }
  }
  return out;
}

// ── 规则表：核心层（数据页）+ 站点层（Conversiontable），整个页面会话只建一次 ──
let tablesP = null;
function ensureTables(status) {
  if (!tablesP) tablesP = (async () => {
    status(_M('tables.checkingVersion'));
    const rev = await latestRevId();
    const cached = await cacheGet(CACHE_KEY); let json;
    if (cached && cached.rev === rev) { json = cached.json; status(_M('tables.usingCache', rev)); }
    else { status(_M('tables.downloading')); json = await fetchData(rev); await cachePut(CACHE_KEY, { rev, json }); }
    status(_M('tables.readingSite'));
    const pages = await getPages(VARIANTS.map(siteTitle));
    const site = {}; let nPages = 0;
    for (const v of VARIANTS) { const p = pages[siteTitle(v)]; if (p) { site[v] = p.text; nPages++; } }
    const tables = createTables();
    const info = await loadTables(json, tables, { site, onProgress: (d, t) => status(_M('tables.building', d, t)) });
    info.sitePages = nPages;
    return { tables, info, rev };
  })().catch(e => { tablesP = null; throw e; });
  return tablesP;
}

// ── 公共转换组：按文中的 {{noteTA|G1=…}} 现取现用 ──
// 两个位置：先 Module:CGroup/X；没有的话退到 Template:CGroup/X —— 展开模板，得到一大堆 -{H|…}-
async function expandCGroupTemplate(name) {
  if (/[{}|<>\[\]#\x00-\x1f]/.test(name)) return null; // 不是能放进 {{ }} 的名字
  try {
    const r = await new mw.Api().post({ action: 'expandtemplates', text: '{{CGroup/' + name + '}}', prop: 'wikitext', formatversion: 2 });
    const p = parseCGroupTemplate(r.expandtemplates && r.expandtemplates.wikitext);
    return p.rules.length ? p : null; // 模板不存在时展开结果是红链，里面没有 -{ }-，自然是 0 条
  } catch (e) { return null; }
}
async function loadGroups(src, mode) {
  const names = collectGroups(src, mode), groups = {}, missing = [], viaTemplate = [];
  if (!names.length) return { groups, names, missing, viaTemplate };
  const pages = await getPages(names.map(n => 'Module:CGroup/' + n));
  const cur = new Map(); // 组名 → {page, text, from:[经过的重定向页]}
  for (const n of names) { const p = pages['Module:CGroup/' + n]; if (p) cur.set(n, { page: 'Module:CGroup/' + n, text: p.text, from: [] }); }
  // 跟随 Lua 层重定向（return require('模块:CGroup/X')），最多 5 跳；目标不存在或绕圈则当没有这个模块
  for (let depth = 0; depth < 6 && cur.size; depth++) {
    const hops = [];
    for (const [n, c] of cur) { const tg = luaRedirectTarget(c.text); if (tg) hops.push([n, tg]); }
    if (!hops.length) break;
    const got = await getPages([...new Set(hops.map(h => h[1]))]);
    for (const [n, tg] of hops) {
      const c = cur.get(n), p = got[tg];
      if (!p || depth === 5) { cur.delete(n); continue; }
      c.from.push(c.page); c.page = tg; c.text = p.text;
    }
  }
  const noModule = [];
  for (const n of names) {
    const c = cur.get(n);
    if (c) groups[n] = Object.assign(parseCGroup(c.text), { page: c.page, redirectedFrom: c.from });
    else noModule.push(n);
  }
  const expanded = await Promise.all(noModule.map(expandCGroupTemplate));
  noModule.forEach((n, k) => {
    if (expanded[k]) { groups[n] = Object.assign(expanded[k], { page: 'Template:CGroup/' + n }); viaTemplate.push(n); }
    else missing.push(n);
  });
  return { groups, names, missing, viaTemplate };
}

// ── 页面界面 ──
const PAGE_CSS = `
#lc-wrap{position:relative}
#lc-bar{position:sticky;top:var(--lc-top,0px);z-index:50;display:flex;flex-wrap:wrap;align-items:center;gap:.4em 1em;padding:.45em .7em;margin-bottom:.7em;
  background:Canvas;color:CanvasText;border:1px solid rgba(128,128,128,.55);border-radius:6px;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.15)}
#lc-bar .sp{flex:1}
#lc-bar label{white-space:nowrap}
#lc-status{font-size:13px;opacity:.75}
#lc-out{font-size:16px;padding-bottom:4em}
#lc-out.lc-editing{padding-bottom:18em}
html.lc-has-rail{padding-right:var(--lc-rail-w,28px)}
html.lc-pushed{padding-right:calc(var(--lc-rail-w,28px) + var(--lc-dock-w,380px))}
#lc-dock{position:fixed;top:var(--lc-dock-top,var(--lc-top,0px));right:var(--lc-rail-w,28px);bottom:0;z-index:5;box-sizing:border-box;width:var(--lc-dock-w,380px);max-width:calc(100vw - var(--lc-rail-w,28px) - 24px);display:none;flex-direction:column;
  background:Canvas;color:CanvasText;border-left:1px solid rgba(128,128,128,.55);box-shadow:-3px 0 14px rgba(0,0,0,.2);font-size:14px}
#lc-dock.open{display:flex}
#lc-dock .dh{display:flex;align-items:center;gap:.4em;padding:.4em .6em;border-bottom:1px solid rgba(128,128,128,.35)}
#lc-dock .dh .sp{flex:1}
#lc-dock .dh button{cursor:pointer}
#lc-dock button.on{background:#4dabf7;color:#fff}
#lc-dock .dp{flex:1;min-height:0;overflow:auto}
#lc-dock-rz{position:absolute;left:-4px;top:0;bottom:0;width:8px;cursor:col-resize;z-index:1}
#lc-dock-rz:hover{background:rgba(77,171,247,.45)}
#lc-rail{position:fixed;top:var(--lc-top,0px);right:0;bottom:0;z-index:5;box-sizing:border-box;width:var(--lc-rail-w,28px);display:flex;flex-direction:column;align-items:center;gap:.5em;padding:.6em 0;
  background:Canvas;color:CanvasText;border-left:1px solid rgba(128,128,128,.55)}
#lc-rail button{display:flex;flex-direction:row;writing-mode:vertical-rl;padding:.7em .2em;font:600 13px/1.4 ${UI_FONT};letter-spacing:.08em;cursor:pointer;border-radius:4px}
#lc-rail button.on{background:#4dabf7;color:#fff}
#lc-rail button:disabled{opacity:.45;cursor:default}
#lc-tocp{padding:.3em .3em .6em}
#lc-tocp .dim{padding:.4em .6em;opacity:.6}
#lc-tocp ol{margin:0;padding:0;list-style:none}
#lc-tocp li{margin:0}
#lc-tocp a{display:block;padding:.15em .5em;color:inherit;text-decoration:none;border-radius:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#lc-tocp a:hover{background:rgba(77,171,247,.25)}
#lc-tocp a.on{background:rgba(77,171,247,.4);font-weight:600}
#lc-bar button.on{background:#4dabf7;color:#fff}
#lc-bar .lc-why{font-size:12px;opacity:.7}
#lc-toast{position:fixed;left:12px;bottom:12px;z-index:2147483200;display:none;max-width:min(420px,90vw);padding:.5em .9em;font:14px/1.5 ${UI_FONT};
  background:Canvas;color:CanvasText;border:1px solid #4dabf7;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.35)}
.lc-ed{position:fixed;left:calc((100% - var(--lc-inset,0px)) / 2);bottom:10px;transform:translateX(-50%);z-index:2147482000;box-sizing:border-box;width:min(840px,calc(94% - var(--lc-inset,0px)));padding:.5em .7em;
  background:Canvas;color:CanvasText;border:1px solid #4dabf7;border-radius:8px;box-shadow:0 4px 22px rgba(0,0,0,.4);font:14px/1.5 ${UI_FONT}}
.lc-edh{margin-bottom:.3em}
.lc-edf{display:block;box-sizing:border-box;width:100%;font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:.3em .5em;color:inherit;background:rgba(128,128,128,.1);
  border:1px solid rgba(128,128,128,.6);border-radius:4px}
textarea.lc-edf{resize:vertical;white-space:pre;overflow:auto}
.lc-edmsg,.lc-cfmsg{min-height:1.2em;color:#e8590c;font-size:13px}
.lc-edb{display:flex;flex-wrap:wrap;align-items:center;gap:.5em;margin-top:.3em}
.lc-edb button,.lc-cf button{padding:.15em .9em;cursor:pointer}
.lc-edb .pri,.lc-cf .pri{font-weight:600}
.lc-edtip{font-size:12px;opacity:.6}
.lc-cfo{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5)}
.lc-cf{box-sizing:border-box;width:min(940px,96vw);max-height:92vh;overflow:auto;padding:.7em 1em;background:Canvas;color:CanvasText;
  border:1px solid #4dabf7;border-radius:8px;font:14px/1.5 ${UI_FONT}}
.lc-cfh{font-size:16px;margin-bottom:.3em}
.lc-sec{margin:.7em 0 .25em;font-weight:600;opacity:.8}
.lc-ord .r{display:flex;align-items:baseline;gap:.4em;padding:.1em 0;border-top:1px solid rgba(128,128,128,.2)}
.lc-ord .r b{flex:none;min-width:3.2em}
.lc-ord .r .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc-ord .r .d{flex:none;font-size:12px;opacity:.6}
.lc-ord .pv{margin:.3em 0;padding:.3em .5em;border-radius:4px;background:rgba(128,128,128,.14);font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-all;max-height:12em;overflow:auto}
.lc-warn{padding:.3em .6em;margin:.3em 0;background:rgba(250,176,5,.2);border-left:3px solid #fab005}
.lc-dfroot{max-height:42vh;overflow:auto;font-size:16px;border:1px solid rgba(128,128,128,.45);border-radius:4px}
.lc-dfrow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.lc-dfh{position:sticky;top:0;z-index:2;padding:.15em .6em;font:600 12px/1.6 ${UI_FONT};border-bottom:1px solid rgba(128,128,128,.45)}
.lc-dfh.old{background:linear-gradient(rgba(224,49,49,.18),rgba(224,49,49,.18)),Canvas;border-right:1px solid rgba(128,128,128,.45)}
.lc-dfh.new{background:linear-gradient(rgba(47,158,68,.18),rgba(47,158,68,.18)),Canvas}
.lc-dfc{min-width:0;overflow-x:auto;padding:.2em .6em}
.lc-dfc.old{background:rgba(224,49,49,.09);border-right:1px solid rgba(128,128,128,.45)}
.lc-dfc.new{background:rgba(47,158,68,.1)}
.lc-dfc.empty{font-size:13px;opacity:.5}
.lc-dfgap{text-align:center;font-size:12px;opacity:.55;border-top:1px dashed rgba(128,128,128,.6);border-bottom:1px dashed rgba(128,128,128,.6)}
.lc-dfnone{padding:.4em .6em;opacity:.7}
.lc-diffbox{max-height:34vh;overflow:auto;border:1px solid rgba(128,128,128,.45);border-radius:4px;padding:.2em .4em;font-size:13px}
.lc-diffbox table.diff{width:100%;table-layout:fixed}
.lc-sumrow{display:flex;align-items:center;gap:.5em;margin-top:.6em}
.lc-sum{flex:1;min-width:0;padding:.2em .4em;color:inherit;background:transparent;border:1px solid rgba(128,128,128,.6);border-radius:4px}
#lc-nta{box-sizing:border-box;padding:0 .7em .9em;font:13px/1.5 ${UI_FONT}}
#lc-nta [hidden]{display:none!important}
#lc-nta .dim{opacity:.6}
#lc-nta button{box-sizing:border-box;padding:.08em .75em;border:1px solid rgba(128,128,128,.5);border-radius:6px;background:transparent;color:inherit;font:inherit;line-height:1.5;white-space:nowrap;cursor:pointer}
#lc-nta button:hover{border-color:#4dabf7;background:rgba(77,171,247,.15)}
#lc-nta button.pri{background:#4dabf7;border-color:#4dabf7;color:#fff;font-weight:600}
#lc-nta button.pri:hover{filter:brightness(1.1)}
#lc-nta button.dgr{border-color:rgba(224,49,49,.6);color:#e03131}
#lc-nta button.dgr:hover{background:rgba(224,49,49,.15);border-color:#e03131}
#lc-nthead{position:sticky;top:0;z-index:4;margin:0 -.7em;padding:.5em .7em .45em;background:Canvas;border-bottom:1px solid rgba(128,128,128,.4)}
#lc-nthead .srch{display:block;box-sizing:border-box;width:100%;padding:.3em .6em;color:inherit;background:rgba(128,128,128,.1);border:1px solid rgba(128,128,128,.5);border-radius:6px;font:inherit}
#lc-nthead .srch:focus{outline:none;border-color:#4dabf7;box-shadow:0 0 0 2px rgba(77,171,247,.3)}
#lc-nthead .frow{display:flex;align-items:center;flex-wrap:wrap;gap:.3em .5em;margin-top:.4em}
#lc-nthead .fl{font-size:12px;opacity:.65}
#lc-nthead .cn{margin-left:auto;font-size:12px;opacity:.65;white-space:nowrap;font-variant-numeric:tabular-nums}
#lc-nthead .seg{display:inline-flex}
#lc-nthead .seg button{border-radius:0;margin-left:-1px;padding:.04em .8em}
#lc-nthead .seg button:first-child{border-radius:6px 0 0 6px;margin-left:0}
#lc-nthead .seg button:last-child{border-radius:0 6px 6px 0}
#lc-nthead .seg button.on{position:relative;background:#4dabf7;border-color:#4dabf7;color:#fff;font-weight:600}
#lc-nthead .vbtn{margin-left:auto;padding:.04em .7em;font-size:12px}
#lc-nthead .vbtn.on{border-color:#4dabf7;background:rgba(77,171,247,.2)}
#lc-nav{margin-top:.45em;padding:.25em .4em;border-radius:6px;background:linear-gradient(rgba(77,171,247,.2),rgba(77,171,247,.2)),Canvas}
#lc-nav .nrow1{display:flex;align-items:center;gap:.35em}
#lc-nav button{padding:0 .55em}
#lc-nav .ntbl{display:flex;flex-wrap:wrap;align-items:baseline;gap:.15em .5em;margin-top:.25em;padding-top:.25em;border-top:1px solid rgba(128,128,128,.3);font-size:15px;line-height:1.6}
#lc-nav .ntbl .src{font-weight:600}
#lc-nav .ntbl .nto{margin:0}
#lc-nav .nt{flex:1;min-width:0;display:flex;gap:.5em;align-items:baseline}
#lc-nav .nn{font-size:15px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;cursor:pointer}
#lc-nav .np{margin-left:auto;flex:none;opacity:.75;font-variant-numeric:tabular-nums}
#lc-nta .nstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(74px,1fr));gap:.4em;margin:.7em 0 .5em}
#lc-nta .stat{padding:.35em .55em;border:1px solid rgba(128,128,128,.35);border-radius:6px;background:rgba(128,128,128,.07);text-align:left;color:inherit;font:inherit}
#lc-nta .stat b{display:block;font-size:17px;line-height:1.25;font-variant-numeric:tabular-nums}
#lc-nta .stat span{font-size:11px;opacity:.7}
#lc-nta .stat small{display:block;margin-top:.1em;font-size:11px;opacity:.8}
#lc-nta .stat.warn{border-color:#fab005;background:rgba(250,176,5,.14)}
#lc-nta .ncard{margin:.5em 0;padding:.4em .6em;border:1px solid rgba(250,176,5,.55);border-left:3px solid #fab005;border-radius:6px;background:rgba(250,176,5,.09)}
#lc-nta .nct{font-weight:600}
#lc-nta .nrow{display:flex;align-items:center;gap:.5em;padding:.25em 0}
#lc-nta .nsec{margin:1.1em 0 .3em;font-size:12px;font-weight:600;letter-spacing:.05em}
#lc-nta .nsec .dim{margin-left:.6em;font-weight:400;letter-spacing:0}
#lc-nta .nsec.warn{margin-top:1.6em;padding-top:.6em;border-top:2px dashed rgba(250,176,5,.6);color:#e8a200}
#lc-nta .nsub{padding:.25em .6em .1em;font-size:12px;opacity:.55;border-top:1px solid rgba(128,128,128,.2)}
#lc-nta .nhead{display:flex;flex-wrap:wrap;align-items:center;gap:.2em .6em;padding:.3em .6em;font-size:12px}
#lc-nta .nhead a{word-break:break-all}
#lc-nta .nempty{padding:1.2em .4em;text-align:center}
#lc-nta details.ng{margin:.4em 0;border:1px solid rgba(128,128,128,.35);border-radius:6px}
#lc-nta details.ng.nwarn{border-color:rgba(250,176,5,.6);border-left:3px solid #fab005}
#lc-nta .ng>summary{position:sticky;top:var(--nth,0px);z-index:3;display:flex;flex-wrap:wrap;align-items:center;gap:.15em .5em;padding:.4em .6em;border-radius:6px;cursor:pointer;list-style:none;background:linear-gradient(rgba(128,128,128,.12),rgba(128,128,128,.12)),Canvas}
#lc-nta .ng[open]>summary{border-radius:6px 6px 0 0;border-bottom:1px solid rgba(128,128,128,.3)}
#lc-nta .ng>summary:hover{background:linear-gradient(rgba(77,171,247,.2),rgba(77,171,247,.2)),Canvas}
#lc-nta summary::-webkit-details-marker{display:none}
#lc-nta .ng>summary::before{content:'\\25B8';opacity:.6;transition:transform .12s}
#lc-nta .ng[open]>summary::before{transform:rotate(90deg)}
#lc-nta .gn{min-width:0;word-break:break-all}
#lc-nta .gm{margin-left:auto;font-size:12px;opacity:.7;white-space:nowrap}
#lc-nta .trk{flex:1 0 100%;order:9;height:3px;border-radius:2px;background:rgba(128,128,128,.22);overflow:hidden}
#lc-nta .bar{display:block;height:100%;border-radius:2px;background:#4dabf7}
#lc-nta .nr{margin:0;border-top:1px solid rgba(128,128,128,.2)}
#lc-nta .nr>summary{display:flex;flex-wrap:wrap;align-items:center;gap:.1em .5em;padding:.3em .6em;list-style:none}
#lc-nta .nr>summary{position:sticky;top:calc(var(--nth,0px) + var(--ntg,2.6em));z-index:2;cursor:pointer;background:Canvas}
#lc-nta .nr>summary:hover{background:linear-gradient(rgba(77,171,247,.16),rgba(77,171,247,.16)),Canvas}
#lc-nta .nr[open]>summary{background:linear-gradient(rgba(77,171,247,.12),rgba(77,171,247,.12)),Canvas;border-bottom:1px solid rgba(128,128,128,.25)}
#lc-nta .nr.zero>summary>*{opacity:.65}
#lc-nta .nr.zd{display:flex;flex-wrap:wrap;align-items:center;gap:.1em .5em;padding:.3em .6em;opacity:.65}
#lc-nta .tag.need{background:rgba(49,224,84,.3)}
#lc-nta .tag.dorm{background:rgba(224,49,49,.3);font-weight:600}
#lc-nta .tag.shd{background:rgba(250,176,5,.4)}
#lc-nta details.ckb{margin:.25em 0 .35em;padding-left:.5em;border-left:2px solid rgba(49,224,84,.6)}
#lc-nta details.ckb.shd{border-left-color:rgba(250,176,5,.8)}
#lc-nta .ckb>summary{display:block;cursor:pointer;list-style:none;font-size:12px;font-weight:600;color:#33e156}
#lc-nta .ckb.shd>summary{color:#e8a200}
#lc-nta .ckb>summary::before{content:'▸';display:inline-block;margin-right:.3em;opacity:.6;transition:transform .12s}
#lc-nta .ckb[open]>summary::before{transform:rotate(90deg)}
#lc-nta .ckt{width:100%;margin:.15em 0 .1em;border-collapse:collapse;font-size:13px}
#lc-nta .ckt th{padding:.1em .6em .1em 0;text-align:left;font-size:11px;font-weight:400;opacity:.55;white-space:nowrap}
#lc-nta .ckt td{padding:.1em .6em .1em 0;vertical-align:baseline}
#lc-nta .kz{padding:0 .3em;border-radius:3px;background:rgba(128,128,128,.3)}
#lc-nta .ckt td.v{font-size:11px;opacity:.6;white-space:nowrap}
#lc-nta .ckt td.m{font-size:12px;opacity:.6}
#lc-nta .ckt tr.more td{font-size:12px;opacity:.6}
#lc-nta .cnt{flex:none;box-sizing:border-box;min-width:2.5em;padding:0 .45em;border-radius:9px;background:rgba(77,171,247,.28);text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
#lc-nta .cnt.z{background:rgba(128,128,128,.22);font-weight:400}
#lc-nta .rl{font-size:15px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#lc-nta .nb{padding:.25em .6em .5em;margin:0 0 .2em 1em;border-left:2px solid #4dabf7}
#lc-nta .nmeta{font-size:15px;margin-bottom:.15em}
#lc-nta .nfull{display:block;margin:.1em 0 .3em;padding:.2em .45em;border-radius:4px;background:rgba(128,128,128,.14);font:15px/1.5 Consolas,"Liberation Mono",Menlo,${UI_FONT};word-break:break-all;white-space:pre-wrap}
#lc-nta .nk{display:flex;flex-wrap:wrap;gap:.25em;margin:.15em 0 .35em}
#lc-nta .kc{padding:0 .45em;border-radius:4px;background:rgba(128,128,128,.2);font-size:15px}
#lc-nta .kc sup{margin-left:.15em;opacity:.7}
#lc-nta .ntool{margin:.1em 0 .35em}
#lc-nta .nmore{display:block;margin:.3em 0}
#lc-nta .nu{display:block;padding:.2em .35em;margin:.05em 0;color:inherit;text-decoration:none;border-radius:4px;cursor:pointer;scroll-margin-top:calc(var(--nth,0px) + var(--ntg,2.6em) + 3em)}
#lc-nta .nu:hover{background:rgba(77,171,247,.2)}
#lc-nta .nu.on{background:rgba(77,171,247,.4);box-shadow:inset 2px 0 0 #4dabf7}
#lc-nta .nu .ctx{font-size:15px;word-break:break-all}
#lc-nta .nu .ctx i{font-style:normal;font-size:12px;opacity:.55}
#lc-nta .nu mark{background:rgba(255,212,59,.55);color:inherit;padding:0 .1em;border-radius:2px}
#lc-nta .nto{display:inline-flex;flex-wrap:wrap;gap:.25em;margin-top:.1em}
#lc-nta .vt{padding:0 .4em;border-radius:4px;background:rgba(47,158,68,.18);font-size:15px}
#lc-nta .vt.same{background:rgba(128,128,128,.2)}
#lc-nta .vt sub{margin-left:.25em;font-size:11px;vertical-align:baseline;opacity:.7}
#lc-nta .tag{display:inline-block;flex:none;padding:0 .45em;font-size:12px;font-weight:400;border-radius:3px;background:rgba(250,176,5,.3);white-space:nowrap}
#lc-nta .tag.z{background:rgba(224,49,49,.22)}
#lc-nta .tag.rf{background:rgba(132,94,247,.25)}
#lc-nta .tag.rf.all{background:rgba(250,5,176,.33);font-weight:600}
#lc-nta .ctx .tag{margin-right:.4em}
#lc-nta .ndup{display:flex;flex-wrap:wrap;gap:.1em .6em;padding:.25em .6em;border-top:1px solid rgba(128,128,128,.2);font-size:15px}
#lc-nta .ow.win{color:#2f9e44}
#lc-nta .ow.lose{opacity:.6}
#lc-nta .nhelp{margin-top:.8em;font-size:12px}
#lc-nta .nhelp>summary{cursor:pointer;opacity:.7}
#lc-rail .bd{display:block;writing-mode:horizontal-tb;margin:.35em auto 0;min-width:1.4em;padding:0 .3em;box-sizing:border-box;border-radius:9px;background:#fab005;color:#000;font:600 11px/1.5 ${UI_FONT};letter-spacing:0;text-align:center}
#lc-dock,#lc-dock button,#lc-dock input,#lc-bar,#lc-bar button,#lc-bar input,#lc-bar select{font-family:${UI_FONT}}
.lc-rmbox{margin:.4em 0;padding:.3em .6em;border:1px solid rgba(128,128,128,.5);border-radius:4px}
.lc-rmbox .t{font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-all;padding:.1em .4em;margin:.1em 0}
.lc-rmbox .t.o{background:rgba(224,49,49,.13)}
.lc-rmbox .t.n{background:rgba(47,158,68,.15)}
.lc-rmbox .p{font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;opacity:.75;word-break:break-all}
.lc-rmmore{opacity:.6;margin:.3em 0}
`;

let runId = 0, latest = { tables: null, groups: {} }, firstRun = true, obs = null;
function el(tag, props, kids) {
  const e = document.createElement(tag); Object.assign(e, props || {});
  for (const k of kids || []) e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
  return e;
}

let srcP = null;
function getSource() {
  const ta = document.getElementById('wpTextbox1');
  if (ta) return Promise.resolve(ta.value); // 编辑页：用编辑框当前内容
  if (!srcP) srcP = (async () => {
    if (!mw.config.get('wgArticleId')) throw new Error(_M('source.pageMissing'));
    const p = { title: mw.config.get('wgPageName'), action: 'raw' };
    const rev = mw.config.get('wgRevisionId'); if (rev) p.oldid = rev;
    const r = await fetch(rawUrl(p), { credentials: 'same-origin' });
    if (!r.ok) throw new Error(_M('source.downloadFailed', r.status));
    return r.text();
  })().catch(e => { srcP = null; throw e; });
  return srcP;
}


// ── noteTA 检查面板：顶部固定工具区（搜索 / 命中筛选 / 位置 / 条形）→ 概览 → 可清理 → 公共转换组 → 全页转换 → 冲突；点一处就跳到正文对应位置 ──
const NTA_FEW = 3, NTA_SHOW = 200; // 命中 ≤ NTA_FEW 处的转换组打“少用”标；一条规则最多先列 NTA_SHOW 处
function ntaToText(u) { // 各变体的转换结果：相同的并起来，和原词一样的记作 ＝
  const g = new Map();
  for (const [k, v] of Object.entries(u.to)) { const t = v === u.from ? '＝' : v; if (!g.has(t)) g.set(t, []); g.get(t).push(k); }
  return [...g].map(([t, ks]) => t + '(' + (ks.length === 8 ? _M('common.all') : ks.map(disp).join('/')) + ')').join(' · ');
}
/** 各变体的转换结果做成小标签：结果 + 所属变体。onlySame：只留“＝变体”（这一处在这些变体下保持原样），其余转换规则交给顶部的 lc-nav 表格 */
function ntaToEls(u, onlySame) {
  const g = new Map();
  for (const [k, v] of Object.entries(u.to)) { const t = v === u.from ? '＝' : v; if (onlySame && t !== '＝') continue; if (!g.has(t)) g.set(t, []); g.get(t).push(k); }
  if (!g.size) return null;
  const box = el('span', { className: 'nto' });
  for (const [t, ks] of g) box.appendChild(el('span', { className: 'vt' + (t === '＝' ? ' same' : '') }, [el('b', { textContent: t }), el('sub', { textContent: ks.length === 8 ? 'all' : ks.map(disp).join('/') })]));
  return box;
}

// ── 命中在不在 <ref> 里：按 MediaWiki 预处理器的口径（opaqueEnd）扫一遍源码，得到 ref 的区间表 ──
// cite 系列模板的 title 在 ref 里通常被强制不转换，主编辑器无法可靠判断，这里只做“在不在 ref 内”的标注和筛选，由人来判断。
let ntaRefCache = { src: null, a: [] };
function ntaRefRanges(src) {
  if (ntaRefCache.src === src) return ntaRefCache.a;
  const a = []; let i = src.indexOf('<');
  while (i > -1) {
    const e = opaqueEnd(src, i);
    if (e > i) { if (/^<ref\b/i.test(src.substr(i, 6))) a.push([i, e]); i = src.indexOf('<', e); } else i = src.indexOf('<', i + 1);
  }
  ntaRefCache = { src, a }; return a;
}
function ntaInRef(a, pos) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (pos < a[m][0]) hi = m - 1; else if (pos >= a[m][1]) lo = m + 1; else return true; }
  return false;
}
/** 只看“正文”或“ref 内”的命中：规则 / 转换组的计数按这个口径重算（可清理仍按真实命中数判断，不受影响） */
function ntaView(R, scope) {
  if (scope === 'all') return R;
  const keep = u => scope === 'ref' ? u.ref : !u.ref;
  const cl = r => {
    const uses = r.uses.filter(keep), keyCount = {};
    for (const u of uses) keyCount[u.from] = (keyCount[u.from] || 0) + 1;
    return Object.assign({}, r, { uses, n: uses.length, keyCount, _src: r });
  };
  const groups = R.groups.map(g => {
    const rules = g.rules.map(cl);
    return Object.assign({}, g, { rules, uses: rules.reduce((a, r) => a + r.n, 0), used: rules.filter(r => r.n).length, _src: g });
  });
  const local = R.local.map(cl), hidden = R.hidden.map(cl);
  const total = [].concat(...groups.map(g => g.rules), local, hidden).reduce((a, r) => a + r.n, 0);
  return Object.assign({}, R, { groups, local, hidden, total });
}

// ── 规则的简写：zh-hans:马克龙;zh-tw:馬克宏;zh-hk:馬克龍; → 马克龙/馬克宏/馬克龍；单向 A=>zh-tw:B → A⇒B ──
const ntaFull = r => r.text.replace(/^-\{|\}-$/g, '').trim();
function ntaShortOf(text) {
  let P; try { P = parseManual(text.replace(/^-\{|\}-$/g, '')); } catch (_) { return null; }
  const parts = [], bid = [...new Set(Object.values(P.bid))];
  if (bid.length) parts.push(bid.join('/'));
  if (P.keep.length) parts.push(P.keep.join('/'));
  for (const [from, to] of Object.entries(P.uni)) parts.push(from + '⇒' + [...new Set(Object.values(to))].join('/'));
  return parts.length ? { s: parts.join(' ‖ '), k: JSON.stringify([P.bid, P.uni, P.keep]), bare: !!P.keep.length && !bid.length && !Object.keys(P.uni).length } : null;
}
/** rid → 列表里显示的规则文本。简写相同、实际规则不同（比如覆盖的变体不一样）的，改显示完整规则，免得看不出区别 */
function ntaShortMap(rules) {
  const sh = new Map(), by = new Map(), out = new Map();
  for (const r of rules) {
    const x = ntaShortOf(r.text); sh.set(r.rid, x);
    if (x) { let m = by.get(x.s); if (!m) by.set(x.s, m = new Set()); m.add(x.k); }
  }
  for (const r of rules) { const x = sh.get(r.rid); out.set(r.rid, x && by.get(x.s).size === 1 ? x.s : x && x.bare ? '-{' + clip(ntaFull(r), 78) + '}-' : clip(ntaFull(r), 80)); }
  return out;
}
const ntaTitle = (ui, r) => (r.kind === 'cgroup' ? r.group + ' · ' : r.kind === 'local' ? '#' + r.num + ' · ' : '') + ((ui.ntaShort && ui.ntaShort.get(r.rid)) || clip(ntaFull(r), 40));

function ntaJump(ui, s, e) {
  const r = rangeForSrc(ui.out, s, e);
  if (!r) { notify(_M('nta.jump.notFoundInBody')); return false; }
  const b = r.getBoundingClientRect();
  if (!b.width && !b.height) { notify(_M('nta.jump.insideFoldedRef')); return false; }
  window.scrollTo({ top: Math.max(0, window.scrollY + b.top - window.innerHeight / 3) });
  if (editApi) editApi.flash(s, e);
  dockAfterJump(ui); // 窄屏：侧栏是覆盖式的，跳完自动收起
  return true;
}
/** 逐处查看：跳到规则 r 的第 i 处命中（首尾循环），并记住当前位置，之后可用上 / 下一处或 [ ] 键翻页 */
function ntaGo(ui, r, i) {
  const n = r.uses.length; if (!n) return;
  i = ((i % n) + n) % n;
  ui.nav = { r, i };
  const u = r.uses[i], ok = ntaJump(ui, u.s, u.e);
  ntaNavUpdate(ui);
  if (ok && ui.dockTab !== 'nta') notify(_M('nta.go.notice', ntaName(r), i + 1, n, u.ref ? _M('nta.go.inRef') : ''));
}
const ntaStep = (ui, d) => { if (ui.nav) ntaGo(ui, ui.nav.r, ui.nav.i + d); };
function ntaNavUpdate(ui) {
  const nv = ui.nav; if (!ui.navBar) return;
  if (ui.navOn) { ui.navOn.classList.remove('on'); ui.navOn = null; }
  ui.navBar.hidden = !nv;
  if (!nv) return;
  ui.navName.textContent = ntaTitle(ui, nv.r);
  ui.navPos.textContent = (nv.i + 1) + ' / ' + nv.r.uses.length;
  const u = nv.r.uses[nv.i];
  ui.navRef.hidden = !u.ref;
  ui.navTbl.textContent = ''; // 当前这一处具体怎么转：原文 → 各变体的结果（相同的合并）
  ui.navTbl.appendChild(el('b', { className: 'src', textContent: curSrc.slice(u.s, u.e) }));
  ui.navTbl.appendChild(document.createTextNode('→'));
  ui.navTbl.appendChild(ntaToEls(u) || '');
  const a = nv.r._els && nv.r._els[nv.i];
  if (a) { a.classList.add('on'); ui.navOn = a; if (ui.dockTab === 'nta') a.scrollIntoView({ block: 'nearest' }); }
}
const ntaName = r => r.kind === 'cgroup' ? r.group + (r.item ? '[' + r.item + ']' : ' #' + (r.idx + 1)) : r.kind === 'local' ? _M('nta.localRuleName', r.num) : '-{H|}- @L' + lineOf(r.pos);

/** 记住展开状态：重新转换后面板重画，展开的转换组 / 规则仍保持展开（key 用转换组名、规则 id） */
function ntaTrack(ui, d, key, build) {
  d.addEventListener('toggle', () => { if (d.open) { ui.ntaOpen.add(key); if (build) build(); } else ui.ntaOpen.delete(key); });
  if (ui.ntaOpen.has(key)) { d.open = true; if (build) build(); }
}
const ntaMeter = (pct, cls) => { const i = el('i', { className: 'bar' + (cls ? ' ' + cls : '') }); i.style.width = Math.max(0, Math.min(100, Math.round(pct))) + '%'; return el('span', { className: 'trk' }, [i]); };
/** 命中数条形：比例按“转换组内最大值”或“全局最大值”算，可切成对数（命中数悬殊时小的也看得见） */
function ntaBarsApply(ui) {
  const glob = ui.ntaScale === 'global', f = ui.ntaLog ? Math.log1p : x => x;
  for (const b of ui.ntaBars) {
    const max = glob ? ui.ntaGmax : b.bmax, pct = max > 0 ? 100 * f(b.n) / f(max) : 0;
    b.el.style.width = Math.max(3, Math.min(100, pct)) + '%';
  }
}
/** 一条规则一行：左边命中数徽标，中间是简写的规则（马克龙/馬克宏/馬克龍），展开后才是条目名、完整规则、词条、逐处列表 */
/** “不能乱删”提示 / “为什么不起作用”提示 */
const ntaRuleLabel = (ui, rid) => { const o = ui.ntaRuleBy.get(rid); return o ? (o.kind === 'cgroup' ? _M('nta.convGroupRuleName', ntaName(o)) : ntaName(o)) : String(rid); };
const ntaVs = vs => vs.length === 8 ? 'all' : vs.map(disp).join('/');
const ntaZ = (g, t) => t === g.key ? _M('nta.noConvert') : t;
/** 表格里的转换结果：和原词一样（不转换）就直接写出来，加底色区分 */
const ntaZe = (g, t) => t === g.key ? el('span', { className: 'kz', title: _M('nta.noConvert'), textContent: t }) : t;
/** 删去后改由谁决定（简写）。dyn：另一条规则；stat：核心 / 站点表；否则拆分后转换 */
function ntaNeedBy(ui, g) {
  const w = g.why;
  if (w.kind === 'dyn') return [ntaRuleLabel(ui, w.rid), g.same ? el('span', { className: 'tag', textContent: _M('nta.blocker.tag'), title: _M('nta.blocker.tip') }) : ''];
  if (w.kind === 'stat') return [(w.layer === 'core' ? _M('nta.source.core', String(w.src).replace(/^ZH_/, '')) : _M('nta.source.siteTable', String(w.src).replace(/^MediaWiki:Conversiontable\//, '')))];
  return [_M('nta.source.splitConversion')];
}
const NTA_CK = 20; // 折叠表里最多列几个词
/** 默认折叠的小表格：summary 一句话，展开才是 词 / 变体 / … 的表 */
function ntaCkBox(cls, title, heads, rows, total) {
  const tb = el('table', { className: 'ckt' }, [el('thead', {}, [el('tr', {}, heads.map(h => el('th', { textContent: h })))]), el('tbody', {}, rows.map(cells => el('tr', {}, cells)))]);
  if (total > rows.length) tb.lastChild.appendChild(el('tr', { className: 'more' }, [el('td', { colSpan: heads.length, textContent: _M('common.moreWords', total - rows.length) })]));
  return el('details', { className: 'ckb' + (cls ? ' ' + cls : '') }, [el('summary', { textContent: title }), tb]);
}
const ntaTd = (cls, kids) => el('td', { className: cls || '' }, Array.isArray(kids) ? kids : [kids]);
function ntaNeedBox(ui, r) {
  const list = ui.ntaNeed && ui.ntaNeed.get(r.rid); if (!list) return null;
  return ntaCkBox('', _M('nta.box.needTitle', list.length), [_M('nta.box.colWord'), _M('nta.box.colVariant'), _M('nta.box.colNow'), _M('nta.box.colAfterRemoval'), _M('nta.box.colAfterRemovalBy')],
    list.slice(0, NTA_CK).map(g => [ntaTd('', el('b', { textContent: g.key })), ntaTd('v', ntaVs(g.vs)), ntaTd('', ntaZe(g, g.to)), ntaTd('', el('b', {}, [ntaZe(g, g.after)])), ntaTd('m', ntaNeedBy(ui, g))]), list.length);
}
function ntaShadowBox(ui, r) {
  const list = ui.ntaShadow && ui.ntaShadow.get(r.rid); if (!list) return null;
  return ntaCkBox('shd', _M('nta.box.shadowTitle', list.length), [_M('nta.box.colWord'), _M('nta.box.colVariant'), _M('nta.box.colNow'), _M('nta.box.colAfterRemoval'), _M('nta.box.colAfterRemovalBy')],
    list.slice(0, NTA_CK).map(g => [ntaTd('', el('b', { textContent: g.key })), ntaTd('v', ntaVs(g.vs)), ntaTd('', ntaZe(g, g.to)), ntaTd('', el('b', {}, [ntaZe(g, g.byTo)])), ntaTd('m', ntaRuleLabel(ui, g.by))]), list.length);
}
/** noteTA 数字参数 n 的注释参数 dn（写在模板里，说明这条规则的用途）：按规则所在模板的源码位置取 */
const ntaCmtCache = { src: null, map: new Map() };
function ntaLocalCmt(r) {
  if (r.kind !== 'local' || r.pos == null) return '';
  const C = ntaCmtCache; if (C.src !== curSrc) { C.src = curSrc; C.map = new Map(); }
  let N = C.map.get(r.pos);
  if (N === undefined) {
    N = null;
    try {
      if (curSrc.slice(r.pos, r.pos + 2) === '{{') { const e = findClose(curSrc, r.pos, '{{', '}}'); const b = e > 0 ? curSrc.slice(r.pos, e) : ''; if (NOTETA_RE.test(b)) N = noteTAParams(b).N; }
    } catch (_) { /* 取不到就当没有注释 */ }
    C.map.set(r.pos, N);
  }
  const x = N && (N.find(y => y.n === r.num && y.val === r.text) || N.find(y => y.n === r.num));
  return x && x.cmt || '';
}
function ntaRuleEl(ui, r, bmax, g) { // g：规则所在的公共转换组（只有转换组里的规则才有“复制到数字参数”）
  const short = ui.ntaShort.get(r.rid), nref = r.uses.filter(u => u.ref).length, sc = ui.ntaS, cmt = ntaLocalCmt(r);
  const cmtEl = () => cmt ? el('div', { className: 'nmeta' }, [el('span', { className: 'dim', textContent: _M('nta.rule.commentLabel') }), cmt]) : '';
  const hay = [short, cmt, r.text, r.item, r.group, (r.keys || []).join(' '), Object.keys(r.keyCount).join(' ')].filter(Boolean).join(' ').toLowerCase();
  const cnt = el('span', { className: 'cnt' + (r.n ? '' : ' z'), textContent: String(r.n) });
  const lab = el('span', { className: 'rl', title: ntaFull(r) + (cmt ? _M('nta.rule.commentTip', cmt) : '') }, [r.kind === 'local' ? el('i', { className: 'dim', textContent: '#' + r.num + ' ' }) : '', short, cmt ? el('i', { className: 'dim', textContent: '　' + cmt }) : '']);
  let node;
  if (!r.n) {
    const real = r._src ? r._src.n : 0;
    const tag = real ? el('span', { className: 'tag', textContent: sc === 'body' ? _M('nta.rule.tag.refOnly', real) : _M('nta.rule.tag.bodyHas', real), title: sc === 'body' ? _M('nta.rule.tip.hitOnlyInRef') : _M('nta.rule.tip.noHitInRef') }) : el('span', { className: 'tag z', textContent: _M('nta.rule.tag.unused') });
    const shd = ntaShadowBox(ui, r), kids = [cnt, lab, tag];
    if (shd) kids.push(el('span', { className: 'tag shd', textContent: _M('nta.rule.tag.shadowed'), title: _M('nta.rule.tip.shadowed') }));
    if (g && g.pos != null) kids.push(ntaCopyBtn(ui, g, r));
    if (r.kind === 'local' && r.pos != null) kids.push(ntaRemoveBtn(ui, localSpec(r._src || r), real));
    if (shd) { node = el('details', { className: 'nr zero' }, [el('summary', {}, kids), el('div', { className: 'nb' }, [cmtEl(), el('code', { className: 'nfull', textContent: ntaFull(r) }), shd])]); ntaTrack(ui, node, 'r:' + r.rid); }
    else { node = el('div', { className: 'nr zero zd' }, kids); }
  } else {
    const kids = [cnt, lab];
    if (sc === 'all' && nref) kids.push(el('span', { className: 'tag rf' + (nref === r.n ? ' all' : ''), textContent: nref === r.n ? _M('nta.rule.tag.allInRef') : 'ref ' + nref, title: nref === r.n ? _M('nta.rule.tip.allInRef') : _M('nta.rule.tip.refHits', nref) }));
    if (ui.ntaShadow && ui.ntaShadow.has(r.rid)) kids.push(el('span', { className: 'tag shd', textContent: _M('nta.rule.tag.partlyShadowed'), title: _M('nta.rule.tip.partlyShadowed') }));
    if (ui.ntaNeed && ui.ntaNeed.has(r.rid)) kids.push(el('span', { className: 'tag need', textContent: _M('nta.rule.tag.active'), title: _M('nta.rule.tip.active') }));
    if (ui.ntaNeed && !ui.ntaNeed.has(r.rid)) kids.push(el('span', { className: 'tag dorm', textContent: _M('nta.rule.tag.dormant'), title: _M('nta.rule.tip.dormant') }));
    const bar = el('i', { className: 'bar' });
    kids.push(el('span', { className: 'trk' }, [bar]));
    ui.ntaBars.push({ el: bar, n: r.n, bmax });
    node = el('details', { className: 'nr' }, [el('summary', {}, kids)]);
    const body = el('div', { className: 'nb' });
    if (r.item) body.appendChild(el('div', { className: 'nmeta' }, [el('span', { className: 'dim', textContent: _M('nta.rule.itemLabel') }), r.item]));
    if (cmt) body.appendChild(cmtEl());
    body.appendChild(el('code', { className: 'nfull', textContent: ntaFull(r) }));
    const ks = Object.entries(r.keyCount).sort((a, b) => b[1] - a[1]);
    if (ks.length) {
      const kc = el('div', { className: 'nk' });
      for (const [k, n] of ks) kc.appendChild(el('span', { className: 'kc' }, [k, n > 1 ? el('sup', { textContent: '×' + n }) : '']));
      body.appendChild(kc);
    }
    const stepB = el('button', { className: 'pri', textContent: _M('nta.rule.stepButton'), title: _M('nta.rule.stepTip') });
    stepB.onclick = () => ntaGo(ui, r, 0);
    const tools = [stepB];
    if (g && g.pos != null) tools.push(ntaCopyBtn(ui, g, r));
    if (r.kind === 'local' && r.pos != null) tools.push(ntaRemoveBtn(ui, localSpec(r._src || r), r._src ? r._src.n : r.n));
    body.appendChild(el('div', { className: 'ntool' }, tools));
    for (const bx of [ntaNeedBox(ui, r), ntaShadowBox(ui, r)]) if (bx) body.appendChild(bx);
    node.appendChild(body);
    let built = false;
    const build = () => {
      if (built) return; built = true;
      let more = null;
      const add = from => {
        r.uses.slice(from, from + NTA_SHOW).forEach((u, k) => {
          const idx = from + k;
          const pre = curSrc.slice(Math.max(0, u.s - 12), u.s).replace(/\s+/g, ' '), post = curSrc.slice(u.e, u.e + 12).replace(/\s+/g, ' ');
          const same = ntaToEls(u, true);
          const a = el('a', { className: 'nu', title: u.ref ? _M('nta.rule.tip.jumpFromRef') : _M('nta.rule.tip.jumpToBody') }, [
            el('div', { className: 'ctx' }, [u.ref ? el('span', { className: 'tag rf', textContent: 'ref' }) : '', el('i', { textContent: 'L' + lineOf(u.s) + '  ' }), pre, el('mark', { textContent: curSrc.slice(u.s, u.e) }), post]),
            same || ''
          ]);
          a.onclick = () => ntaGo(ui, r, idx);
          (r._els || (r._els = []))[idx] = a;
          body.insertBefore(a, more || null);
        });
      };
      if (r.uses.length > NTA_SHOW) {
        let shown = NTA_SHOW;
        more = el('button', { className: 'nmore', textContent: _M('nta.rule.showMore', Math.min(NTA_SHOW, r.uses.length - shown), r.uses.length - shown) });
        more.onclick = () => {
          add(shown); shown += NTA_SHOW;
          if (shown >= r.uses.length) more.remove(); else more.textContent = _M('nta.rule.showMoreRemaining', r.uses.length - shown);
        };
        body.appendChild(more);
      }
      add(0);
    };
    ntaTrack(ui, node, 'r:' + r.rid, build);
  }
  r._row = node;
  ui.ntaRules.push({ el: node, r, hay });
  return node;
}
/** 转换组里的规则 → 复制到 noteTA 数字参数（保留转换组；常用来提高被覆盖规则的优先级，所以不做渲染对比，确认后直接提交） */
function ntaCopyBtn(ui, g, r) {
  const gs = g._src || g, spec = ruleCopySpec(gs, r._src || r);
  const b = el('button', { textContent: _M('nta.copy.button'), title: _M('nta.copy.tip') });
  if (!spec) { b.disabled = true; b.title = _M('nta.copy.tipNotParsable'); return b; }
  b.onclick = ev => {
    ev.preventDefault(); ev.stopPropagation(); // 按钮可能在 <summary> 里：别触发展开收起
    if (!confirm(_M('nta.copy.confirm', gs.name, clip(spec.param.move[0], 120)))) return;
    removeNTA(ui, spec);
  };
  return b;
}
/** 移除按钮：没命中的直接进入移除流程；有命中的先二次确认（移除会改变这些位置的转换），之后仍会逐变体对比渲染结果 */
function ntaRemoveBtn(ui, spec, real, text) {
  const btnText = text || _M('common.remove');
  const b = el('button', { className: 'dgr', textContent: real ? _M('nta.remove.directly', btnText) + '…' : btnText,
    title: real ? _M('nta.remove.tipUsed') : _M('nta.remove.tipUnused') });
  b.onclick = ev => {
    ev.preventDefault(); ev.stopPropagation(); // 按钮在 <summary> / 折叠块里：别触发展开收起
    if (real && !confirm(_M('nta.remove.confirmUsed', spec.label, real))) return;
    removeNTA(ui, spec);
  };
  return b;
}
const ntaBlockMax = rules => rules.reduce((a, r) => Math.max(a, r.n), 1);
function ntaObserve(ui, sum) { if (ui.ntaRO) ui.ntaRO.observe(sum); }
/** 块标题行的概况 + 比例条：筛「活跃」「休眠」时是它们各自占「命中」的比例（活跃 + 休眠 = 命中），其余筛选仍是 命中 / 全部 */
function ntaSumSet(ui, b) {
  const f = ui.ntaF, nd = ui.ntaNeed, hit = b.rules.filter(r => r.n > 0), split = !!nd && (f === 'need' || f === 'dorm');
  const sumN = rs => rs.reduce((x, r) => x + r.n, 0);
  const act = split ? hit.filter(r => nd.has(r.rid)) : null;
  if (split) { // 活跃 + 休眠 = 命中：条数、处数都是占「命中」的比例；比例条左绿（活跃）右红（休眠）
    const sel = f === 'need' ? act : hit.filter(r => !nd.has(r.rid));
    b.gm.textContent = _M('nta.sum.byState', sumN(sel), sumN(hit), f === 'need' ? _M('nta.rule.tag.active') : _M('nta.rule.tag.dormant'), sel.length, hit.length);
    const p = hit.length ? Math.round(100 * act.length / hit.length) : 0;
    b.bar.style.width = hit.length ? '100%' : '0';
    b.bar.style.background = 'linear-gradient(90deg,#33e156 ' + p + '%,#e03131 ' + p + '%)';
  } else {
    const un = f === 'unused'; // 统一成「处数 · 标签 k/n 条」：命中 = 命中条数/全部条数
    b.gm.textContent = un ? _M('nta.sum.unused', b.rules.length - hit.length, b.rules.length) : _M('nta.sum.used', sumN(hit), hit.length, b.rules.length);
    b.bar.style.width = (b.rules.length ? Math.round(100 * hit.length / b.rules.length) : 0) + '%';
    b.bar.style.background = '';
  }
}
/** 转换组：标题行（名称 + 状态标 + 命中概况 + 用到比例条），展开后是所属规则（有命中的在前，按命中数降序） */
function ntaGroupEl(ui, g) {
  const nref = g.rules.reduce((a, r) => a + r.uses.filter(u => u.ref).length, 0);
  let tag = '';
  if (!g.uses) tag = el('span', { className: 'tag z', textContent: g._src && g._src.uses ? (ui.ntaS === 'body' ? _M('nta.group.tag.refOnlyAll') : _M('nta.group.tag.noRefHit')) : _M('nta.group.tag.unused') });
  else if (g.uses <= NTA_FEW) tag = el('span', { className: 'tag', textContent: _M('nta.group.tag.fewUses') });
  const gm = el('span', { className: 'gm' }), mt = ntaMeter(0);
  const sum = el('summary', {}, [el('b', { className: 'gn', textContent: g.name }), tag, gm, mt]);
  const d = el('details', { className: 'ng' }, [sum]);
  ntaObserve(ui, sum);
  const head = el('div', { className: 'nhead' }, [el('a', { href: mw.util.getUrl(g.page), target: '_blank', textContent: g.page }), g.via === 'template' ? el('span', { className: 'dim', textContent: _M('nta.group.viaTemplate') }) : '']);
  if (g.pos != null) {
    const gs = g._src || g;
    if (gs.uses) {
      const mvSpec = groupMoveSpec(gs);
      if (mvSpec.param.move.length) {
        const mv = el('button', { textContent: _M('nta.group.moveButton'), title: _M('nta.group.moveTip') });
        mv.onclick = ev => {
          ev.preventDefault(); ev.stopPropagation();
          const rm = buildRemoval(curSrc, mvSpec.pos, mvSpec.param);
          if (!rm) { notify(_M('nta.group.notFoundInSource')); return; }
          if (rm.err) { notify(rm.err); return; }
          const k = mvSpec.param.move.length, drop = gs.rules.filter(r => !r.n).length;
          if (!confirm(_M('nta.group.moveConfirm', gs.name, k, gs.rules.length, rm.nums && rm.nums.length ? ' #' + rm.nums.join('、#') : '', drop))) return;
          removeNTA(ui, mvSpec);
        };
        head.appendChild(mv);
      }
    }
    head.appendChild(ntaRemoveBtn(ui, groupSpec(gs), gs.uses, _M('common.remove')));
  }
  d.appendChild(head);
  const from = ui.ntaRules.length, bmax = ntaBlockMax(g.rules);
  const used = g.rules.filter(r => r.n).sort((a, b) => b.n - a.n), unused = g.rules.filter(r => !r.n);
  for (const r of used) d.appendChild(ntaRuleEl(ui, r, bmax, g));
  if (unused.length) {
    d.appendChild(el('div', { className: 'nsub', textContent: _M('nta.group.unusedRules', unused.length) }));
    for (const r of unused) d.appendChild(ntaRuleEl(ui, r, bmax, g));
  }
  ntaTrack(ui, d, 'g:' + g.name);
  ui.ntaBlocks.push({ el: d, from, to: ui.ntaRules.length, rules: g.rules, gm, bar: mt.firstChild });
  return d;
}
/** 全页转换（noteTA 数字参数 / -{H|}-）：同样做成一个可折叠块 */
function ntaBlockEl(ui, key, title, rules) {
  const hits = rules.reduce((a, r) => a + r.n, 0), nref = rules.reduce((a, r) => a + r.uses.filter(u => u.ref).length, 0);
  const gm = el('span', { className: 'gm' }), mt = ntaMeter(0);
  const sum = el('summary', {}, [el('b', { className: 'gn', textContent: title }), gm, mt]);
  const d = el('details', { className: 'ng' }, [sum]);
  ntaObserve(ui, sum);
  const from = ui.ntaRules.length, bmax = ntaBlockMax(rules);
  const sorted = rules.slice().sort((a, b) => b.n - a.n);
  for (const r of sorted.filter(r => r.n)) d.appendChild(ntaRuleEl(ui, r, bmax));
  const un = sorted.filter(r => !r.n);
  if (un.length) {
    d.appendChild(el('div', { className: 'nsub', textContent: _M('nta.group.unusedRules', un.length) }));
    for (const r of un) d.appendChild(ntaRuleEl(ui, r, bmax));
  }
  ntaTrack(ui, d, 'b:' + key);
  ui.ntaBlocks.push({ el: d, from, to: ui.ntaRules.length, rules, gm, bar: mt.firstChild });
  return d;
}
/** 没命中、且源码里找得到位置（能自动移除）的转换组 / 全页规则 */
const ntaDead = R => ({ g: R.groups.filter(g => !g.uses && g.pos != null), l: R.local.filter(r => !r.n && r.pos != null) });

/** 按搜索词 + 命中筛选显隐：规则行、整个块（没有可见规则的块收起来）、小节标题、以及不参与筛选的附加块 */
function ntaFilter(ui) {
  const q = (ui.ntaQ || '').trim().toLowerCase(), terms = q.split(/\s+/).filter(Boolean), f = ui.ntaF;
  const rs = ui.ntaRules; let shown = 0;
  for (const x of rs) {
    const matchesFilter =
      f === 'all' ||
      (f === 'need' && !!(x.r.n > 0 && ui.ntaNeed && ui.ntaNeed.has(x.r.rid))) ||
      (f === 'dorm' && !!(x.r.n > 0 && ui.ntaNeed && !ui.ntaNeed.has(x.r.rid))) ||
      (f === 'used' && x.r.n > 0) ||
      (f === 'unused' && x.r.n <= 0);
    const matchesQuery = terms.every(t => x.hay.includes(t));
    const ok = matchesFilter && matchesQuery;
    x.el.hidden = !ok; if (ok) shown++;
  }
  for (const b of ui.ntaBlocks) {
    let n = 0; for (let i = b.from; i < b.to; i++) if (!rs[i].el.hidden) n++;
    b.el.hidden = !n; ntaSumSet(ui, b);
    if (terms.length && n && !b.el.open) b.el.open = true; // 搜索时自动展开有匹配的块
    for (const s of b.el.querySelectorAll('.nsub')) s.hidden = f === 'used';
  }
  for (const s of ui.ntaSecs) s.el.hidden = s.blocks.every(b => b.hidden);
  for (const e of ui.ntaExtras) e.hidden = !!terms.length;
  if (ui.ntaCard) ui.ntaCard.hidden = !!terms.length || f === 'unused';
  ui.ntaNone.hidden = shown > 0;
  ui.ntaCount.textContent = _M('nta.shownCount', shown, rs.length);
  for (const s of ui.ntaSync) s();
}
function ntaSeg(ui, items, get, set) { // 分段按钮：items = [[id, 文字, 提示]]
  const box = el('span', { className: 'seg' }), bs = [];
  const sync = () => { for (const [id, b] of bs) b.classList.toggle('on', id === get()); };
  for (const [id, text, title] of items) {
    const b = el('button', { textContent: text, title: title || '' }); b.onclick = () => { set(id); sync(); };
    bs.push([id, b]); box.appendChild(b);
  }
  sync(); ui.ntaSync.push(sync);
  return box;
}
function ntaStat(value, label, sub, onclick, cls, note) {
  const b = el(onclick ? 'button' : 'div', { className: 'stat' + (cls ? ' ' + cls : ''), title: sub || '' }, [el('b', { textContent: String(value) }), el('span', { textContent: label }), note ? el('small', { textContent: note }) : '']);
  if (onclick) b.onclick = onclick;
  return b;
}
function renderNTA(ui) {
  const R0 = ui.report, p = ui.nta, keepTop = p.scrollTop;
  p.textContent = ''; ui.nav = null; ui.navOn = null;
  if (!ui.ntaOpen) { ui.ntaOpen = new Set(); ui.ntaFirst = true; ui.ntaF = 'used'; ui.ntaS = 'all'; ui.ntaQ = ''; ui.ntaScale = lcStore('ntascale') === 'global' ? 'global' : 'group'; ui.ntaLog = lcStore('ntalog') === '1'; }
  ui.ntaRules = []; ui.ntaBlocks = []; ui.ntaExtras = []; ui.ntaSecs = []; ui.ntaSync = []; ui.ntaBars = []; ui.ntaCard = null;
  if (ui.ntaRO) { ui.ntaRO.disconnect(); ui.ntaRO = null; }
  if (typeof ResizeObserver === 'function') // 吸顶：量出顶部固定区、转换组标题行的高度，规则标题行才能贴在它们下面
    ui.ntaRO = new ResizeObserver(es => { for (const e of es) { const t = e.target, h = Math.ceil(t.getBoundingClientRect().height); if (t.id === 'lc-nthead') p.style.setProperty('--nth', h + 'px'); else if (t.parentElement) t.parentElement.style.setProperty('--ntg', h + 'px'); } });

  // ── 顶部固定区：搜索 / 命中筛选 / 位置 / 条形 / 翻页条 ──
  const srch = el('input', { type: 'search', className: 'srch', placeholder: _M('nta.search.placeholder'), value: ui.ntaQ });
  srch.oninput = () => { ui.ntaQ = srch.value; ntaFilter(ui); };
  srch.onkeydown = ev => { if (ev.key === 'Escape' && srch.value) { ev.preventDefault(); ev.stopPropagation(); srch.value = ''; ui.ntaQ = ''; ntaFilter(ui); } };
  ui.ntaCount = el('span', { className: 'cn' });
  const rowB = el('div', { className: 'frow' }, [
    ntaSeg(ui, [['need', _M('nta.rule.tag.active'), _M('nta.filter.tipActive')], ['dorm', _M('nta.rule.tag.dormant'), _M('nta.filter.tipDormant')], ['used', _M('nta.filter.hit'), _M('nta.filter.tipHit')],  ['unused', _M('nta.filter.unused'), _M('nta.filter.tipUnused')], ['all', _M('common.all')]], () => ui.ntaF, id => { ui.ntaF = id; ntaFilter(ui); }),
    ui.ntaCount
  ]);
  const rowD = el('div', { className: 'frow', hidden: !ui.ntaBarOpen }, [
    el('span', { className: 'fl', textContent: _M('nta.bar.label') }),
    ntaSeg(ui, [['group', _M('nta.bar.byGroup'), _M('nta.bar.byGroupTip')], ['global', _M('nta.bar.global'), _M('nta.bar.globalTip')]], () => ui.ntaScale, id => { ui.ntaScale = id; lcStore('ntascale', id); ntaBarsApply(ui); }),
    ntaSeg(ui, [['lin', _M('nta.bar.linear')], ['log', _M('nta.bar.log'), _M('nta.bar.logTip')]], () => ui.ntaLog ? 'log' : 'lin', id => { ui.ntaLog = id === 'log'; lcStore('ntalog', ui.ntaLog ? '1' : '0'); ntaBarsApply(ui); })
  ]);
  const barBtn = el('button', { className: 'vbtn', textContent: _M('nta.bar.menuButton'), title: _M('nta.bar.menuTip') });
  barBtn.onclick = () => { ui.ntaBarOpen = !ui.ntaBarOpen; rowD.hidden = !ui.ntaBarOpen; barBtn.classList.toggle('on', ui.ntaBarOpen); };
  barBtn.classList.toggle('on', !!ui.ntaBarOpen);
  const rowC = el('div', { className: 'frow' }, [
    el('span', { className: 'fl', textContent: _M('nta.scope.label') }),
    ntaSeg(ui, [['all', _M('common.all')], ['body', _M('nta.scope.body'), _M('nta.scope.bodyTip')], ['ref', 'ref', _M('nta.scope.refTip')]], () => ui.ntaS, id => { if (id !== ui.ntaS) { ui.ntaS = id; renderNTA(ui); } }),
    barBtn
  ]);
  const pv = el('button', { textContent: '◀', title: _M('nta.step.prevTip') }), nx = el('button', { textContent: '▶', title: _M('nta.step.nextTip') }), cl = el('button', { textContent: '✕', title: _M('nta.step.endTip') });
  pv.onclick = () => ntaStep(ui, -1); nx.onclick = () => ntaStep(ui, 1); cl.onclick = () => { ui.nav = null; ntaNavUpdate(ui); };
  ui.navName = el('span', { className: 'nn', title: _M('nta.step.nameTip') }); ui.navPos = el('span', { className: 'np' }); ui.navRef = el('span', { className: 'tag rf', textContent: 'ref', hidden: true });
  ui.navName.onclick = () => { const row = ui.nav && ui.nav.r._row; if (row) row.scrollIntoView({ block: 'center' }); };
  ui.navTbl = el('div', { className: 'ntbl' });
  ui.navBar = el('div', { id: 'lc-nav', hidden: true }, [el('div', { className: 'nrow1' }, [pv, nx, el('span', { className: 'nt' }, [ui.navName, ui.navRef, ui.navPos]), cl]), ui.navTbl]);
  const head = el('div', { id: 'lc-nthead' }, [srch, rowB, rowC, rowD, ui.navBar]);
  p.appendChild(head);
  if (ui.ntaRO) ui.ntaRO.observe(head);

  if (!R0) { head.hidden = true; p.appendChild(el('div', { className: 'nempty' }, [el('b', { textContent: _M('nta.notConvertedYet') }), el('div', { className: 'dim', textContent: _M('nta.notConvertedYetHelp') })])); return; }
  if (!R0.groups.length && !R0.local.length && !R0.hidden.length) {
    p.appendChild(el('div', { className: 'nempty' }, [el('b', { textContent: _M('nta.noRules') }), el('div', { className: 'dim', textContent: _M('nta.noRulesHelp') })]));
    head.hidden = true; return;
  }

  // ── 先给每一处命中标上“在不在 ref 内”，再按位置筛选得到当前视图 ──
  const ranges = ntaRefRanges(curSrc), all0 = [].concat(...R0.groups.map(g => g.rules), R0.local, R0.hidden);
  let nRefHit = 0;
  for (const r of all0) for (const u of r.uses) { if (u.ref == null) u.ref = ntaInRef(ranges, u.s); if (u.ref) nRefHit++; }
  const R = ntaView(R0, ui.ntaS), allRules = [].concat(...R.groups.map(g => g.rules), R.local, R.hidden);
  ui.ntaShort = ntaShortMap(all0);
  ui.ntaRuleBy = new Map(all0.map(x => [x.rid, x])); ui.ntaNeed = null; ui.ntaShadow = null;
  if (R0.tables) try { const nd = noteTANeeded(R0, R0.tables); ui.ntaNeed = nd.need; ui.ntaShadow = nd.shadow; } catch (e) { console.error(_M('nta.error.checkFailed'), e); }
  ui.ntaGmax = ntaBlockMax(allRules);

  // ── 概览 ──
  const dead = ntaDead(R0), nDead = dead.g.length + dead.l.length;
  const usedG = R.groups.filter(g => g.uses).length, usedL = R.local.filter(r => r.n).length;
  const toRef = () => { ui.ntaS = ui.ntaS === 'ref' ? 'all' : 'ref'; renderNTA(ui); };
  p.appendChild(el('div', { className: 'nstats' }, [
    ntaStat(R.total, ui.ntaS === 'all' ? _M('nta.filter.hit') : ui.ntaS === 'body' ? _M('nta.stat.bodyHits') : _M('nta.stat.refHits'), _M('nta.stat.hitsTip')),
    ntaStat(usedG + '/' + R.groups.length, _M('nta.stat.groupsUsed'), _M('nta.stat.groupsUsedTip')),
    R.local.length ? ntaStat(usedL + '/' + R.local.length, _M('nta.stat.numericUsed'), _M('nta.stat.numericUsedTip')) : '',
    ntaStat(nDead, _M('nta.stat.cleanable'), nDead ? _M('nta.stat.cleanableTip') : _M('nta.stat.cleanableNone'), null, nDead ? 'warn' : '')
  ]));

  if (ntaReorderBlocks(R0).length) {
    const ob = el('button', { textContent: _M('nta.reorder.label'), title: _M('nta.reorder.tip') });
    ob.onclick = () => ntaReorder(ui);
    p.appendChild(el('div', { className: 'ntool' }, [ob]));
  }

  // ── 可清理：整组没命中的转换组、没命中的全页规则，一处集中处理（按真实命中数，不受“位置”筛选影响） ──
  if (nDead) {
    const c = el('div', { className: 'ncard' }, [el('div', { className: 'nct', textContent: _M('nta.cleanup.title', nDead) }), el('div', { className: 'dim', textContent: _M('nta.cleanup.note') })]);
    for (const g of dead.g) {
      const b = el('button', { className: 'dgr', textContent: _M('common.remove') }); b.onclick = () => removeNTA(ui, groupSpec(g));
      c.appendChild(el('div', { className: 'nrow' }, [el('span', { className: 'tag z', textContent: _M('layer.convGroup') }), el('span', { className: 'rl', textContent: _M('nta.cleanup.groupLabel', g.name, g.rules.length) }), b]));
    }
    for (const r of dead.l) {
      const b = el('button', { className: 'dgr', textContent: _M('common.remove') }); b.onclick = () => removeNTA(ui, localSpec(r));
      c.appendChild(el('div', { className: 'nrow' }, [el('span', { className: 'tag z', textContent: _M('nta.cleanup.localRulesTag') }), el('span', { className: 'rl', title: r.text, textContent: ui.ntaShort.get(r.rid) }), b]));
    }
    p.appendChild(c); ui.ntaCard = c;
  }

  // ── 规则版块 ──
  const section = (title, sub) => {
    const h = el('div', { className: 'nsec' }, [title, sub ? el('span', { className: 'dim', textContent: sub }) : '']);
    const s = { el: h, blocks: [] }; ui.ntaSecs.push(s); p.appendChild(h); return s;
  };
  if (R.groups.length) {
    const s = section(_M('nta.section.commonGroups'), _M('nta.section.commonGroupsHint'));
    for (const g of R.groups.slice().sort((a, b) => (a.uses ? 0 : 1) - (b.uses ? 0 : 1) || b.uses - a.uses)) { const d = ntaGroupEl(ui, g); s.blocks.push(d); p.appendChild(d); }
  }
  if (R.local.length || R.hidden.length) {
    const s = section(_M('nta.section.pageConversion'), _M('nta.section.pageConversionHint'));
    if (R.local.length) { const d = ntaBlockEl(ui, 'local', _M('nta.section.numericParams'), R.local); s.blocks.push(d); p.appendChild(d); }
    if (R.hidden.length) { const d = ntaBlockEl(ui, 'hidden', _M('nta.section.hiddenRules'), R.hidden); s.blocks.push(d); p.appendChild(d); }
  }
  ui.ntaNone = el('div', { className: 'nempty', hidden: true }, [el('b', { textContent: _M('nta.search.noMatch') }), el('div', { className: 'dim', textContent: _M('nta.search.noMatchHelp') })]);
  p.appendChild(ui.ntaNone);

  // ── 冲突：和上面的规则不是一回事，单独一节、单独的样式 ──
  if (R0.dups.length) {
    const h = el('div', { className: 'nsec warn' }, [_M('nta.conflict.title'), el('span', { className: 'dim', textContent: _M('nta.conflict.subtitle') })]);
    const d = el('details', { className: 'ng nwarn' }, [el('summary', {}, [el('b', { className: 'gn', textContent: _M('nta.conflict.heading') }), el('span', { className: 'gm', textContent: _M('nta.conflict.count', R0.dups.length) })])]);
    ntaObserve(ui, d.firstChild);
    d.appendChild(el('div', { className: 'nhead dim', textContent: _M('nta.conflict.note') }));
    for (const x of R0.dups.slice(0, 1000))
      d.appendChild(el('div', { className: 'ndup' }, [el('b', { textContent: x.key }), ...x.owners.map(o => el('span', { className: 'ow ' + (o === x.win ? 'win' : 'lose'), textContent: (o === x.win ? '✔ ' : '✘ ') + ntaName(o) }))]));
    if (R0.dups.length > 1000) d.appendChild(el('div', { className: 'dim nhead', textContent: _M('common.moreItems', R0.dups.length - 1000) }));
    ntaTrack(ui, d, 'dups'); p.appendChild(h); p.appendChild(d); ui.ntaExtras.push(h, d);
  }
  const help = el('details', { className: 'nhelp' }, [el('summary', { textContent: _M('nta.help.title') }),
    el('div', { className: 'dim', textContent: _M('nta.help.body') })]);
  p.appendChild(help); ui.ntaExtras.push(help);

  // 第一次：转换组 / 块很少就直接展开
  if (ui.ntaFirst) { ui.ntaFirst = false; if (ui.ntaBlocks.length <= 2) for (const b of ui.ntaBlocks) b.el.open = true; }
  ntaBarsApply(ui);
  ntaFilter(ui);
  p.scrollTop = keepTop;
}
function toggleNTA(ui) { dockToggle(ui, 'nta'); }
/** 报告变了（重新转换）：侧栏正显示 noteTA 就立刻重画，否则等下次切过去再画（保留展开状态 / 搜索词 / 滚动位置） */
function ntaRefresh(ui) {
  ui.ntaDirty = true;
  if (ui.dockTab === 'nta') { renderNTA(ui); ui.ntaDirty = !ui.report; }
  ntaBadge(ui);
}
/** 竖条上的“noteTA 检查”按钮：有可清理项时挂一个数字角标 */
function ntaBadge(ui) {
  const R = ui.report, d = R ? ntaDead(R) : null, n = d ? d.g.length + d.l.length : 0;
  let b = ui.chk.querySelector('.bd');
  ui.chk.title = _M('nta.badge.toggleTip') + (n ? ' · ' + _M('nta.badge.cleanable', n) : '');
  if (!n) { if (b) b.remove(); return; }
  if (!b) ui.chk.appendChild(b = el('span', { className: 'bd' }));
  b.textContent = String(n);
}

// ── 侧栏：目录 / noteTA 检查 共用一个停靠面板，入口是贴在右边缘的竖条（rail） ──
// 宽屏：面板推开正文（html 右侧留白），不盖住任何文字；窄屏（正文不足 DOCK_MIN_MAIN）：覆盖在正文上，跳转后自动收起。
const DOCK_MIN_MAIN = 680, DOCK_RAIL_W = 28;
let dockW = 380;
const lcStore = (k, v) => { try { if (v === undefined) return localStorage.getItem('lcdebug-' + k); localStorage.setItem('lcdebug-' + k, v); } catch (_) { /* 无痕模式等：忽略 */ } return null; };
const dockWide = () => document.documentElement.clientWidth - DOCK_RAIL_W - dockW >= DOCK_MIN_MAIN;
function dockSetW(w) {
  dockW = Math.round(Math.max(260, Math.min(w, 720, document.documentElement.clientWidth * 0.6)));
  document.documentElement.style.setProperty('--lc-dock-w', dockW + 'px');
}
/** 侧栏展开 / 收起 / 拖宽会改变正文宽度、重新换行，文章就“跑走”了，目录跳转也对不上位置。
 *  改动前在视口里取一个锚点（优先用转换结果的源码位置；取不到就退回“视口里某个块距顶部的距离”），改动后滚回原位。可嵌套：只有最外层生效。 */
function dockKeepView(ui, change) {
  if (ui._dockKeep) return change();
  ui._dockKeep = true;
  try {
    const out = ui.out, anc = out && out.isConnected ? viewAnchor(out) : null;
    let fb = null;
    if (!anc) { // 兜底：从视口上部往下找第一个带文字的块
      for (let y = 100; y < window.innerHeight - 16 && !fb; y += 28) {
        const e = document.elementFromPoint(window.innerWidth * 0.3, y), blk = e && e.closest && e.closest('p,li,dd,dt,h1,h2,h3,h4,h5,h6,tr,pre,blockquote');
        if (blk && !blk.closest(LC_OWN)) fb = { el: blk, top: blk.getBoundingClientRect().top };
      }
    }
    change();
    if (anc) restoreAnchor(out, anc);
    else if (fb && fb.el.isConnected) { const d = fb.el.getBoundingClientRect().top - fb.top; if (d) window.scrollBy({ top: d, left: 0, behavior: 'instant' }); }
  } finally { ui._dockKeep = false; }
}
function dockApply(ui) { dockKeepView(ui, () => dockApplyNow(ui)); }
function dockApplyNow(ui) {
  const t = ui.dockTab, pushed = !!t && dockWide(), root = document.documentElement;
  ui.dock.classList.toggle('open', !!t);
  root.classList.toggle('lc-pushed', pushed);
  root.style.setProperty('--lc-inset', (DOCK_RAIL_W + (pushed ? dockW : 0)) + 'px'); // 右边被占掉的宽度：编辑弹窗据此避开侧栏
  ui.tocBtn.classList.toggle('on', t === 'toc'); ui.chk.classList.toggle('on', t === 'nta');
  ui.dockTitle.textContent = t === 'nta' ? _M('dock.ntaTitle') : _M('dock.tocTitle');
  ui.tocPane.style.display = t === 'toc' ? '' : 'none'; ui.nta.style.display = t === 'nta' ? '' : 'none';
  lcTopSoon();
}
/** tab: 'toc' | 'nta' | null（收起）；temp：不写进记忆（自动收起、启动恢复用） */
function dockShow(ui, tab, temp) {
  ui.dockTab = tab;
  if (tab === 'nta' && ui.ntaDirty) { renderNTA(ui); ui.ntaDirty = !ui.report; }
  dockApply(ui);
  if (!temp) lcStore('dock', tab || '');
}
const dockToggle = (ui, tab) => dockShow(ui, ui.dockTab === tab ? null : tab);
const dockAfterJump = ui => { if (ui.dockTab && !dockWide()) dockShow(ui, null, true); };

/** 吸顶偏移：站点皮肤自己的固定 / 吸顶头部（Vector 2022 的 sticky header、Timeless 的固定头部……）会盖住 LC 的顶栏。
 *  探测视口顶部正中被哪个 fixed / sticky 元素占着，把它的下沿写进 --lc-top，顶栏、侧栏、竖条都躲到它下面。
 *  这类头部随滚动出现 / 消失（还带动画），所以滚动、缩放、动画结束时都重测。 */
const LC_OWN = '#lc-wrap,#lc-dock,#lc-rail,#lc-toast,.lc-tip,.lc-selhint,.lc-ed,.lc-cfo';
function lcTopProbe() {
  if (!document.elementsFromPoint) return 0;
  const W = document.documentElement.clientWidth, maxH = window.innerHeight * 0.4;
  let top = 0;
  for (const x of [Math.round(W * 0.15), Math.round(W / 2), W - 12]) { // 头部不一定横贯全宽：左、中、右（侧栏所在处）都量
    for (const n of document.elementsFromPoint(x, 1)) { // 返回的是这个点上所有叠着的元素，连被 LC 侧栏盖住的头部也在里面
      if (n.closest(LC_OWN)) continue;
      for (let e = n; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
        const p = getComputedStyle(e).position;
        if (p !== 'fixed' && p !== 'sticky') continue;
        const r = e.getBoundingClientRect();
        if (r.top <= 2 && r.bottom > top && r.bottom <= maxH) top = r.bottom; // 超过视口 40% 的当整屏遮罩，不算头部
        break;
      }
    }
  }
  return Math.ceil(top);
}
let lcTopV = -1, lcDockV = -1, lcTopRaf = 0, lcTopUntil = 0;
function lcTopSync() {
  const root = document.documentElement, v = lcTopProbe();
  let d = v; // 侧栏的顶：覆盖式（没推开正文）时它会压在 LC 顶栏的右端，让它躲到顶栏下面
  const dock = document.getElementById('lc-dock'), bar = document.getElementById('lc-bar');
  if (dock && bar && dock.classList.contains('open') && !root.classList.contains('lc-pushed')) {
    const b = bar.getBoundingClientRect(); if (b.bottom > d && b.top < window.innerHeight * 0.5) d = Math.ceil(b.bottom);
  }
  if (v !== lcTopV) { lcTopV = v; root.style.setProperty('--lc-top', v + 'px'); }
  if (d !== lcDockV) { lcDockV = d; root.style.setProperty('--lc-dock-top', d + 'px'); }
}
/** 头部出现 / 消失带滑动动画，LC 顶栏也随滚动移动：触发后连续逐帧重测 450ms，侧栏才能和它们同步，不留互相遮挡的瞬间 */
function lcTopTick() { lcTopRaf = 0; lcTopSync(); if (performance.now() < lcTopUntil) lcTopRaf = requestAnimationFrame(lcTopTick); }
function lcTopSoon() { lcTopUntil = performance.now() + 450; if (!lcTopRaf) lcTopRaf = requestAnimationFrame(lcTopTick); }

/** 少数皮肤的右栏要另外处理：LC 模式用不着站点自己的右栏，让出位置给侧栏 */
const SKIN_CSS = {
  // Timeless：mediawiki.org 上 Skin:Timeless 文档里的“单侧导航”片段——宽屏时也把右栏并到左栏
  timeless: '@media (min-width:1340px){#mw-content-block{display:block}#mw-content,#content-bottom-stuff{margin-left:14em}#mw-content-wrapper{float:right;margin-left:-14em;width:100%}#mw-related-navigation{width:14em;padding:0 1em 0 0}div.color-middle{margin-right:0}.ts-inner{padding:0 0 0 1em}#footer{padding-right:1em}}',
  // Vector 2022：LC 模式把正文整个替换了，原生目录对不上，始终隐藏；左栏（主菜单等）默认收起，竖条上的“左栏”按钮可展开（html.lc-left-open）；
  // 没有官方的“右栏挪到左边”，侧栏打开时把右栏（页面工具 / 外观）也藏起来。这些类名和 id 都没在真实页面上验证过
  'vector-2022': 'html:not(.lc-left-open) .vector-column-start{display:none!important}'
    // 左栏收起时，把原生网格（≥1120px：12.25rem 的左栏列 + 24px 列间距）改成单列，空白才会消失；左栏展开时不碰
    + '@media screen and (min-width:1120px){html:not(.lc-left-open) .mw-page-container-inner{column-gap:0!important;grid-template-columns:minmax(0,1fr)!important;'
    + 'grid-template-areas:"siteNotice" "pageContent" "footer"!important}}'
    + '#vector-toc-pinned-container,#mw-panel-toc,.vector-toc,.vector-toc-landmark,.mw-table-of-contents-container{display:none!important}'
    + 'html.lc-pushed .vector-column-end{display:none}'
};
/** 站点上其他小工具的位置修正：只在 LC 模式生效。左边是给竖条 / 侧栏腾出右边 */
const GADGET_CSS = '#scrollDownButton-zhwiki,#scrollUpButton-zhwiki{left:18px!important}';

function installDock(ui) {
  const x = el('button', { textContent: '✕', title: _M('dock.collapse') }); x.onclick = () => dockShow(ui, null);
  const rz = el('div', { id: 'lc-dock-rz', title: _M('dock.resizeTip') });
  ui.dockTitle = el('b');
  ui.tocEmpty = el('div', { className: 'dim', textContent: _M('dock.tocEmpty') });
  ui.tocPane = el('div', { id: 'lc-tocp', className: 'dp' }, [ui.tocEmpty, ui.tocList]);
  ui.nta = el('div', { id: 'lc-nta', className: 'dp' });
  ui.dock = el('div', { id: 'lc-dock' }, [rz, el('div', { className: 'dh' }, [ui.dockTitle, el('span', { className: 'sp' }), x]), ui.tocPane, ui.nta]);
  ui.tocBtn.title = _M('dock.tocToggleTip'); ui.chk.title = _M('nta.badge.toggleTip');
  const root = document.documentElement, railBtns = [ui.tocBtn, ui.chk];
  if (mw.config.get('skin') === 'vector-2022') { // 左栏默认收起，这里留一个展开 / 收起的按钮（原生目录无论如何都隐藏）
    const lb = ui.leftBtn = el('button', { textContent: _M('dock.leftButton'), title: _M('dock.leftTip') });
    const setLeft = (on, save) => { root.classList.toggle('lc-left-open', on); lb.classList.toggle('on', on); if (save) lcStore('left', on ? '1' : '0'); };
    lb.onclick = () => setLeft(!root.classList.contains('lc-left-open'), true);
    setLeft(lcStore('left') === '1');
    railBtns.push(lb);
  }
  ui.rail = el('div', { id: 'lc-rail' }, railBtns);
  root.classList.add('lc-has-rail'); root.style.setProperty('--lc-rail-w', DOCK_RAIL_W + 'px');
  document.body.appendChild(ui.dock); document.body.appendChild(ui.rail);
  ui.tocBtn.onclick = () => dockToggle(ui, 'toc');
  rz.addEventListener('pointerdown', ev => {
    ev.preventDefault(); rz.setPointerCapture(ev.pointerId);
    const mv = e2 => dockKeepView(ui, () => { dockSetW(root.clientWidth - DOCK_RAIL_W - e2.clientX); dockApply(ui); }); // 宽度变量先于 dockApply 改，所以锚点要包在外面取
    const up = () => { rz.removeEventListener('pointermove', mv); rz.removeEventListener('pointerup', up); lcStore('dockw', String(dockW)); };
    rz.addEventListener('pointermove', mv); rz.addEventListener('pointerup', up);
  });
  window.addEventListener('resize', () => { dockApply(ui); lcTopSoon(); });
  window.addEventListener('scroll', lcTopSoon, { passive: true });
  document.addEventListener('transitionend', lcTopSoon, true); document.addEventListener('animationend', lcTopSoon, true);
  document.addEventListener('keydown', ev => { // [ ]：上 / 下一处命中（输入框、编辑器里不响应）
    if (!ui.nav || ev.ctrlKey || ev.metaKey || ev.altKey || (ev.key !== '[' && ev.key !== ']')) return;
    const t = ev.target; if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    ev.preventDefault(); ntaStep(ui, ev.key === ']' ? 1 : -1);
  });
  // 恢复上次的状态；第一次来：宽屏（≥1400）默认开目录，其余默认收起。窄屏不自动弹出覆盖式面板
  dockSetW(+lcStore('dockw') || 380);
  let t = lcStore('dock'); if (t == null) t = root.clientWidth >= 1400 ? 'toc' : '';
  ui.dockTab = null; ui.ntaDirty = true;
  dockShow(ui, (t === 'toc' || t === 'nta') && dockWide() ? t : null, true);
  lcTopSync();
}

// ── 移除无用的 noteTA 规则 ──
// 对 8 个变体分别请求「原本」「删去后」的渲染 HTML 并对比：全部无差异 → 直接提交删除；有差异 → 列出文本、DOM 路径、可能匹配的规则，由人判断。
const RM = { busy: false };

/** 从 noteTA 源码里去掉一个参数（数字参数 n 连同它的注释参数 dn）。spec: {kind:'local', num, text} | {kind:'group', name}
 *  返回 {text:新模板源码} / {all:true}（去掉后一个参数都不剩，整个模板删掉）/ null（没找到） */
function dropNoteTAParam(block, spec) {
  const parts = splitTop(block.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  let pn = 0;
  const info = parts.map((p, i) => { // 命名规则与 parseNoteTA 完全一致（位置参数按出现顺序编号）
    if (!i) return null;
    const eq = p.indexOf('=');
    if (eq > -1 && /^\s*[A-Za-z0-9]+\s*$/.test(p.slice(0, eq))) return { name: p.slice(0, eq).trim(), val: p.slice(eq + 1).trim(), pos: false };
    return { name: String(++pn), val: p.trim(), pos: true };
  });
  const hit = info.findIndex(x => x && (spec.kind === 'group'
    ? /^G\d+$/i.test(x.name) && x.val === spec.name
    : x.name === String(spec.num) && x.val === spec.text.trim()));
  if (hit < 0) return null;
  const cm = /^\d+$/.test(info[hit].name) ? ('d' + info[hit].name).toLowerCase() : null, isCm = i => !!cm && !!info[i] && !info[i].pos && info[i].name.toLowerCase() === cm; // 数字参数 n 的注释参数 dn：跟着被删的参数一起走（G 参数没有注释）
  if (!info.some((x, i) => x && i !== hit && !isCm(i))) return { all: true };
  const out = [];
  parts.forEach((p, i) => {
    if (i === hit || isCm(i)) return;
    if (i > hit && info[hit].pos && info[i] && info[i].pos) { // 去掉的是位置参数：后面的位置参数编号会前移，改成显式 N= 保持原编号
      const lead = /^\s*/.exec(p)[0]; out.push(lead + info[i].name + '=' + p.slice(lead.length));
    } else out.push(p);
  });
  return { text: '{{' + out.join('|') + '}}' };
}
/** 在 src 里 pos 处的 noteTA 中去掉一个参数；返回 {s,e,to,full} 或 null */
function buildRemoval(src, pos, param) {
  if (pos == null || src.slice(pos, pos + 2) !== '{{') return null;
  const e = findClose(src, pos, '{{', '}}'); if (e < 0) return null;
  const block = src.slice(pos, e);
  if (!NOTETA_RE.test(block)) return null;
  const d = param.move ? moveNoteTAGroup(block, param) : dropNoteTAParam(block, param); if (!d) return null;
  if (d.err) return { err: d.err };
  if (d.all) {
    let b = e; if (src[b] === '\n' && (pos === 0 || src[pos - 1] === '\n')) b++; // 模板独占一行：连换行一起删
    return { s: pos, e: b, to: '', full: src.slice(0, pos) + src.slice(b) };
  }
  return { s: pos, e, to: d.text, nums: d.nums, full: src.slice(0, pos) + d.text + src.slice(e) };
}
/** 把转换组 spec.name 的 G 参数去掉（spec.keep 时保留，即“复制”），并把 spec.move（规则文本，已去掉标志）作为数字参数追加到模板末尾。
 *  noteTA 只接受 1–30 号数字参数：从空闲编号里按小到大取，不够就返回 {err}；已有相同规则文本的不重复加。
 *  返回 {text, nums:[新用的编号]} / {err} / null（没找到这个 G 参数） */
function moveNoteTAGroup(block, spec) {
  const parts = splitTop(block.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  let pn = 0; const taken = new Set(), vals = new Set();
  const info = parts.map((p, i) => { // 命名规则与 parseNoteTA 一致
    if (!i) return null;
    const eq = p.indexOf('=');
    if (eq > -1 && /^\s*[A-Za-z0-9]+\s*$/.test(p.slice(0, eq))) return { name: p.slice(0, eq).trim(), val: p.slice(eq + 1).trim() };
    return { name: String(++pn), val: p.trim() };
  });
  for (const x of info) if (x && /^\d+$/.test(x.name) && +x.name >= 1 && +x.name <= 30) { taken.add(+x.name); vals.add(x.val); }
  const hit = info.findIndex(x => x && /^G\d+$/i.test(x.name) && x.val === spec.name);
  if (hit < 0) return null;
  const add = [];
  for (const t of spec.move) {
    if (vals.has(t) || add.includes(t)) continue;
    if (splitTop(t).length > 1) return { err: _M('nta.move.topLevelPipe', clip(t, 40)) };
    add.push(t);
  }
  if (spec.keep && !add.length) return { err: _M('nta.move.alreadyThere') };
  const free = []; for (let n = 1; n <= 30; n++) if (!taken.has(n)) free.push(n);
  if (spec.keep) free.reverse(); // 复制：从 30 往下取，编号最大的优先级最高，才压得过被覆盖它的规则
  if (add.length > free.length) return { err: _M('nta.move.tooMany', taken.size, free.length, add.length) };
  const kept = spec.keep ? parts.slice() : parts.filter((_, i) => i !== hit), multi = block.includes('\n'); // keep：复制，保留转换组
  const tr = /\s*$/.exec(kept[kept.length - 1])[0];
  kept[kept.length - 1] = kept[kept.length - 1].slice(0, kept[kept.length - 1].length - tr.length);
  add.forEach((t, k) => { if (multi) kept[kept.length - 1] += '\n'; kept.push(free[k] + '=' + t); });
  kept[kept.length - 1] += tr;
  return { text: '{{' + kept.join('|') + '}}', nums: free.slice(0, add.length) };
}

/** HTML → 有序“项”列表：元素（标签 + 属性）和非空文本节点。noteTA 提示框本身会随规则变化，整个忽略 */
function htmlItems(html) {
  const doc = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html');
  doc.querySelectorAll('.noteTA,[class*="noteTA"]').forEach(n => n.remove());
  const items = [];
  (function walk(n) {
    for (let c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { const t = c.data.replace(/\s+/g, ' ').trim(); if (t) items.push({ sig: 'T' + t, text: t, node: c }); }
      else if (c.nodeType === 1) {
        const at = [...c.attributes].map(a => a.name + '="' + a.value + '"').join(' ');
        items.push({ sig: 'E' + c.localName + ' ' + at, text: '<' + c.localName + (at ? ' ' + at : '') + '>', node: c });
        walk(c);
      }
    }
  })(doc.body);
  return items;
}
/** 节点的 DOM 路径：tag#id / tag.class，同类兄弟多于一个时带 :nth-of-type */
function domPath(node) {
  let e = node.nodeType === 3 ? node.parentNode : node; const parts = [];
  while (e && e.localName && e.localName !== 'body') {
    let s = e.localName;
    if (e.id) s += '#' + e.id; else if (e.classList && e.classList.length) s += '.' + [...e.classList].slice(0, 2).join('.');
    const p = e.parentNode;
    if (p && p.children) { const same = [...p.children].filter(x => x.localName === e.localName); if (same.length > 1) s += ':nth-of-type(' + (same.indexOf(e) + 1) + ')'; }
    parts.unshift(s); e = e.parentNode;
  }
  return parts.join(' > ');
}
/** 差异区间：项数相同（只是文字被转换，结构不变）就逐项比；否则退回 diffHunks */
function htmlHunks(A, B) {
  const sa = A.map(x => x.sig), sb = B.map(x => x.sig);
  if (sa.length !== sb.length) return diffHunks(sa, sb);
  const hs = []; let cur = null;
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) { if (cur) cur.a1 = cur.b1 = i + 1; else cur = { a0: i, a1: i + 1, b0: i, b1: i + 1 }; }
    else if (cur) { hs.push(cur); cur = null; }
  }
  if (cur) hs.push(cur);
  return hs;
}
/** 渲染结果缓存：key = 变体 + 源码。基线（原本）那份在连续移除多条规则时可以复用；10 分钟过期，最多 16 份 */
const PARSE_CACHE = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
/** 值得重试的失败：429 / 503（站点解析并发池已满，等一会儿就行）、限流、只读。
 *  超时 / 504 / 断线不重试：整页解析本身就超过时限，重试只会白白占用解析并发池。 */
function isTransient(e) {
  if (!e) return false;
  if (e.code === 'http') { const d = e.data || {}, st = d.xhr && d.xhr.status; return st === 429 || st === 503; }
  return e.code === 'ratelimited' || e.code === 'readonly';
}
/** 请求本身太慢：超时 / 504 / 网关断开。再试别的变体也一样，直接放弃 */
function isTooSlow(e) {
  if (!e || e.code !== 'http') return false;
  const d = e.data || {}, st = d.xhr && d.xhr.status;
  return d.textStatus === 'timeout' || st === 504 || st === 502;
}
/** 带退避重试（3/8/15 秒）地执行 fn；onStatus(文字) 报告进度 */
async function withRetry(fn, cancelled, onStatus, what) {
  const DELAYS = [3000, 8000, 15000];
  for (let k = 0; ; k++) {
    try {
      if (onStatus) onStatus((k ? _M('retry.attempt', what, k + 1) : what));
      return await fn();
    } catch (e) {
      if (k >= DELAYS.length || !isTransient(e) || cancelled()) throw e;
      if (onStatus) onStatus(_M('retry.rateLimited', what, DELAYS[k] / 1000));
      await sleep(DELAYS[k]);
      if (cancelled()) throw e;
    }
  }
}
/** 8 个变体各自请求 oldSrc / newSrc 的渲染结果并对比。onVariant(v, result)；result = {A,B,hunks} 或 {err}
 *  只能串行：站点对同一用户的 parse 并发有上限，并行会让多数请求立刻 503。不拆段：noteTA / -{H|}- 只影响其后的文本，
 *  拆开后规则状态、跨段的 <ref name> / 表格 / 模板都会不一致。 */
async function compareVariants(oldSrc, newSrc, onVariant, cancelled, onStatus) {
  const res = {};
  const rawParse = (text, v) => apiCall('post', { action: 'parse', title: cfg('wgPageName'), text, contentmodel: 'wikitext', prop: 'text', disablelimitreport: 1, disableeditsection: 1, disabletoc: 1, preview: 1, variant: v, uselang: 'zh', formatversion: 2 })
    .then(r => { if (!r.parse || typeof r.parse.text !== 'string') throw new Error(_M('compare.noHtml')); return r.parse.text; });
  const parse = async (text, v, what) => {
    const key = v + '\x00' + text, hit = PARSE_CACHE.get(key);
    if (hit && Date.now() - hit.t < 600000) return hit.html;
    const html = await withRetry(() => rawParse(text, v), cancelled, t => onStatus && onStatus(v, t), what);
    PARSE_CACHE.set(key, { t: Date.now(), html });
    while (PARSE_CACHE.size > 16) PARSE_CACHE.delete(PARSE_CACHE.keys().next().value);
    return html;
  };
  let abort = null;
  for (const v of VARIANTS) {
    if (cancelled()) break;
    if (abort) { res[v] = { err: abort }; onVariant(v, res[v]); continue; }
    try {
      const a = await parse(oldSrc, v, _M('compare.renderBefore')); if (cancelled()) break;
      const b = await parse(newSrc, v, _M('compare.renderAfter')); if (cancelled()) break;
      const A = htmlItems(a), B = htmlItems(b);
      res[v] = { A, B, hunks: a === b ? [] : htmlHunks(A, B) };
    } catch (e) {
      if (cancelled()) break;
      res[v] = { err: errText(e) };
      if (isTooSlow(e)) abort = _M('compare.skipped');
    }
    onVariant(v, res[v]);
  }
  return res;
}

// ── 大页面的快速检查：不渲染，只展开模板，看展开后的文本里有没有出现被删规则的词 ──
const QUICK_BYTES = 200000;
/** 在行边界上切成 ≈target 字符的块：只在 {{ }} 与 {| |} 都配平、且遇到空行 / 二级标题时切 */
function splitChunks(src, target) {
  const lines = src.split('\n'), out = []; let cur = [], size = 0, depth = 0, tbl = 0;
  for (const line of lines) {
    if (size >= target && depth <= 0 && tbl <= 0 && (line === '' || /^==[^=]/.test(line))) { out.push(cur.join('\n')); cur = []; size = 0; }
    cur.push(line); size += line.length + 1;
    depth += (line.split('{{').length - 1) - (line.split('}}').length - 1);
    const tl = line.trimStart(); if (tl.startsWith('{|')) tbl++; else if (tl.startsWith('|}')) tbl--;
  }
  if (cur.length) out.push(cur.join('\n'));
  return out.filter(c => c.trim());
}
/** 把 {{noteTA …}} 换成占位符再送去展开（展开会把整个转换组的词带出来）；展开后用 restore 原样放回，交给本地引擎解析 */
function protectNTA(t) {
  const re = /\{\{\s*[nN]ote[tT][aA]\b/g, saved = []; let out = '', i = 0, m;
  while ((m = re.exec(t))) {
    if (m.index < i) continue;
    const e = findClose(t, m.index, '{{', '}}'); if (e < 0) break;
    out += t.slice(i, m.index) + '@@LCNTA' + saved.length + '@@'; saved.push(t.slice(m.index, e)); i = e; re.lastIndex = e;
  }
  return { text: out + t.slice(i), restore: x => x.replace(/@@LCNTA(\d+)@@/g, (mm, n) => saved[+n] != null ? saved[+n] : mm) };
}
/** 按“顶层单元”切分源码：配平的 {{ }} / {| |} 算同一单元，其余每行一个单元。line/end 是原文行号（1 起） */
function splitUnits(src) {
  const cnt = (x, t) => x.split(t).length - 1, units = []; let cur = null, depth = 0, tbl = 0;
  src.split('\n').forEach((line, i) => {
    if (!cur || (depth <= 0 && tbl <= 0)) { cur = { line: i + 1, end: i + 1, text: line }; units.push(cur); }
    else { cur.text += '\n' + line; cur.end = i + 1; }
    depth += cnt(line, '{{') - cnt(line, '}}');
    const tl = line.trimStart(); if (tl.startsWith('{|')) tbl++; else if (tl.startsWith('|}')) tbl--;
  });
  return units;
}
/** 逐块展开模板（串行）并在展开文本里找被删规则的词；有命中的块再二分展开，定位到具体的源码行 / 模板调用。
 *  返回 {chunks, requests, truncated, leaves:[{line,end,heading,tpl,snippet,range,hits:[{label,key,n,ctx}]}]} 或 {err} */
async function quickCheck(src, spec, cancelled, onStatus) {
  const units = splitUnits(src), REFINE_BUDGET = 60;
  let requests = 0, budget = REFINE_BUDGET, truncated = false;
  const headOf = []; { let h = ''; for (let i = 0; i < units.length; i++) { const m = /^=+\s*(.+?)\s*=+\s*$/.exec(units[i].text); if (m) h = m[1]; headOf[i] = h; } }
  const ranges = []; { let lo = 0, size = 0;
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (size >= 15000 && i > lo && (u.text === '' || /^==[^=]/.test(u.text))) { ranges.push([lo, i]); lo = i; size = 0; }
      size += u.text.length + 1;
    }
    ranges.push([lo, units.length]); }
  if (!latest.tables) return { err: _M('quick.noTables') };
  const byRid = new Map(spec.cands.filter(c => c.rid).map(c => [c.rid, c])), locals = spec.cands.filter(c => c.kind === 'local');
  const candOf = (u, defs) => {
    const c = byRid.get(u.rid); if (c) return c;
    const d = defs && defs.get(u.rid);
    return d && d.kind === 'local' ? locals.find(x => x.num === d.num && x.text === d.text) || null : null; // 局部规则的 rid 带位置，换了文本就对不上，改按序号 + 内容认
  };
  /** 用本地转换引擎（sim 模式：与真实转换一样屏蔽链接目标 / 文件名 / 属性等；最长匹配、同长先后、层级都按脚本现有逻辑）
   *  处理 text，统计被删规则真正生效的次数。preLen：text 开头那段是“规则前缀”，其中的命中不算 */
  const tidy = x => x.replace(/\[\[(?:[^\]|\[]*\|)?/g, '').replace(/\]\]|'{2,}/g, '').replace(/\s+/g, ' '); // 上下文里去掉 [[ ]] / 粗斜体标记，只留文字
  const probe = (text, preLen) => {
    const info = { usage: [] }, esc = escapeWikitext(text, 'sim', 0, false);
    for (const _ of tokenize(esc.escapedText, esc.placeholders, latest.tables, latest.groups, undefined, esc.map, info)) { /* 只要 info.usage */ }
    const found = new Map();
    for (const u of info.usage) {
      if (u.s < preLen) continue;
      const c = candOf(u, info.defs); if (!c) continue;
      const id = c.label + '\x00' + u.from; let h = found.get(id);
      if (!h) found.set(id, h = { label: c.label, key: u.from, n: 0, ctx: [] });
      h.n++; if (h.ctx.length < 2) h.ctx.push({ a: tidy(text.slice(Math.max(preLen, u.s - 30), u.s)).slice(-18), k: text.slice(u.s, u.e), b: tidy(text.slice(u.e, u.e + 30)).slice(0, 18) });
    }
    return [...found.values()];
  };
  const hitsIn = async (lo, hi, what) => {
    // 规则前缀：此前出现过 noteTA / -{ }- 的单元原样放在最前面，让引擎知道这一段开始时哪些规则已生效
    const pre = units.slice(0, lo).filter(u => /\{\{\s*[nN]ote[tT][aA]\b|-\{/.test(u.text)).map(u => u.text).join('\n'), head = pre ? pre + '\n' : '';
    const P = protectNTA(units.slice(lo, hi).map(u => u.text).join('\n'));
    let ex = P.text;
    if (ex.replace(/@@LCNTA\d+@@/g, '').trim()) // 空文本接口不接受，也不会有命中
      ex = await withRetry(() => apiCall('post', { action: 'expandtemplates', title: cfg('wgPageName'), text: ex, prop: 'wikitext', formatversion: 2 })
        .then(r => { if (!r.expandtemplates || typeof r.expandtemplates.wikitext !== 'string') throw new Error(_M('quick.noExpansion')); return r.expandtemplates.wikitext; }), cancelled, onStatus, what);
    return probe(head + P.restore(ex), head.length);
  };
  const leaves = [];
  const leaf = (lo, hi, hits) => {
    const u = units[lo], single = hi - lo === 1, tm = /^\s*\{\{\s*([^|{}\n]+?)\s*(?:\||\}\}|$)/.exec(u.text);
    leaves.push({ line: u.line, end: units[hi - 1].end, heading: headOf[lo], tpl: single && tm ? tm[1] : '', snippet: single ? u.text.replace(/\s+/g, ' ') : '', range: !single, hits });
  };
  const refine = async (lo, hi, known) => {
    if (cancelled()) return;
    if (hi - lo === 1) return leaf(lo, hi, known);
    if (budget <= 0) { truncated = true; return leaf(lo, hi, known); }
    const mid = (lo + hi) >> 1;
    budget -= 1; requests++;
    const L = await hitsIn(lo, mid, _M('quick.locating', units[lo].line, units[mid - 1].end));
    if (L.length) { await refine(lo, mid, L); budget -= 1; requests++; const R = await hitsIn(mid, hi, _M('quick.locating', units[mid].line, units[hi - 1].end)); if (R.length) await refine(mid, hi, R); }
    else await refine(mid, hi, known); // 左半没有，命中全在右半，沿用已有结果
  };
  try {
    for (let c = 0; c < ranges.length; c++) {
      if (cancelled()) return { cancelled: true };
      requests++;
      const hits = await hitsIn(ranges[c][0], ranges[c][1], _M('quick.expanding', c + 1, ranges.length));
      if (hits.length) await refine(ranges[c][0], ranges[c][1], hits);
    }
  } catch (e) { return { err: errText(e), tooSlow: isTooSlow(e) }; }
  return { chunks: ranges.length, requests, truncated, leaves };
}

const localSpec = r => ({ pos: r.pos, label: '#' + r.num + ' ' + clip(r.text, 30), param: { kind: 'local', num: r.num, text: r.text }, cands: [{ label: '#' + r.num, keys: r.keys, rid: r.rid, kind: 'local', num: r.num, text: r.text }] });
const groupSpec = g => ({ pos: g.pos, label: _M('spec.groupLabel', g.name), param: { kind: 'group', name: g.name }, cands: g.rules.map(r => ({ label: r.item || '#' + (r.idx + 1), keys: r.keys, rid: r.rid, kind: 'cgroup' })) });
/** 把转换组里“有命中”的规则整理成数字参数的规则文本（去掉 H| 等标志）。移动后优先级从“转换组”升到“本页”，差异检查会兜底 */
function groupMoveSpec(g) {
  const move = [];
  for (const r of g.rules) {
    if (!r.n) continue;
    const t = parseManual(r.text.replace(/^-\{|\}-$/g, '')).body.trim();
    if (t && !move.includes(t)) move.push(t);
  }
  return Object.assign(groupSpec(g), {
    label: _M('spec.groupMoveLabel', g.name), move: true, title: _M('spec.groupMoveTip'),
    param: { kind: 'group', name: g.name, move },
    summary: _M('spec.groupMoveSummary', g.name, move.length),
    done: _M('spec.groupMoveDone', g.name, move.length)
  });
}
/** 把转换组里的一条规则复制成数字参数（保留转换组）。优先级从“转换组”升到“本页”，差异检查会兜底 */
function ruleCopySpec(g, r) {
  const t = parseManual(r.text.replace(/^-\{|\}-$/g, '')).body.trim();
  if (!t) return null;
  return Object.assign(groupSpec(g), {
    label: _M('spec.ruleCopyLabel', g.name, clip(t, 30)), move: true, copy: true, verb: _M('spec.ruleCopyVerb'), title: _M('spec.ruleCopyTip'),
    param: { kind: 'group', name: g.name, move: [t], keep: true },
    cands: [{ label: r.item || '#' + (r.idx + 1), keys: r.keys, rid: r.rid, kind: 'cgroup' }],
    summary: _M('spec.ruleCopySummary', g.name, clip(t, 30)),
    done: _M('spec.ruleCopyDone')
  });
}
/** 有差异时的展示：相同的差异合并，标出所在变体、前后文本、DOM 路径、可能匹配的被删规则 */
function rmDetailEl(spec, res) {
  const agg = new Map();
  for (const v of VARIANTS) {
    const r = res[v];
    for (const h of r.hunks) {
      const o = r.A.slice(h.a0, h.a1), n = r.B.slice(h.b0, h.b1);
      const ot = o.map(x => x.text).join(' '), nt = n.map(x => x.text).join(' ');
      const path = domPath((o[0] || n[0]).node), k = ot + '\x00' + nt + '\x00' + path;
      let g = agg.get(k); if (!g) agg.set(k, g = { ot, nt, path, vs: [] });
      g.vs.push(disp(SHORT[v]));
    }
  }
  const root = el('div', {}, [el('div', { className: 'lc-warn', textContent: spec.copy
    ? _M('rm.detail.copyDiff', agg.size)
    : spec.move
    ? _M('rm.detail.moveDiff', agg.size)
    : _M('rm.detail.removeDiff', agg.size) })]);
  let i = 0;
  for (const g of agg.values()) {
    if (++i > 40) { root.appendChild(el('div', { className: 'lc-rmmore', textContent: _M('rm.moreGroupsHidden', agg.size - 40) })); break; }
    const hits = [];
    for (const c of spec.cands) {
      const ks = c.keys.filter(k => k && (g.ot.includes(k) || g.nt.includes(k)));
      if (ks.length) hits.push(c.label + '：' + ks.map(k => '「' + clip(k, 20) + '」').join(' '));
    }
    root.appendChild(el('div', { className: 'lc-rmbox' }, [
      el('div', { textContent: _M('rm.detail.variants', g.vs.join(' / ')) }),
      el('div', { className: 't o', textContent: _M('rm.detail.before', clip(g.ot, 300)) }),
      el('div', { className: 't n', textContent: _M('rm.detail.after', clip(g.nt, 300)) }),
      el('div', { className: 'p', textContent: _M('rm.detail.domPath', g.path || _M('rm.detail.root')) }),
      el('div', { className: 'p', textContent: _M('rm.detail.possibleRules', hits.slice(0, 8).join('；') || _M('rm.detail.noRuleMatched')) })
    ]));
  }
  return root;
}
async function removeNTA(ui, spec) {
  if (RM.busy) { notify(_M('rm.busy')); return; }
  const why = editAvail(); if (why) { notify(_M('rm.unavailable', why)); return; }
  if (ED.ed || ED.cf) { notify(_M('rm.editorOpen')); return; }
  const baseRev = cfg('wgRevisionId'), baseSrc = curSrc;
  const rm = buildRemoval(baseSrc, spec.pos, spec.param);
  if (!rm) { notify(_M('rm.notFoundInSource')); return; }
  if (rm.err) { notify(rm.err); return; }
  RM.busy = true;
  let cancelled = false, saving = false;
  const list = el('div'), lines = new Map();
  const verb = spec.verb || _M('rm.defaultVerb'), forceText = spec.move ? _M('rm.forceVerb', verb) : _M('rm.forceRemove');
  const sec = el('div', { className: 'lc-sec', textContent: _M('rm.preparing') });
  const detail = el('div'), msg = el('div', { className: 'lc-cfmsg' });
  const force = el('button', { textContent: forceText }), close = el('button', { textContent: _M('common.cancel') });
  const slowBtn = el('button', { textContent: _M('rm.slowButton'), title: _M('rm.slowTip') });
  force.style.display = 'none'; slowBtn.style.display = 'none';
  const box = el('div', { className: 'lc-cfo' }, [el('div', { className: 'lc-cf' }, [
    el('div', { className: 'lc-cfh' }, [el('b', { textContent: spec.title || _M('rm.title') }), ' · ' + spec.label]),
    sec, list, detail, msg,
    el('div', { className: 'lc-edb' }, [slowBtn, force, close])
  ])]);
  const onKey = ev => { if (ev.key === 'Escape' && !saving) { ev.preventDefault(); ev.stopPropagation(); finish(); } };
  const finish = () => { cancelled = true; document.removeEventListener('keydown', onKey, true); box.remove(); RM.busy = false; };
  document.addEventListener('keydown', onKey, true); document.body.appendChild(box);
  close.onclick = () => { if (!saving) finish(); };
  const summary = spec.summary || _M('rm.summary', spec.label);
  const commit = async () => {
    saving = true; force.disabled = true; msg.textContent = _M('common.committing');
    try {
      if (curSrc !== baseSrc || cfg('wgRevisionId') !== baseRev) throw { code: 'lc-stale', message: _M('rm.staleDuringCompare') };
      const r = await apiCall('postWithEditToken', { action: 'edit', pageid: cfg('wgArticleId'), text: rm.full, summary, baserevid: baseRev, nocreate: 1, formatversion: 2 });
      const E = r.edit || {};
      if (E.result !== 'Success') throw { code: E.captcha ? 'captcha' : (E.result || 'failure'), message: E.captcha ? _M('save.captcha') : _M('save.failed'), data: r };
      finish();
      if (E.nochange || !E.newrevid) { notify(_M('save.noChange')); return; }
      try {
        const nt = await fetchRev(E.newrevid);
        curSrc = nt; srcP = Promise.resolve(nt); mw.config.set({ wgRevisionId: E.newrevid, wgCurRevisionId: E.newrevid });
        notify(_M('save.savedVersion', spec.done || _M('rm.removedDone', spec.label), E.newrevid));
        await convert(ui, { keepScroll: true });
      } catch (err) { notify(_M('sync.savedButSyncFailed', err.message)); }
    } catch (err) { saving = false; force.disabled = false; msg.textContent = errText(err); }
  };
  const slow = async () => { // 逐变体整页渲染对比
    slowBtn.style.display = 'none'; detail.textContent = ''; msg.textContent = ''; force.style.display = 'none'; force.textContent = forceText;
    // 每次都重建状态区（前面的“快速检查 / 大页面提示”留下的内容要清掉，否则状态行会写到已脱离页面的旧元素上）
    sec.textContent = _M('rm.compare.title', spec.move ? _M('rm.afterVerb', verb) : _M('rm.afterRemoval'));
    list.textContent = ''; lines.clear();
    const prog = el('div', { textContent: _M('rm.compare.start', spec.move ? _M('rm.afterVerb', verb) : _M('rm.afterRemoval')) });
    list.appendChild(prog);
    for (const v of VARIANTS) { const d = el('div', { textContent: _M('rm.compare.waiting', v) }); lines.set(v, d); list.appendChild(d); }
    let doneN = 0;
    try {
      const res = await compareVariants(baseSrc, rm.full, (v, r) => {
        doneN++; prog.textContent = _M('rm.compare.progress', doneN, VARIANTS.length);
        lines.get(v).textContent = (r.err ? _M('rm.compare.variantFailed', v, r.err) : r.hunks.length ? _M('rm.compare.variantChanged', v, r.hunks.length) : _M('rm.compare.variantSame', v));
      }, () => cancelled, (v, t) => { lines.get(v).textContent = v + '：' + t + '…'; });
      if (cancelled) return;
      prog.textContent = _M('rm.compare.finished', doneN, VARIANTS.length);
      const vals = VARIANTS.map(v => res[v]);
      if (vals.some(r => !r || r.err)) { msg.textContent = _M('rm.compare.failedSomeVariants'); return; }
      if (vals.every(r => !r.hunks.length)) { msg.textContent = _M('rm.compare.noDiffCommitting'); await commit(); return; }
      detail.appendChild(rmDetailEl(spec, res));
      force.style.display = '';
      force.onclick = () => { if (!saving && confirm(_M('rm.compare.confirmDiff', spec.move ? verb : _M('common.remove')))) commit(); };
    } catch (err) { msg.textContent = _M('rm.compare.failed', err && err.message || err); }
  };
  slowBtn.onclick = slow;
  const quick = async () => { // 大页面：只展开模板，查词
    list.textContent = ''; sec.textContent = _M('rm.quick.title');
    const st = el('div', { textContent: _M('rm.preparing') }); list.appendChild(st);
    const r = await quickCheck(baseSrc, spec, () => cancelled, t => { st.textContent = t + '…'; });
    if (cancelled || r.cancelled) return;
    if (r.err) { st.textContent = _M('rm.quick.failed', r.err); msg.textContent = _M('rm.retryHint'); return; }
    st.textContent = _M('rm.quick.largePage', Math.round(new TextEncoder().encode(baseSrc).length / 1024), r.chunks);
    slowBtn.style.display = '';
    if (!r.leaves.length) {
      detail.appendChild(el('div', { textContent: _M('rm.quick.noHit') }));
      force.textContent = _M('common.remove'); force.style.display = '';
      force.onclick = () => { if (!saving) commit(); };
      return;
    }
    const root = el('div', {}, [el('div', { className: 'lc-warn', textContent: _M('rm.quick.activeWarning', r.leaves.length, r.requests, r.truncated ? _M('rm.quick.locateLimit') : '') })]);
    r.leaves.slice(0, 30).forEach(l => {
      const where = _M('rm.loc.lines', l.line + (l.end > l.line ? '–' + l.end : '')) + (l.range ? _M('rm.loc.rangeNote') : '') + (l.heading ? _M('rm.loc.section', clip(l.heading, 30)) : _M('rm.loc.top')) + (l.tpl ? _M('rm.loc.template', l.tpl) : '');
      const box = el('div', { className: 'lc-rmbox' }, [el('div', { textContent: where })]);
      if (l.snippet) box.appendChild(el('div', { className: 't o', textContent: _M('rm.loc.source', clip(l.snippet, 90)) }));
      l.hits.sort((x, y) => y.n - x.n).slice(0, 6).forEach(h => box.appendChild(el('div', {}, [_M('rm.hit.expanded', h.label, clip(h.key, 20), h.n), h.ctx[0].a, el('mark', { textContent: h.ctx[0].k }), h.ctx[0].b])));
      if (l.hits.length > 6) box.appendChild(el('div', { className: 'lc-rmmore', textContent: _M('common.moreWords', l.hits.length - 6) }));
      root.appendChild(box);
    });
    if (r.leaves.length > 30) root.appendChild(el('div', { className: 'lc-rmmore', textContent: _M('rm.moreLocationsHidden', r.leaves.length - 30) }));
    detail.appendChild(root);
    force.style.display = '';
    force.onclick = () => { if (!saving && confirm(_M('rm.quick.confirmHits'))) commit(); };
  };
  try {
    if (spec.copy) { sec.textContent = _M('rm.copyingNoCompare'); list.textContent = ''; await commit(); return; } // 复制多半就是想让结果变化（提高被覆盖规则的优先级），对比没有意义
    const bytes = new TextEncoder().encode(baseSrc).length;
    if (bytes > QUICK_BYTES && spec.move) { // “移动”不是删规则，快速查词没有意义：只能整页渲染对比，或不对比直接提交
      list.textContent = ''; sec.textContent = _M('rm.largeNoCompare');
      list.appendChild(el('div', { textContent: _M('rm.largeUnverifiable', Math.round(bytes / 1024), verb) }));
      slowBtn.style.display = '';
      force.textContent = _M('rm.commitWithoutCompare', verb); force.style.display = '';
      force.onclick = () => { if (!saving && confirm(_M('rm.confirmNoCompare'))) commit(); };
    } else if (bytes > QUICK_BYTES) await quick(); else await slow();
  } catch (err) { msg.textContent = _M('rm.check.failed', err && err.message || err); }
}

// ── 重新排序 Gn / n ──
// noteTA 的转换组参数 G1…Gn、数字参数 1…n：同层里后写入的生效，所以先后顺序就是优先级。
// 这里列出每个 {{noteTA}} 里的 G / 数字参数，可上下移动，保存时按新顺序重新编号（G1…Gk、1…m）并按这个顺序写回。
/** 拆 noteTA 模板：G 参数 / 数字参数（各按编号排好，同号保持出现顺序）/ 其它参数（T= 等，原样保留）。命名规则与 parseNoteTA 一致 */
function noteTAParams(block) {
  const parts = splitTop(block.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  let pn = 0; const G = [], N = [], other = [], cm = new Map(); // cm：注释参数 dn → 数字参数 n 的注释
  parts.forEach((p, i) => {
    if (!i) return;
    const eq = p.indexOf('='); let name, val;
    if (eq > -1 && /^\s*[A-Za-z0-9]+\s*$/.test(p.slice(0, eq))) { name = p.slice(0, eq).trim(); val = p.slice(eq + 1).trim(); }
    else { name = String(++pn); val = p.trim(); }
    const mc = eq > -1 && /^d(\d+)$/i.exec(name); if (mc) { if (val) cm.set(mc[1], val); return; }
    const isG = /^G\d+$/i.test(name), isN = /^\d+$/.test(name) && +name >= 1 && +name <= 30;
    if (!val && (isG || /^\d+$/.test(name))) return; // 空的 Gn / n 没有意义：丢掉，免得和重新编号后的同名参数打架
    if (isG) G.push({ n: +name.slice(1), val, from: name.toUpperCase() });
    else if (isN) N.push({ n: +name, val, from: name });
    else other.push(name + '=' + val);
  });
  for (const x of N) x.cmt = cm.get(String(x.n)); // 对应参数不存在的孤立注释不保留
  G.sort((a, b) => a.n - b.n); N.sort((a, b) => a.n - b.n); // 稳定排序：先按现有编号排好，作为起点
  return { parts, G, N, other };
}
/** 按新顺序重新编号后的模板源码；原来是多行写法的，仍然一行一个参数 */
function noteTABuild(block, st) {
  const parts = splitTop(block.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  const head = parts[0].replace(/\s+$/, ''), tr = /\s*$/.exec(parts[parts.length - 1])[0], multi = block.includes('\n');
  const ps = [];
  st.G.forEach((x, i) => ps.push('G' + (i + 1) + '=' + x.val));
  st.N.forEach((x, i) => { ps.push((i + 1) + '=' + x.val); if (x.cmt) ps.push('d' + (i + 1) + '=' + x.cmt); }); // 注释参数 dn 紧跟在对应参数后面，一起重新编号
  ps.push(...st.other);
  return '{{' + head + ps.map(p => (multi ? '\n|' : '|') + p).join('') + tr + '}}';
}
/** 页面里能找到源码位置的 {{noteTA}} 模板 */
function ntaReorderBlocks(R0) {
  const poss = new Set();
  for (const g of R0.groups) if (g.pos != null) poss.add(g.pos);
  for (const r of R0.local) if (r.pos != null) poss.add(r.pos);
  const out = [];
  for (const pos of [...poss].sort((a, b) => a - b)) {
    if (curSrc.slice(pos, pos + 2) !== '{{') continue;
    const e = findClose(curSrc, pos, '{{', '}}'); if (e < 0) continue;
    const block = curSrc.slice(pos, e); if (!NOTETA_RE.test(block)) continue;
    out.push({ pos, e, block });
  }
  return out;
}
function ntaReorder(ui) {
  if (RM.busy) { notify(_M('reorder.busy')); return; }
  const why = editAvail(); if (why) { notify(_M('reorder.unavailable', why)); return; }
  if (ED.ed || ED.cf) { notify(_M('rm.editorOpen')); return; }
  const R0 = ui.report; if (!R0) { notify(_M('nta.notConvertedYet')); return; }
  const baseRev = cfg('wgRevisionId'), baseSrc = curSrc;
  const blocks = ntaReorderBlocks(R0).map(b => Object.assign(b, { st: noteTAParams(b.block), line: lineOf(b.pos) }));
  if (!blocks.length) { notify(_M('reorder.noNoteTA')); return; }
  RM.busy = true;
  let saving = false;
  const body = el('div', { className: 'lc-ord' }), msg = el('div', { className: 'lc-cfmsg' });
  const save = el('button', { className: 'pri', textContent: _M('reorder.save') }), close = el('button', { textContent: _M('common.cancel') });
  const box = el('div', { className: 'lc-cfo' }, [el('div', { className: 'lc-cf' }, [
    el('div', { className: 'lc-cfh' }, [el('b', { textContent: _M('nta.reorder.label') }), _M('reorder.subtitle')]),
    el('div', { className: 'dim', textContent: _M('reorder.help') }),
    body, msg, el('div', { className: 'lc-edb' }, [save, close])
  ])]);
  const onKey = ev => { if (ev.key === 'Escape' && !saving) { ev.preventDefault(); ev.stopPropagation(); finish(); } };
  const finish = () => { document.removeEventListener('keydown', onKey, true); box.remove(); RM.busy = false; };
  document.addEventListener('keydown', onKey, true); document.body.appendChild(box);
  close.onclick = () => { if (!saving) finish(); };
  const newFull = () => { let t = baseSrc; for (const b of blocks.slice().reverse()) t = t.slice(0, b.pos) + noteTABuild(b.block, b.st) + t.slice(b.e); return t; };
  const row = (list, i, label, text, d, hits, from) => {
    const up = el('button', { textContent: '↑', title: _M('reorder.moveUpTip'), disabled: i === 0 }), dn = el('button', { textContent: '↓', title: _M('reorder.moveDownTip'), disabled: i === list.length - 1 });
    up.onclick = () => { [list[i - 1], list[i]] = [list[i], list[i - 1]]; render(); };
    dn.onclick = () => { [list[i + 1], list[i]] = [list[i], list[i + 1]]; render(); };
    return el('div', { className: 'r' }, [up, dn, el('b', { textContent: label }), el('span', { className: 't', title: d, textContent: text }),
      el('span', { className: 'd', textContent: (hits != null ? _M('nta.hitCount', hits) : '') + (from ? _M('reorder.from', from) : '') })]);
  };
  const render = () => {
    body.textContent = '';
    for (const b of blocks) {
      const { G, N } = b.st;
      body.appendChild(el('div', { className: 'lc-sec', textContent: _M('reorder.noteTAAt', b.line) }));
      if (G.length) body.appendChild(el('div', { className: 'dim', textContent: _M('nta.section.commonGroups') }));
      G.forEach((x, i) => { const g = R0.groups.find(y => y.name === x.val && y.pos === b.pos); body.appendChild(row(G, i, 'G' + (i + 1), x.val, x.val, g ? g.uses : null, x.from !== 'G' + (i + 1) ? x.from : '')); });
      if (N.length) body.appendChild(el('div', { className: 'dim', textContent: _M('reorder.individualConversions') }));
      N.forEach((x, i) => { const r = R0.local.find(y => y.pos === b.pos && y.num === x.n && y.text === x.val) || R0.local.find(y => y.pos === b.pos && y.num === x.n); body.appendChild(row(N, i, String(i + 1), clip(x.val, 80) + (x.cmt ? '（' + clip(x.cmt, 40) + '）' : ''), x.val + (x.cmt ? '\n' + x.cmt : ''), r ? r.n : null, x.from !== String(i + 1) ? x.from : '')); });
      body.appendChild(el('div', { className: 'pv', textContent: noteTABuild(b.block, b.st) }));
    }
    save.disabled = saving || newFull() === baseSrc;
    msg.textContent = save.disabled && !saving ? _M('reorder.unchanged') : '';
  };
  save.onclick = async () => {
    saving = true; save.disabled = true; msg.textContent = _M('common.committing');
    try {
      if (curSrc !== baseSrc || cfg('wgRevisionId') !== baseRev) throw { code: 'lc-stale', message: _M('reorder.staleDuringEdit') };
      const r = await apiCall('postWithEditToken', { action: 'edit', pageid: cfg('wgArticleId'), text: newFull(), summary: _M('reorder.summary'), baserevid: baseRev, nocreate: 1, formatversion: 2 });
      const E = r.edit || {};
      if (E.result !== 'Success') throw { code: E.captcha ? 'captcha' : (E.result || 'failure'), message: E.captcha ? _M('save.captcha') : _M('save.failed'), data: r };
      finish();
      if (E.nochange || !E.newrevid) { notify(_M('save.noChange')); return; }
      try {
        const nt = await fetchRev(E.newrevid);
        curSrc = nt; srcP = Promise.resolve(nt); mw.config.set({ wgRevisionId: E.newrevid, wgCurRevisionId: E.newrevid });
        notify(_M('reorder.done', E.newrevid));
        await convert(ui, { keepScroll: true });
      } catch (err) { notify(_M('sync.savedButSyncFailed', err.message)); }
    } catch (err) { saving = false; render(); msg.textContent = errText(err); }
  };
  render();
}

// ── 目录 ──
function buildToc(ui, items) {
  ui.tocList.textContent = '';
  if (obs) { obs.disconnect(); obs = null; }
  ui.tocEmpty.style.display = items.length ? 'none' : '';
  if (!items.length) return;
  const min = Math.min(...items.map(i => i.level)), links = new Map();
  for (const it of items) {
    const a = el('a', { textContent: it.text, title: it.text });
    a.setAttribute('href', '#' + it.id);
    a.style.paddingLeft = (0.5 + (it.level - min) * 1) + 'em';
    a.onclick = e => {
      e.preventDefault();
      const t = document.getElementById(it.id); if (t) t.scrollIntoView();
      dockAfterJump(ui);
      try { history.replaceState(null, '', '#' + it.id); } catch (_) { /* 忽略 */ }
    };
    links.set(it.id, a); ui.tocList.appendChild(el('li', {}, [a]));
  }
  if (typeof IntersectionObserver === 'function') { // 当前所在小节高亮
    let on = null;
    obs = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) {
        const a = links.get(e.target.id); if (!a) continue;
        if (on) on.classList.remove('on'); a.classList.add('on'); on = a;
        a.scrollIntoView({ block: 'nearest' });
      }
    }, { rootMargin: '-70px 0px -80% 0px' });
    for (const id of links.keys()) { const h = document.getElementById(id); if (h) obs.observe(h); }
  }
}

/** o.keepScroll：重转换后保持滚动位置（先把输出区撑到原来的高度，完成后还原）；o.anchor：源码没变（只是切换渲染模式）时，按“视口里看到的那段源码”还原，而不是按像素；
 *  o.flash：{s,e} 完成后短暂高亮刚改的位置 */
/** 记下“我现在看到哪”：视口里第一处能对上源码位置的内容，返回 {s:源码位置, mid:它在视口里的纵向中点}；找不到返回 null。
 *  普通 / 盲检两种渲染的高度差很多，按像素还原会跑到别处；按源码位置还原就能回到同一段话。 */
function viewAnchor(out) {
  const doc = out.ownerDocument, r0 = out.getBoundingClientRect(), vh = window.innerHeight;
  if (!r0.width) return null;
  const xs = [r0.left + Math.min(48, r0.width / 2), r0.left + r0.width / 2];
  for (let y = 80; y < vh - 16; y += 28) for (const x of xs) { // 从 80px 往下找：避开顶部的固定栏
    const el = doc.elementFromPoint(x, y);
    if (!el || !out.contains(el)) continue;
    const atom = el.closest('.lc-w,.lc-code'); // 转换词 / 屏蔽块：整个元素带源码区间
    if (atom && atom._lcSrc && out.contains(atom)) { const b = atom.getBoundingClientRect(); return { s: atom._lcSrc.s, mid: b.top + b.height / 2 }; }
    let node = null, off = 0; // 纯文本：用光标位置取文本节点 + 偏移
    if (doc.caretPositionFromPoint) { const p = doc.caretPositionFromPoint(x, y); if (p) { node = p.offsetNode; off = p.offset; } }
    else if (doc.caretRangeFromPoint) { const r = doc.caretRangeFromPoint(x, y); if (r) { node = r.startContainer; off = r.startOffset; } }
    if (node && node.nodeType === 1) {
      const k = node.childNodes[off], q = node.childNodes[off - 1];
      if (k && k.nodeType === 3 && textPos.has(k)) { node = k; off = 0; } else if (q && q.nodeType === 3 && textPos.has(q)) { node = q; off = q.length; } else node = null;
    }
    if (!node || node.nodeType !== 3 || !textPos.has(node) || !out.contains(node)) continue;
    off = Math.max(0, Math.min(node.length - 1, off)); if (node.length < 1) continue;
    const rg = doc.createRange(); rg.setStart(node, off); rg.setEnd(node, off + 1);
    const b = rg.getBoundingClientRect(); if (!b.width && !b.height) continue;
    const pos = textPos.get(node);
    return { s: Math.min(pos.s + off, Math.max(pos.s, pos.e - 1)), mid: b.top + b.height / 2 };
  }
  return null;
}
/** 重转换完成后，把锚点那处内容滚回原来在视口里的位置；成功返回 true */
function restoreAnchor(out, a) {
  if (!a) return false;
  const r = rangeForSrc(out, a.s, a.s + 1); if (!r) return false;
  let b = r.getBoundingClientRect();
  if (!b.width && !b.height) { const rs = r.getClientRects(); b = rs[0]; }
  if (!b) return false;
  window.scrollBy({ top: b.top + b.height / 2 - a.mid, left: 0, behavior: 'instant' });
  return true;
}
let lcBusyN = 0; // 正在进行的转换数（被新一轮顶掉的旧轮也会走到 finally，所以用计数而不是布尔）
/** 转换期间在 <html> 上打 data-lc-busy，让监听 DOM 变化的其它脚本（标注类小工具）暂缓扫描 */
async function convert(ui, o) {
  const root = document.documentElement;
  lcBusyN++; root.setAttribute('data-lc-busy', '1');
  try { await convertRun(ui, o); }
  finally { if (--lcBusyN <= 0) { lcBusyN = 0; root.removeAttribute('data-lc-busy'); } }
}
async function convertRun(ui, o) {
  o = o || {};
  const my = ++runId, mode = ui.blind.checked ? 'blind' : 'sim', t0 = performance.now();
  const say = s => { if (my === runId) ui.status.textContent = s; };
  const keepY = o.keepScroll ? window.scrollY : null;
  ui.out.style.minHeight = keepY != null ? ui.out.offsetHeight + 'px' : '';
  const anc = o.anchor ? viewAnchor(ui.out) : null; // 要在清空 DOM 之前取
  const restore = () => { if (anc && restoreAnchor(ui.out, anc)) return; if (keepY != null) window.scrollTo(0, keepY); };
  ui.report = null; ui.chk.disabled = true; ntaRefresh(ui);
  const T = { t0: performance.now() }; // 分段计时
  clearLC(ui.out); T.clear = performance.now(); setDots(ui.out, ui.dots.checked); ui.out._lcAll = ui.refs.checked;
  buildToc(ui, []);
  let ctx, g, src;
  try {
    say(_M('convert.reading')); src = await getSource(); if (my !== runId) return;
    curSrc = src;
    ctx = await ensureTables(say); if (my !== runId) return;
    say(_M('convert.readingGroups')); g = await loadGroups(src, mode);
  } catch (e) { say(_M('convert.loadFailed', e.message)); return; }
  if (my !== runId) return;
  T.load = performance.now();
  const info = { usage: [] }; // tokenize 会填上规则日志与 ruleMarks，确认弹窗预览改动所在行时要用；usage：noteTA 检查用的命中记录
  latest = { tables: ctx.tables, groups: g.groups, mode, info };
  const i = ctx.info;
  const head = _M('convert.tables', i.count, i.siteCount, i.sitePages) + (i.missing.length ? _M('convert.missingTables', i.missing.join(',')) : '') + // 只进 console
    (g.names.length ? _M('convert.groupsLoaded', Object.keys(g.groups).length, g.names.length) + (g.viaTemplate.length ? _M('convert.groupsViaTemplate', g.viaTemplate.join('、')) : '') + (g.missing.length ? _M('convert.groupsNotFoundInline', g.missing.join('、')) : '') : '');
  const warn = (i.missing.length ? _M('convert.missingTables', i.missing.join(',')) : '') + (g.missing.length ? _M('convert.groupsNotFound', g.missing.join('、')) : ''); // 影响结果的才留在界面上
  say(_M('convert.converting'));
  const gen = tokenizeWikitext(src, ctx.tables, { mode, groups: g.groups, info, headings: true });
  const stage = document.createElement('div'); // 游离容器：渲染期间不在文档里，不参与排版（每批追加到真实 DOM 会让浏览器反复整页重排）
  let buf = [], n = 0, compute = 0, c0 = performance.now(); // compute：纯计算（分词 + 渲染）耗时，不含让出主线程的等待
  for (const t of gen) {
    buf.push(t); n++;
    if (buf.length >= BATCH) { renderLC(buf, stage); buf = []; compute += performance.now() - c0; await tick(); if (my !== runId) return; c0 = performance.now(); }
  }
  renderLC(buf, stage);
  compute += performance.now() - c0;
  { // 一次性挂载，并把渲染状态（目录 / id）移交给真正的容器
    const st = states.get(stage); if (st) states.set(ui.out, st);
    const frag = document.createDocumentFragment();
    while (stage.firstChild) frag.appendChild(stage.firstChild);
    T.render = performance.now();
    ui.out.appendChild(frag);
    T.attach = performance.now();
    void ui.out.offsetHeight; // 强制排版一次，把排版耗时单独量出来（反正绘制前也要做）
    T.layout = performance.now();
  }
  buildToc(ui, getToc(ui.out));
  ui.out.style.minHeight = ''; restore();
  try { ui.report = buildNoteTAReport(info); ui.report.tables = ctx.tables; } catch (e) { ui.report = null; console.error(_M('convert.error.checkSummaryFailed'), e); }
  ui.chk.disabled = !ui.report; ntaRefresh(ui);
  T.end = performance.now();
  const ms = (a, b) => Math.round(T[b] - T[a]);
  const phaseMs = { clear: ms('t0', 'clear'), load: ms('clear', 'load'), render: ms('load', 'render'), attach: ms('render', 'attach'), layout: ms('attach', 'layout'), tocAndCheck: ms('layout', 'end') };
  const phases = _M('convert.phases', phaseMs.clear, phaseMs.load, phaseMs.render, phaseMs.attach, phaseMs.layout, phaseMs.tocAndCheck);
  const total = Math.round(performance.now() - t0);
  const heads = getToc(ui.out).length;
  say(_M('convert.done', n, heads, warn));
  try { // 细节只进 console：整行文字方便复制，对象方便展开
    console.log('[LC Debug] ' + _M('convert.logSummary', head, n, heads, total, Math.round(compute), src.length, phases),
      { mode, chars: src.length, tokens: n, headings: heads, totalMs: total, computeMs: Math.round(compute), phaseMs, tables: { core: i.count, site: i.siteCount, sitePages: i.sitePages, missing: i.missing }, groups: { loaded: Object.keys(g.groups).length, wanted: g.names.length, viaTemplate: g.viaTemplate, missing: g.missing } });
  } catch (_) { /* 忽略 */ }
  if (o.flash && editApi) editApi.flash(o.flash.s, o.flash.e);
  if (firstRun) { // 带 #锚点 进来的，渲染完再跳一次
    firstRun = false;
    try { const h = decodeURIComponent(location.hash.slice(1)); const t = h && document.getElementById(h); if (t) t.scrollIntoView(); } catch (_) { /* 忽略 */ }
  }
}

// ── 就地编辑：编辑器 → 确认弹窗（预览 + 服务器 diff）→ 保存 → 同步 ──
let editMode = false, curSrc = '', editApi = null;
const ED = { ed: null, cf: null }; // 当前打开的编辑器 / 确认弹窗
const cfg = k => mw.config.get(k);

function notify(msg) {
  let t = document.getElementById('lc-toast');
  if (!t) { t = el('div', { id: 'lc-toast' }); document.body.appendChild(t); }
  t.textContent = msg; t.style.display = 'block'; clearTimeout(t._t); t._t = setTimeout(() => { t.style.display = 'none'; }, 5000);
}
/** 编辑开关的可用条件；不满足时返回原因，满足返回 null */
function editAvail() {
  if (document.getElementById('wpTextbox1')) return _M('edit.unavailable.inEditPage');
  if (cfg('wgAction') !== 'view') return _M('edit.unavailable.readViewOnly');
  if (cfg('wgDiffNewId') || cfg('wgDiffOldId')) return _M('edit.unavailable.diffView');
  if (!cfg('wgArticleId')) return _M('source.pageMissing');
  if (cfg('wgRevisionId') !== cfg('wgCurRevisionId')) return _M('edit.unavailable.oldRevision');
  if (!cfg('wgIsProbablyEditable')) return _M('edit.unavailable.noPermission');
  return null;
}
function refreshEdit(ui) {
  const why = editAvail();
  ui.edit.disabled = !!why && !editMode;
  ui.edit.title = why || _M('edit.toggleTip');
  ui.editWhy.textContent = why && !editMode ? '（' + why + '）' : '';
}
const edDirty = () => !!ED.cf || !!(ED.ed && ED.ed.value() !== ED.ed.shown);
function setEdit(ui, on) {
  if (on) { const why = editAvail(); if (why) { notify(_M('edit.cannotEnable', why)); return; } }
  else if (edDirty() && !confirm(_M('edit.confirmDiscard'))) return;
  if (!on) { closeConfirm(); closeEditor(); }
  editMode = on;
  ui.edit.classList.toggle('on', on); ui.edit.textContent = on ? _M('edit.buttonOn') : _M('edit.buttonOff');
  ui.out.classList.toggle('lc-editing', on);
  if (editApi) editApi.reset();
  refreshEdit(ui);
}

const lineOf = pos => { let n = 1; for (let i = curSrc.indexOf('\n'); i > -1 && i < pos; i = curSrc.indexOf('\n', i + 1)) n++; return n; };
/** [s,e) 所在的整行范围 */
function lineSpan(src, s, e) {
  const a = s <= 0 ? 0 : src.lastIndexOf('\n', s - 1) + 1; let b = src.indexOf('\n', e); if (b < 0) b = src.length; return { a, b };
}
/** 第 pos 个字符所在行开始时已生效的规则快照（供预览用） */
function ruleSnap(pos) {
  const I = latest.info; if (!I || !I.ruleMarks) return undefined;
  let n = 0; for (const m of I.ruleMarks) { if (m.pos <= pos) n = m.n; else break; }
  return n ? { log: I.log, n } : undefined;
}
function apiCall(method, params) { // mw.Api 的 jQuery promise → 原生 Promise；失败时 reject {code, data}
  return new Promise((res, rej) => { new mw.Api()[method](params).then(res, (code, data) => rej({ code, data })); });
}
const ERR_TEXT = {
  editconflict: _M('api.error.editConflict'),
  protectedpage: _M('api.error.protectedPage'), permissiondenied: _M('api.error.permissionDenied'), blocked: _M('api.error.blocked'),
  readonly: _M('api.error.readOnly'), badtoken: _M('api.error.badToken'), ratelimited: _M('api.error.rateLimited'),
  contenttoobig: _M('api.error.contentTooBig'), articleexists: _M('api.error.pageChanged'), missingtitle: _M('api.error.pageDeleted'),
  'abusefilter-disallowed': _M('api.error.abuseFilterDisallowed'), 'abusefilter-warning': _M('api.error.abuseFilterWarning'), spamdetected: _M('api.error.spam')
};
function errText(e) {
  const c = e && e.code, info = e && e.data && e.data.error && e.data.error.info;
  if (c === 'http') { // mw.Api 的网络层失败：把状态码 / 超时 / 返回内容露出来，方便定位
    const d = (e && e.data) || {}, x = d.xhr || {};
    return _M('api.httpFailed', [d.textStatus, x.status, x.statusText].filter(v => v != null && v !== '' && v !== 0).join(' ')) + (x.responseText ? '：' + String(x.responseText).replace(/\s+/g, ' ')/*Handle Wikimedia error page HTML*/.replace(/^[\S\s]*?<p>/,'').replace(/<\/p>[\S\s]*<code>/,'. ').replace(/<details>[\S\s]*$/,'').slice(0, 1000) : '');
  }
  if (c && ERR_TEXT[c]) return ERR_TEXT[c];
  const msg = (e && e.message) || c || _M('api.unknownError');
  return info ? _M('api.failedWithInfo', msg, info) : _M('api.failed', msg);
}
async function fetchRev(rev) {
  const r = await fetch(rawUrl({ title: cfg('wgPageName'), action: 'raw', oldid: rev }), { credentials: 'same-origin' });
  if (!r.ok) throw new Error(_M('rev.downloadFailed', r.status));
  return r.text();
}
async function latestPageRev() {
  const r = await new mw.Api().get({ action: 'query', prop: 'revisions', rvprop: 'ids', pageids: cfg('wgArticleId'), maxage: 0, smaxage: 0, formatversion: 2 });
  const p = r.query && r.query.pages && r.query.pages[0];
  return p && p.revisions ? p.revisions[0].revid : null;
}
/** 把本地状态同步到某个版本：更新版本号和源码，全量重转换并保持滚动位置 */
async function syncTo(ui, rev, flash) {
  const text = await fetchRev(rev);
  curSrc = text; srcP = Promise.resolve(text); mw.config.set({ wgRevisionId: rev, wgCurRevisionId: rev });
  return convert(ui, { keepScroll: true, flash });
}

// ── 编辑器（浮层，非模态：不绑 blur，点别处不会关） ──
function closeEditor() { if (ED.ed) { ED.ed.box.remove(); ED.ed = null; } if (editApi) editApi.clearHighlight(); }
function openEditor(ui, r) {
  if (!editMode || ED.cf) return;
  dockAfterJump(ui); // 窄屏覆盖式侧栏会和底部编辑框抢位置：先收起
  if (ED.ed) {
    if (ED.ed.value() !== ED.ed.shown && !confirm(_M('editor.confirmDiscardCurrent'))) return;
    closeEditor(); if (editApi) editApi.highlight(r.s, r.e);
  }
  const orig = curSrc.slice(r.s, r.e), shown = orig.replace(/\r\n?/g, '\n'), multi = shown.includes('\n');
  const l1 = lineOf(r.s), l2 = lineOf(Math.max(r.s, r.e - 1));
  const field = multi ? el('textarea', { rows: Math.min(14, Math.max(3, shown.split('\n').length + 1)), spellcheck: false })
                      : el('input', { type: 'text', spellcheck: false });
  field.className = 'lc-edf'; field.value = r.fill != null ? r.fill : shown; // fill：预填内容（如“改行内转换”），与 shown 不同即视为有未提交改动
  const msg = el('div', { className: 'lc-edmsg' });
  const go = el('button', { textContent: _M('editor.previewButton'), className: 'pri' }), cancel = el('button', { textContent: _M('common.cancel') });
  const box = el('div', { className: 'lc-ed' }, [
    el('div', { className: 'lc-edh' }, [el('b', { textContent: _M('editor.title') }), _M('editor.position', l1 === l2 ? l1 : l1 + '–' + l2, shown.length)]),
    field, msg, el('div', { className: 'lc-edb' }, [go, cancel,
      el('span', { className: 'lc-edtip', textContent: _M('editor.tip') })])
  ]);
  const ed = { s: r.s, e: r.e, orig, shown, box, inline: r.fill != null, stale: false, value: () => field.value, msg: t => { msg.textContent = t || ''; }, show: v => { box.style.display = v ? '' : 'none'; } };
  const tryCancel = () => { if (ed.value() !== ed.shown && !confirm(_M('editor.confirmDiscard'))) return; closeEditor(); };
  go.onclick = () => submitEditor(ui);
  cancel.onclick = tryCancel;
  field.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); submitEditor(ui); }
    else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); tryCancel(); }
  });
  document.body.appendChild(box); ED.ed = ed;
  field.focus();
  const c = Math.max(0, Math.min(field.value.length, r.caret || 0)); try { field.setSelectionRange(c, c); } catch (_) { /* 忽略 */ }
}
function submitEditor(ui) {
  const ed = ED.ed; if (!ed || ED.cf) return;
  if (ed.stale) { ed.msg(_M('editor.error.stalePosition')); return; }
  const v = ed.value(); if (v === ed.shown) { ed.msg(_M('editor.noChange')); return; }
  // 提交前校验：源码里这个区间必须还是打开时记下的原文，否则位置已经不对，写进去会写坏文章
  if (curSrc.slice(ed.s, ed.e) !== ed.orig) { ed.msg(_M('editor.error.sourceMismatch')); ed.stale = true; return; }
  ed.msg('');
  const adj = linkAdjust(curSrc, ed.s, ed.e, v, !!ed.inline); // 改的是 [[ABC]] 的显示文字？
  if (!adj) { openConfirm(ui, ed, v); return; }
  if (adj.auto) { openConfirm(ui, ed, v, adj); return; } // 行内规则替换 / 含 -{ }-：直接改成 [[ABC|def]]
  askLink(adj).then(ch => { if (ED.ed !== ed || ED.cf) return; if (ch === 'pipe') openConfirm(ui, ed, v, adj); else if (ch === 'plain') openConfirm(ui, ed, v); });
}

/** 编辑区间 [s,e) 落在无管道的 [[ABC]] 内部时，返回改写成 [[ABC|def]] 的方案；否则 null。
 *  auto：行内规则替换或新文字含 -{ }-，无需询问。原链接内部已含 -{ }-（目标不明）、文件/分类/语言链接、用户自己写了 | 的，一律不管 */
function linkAdjust(src, s, e, piece, inline) {
  let a = s >= 2 ? src.lastIndexOf('[[', s - 2) : -1;
  for (let k = 0; a >= 0 && k < 8; k++, a = a >= 1 ? src.lastIndexOf('[[', a - 1) : -1) {
    const c = findClose(src, a, '[[', ']]');
    if (c < 0 || c - 2 < e) continue;
    const inner = src.slice(a + 2, c - 2);
    if (NS_RE.test(src.slice(a, a + 24)) || /^[a-z]{2,3}(-[a-z]{2,8})?:/.test(inner) || splitTop(inner).length !== 1 || inner.includes('-{')) return null;
    const text = src.slice(a + 2, s) + piece + src.slice(e, c - 2);
    if (text === inner || !text.trim() || text.includes('|')) return null;
    return { s: a, e: c, piece: '[[' + inner + '|' + text + ']]', target: inner, text, auto: !!inline || text.includes('-{') };
  }
  return null;
}
/** 询问：改成 [[ABC|def]]（保留链接目标）/ 直接改 [[def]] / 取消 → 'pipe' | 'plain' | null */
function askLink(adj) {
  return new Promise(res => {
    const onKey = ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); done(null); } };
    function done(v) { document.removeEventListener('keydown', onKey, true); box.remove(); res(v); }
    const mkb = (t, v, cls) => { const b = el('button', { textContent: t, className: cls || '' }); b.onclick = () => done(v); return b; };
    const pipe = mkb(_M('link.pipeButton', clip(adj.target, 16)), 'pipe', 'pri');
    const box = el('div', { className: 'lc-cfo' }, [el('div', { className: 'lc-cf' }, [
      el('div', { className: 'lc-cfh' }, [el('b', { textContent: _M('link.dialogTitle') })]),
      el('div', {}, [_M('link.askKeepTarget', adj.target)]),
      el('div', { className: 'lc-rmbox' }, [
        el('div', { className: 't n', textContent: _M('link.pipePreview', clip(adj.piece, 160)) }),
        el('div', { className: 't o', textContent: _M('link.directPreview', clip(adj.text, 140)) })]),
      el('div', { className: 'lc-edb' }, [pipe, mkb(_M('link.directButton'), 'plain'), mkb(_M('common.cancel'), null)])
    ])]);
    document.addEventListener('keydown', onKey, true); document.body.appendChild(box); pipe.focus();
  });
}

// ── 确认弹窗 ──
function closeConfirm() {
  const cf = ED.cf; if (!cf) return;
  document.removeEventListener('keydown', cf.key, true); cf.box.remove(); ED.cf = null;
  if (ED.ed) ED.ed.show(true);
}
async function loadDiff(rev, newFull) {
  try { await mw.loader.using('mediawiki.diff.styles'); } catch (_) { /* 没有样式也能看 */ }
  const common = { action: 'compare', fromrev: rev, prop: 'diff', formatversion: 2 };
  let r;
  try { r = await apiCall('post', Object.assign({}, common, { toslots: 'main', 'totext-main': newFull, 'tocontentmodel-main': 'wikitext' })); }
  catch (_) { r = await apiCall('post', Object.assign({}, common, { totext: newFull, tocontentmodel: 'wikitext' })); } // 旧站点的参数名
  if (!r.compare || r.compare.body == null) throw new Error(_M('diff.noResult'));
  return r.compare.body;
}
const clip = (x, n) => { x = x.replace(/\s+/g, ' ').trim(); return x.length > n ? x.slice(0, n) + '…' : x; };

// ── 转换预览的 DOM diff：块 = 渲染容器的直接子节点（纯文本节点 / 转换词 / 屏蔽块 / 标题 / ref…） ──
/** 一个块的签名：文本节点取文字；元素取 outerHTML + 其中所有 tooltip 的内容（规则来源变了也算差异） */
function blockSig(n) {
  if (n.nodeType === 3) return 'T' + n.data;
  const tips = [n, ...n.querySelectorAll('[data-lc-tip]')].filter(x => x._lcTip).map(x => x._lcTip.map(l => l.text + '\x02' + (l.page || '')).join('\n'));
  return 'E' + n.outerHTML + (tips.length ? '\x00' + tips.join('\x01') : '');
}
/** 两个签名数组的差异区间 [{a0,a1,b0,b1}]（半开区间，下标相对完整数组）。先剥公共前后缀，中间用 LCS；太大就不细分 */
function diffHunks(A, B) {
  let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let qa = A.length, qb = B.length; while (qa > p && qb > p && A[qa - 1] === B[qb - 1]) { qa--; qb--; }
  const n = qa - p, m = qb - p;
  if (!n && !m) return [];
  if (n * m > 4e6) return [{ a0: p, a1: qa, b0: p, b1: qb }];
  const w = m + 1, L = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i * w + j] = A[p + i] === B[p + j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1]);
  const hunks = []; let i = 0, j = 0, cur = null;
  while (i < n || j < m) {
    if (i < n && j < m && A[p + i] === B[p + j]) { if (cur) { hunks.push(cur); cur = null; } i++; j++; continue; }
    if (!cur) cur = { a0: p + i, a1: p + i, b0: p + j, b1: p + j };
    if (j < m && (i >= n || L[i * w + j + 1] >= L[(i + 1) * w + j])) { j++; cur.b1 = p + j; } else { i++; cur.a1 = p + i; }
  }
  if (cur) hunks.push(cur);
  return hunks;
}
/** 对 oldC / newC 两个已渲染的容器做 DOM diff，返回并排视图：左 改前，右 改后；只保留有差异的块（把节点从两个容器里挪过来） */
function domDiffView(ui, oldC, newC) {
  const A = [...oldC.childNodes], B = [...newC.childNodes];
  const hunks = diffHunks(A.map(blockSig), B.map(blockSig));
  const root = el('div', { className: 'lc-dfroot' }); root.classList.toggle('lc-dots', ui.dots.checked);
  root.appendChild(el('div', { className: 'lc-dfrow' }, [el('div', { className: 'lc-dfh old', textContent: _M('diff.before') }), el('div', { className: 'lc-dfh new', textContent: _M('diff.after') })]));
  if (!hunks.length) { root.appendChild(el('div', { className: 'lc-dfnone', textContent: _M('diff.noRenderDifference') })); return root; }
  hunks.forEach((h, k) => {
    if (k) root.appendChild(el('div', { className: 'lc-dfgap', textContent: _M('diff.skippedBlocks', h.a0 - hunks[k - 1].a1) }));
    const row = el('div', { className: 'lc-dfrow' });
    for (const [cls, nodes] of [['old', A.slice(h.a0, h.a1)], ['new', B.slice(h.b0, h.b1)]]) {
      const cell = el('div', { className: 'lc-dfc lc-flow ' + cls });
      if (!nodes.length) { cell.classList.add('empty'); cell.textContent = _M('diff.none'); }
      else for (const nd of nodes) cell.appendChild(nd);
      row.appendChild(cell);
    }
    root.appendChild(row);
  });
  return root;
}
function openConfirm(ui, ed, newPiece, adj) { // adj：改写成 [[ABC|def]] 的方案，范围与内容以它为准
  const baseRev = cfg('wgRevisionId'), baseSrc = curSrc, s = adj ? adj.s : ed.s, e = adj ? adj.e : ed.e;
  if (adj) newPiece = adj.piece;
  const newFull = baseSrc.slice(0, s) + newPiece + baseSrc.slice(e);
  const L = lineSpan(baseSrc, s, e);
  const oldLine = baseSrc.slice(L.a, L.b), newLine = baseSrc.slice(L.a, s) + newPiece + baseSrc.slice(e, L.b);
  const snap = ruleSnap(L.a); // 这一行开始时已生效的规则（-{H|}-、noteTA、公共转换组）
  const affects = /-\{|noteta/i.test(baseSrc.slice(s, e)) || /-\{|noteta/i.test(newPiece);
  const l1 = lineOf(s), l2 = lineOf(Math.max(s, e - 1));
  const sumDef = _M('confirm.summary', l1 === l2 ? l1 : l1 + '–' + l2, clip(baseSrc.slice(s, e), 24) || _M('common.empty'), clip(newPiece, 24) || _M('common.empty'));

  const renderTo = text => { // 把一段源码按“这一行开始时的规则”渲染到一个游离容器里
    const c = el('div');
    if (text.trim()) renderLC([...tokenizeWikitext(text, latest.tables, { mode: latest.mode, groups: latest.groups, rules: snap, headings: true })], c);
    return c;
  };
  const pvSec = (() => {
    try {
      const root = domDiffView(ui, renderTo(oldLine), renderTo(newLine)); // 左 改前，右 改后；只留有差异的块
      install(root, { pageUrl: t => mw.util.getUrl(t) }); // 不带编辑钩子：预览区只有悬停提示
      return root;
    } catch (err) { return el('div', { className: 'lc-warn', textContent: _M('confirm.previewFailed', err.message) }); }
  })();
  const diffBox = el('div', { className: 'lc-diffbox', textContent: _M('confirm.requestingDiff') });
  const sum = el('input', { type: 'text', className: 'lc-sum', value: sumDef, maxLength: 480 });
  const msg = el('div', { className: 'lc-cfmsg' });
  const back = el('button', { textContent: _M('confirm.back') }), ok = el('button', { textContent: _M('confirm.ok'), className: 'pri', disabled: true }), cancel = el('button', { textContent: _M('common.cancel') });
  const box = el('div', { className: 'lc-cfo' }, [el('div', { className: 'lc-cf', tabIndex: -1 }, [
    el('div', { className: 'lc-cfh' }, [el('b', { textContent: _M('confirm.ok') }), _M('confirm.headerLines', l1 === l2 ? l1 : l1 + '–' + l2)]),
    affects ? el('div', { className: 'lc-warn', textContent: _M('confirm.affectsLater') }) : '',
    adj ? el('div', { className: 'lc-warn', textContent: _M('confirm.rewrittenAsPipe', clip(newPiece, 80), clip(adj.target, 40)) }) : '',
    el('div', { className: 'lc-sec' }, [_M('confirm.conversionDiff')]), pvSec,
    el('div', { className: 'lc-sec' }, [_M('confirm.sourceDiff')]), diffBox,
    el('label', { className: 'lc-sumrow' }, [_M('confirm.summaryLabel'), sum]), msg,
    el('div', { className: 'lc-edb' }, [back, ok, cancel, el('span', { className: 'lc-edtip', textContent: _M('confirm.tip') })])
  ])]);
  const cf = { box, saving: false, diff: 'loading' };
  const syncOk = () => { ok.disabled = cf.diff === 'loading' || cf.saving; };
  cf.key = ev => {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); if (!cf.saving) closeConfirm(); }
    else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); ev.stopPropagation(); if (!ok.disabled) ok.click(); } // 快捷键同样遵守“diff 加载完才能确认”
  };
  document.addEventListener('keydown', cf.key, true);
  back.onclick = () => { if (!cf.saving) closeConfirm(); };
  cancel.onclick = () => { if (cf.saving) return; closeConfirm(); closeEditor(); };
  ok.onclick = async () => {
    if (cf.saving || cf.diff === 'loading') return;
    cf.saving = true; syncOk(); msg.textContent = _M('common.committing');
    try {
      // 再校验一次：区间必须仍是原文
      if (curSrc !== baseSrc || cfg('wgRevisionId') !== baseRev) throw { code: 'lc-stale', message: _M('confirm.staleDuringConfirm') };
      const r = await apiCall('postWithEditToken', { action: 'edit', pageid: cfg('wgArticleId'), text: newFull, summary: sum.value.trim() || sumDef, baserevid: baseRev, nocreate: 1, formatversion: 2 });
      const E = r.edit || {};
      if (E.result !== 'Success') throw { code: E.captcha ? 'captcha' : (E.result || 'failure'), message: E.captcha ? _M('save.captcha') : _M('save.failed'), data: r };
      closeConfirm(); closeEditor();
      if (E.nochange || !E.newrevid) { notify(_M('save.noChange')); return; }
      // 提交成功：用 newrevid 重新拉源码（服务器可能做了保存前转换或三方合并），全量重转换；编辑模式保持开启
      let flash = null;
      try {
        const nt = await fetchRev(E.newrevid);
        const keep = nt.slice(0, s) === baseSrc.slice(0, s); // 前文没变，位置才可信
        if (keep) flash = { s, e: Math.max(s, s + newPiece.length + (nt.length - newFull.length)) };
        curSrc = nt; srcP = Promise.resolve(nt); mw.config.set({ wgRevisionId: E.newrevid, wgCurRevisionId: E.newrevid });
        notify(_M('confirm.saved', E.newrevid));
        await convert(ui, { keepScroll: true, flash });
      } catch (err) { notify(_M('sync.savedButSyncFailedReconvert', err.message)); }
    } catch (err) {
      cf.saving = false; syncOk();
      msg.textContent = errText(err);
      if (err && err.code === 'editconflict') { // 冲突：先同步到最新，再让用户重新编辑
        try { const rev = await latestPageRev(); if (rev) { closeConfirm(); if (ED.ed) ED.ed.stale = true; if (ED.ed) ED.ed.msg(_M('confirm.editConflict')); await syncTo(ui, rev); } } catch (_) { /* 忽略 */ }
      }
    }
  };
  sum.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.ctrlKey && !ev.metaKey) { ev.preventDefault(); if (!ok.disabled) ok.click(); } });
  ED.cf = cf; ed.show(false); document.body.appendChild(box); if (editApi) editApi.reset();

  // 服务器 diff：弹窗打开时自动请求；失败也允许确认，但给出警告
  loadDiff(baseRev, newFull).then(body => {
    if (ED.cf !== cf) return;
    cf.diff = 'ok';
    if (!String(body).trim()) { diffBox.textContent = _M('confirm.noSourceDiff'); }
    else {
      diffBox.innerHTML = '<table class="diff diff-type-table diff-contentalign-left diff-editfont-monospace"><colgroup><col class="diff-marker"><col class="diff-content"><col class="diff-marker"><col class="diff-content"></colgroup><tbody>' + body + '</tbody></table>';
    }
    syncOk();
  }).catch(err => {
    if (ED.cf !== cf) return;
    cf.diff = 'fail'; diffBox.textContent = ''; diffBox.appendChild(el('div', { className: 'lc-warn', textContent: _M('confirm.diffLoadFailed', errText(err)) }));
    syncOk();
  });
  // 打开弹窗时顺带查一次最新版本号：已变就先同步并提示，不让用户在旧位置上继续写
  latestPageRev().then(rev => {
    if (ED.cf !== cf || !rev || rev === baseRev) return;
    closeConfirm();
    if (ED.ed) { ED.ed.stale = true; ED.ed.msg(_M('confirm.newVersionDuringEdit', rev)); }
    notify(_M('confirm.newVersionSynced'));
    syncTo(ui, rev).catch(e2 => notify(_M('sync.failed', e2.message)));
  }).catch(() => { /* 查不到就算了，保存时 baserevid 还会兜底 */ });
  sum.focus();
}
window.addEventListener('beforeunload', ev => { if (edDirty()) { ev.preventDefault(); ev.returnValue = ''; } });

function init() {
  if (mw.config.get('wgNamespaceNumber') < 0 || mw.config.get('wgPageContentModel') !== 'wikitext') return;
  const host = document.getElementById('mw-content-text'); if (!host) return;
  injectCss(document);
  document.head.appendChild(el('style', { id: 'lc-page-css', textContent: PAGE_CSS }));
  const skinCss = SKIN_CSS[mw.config.get('skin')]; if (skinCss) document.head.appendChild(el('style', { id: 'lc-skin-css', textContent: skinCss }));
  document.head.appendChild(el('style', { id: 'lc-gadget-css', textContent: GADGET_CSS }));
  const exit = new URL(location.href); exit.searchParams.delete('lcdebug');
  const ui = {
    out: el('div', { id: 'lc-out', className: 'lc-flow' }), status: el('span', { id: 'lc-status' }),
    dots: el('input', { type: 'checkbox' }), blind: el('input', { type: 'checkbox' }), refs: el('input', { type: 'checkbox' }),
    go: el('button', { textContent: _M('toolbar.reconvert') }), tocList: el('ol'), tocBtn: el('button', { textContent: _M('dock.tocTitle'), title: _M('toolbar.tocToggleTip') }),
    chk: el('button', { textContent: _M('dock.ntaTitle'), disabled: true }), nta: null, report: null,
    edit: el('button', { textContent: _M('toolbar.edit') }), editWhy: el('span', { className: 'lc-why' })
  };
  ui.edit.onclick = () => setEdit(ui, !editMode);
  refreshEdit(ui);
  ui.go.onclick = () => convert(ui);
  ui.chk.onclick = () => toggleNTA(ui);
  ui.blind.onchange = () => convert(ui, { keepScroll: true, anchor: true }); // 源码没变，只是换渲染：回到刚才看的那段
  ui.dots.onchange = () => setDots(ui.out, ui.dots.checked);
  ui.refs.onchange = () => setAllOpen(ui.out, ui.refs.checked);
  const bar = el('div', { id: 'lc-bar' }, [
    el('b', { textContent: _M('app.title') }), ui.go, ui.edit, ui.editWhy,
    el('label', {}, [ui.dots, _M('toolbar.dots')]), el('label', {}, [ui.blind, _M('toolbar.blind')]), el('label', {}, [ui.refs, _M('toolbar.expandAll')]),
    ui.status, el('span', { className: 'sp' }), el('a', { href: exit.href, textContent: _M('toolbar.exit') })
  ]);
  const wrap = el('div', { id: 'lc-wrap' }, [bar, ui.out]);
  if (document.getElementById('wpTextbox1')) host.insertBefore(wrap, host.firstChild); // 编辑页：加在编辑框上方
  else { host.textContent = ''; host.appendChild(wrap); } // 阅读页：整体替换正文
  installDock(ui);
  editApi = install(ui.out, {
    blindFn: (text, rules, base) => [...tokenizeWikitext(text, latest.tables, { mode: 'blind', groups: latest.groups, rules, base })], // 带上该块之前生效的规则；base 让盲检出来的词和文字仍是整页绝对位置
    pageUrl: t => mw.util.getUrl(t),
    toHant: text => scriptConvert(text, latest.tables['zh-hant']), // 判断繁简差异是否只是字形（PWVCST）
    isEdit: () => editMode, getSrc: () => curSrc, onEdit: r => openEditor(ui, r)
  });
  convert(ui);
}

mw.loader.using(['mediawiki.api', 'mediawiki.util']).then(() => {
  $(() => {
    if (new URLSearchParams(location.search).get('lcdebug') === '1') { init(); return; }
    if (mw.config.get('wgNamespaceNumber') < 0 || mw.config.get('wgPageContentModel') !== 'wikitext') return;
    const u = new URL(location.href); u.searchParams.set('lcdebug', '1'); // 工具箱里的入口：跳转到本页的 ?lcdebug=1
    mw.util.addPortletLink('p-tb', u.href, _M('app.title'), 't-lcdebug', _M('app.enterTip'));
  });
});
})();
/* @preserve
 * </nowiki>
 * @endpreserve
 */