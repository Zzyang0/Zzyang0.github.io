// ============================================================
//  Interface text in both languages + the language switch.
// ============================================================
export const UI = {
  en: {
    "nav.home": "home", "nav.profile": "about", "nav.footprints": "footprints", "nav.experience": "experience",
    "nav.projects": "projects", "nav.skills": "skills", "nav.resume": "resume", "nav.log": "log", "nav.contact": "contact",

    "mode.simple": "Simple", "mode.sql": "SQL",
    "mode.tip.simple": "Simple view: clean cards for everyone",
    "mode.tip.sql": "SQL view: tables and queries for the techy crowd",
    "hint.simple": "Into databases?", "hint.simple.btn": "Try the SQL view",
    "hint.sql": "Want it plain and friendly?", "hint.sql.btn": "Switch to Simple view",

    "hero.conn": "CONNECTED TO",
    "hero.placeholder.simple": "Search my site: projects, skills, Python, Seattle…",
    "hero.placeholder.sql": "SELECT * FROM projects WHERE year >= 2024;",
    "hero.run": "GO",

    "sec.profile.title": "About me", "sec.profile.sub": "Who I am, in one record.",
    "sec.footprints.title": "Footprints", "sec.footprints.sub": "The world is one big database. Every place I've lived left a row.",
    "sec.experience.title": "Experience", "sec.experience.sub": "Where I've worked, and what I did there.",
    "sec.education.title": "Education", "sec.education.sub": "Where I studied.",
    "sec.projects.title": "Projects", "sec.projects.sub": "Things I've built. See them as cards, as a heatmap, or as a table.",
    "sec.skills.title": "Skills", "sec.skills.sub": "My toolkit, rated honestly from 1 to 5, plus what I'm learning now.",
    "sec.resume.title": "Resume", "sec.resume.sub": "Read it here, or take a copy. Available in English and 中文.",
    "sec.log.title": "Log", "sec.log.sub": "Notes, photos, and things worth remembering.",
    "sec.contact.title": "Contact", "sec.contact.sub": "Say hi. Pick whichever channel suits you.",

    "fp.drag": "drag to spin · tap a place to fly there",
    "card.drag": "drag to flip",
    "proj.all": "all",
    "proj.view": "View on GitHub",
    "proj.private": "Repo not published",
    "tbl.proj": ["#", "name", "stack", "year", ""],
    "tbl.exp": ["#", "company", "title", "period", "place", ""],
    "tbl.edu": ["school", "degree", "gpa", "period", "diploma"],
    "tbl.fp": ["#", "city", "region", "when"],
    "tbl.skills": ["category", "skill", "level"],
    "tbl.log": ["date", "type", "title", "tags"],
    "tbl.contact": ["channel", "handle"],
    "tbl.resume": ["lang", "file", "action"],
    "edu.diploma": "View diploma",
    "resume.open": "Open in new tab",
    "resume.dl": "Download",
    "resume.note": "Can't see the preview? Your browser may block embedded PDFs, so use the buttons above. My phone number is left off on purpose; email me and I will share it.",
    "log.photo": "photo", "log.article": "article", "log.loading": "loading…",
    "contact.signoff": "Connection stays open. Drop me a line anytime.",
    "rows": (n) => `${n} row${n === 1 ? "" : "s"}`,
    "prev": "prev", "next": "next",
    "footer.built": "built with three.js · served from",
    "visit.label": (n) => `${n} visits`,
    "visit.tip": "Anonymous visit counter. No IP address is stored.",
    "loader.title": "LOADING", "loader.sub": "connecting to frank.db",
    "con.help": [
      "Just type a section name: about · footprints · experience · projects · skills · resume · log · contact",
      "Or try:  whoami · show tables",
      "SQL works too:  SELECT * FROM projects WHERE tag = 'python';",
    ],
    "search.count": (n) => `${n} result${n === 1 ? "" : "s"}`,
    "search.none": (q) => `No results for "${q}". Try "projects", "resume" or "Python".`,
    "search.hint": "↑ ↓ to move · Enter to open · Esc to clear",
    "kind.page": "page", "kind.about": "about", "kind.place": "place", "kind.job": "work", "kind.school": "school",
    "kind.project": "project", "kind.skill": "skill", "kind.learning": "learning", "kind.resume": "resume", "kind.log": "log", "kind.contact": "contact",
    "sql.open": "open page", "sql.match": "Matching commands", "sql.hint": "↑ ↓ to move · Tab to complete · Enter to run · Esc to close", "sql.cheat": "Try one of these (click to run):", "sql.empty": "Empty set",
    "sql.rows": (n, s) => `${n} row${n === 1 ? "" : "s"} in set (${s} sec)`,
    "proj.v.cards": "Cards", "proj.v.heatmap": "Heatmap", "proj.v.table": "Table",
    "proj.close": "close",
    "heat.none": "Contribution data isn't available yet. Run update-github.ps1 to fetch it.",
    "heat.months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "heat.tip": (n, d) => `${n} contribution${n === 1 ? "" : "s"} on ${d}`,
    "heat.total": (n) => `${n} contributions`,
    "heat.fit": "Fit all", "heat.detail": "Detail view", "heat.contrib": "contributions", "heat.days": "active days", "heat.repos": "public repos", "heat.less": "less", "heat.more": "more", "heat.project": "project start",
    "heat.source": (d) => `Source: public GitHub activity, updated ${d}. Yellow diamonds mark when a project began.`,
    "learn.title": "Now learning", "learn.sub": "Ongoing study. Not on the 1–5 scale yet.", "learn.status": "in progress",
    "contact.headline": "Let's talk.",
    "contact.lead": "Ideas, collaborations, or just a good conversation about data, semiconductor tech and food. My inbox is open.",
    "contact.email": "Email me", "contact.copy": "Copy", "contact.copied": "Copied!",
    "contact.time": "local time", "contact.lang": "languages", "contact.where": "based in", "contact.find": "Find me elsewhere",    "docs.resume.title": "Resume available on request",
    "docs.resume.text": "I keep my resume off the public web. Send me a quick email or message me on LinkedIn and I'll share the latest English or 中文 version.",
    "docs.diploma": "Diploma available on request",    "con.go": "opening",
    "con.notfound": (q) => `Hmm, I don't have "${q}". Type 'help' to see what's here.`,
    "con.denied": "Permission denied. Nice try :)",
    "con.food": "MICHELIN Dish is coming soon. Opening the log…",
  },
  zh: {
    "nav.home": "首页", "nav.profile": "关于", "nav.footprints": "足迹", "nav.experience": "经历",
    "nav.projects": "项目", "nav.skills": "技能", "nav.resume": "简历", "nav.log": "日志", "nav.contact": "联系",

    "mode.simple": "简洁", "mode.sql": "SQL",
    "mode.tip.simple": "简洁视图：清爽的卡片，人人都能看懂",
    "mode.tip.sql": "SQL 视图：表格与查询语句，给技术同好",
    "hint.simple": "喜欢数据库？", "hint.simple.btn": "试试 SQL 视图",
    "hint.sql": "想看更直观的版本？", "hint.sql.btn": "切换到简洁视图",

    "hero.conn": "已连接至",
    "hero.placeholder.simple": "搜索全站：项目、技能、Python、西雅图…",
    "hero.placeholder.sql": "SELECT * FROM projects WHERE year >= 2024;",
    "hero.run": "前往",

    "sec.profile.title": "关于我", "sec.profile.sub": "用一条记录介绍我自己。",
    "sec.footprints.title": "足迹", "sec.footprints.sub": "世界是一个巨大的数据库，我住过的每个地方都留下了一行记录。",
    "sec.experience.title": "工作经历", "sec.experience.sub": "我在哪里工作过，做了什么。",
    "sec.education.title": "教育背景", "sec.education.sub": "我读过的学校。",
    "sec.projects.title": "项目", "sec.projects.sub": "我做过的东西，可以用卡片、热力图或表格来看。",
    "sec.skills.title": "技能", "sec.skills.sub": "我的工具箱（1 到 5 分如实自评），以及正在学习的内容。",
    "sec.resume.title": "简历", "sec.resume.sub": "在线查看，也可以下载。提供英文和中文两个版本。",
    "sec.log.title": "日志", "sec.log.sub": "随笔、照片，和值得记住的事。",
    "sec.contact.title": "联系方式", "sec.contact.sub": "欢迎打招呼，选你最方便的方式。",

    "fp.drag": "拖动旋转地球 · 点击地点飞过去",
    "card.drag": "拖动翻转",
    "proj.all": "全部",
    "proj.view": "在 GitHub 查看",
    "proj.private": "仓库未公开",
    "tbl.proj": ["#", "名称", "技术栈", "年份", ""],
    "tbl.exp": ["#", "公司", "职位", "时间", "地点", ""],
    "tbl.edu": ["学校", "学位", "GPA", "时间", "毕业证"],
    "tbl.fp": ["#", "城市", "地区", "时间"],
    "tbl.skills": ["类别", "技能", "熟练度"],
    "tbl.log": ["日期", "类型", "标题", "标签"],
    "tbl.contact": ["渠道", "账号"],
    "tbl.resume": ["语言", "文件", "操作"],
    "edu.diploma": "查看毕业证",
    "resume.open": "新标签页打开",
    "resume.dl": "下载",
    "resume.note": "看不到预览？可能是浏览器禁止了内嵌 PDF，请使用上方按钮。简历中特意没有放手机号，需要的话请发邮件联系我。",
    "log.photo": "照片", "log.article": "文章", "log.loading": "加载中…",
    "contact.signoff": "连接一直开着，随时来信。",
    "rows": (n) => `${n} 条记录`,
    "prev": "上一页", "next": "下一页",
    "footer.built": "使用 three.js 构建 · 数据来自",
    "visit.label": (n) => `累计访问 ${n} 次`,
    "visit.tip": "匿名访问计数，不会记录 IP 地址。",
    "loader.title": "LOADING", "loader.sub": "正在连接 frank.db",
    "con.help": [
      "直接输入想看的内容：关于 · 足迹 · 经历 · 项目 · 技能 · 简历 · 日志 · 联系",
      "或者试试：我是谁 · show tables",
      "也支持 SQL：SELECT * FROM projects WHERE tag = 'python';",
    ],
    "search.count": (n) => `${n} 条结果`,
    "search.none": (q) => `没有找到「${q}」。试试「项目」、「简历」或「Python」。`,
    "search.hint": "↑ ↓ 选择 · 回车打开 · Esc 清除",
    "kind.page": "页面", "kind.about": "关于", "kind.place": "足迹", "kind.job": "工作", "kind.school": "学校",
    "kind.project": "项目", "kind.skill": "技能", "kind.learning": "学习中", "kind.resume": "简历", "kind.log": "日志", "kind.contact": "联系",
    "sql.open": "打开页面", "sql.match": "匹配的命令", "sql.hint": "↑ ↓ 选择 · Tab 补全 · 回车运行 · Esc 关闭", "sql.cheat": "试试这些（点击即可运行）：", "sql.empty": "空结果",
    "sql.rows": (n, s) => `${n} 行，用时 ${s} 秒`,
    "proj.v.cards": "卡片", "proj.v.heatmap": "热力图", "proj.v.table": "表格",
    "proj.close": "关闭",
    "heat.none": "暂时没有贡献数据，请运行 update-github.ps1 获取。",
    "heat.months": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    "heat.tip": (n, d) => `${d}：${n} 次贡献`,
    "heat.total": (n) => `${n} 次贡献`,
    "heat.fit": "总览", "heat.detail": "细节视图", "heat.contrib": "次贡献", "heat.days": "活跃天数", "heat.repos": "公开仓库", "heat.less": "少", "heat.more": "多", "heat.project": "项目开始",
    "heat.source": (d) => `数据来自 GitHub 公开记录，更新于 ${d}。黄色菱形表示项目开始的日期。`,
    "learn.title": "正在学习", "learn.sub": "持续学习中，暂未纳入 1–5 分评级。", "learn.status": "学习中",
    "contact.headline": "聊聊吧。",
    "contact.lead": "无论是想法、合作，还是关于数据、半导体技术和美食的闲聊，我的邮箱随时开着。",
    "contact.email": "发邮件给我", "contact.copy": "复制", "contact.copied": "已复制！",
    "contact.time": "当地时间", "contact.lang": "语言", "contact.where": "所在地", "contact.find": "在其他平台找到我",    "docs.resume.title": "简历可按需提供",
    "docs.resume.text": "为保护隐私，简历没有公开放在网页上。欢迎发邮件或在 LinkedIn 联系我，我会发送最新的中文或英文版本。",
    "docs.diploma": "毕业证可按需提供",    "con.go": "正在打开",
    "con.notfound": (q) => `没有找到「${q}」。输入「帮助」看看有什么。`,
    "con.denied": "权限不足，想得美 :)",
    "con.food": "MICHELIN Dish 即将上线，正在打开日志…",
  },
};

let lang = "en";
try {
  const saved = new URLSearchParams(location.search).get("lang") || localStorage.getItem("lang");
  if (saved === "en" || saved === "zh") lang = saved;
  else if ((navigator.language || "").toLowerCase().startsWith("zh")) lang = "zh";
} catch {}

export const getLang = () => lang;
export function setLang(l) {
  lang = l;
  try { localStorage.setItem("lang", l); } catch {}
  document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
}
document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

// pick the right language from a {en, zh} field, or return plain values as-is
export const t = (v) => (v && typeof v === "object" && !Array.isArray(v) && "en" in v ? (v[lang] ?? v.en) : v);
// interface string by key
export const ui = (key, ...args) => {
  const v = UI[lang][key] ?? UI.en[key] ?? key;
  return typeof v === "function" ? v(...args) : v;
};
