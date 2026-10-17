// ============================================================
//  FRANK.DB — all site content lives here.
//  Bilingual fields are written as { en: "...", zh: "..." }.
//  Plain strings are shown the same in both languages.
// ============================================================

export const profile = {
  name: "Tzuyang Lin",
  aka: "Frank",
  name_zh: "林子洋",
  role: { en: "Data Analyst", zh: "数据分析师" },
  // shown under the name in the hero: titles, not tools
  titles: [
    { en: "Data Analyst", zh: "数据分析师" },
    { en: "Field Deployment Engineer", zh: "现场部署工程师" },
    { en: "Tech Explorer", zh: "科技探索者" },
    { en: "R&B Lover", zh: "R&B 爱好者" },
    { en: "Foodie", zh: "美食爱好者" },
  ],
  motto: {
    en: "Data earns its value by serving people.",
    zh: "数据，因服务于人而有价值。",
  },
  tagline: {
    en: "Data earns its value by serving people.",
    zh: "数据，因服务于人而有价值。",
  },
  based_in: { en: "Shanghai, CN", zh: "上海" },
  photo: "assets/photos/polaroid.jpg",
  resume: { en: "assets/resume-public/Tzuyang_Lin_Resume.pdf", zh: "assets/resume-public/Tzuyang_Lin_Resume_zh.pdf" },
  resumes: [
    { lang: "en", label: "English", file: "assets/resume-public/Tzuyang_Lin_Resume.pdf", preview: "assets/resume-public/Tzuyang_Lin_Resume.jpg", download: "Tzuyang_Lin_Resume.pdf" },
    { lang: "zh", label: "中文", file: "assets/resume-public/Tzuyang_Lin_Resume_zh.pdf", preview: "assets/resume-public/Tzuyang_Lin_Resume_zh.jpg", download: "林子洋_简历.pdf" },
  ],
  bio: {
    en: [
      "I'm Frank: a data analyst who likes taking messy, real-world data and turning it into something people can actually use.",
      "I studied Economics + Informatics at the University of Washington, then did a Master of Analytics (IEOR) at UC Berkeley. Since then I've built ETL pipelines, dashboards and analysis for clean-energy and carbon-removal teams.",
      "Outside of work I'm a tech explorer who can't stop trying new tools, and a self-declared cookholic.",
    ],
    zh: [
      "我是林子洋（Frank），一名数据分析师。我喜欢从繁杂的真实数据中找到问题，并把它变成大家真正用得上的结论。",
      "本科就读于华盛顿大学（经济学，辅修信息学），之后在加州大学伯克利分校完成分析学硕士。毕业后为清洁能源与碳移除团队搭建 ETL 流水线、数据看板，并做业务分析。",
      "工作之外，我是一个停不下来尝试新技术的科技爱好者，也是一个自封的「做饭狂魔」。",
    ],
  },
  fields: [
    [{ en: "name", zh: "姓名" }, { en: "Tzuyang Lin", zh: "林子洋" }],
    [{ en: "aka", zh: "英文名" }, "Frank"],
    [{ en: "titles", zh: "身份" }, { en: "Data Analyst · Field Deployment Engineer · Tech Explorer · R&B Lover · Foodie", zh: "数据分析师 · 现场部署工程师 · 科技探索者 · R&B 爱好者 · 美食爱好者" }],
    [{ en: "based in", zh: "所在地" }, { en: "Shanghai, CN", zh: "中国上海" }],
    [{ en: "education", zh: "教育" }, { en: "UC Berkeley · M. Analytics '25  /  UW · B.A. Econ + Info '24", zh: "伯克利 · 分析学硕士 '25 ／ 华盛顿大学 · 经济学学士 '24" }],
    [{ en: "interests", zh: "爱好" }, { en: "new tech · cooking · photography · travel", zh: "新科技 · 做饭 · 摄影 · 旅行" }],
    [{ en: "motto", zh: "信条" }, { en: "Data earns its value by serving people.", zh: "数据，因服务于人而有价值。" }],
  ],
};

export const contact = [
  { key: "email", icon: "fa-solid fa-envelope", label: "franklin532232@gmail.com", url: "mailto:franklin532232@gmail.com" },
  { key: "github", icon: "fa-brands fa-github", label: "github.com/Zzyang0", url: "https://github.com/Zzyang0?tab=repositories" },
  { key: "linkedin", icon: "fa-brands fa-linkedin", label: "in/tzuyang-frank-lin", url: "https://www.linkedin.com/in/tzuyang-frank-lin-982b56225/" },
  { key: "instagram", icon: "fa-brands fa-instagram", label: "@zzyang0528", url: "https://www.instagram.com/zzyang0528/" },
  { key: "spotify", icon: "fa-brands fa-spotify", label: { en: "what I'm listening to", zh: "我最近在听的歌" }, url: "https://open.spotify.com/user/31qsjmnt4asnjqigdix4yb4bwlpu" },
];

// Places I've lived: drawn on the 3D globe in order.
// years: rough length of stay, used for the height of each data pillar.
export const footprints = [
  {
    id: "changhua", city: { en: "Changhua", zh: "彰化" }, region: { en: "Taiwan", zh: "台湾" },
    lat: 24.08, lng: 120.54, years: 3,
    when: { en: "born here", zh: "出生地" },
    note: { en: "Hometown. Where it all started.", zh: "家乡，一切开始的地方。" },
  },
  {
    id: "ningbo", city: { en: "Ningbo", zh: "宁波" }, region: { en: "Zhejiang, China", zh: "浙江" },
    lat: 29.87, lng: 121.54, years: 15, from: "2020-06", to: "2020-08",
    when: { en: "age 3 → 18", zh: "3 岁 → 18 岁" },
    note: { en: "Where I grew up.", zh: "我长大的地方。" },
  },
  {
    id: "seattle", city: { en: "Seattle", zh: "西雅图" }, region: { en: "Washington, US", zh: "美国华盛顿州" },
    lat: 47.61, lng: -122.33, years: 3.5, from: "2020-09", to: "2024-03",
    when: { en: "2020.09 → 2024.03", zh: "2020.09 → 2024.03" },
    note: { en: "University of Washington: Economics + Informatics.", zh: "华盛顿大学：经济学 + 信息学。" },
  },
  {
    id: "berkeley", city: { en: "Berkeley / SF", zh: "伯克利 / 旧金山" }, region: { en: "California, US", zh: "美国加州" },
    lat: 37.87, lng: -122.27, years: 1.2, from: "2024-08", to: "2025-08",
    when: { en: "2024.08 → 2025.08", zh: "2024.08 → 2025.08" },
    note: { en: "UC Berkeley: Master of Analytics (IEOR).", zh: "加州大学伯克利分校：分析学硕士。" },
  },
  {
    id: "newyork", city: { en: "New York", zh: "纽约" }, region: { en: "New York, US", zh: "美国纽约州" },
    lat: 40.71, lng: -74.01, years: 0.25, spans: [["2025-10", "2025-11"], ["2025-12", "2026-01"]],
    when: { en: "late Oct → Nov 5, then mid Dec → Jan 2026", zh: "10 月底 → 11 月 5 日，12 月中 → 2026 年 1 月底" },
    note: { en: "Two stays exploring the city.", zh: "两次小住，用来探索这座城市。" },
  },
  {
    id: "shanghai", city: { en: "Shanghai", zh: "上海" }, region: { en: "China", zh: "中国" },
    lat: 31.23, lng: 121.47, years: 0.6, from: "2026-10", to: null,
    when: { en: "from late Oct 2026", zh: "2026 年 10 月底起" },
    note: { en: "Next station: joining LaserTech as a Field Deployment Engineer (FDE).", zh: "下一站：加入 LaserTech，担任现场部署工程师（FDE）。" },
  },
];

export const education = [
  {
    school: { en: "University of California, Berkeley", zh: "加州大学伯克利分校" },
    short: { en: "UC Berkeley", zh: "伯克利" },
    degree: { en: "Master of Analytics (IEOR)", zh: "分析学硕士（工业工程与运筹学系）" },
    gpa: "3.88", scale: "4.0",
    diploma: "assets/diploma-preview/berkeley.jpg",
    period: "2024.08 → 2025.08",
    place: { en: "Berkeley, CA", zh: "美国加州伯克利" },
    courses: { en: "Database Analysis & Design · Machine Learning · Optimization (Gurobi) · Data Modeling & Statistics", zh: "数据库分析与设计 · 机器学习 · 优化分析（Gurobi）· 数据建模与统计" },
  },
  {
    school: { en: "University of Washington, Seattle", zh: "华盛顿大学西雅图分校" },
    short: { en: "UW Seattle", zh: "华盛顿大学" },
    degree: { en: "B.A. Economics · Minor in Informatics · Dean's List", zh: "经济学学士 · 辅修信息学 · 院长荣誉榜" },
    gpa: "3.85", scale: "4.0",
    diploma: "assets/diploma-preview/uw.jpg",
    period: "2020.09 → 2024.03",
    place: { en: "Seattle, WA", zh: "美国西雅图" },
    courses: { en: "Strategic Pricing · Computational Finance & Econometrics · Portfolio Optimization · Info Visualization · DBMS", zh: "战略定价数据科学 · 计算金融与计量经济学 · 投资组合优化 · 信息可视化 · 数据库管理系统" },
  },
];

export const experience = [
  {
    company: "LaserTech",
    title: { en: "Field Deployment Engineer (FDE)", zh: "现场部署工程师（FDE）" },
    period: "2026.10 → now",
    place: { en: "Shanghai, CN", zh: "上海" },
    tags: ["MES", "EAP", "SECS/GEM", "HPC", "field engineering"],
    points: {
      en: [
        "Installing, configuring and integration-testing tool control software and HPC image-processing systems at customer sites.",
        "Building and maintaining factory-automation communication modules (MES, EAP, SECS/GEM).",
        "Fast on-site troubleshooting, and feeding field issues back to the US R&D headquarters.",
      ],
      zh: [
        "在客户现场安装、配置并集成测试机台控制软件与 HPC 图像处理系统。",
        "开发与维护工厂自动化通信模块（MES / EAP / SECS-GEM）。",
        "现场快速排障，并把一线问题反馈给美国研发总部。",
      ],
    },
  },
  {
    company: "OnPoint Insights",
    title: { en: "Data Analyst", zh: "助理数据分析师" },
    period: "2025.10 → 2026.01",
    place: { en: "Remote, US", zh: "美国（远程）" },
    tags: ["python", "funnel", "segmentation"],
    points: {
      en: [
        "Cleaned and processed Mass Save energy-efficiency datasets in Python, comparing planned vs. actual Benefit-Cost Ratios to validate ROI compliance.",
        "Built frameworks for heat-pump installation trends and user segmentation, surfacing 40%+ YoY growth and coverage gaps in low-income demographics.",
        "Built an end-to-end conversion funnel for residential retrofits, quantifying a 15% target gap and pinpointing drop-off bottlenecks.",
      ],
      zh: [
        "运用 Python 清洗 Mass Save 能效数据，深入比对计划与实际 BCR 并验证投产效益达标，赋能项目绩效评估。",
        "建立热泵安装趋势与用户分层分析框架，识别年均 40%+ 增长动态及低收入人群覆盖短板。",
        "构建家庭节能改造全流程转化漏斗，测算 15% 目标落差并锁定核心流失断点，针对性输出优化建议。",
      ],
    },
  },
  {
    company: "Takachar",
    title: { en: "Data Dashboard & Web App Developer Intern", zh: "数据分析与应用开发实习生" },
    period: "2025.06 → 2025.08",
    place: { en: "Petaluma, CA", zh: "美国加州" },
    tags: ["streamlit", "etl", "tableau", "azure sql"],
    points: {
      en: [
        "Engineered a Streamlit + Python field-data platform with camera capture, geolocation and QR scanning, cutting submission time by 30%.",
        "Built an automated ETL pipeline feeding 40K+ environmental records into Tableau dashboards for weekly sequestration and compliance KPIs.",
        "Deployed a migration pipeline linking Kobo Toolbox, Azure SQL and SharePoint, eliminating manual file transfers.",
      ],
      zh: [
        "基于 Python 与 Streamlit 开发移动采集平台，集成拍照、GPS 与二维码扫描，多试点碳信用填报耗时降低 30%。",
        "搭建端到端 ETL 流水线，将 4 万+ 条环境监测时序数据接入 Tableau 自动化看板，实现 KPI 周度监控与合规预警。",
        "调用 KoboToolbox API 与 Microsoft Graph API 构建增量数据管道，将现场数据及媒体文件自动归档至 SharePoint。",
      ],
    },
  },
  {
    company: { en: "Big Data Investment Development Co.", zh: "大数据投资发展有限公司" },
    title: { en: "Data Analyst Intern", zh: "数据分析实习生" },
    period: "2023.07 → 2023.09",
    place: { en: "Ningbo, CN", zh: "浙江宁波" },
    tags: ["sql", "maxcompute", "data warehouse"],
    points: {
      en: [
        "Processed 100K+ provincial and municipal investment records with MaxCompute and Python, imputing and annotating data for reporting.",
        "Optimized queries with multi-table joins, window functions and CASE logic for a 7% retrieval-time improvement.",
        "Architected ODS → Data Warehouse ETL pipelines on MaxCompute.",
      ],
      zh: [
        "使用 Python 与 MaxCompute 清洗 10 万+ 条省市级投资数据，完成缺失值填补与质量校验，保障管理报表稳定输出。",
        "优化多表关联、窗口函数及 CASE 等复杂 SQL 查询，检索效率提升 7%。",
        "参与构建 ODS 至 DWH 的 ETL 流水线，统一数据加工口径并沉淀可复用数据层。",
      ],
    },
  },
];

// tags drive the filter buttons in the projects table
const allProjects = [
  {
    id: "massave", year: 2025, date: "2025-12-22", stack: ["Python", "Pandas", "Matplotlib"], tags: ["python", "analysis"],
    name: { en: "Mass Save Energy Efficiency Research", zh: "Mass Save 能效项目研究" },
    summary: {
      en: "15 years (2010–2025) of Massachusetts energy-efficiency program data: cost-to-deliver via Benefit-Cost Ratios, heat-pump adoption and equity, and the home-retrofit conversion funnel.",
      zh: "基于马萨诸塞州 2010–2025 年能效项目数据：用效益成本比（BCR）评估投入产出、分析热泵普及与公平性，并拆解家庭节能改造转化漏斗。",
    },
    url: "https://github.com/Zzyang0/MassSave_Project",
  },
  {
    id: "kobo", year: 2025, date: "2025-08-15", stack: ["Python", "Microsoft Graph", "OAuth2"], tags: ["python", "etl"],
    name: { en: "Kobo → SharePoint Direct Transfer Pipeline", zh: "Kobo → SharePoint 数据直传管道" },
    summary: {
      en: "Streams field media from Kobo Toolbox straight into SharePoint with no local storage: incremental uploads, duplicate detection, date-based naming and chunked uploads for large files. Built at Takachar.",
      zh: "将 Kobo Toolbox 的现场媒体文件直接传输至 SharePoint，无需本地存储；支持增量上传、重复检测、按日期命名及大文件分块上传。于 Takachar 实习期间开发。",
    },
    url: "https://github.com/Zzyang0/Takachar_kobo_sharepoint_pipeline",
  },
  {
    id: "accent", year: 2025, date: "2025-05-29", stack: ["PyTorch", "Hugging Face", "Flask"], tags: ["ml", "python", "web"],
    name: { en: "AccentRecognition: Wav2Vec2 Classifier", zh: "英语口音识别：Wav2Vec2 分类模型" },
    summary: {
      en: "Fine-tuned wav2vec2-base on 167K+ Common Voice clips to classify 11 English accents, with a Flask web UI for real-time MP3/WAV uploads.",
      zh: "基于 16.7 万+ 条 Common Voice 音频微调 wav2vec2-base，识别 11 种英语口音，并提供可实时上传 MP3/WAV 的 Flask 网页界面。",
    },
    url: "https://github.com/Zzyang0/AccentRecognition",
  },
  {
    id: "chronic", year: 2024, date: "2024-12-19", stack: ["Python", "scikit-learn", "Jupyter"], tags: ["ml", "python"],
    name: { en: "Chronic Disease Risk: Predictive Modeling & Clustering", zh: "慢性病风险：预测建模与聚类" },
    summary: {
      en: "Berkeley ML team project using NHANES survey data to predict chronic-disease risk and cluster patient profiles across five modeling notebooks.",
      zh: "伯克利机器学习课程团队项目：利用 NHANES 健康调查数据预测慢性病风险，并对人群画像进行聚类分析。",
    },
    url: "https://github.com/Zzyang0/ML-PROJECT-Predictive-Modeling-and-Clustering-for-Chronic-Disease-Risk",
  },
  {
    id: "portfolio-r", year: 2023, date: "2023-06-15", stack: ["R", "quantmod"], tags: ["r", "analysis"],
    name: { en: "Portfolio Return & Risk Assessment", zh: "ETF 资产组合优化与风险评估" },
    summary: {
      en: "60 months of Vanguard ETF prices: continuously compounded returns, bootstrap and empirical VaR at 1%/5%, and efficient frontiers with and without short-selling (13.6% annual return at reduced volatility).",
      zh: "使用 R 获取 5 只 ETF 的 60 个月价格数据，采用 Bootstrap 与历史分位数法估计 VaR，构建均值-方差有效前沿，筛选年化预期收益率 13.6% 的目标组合。",
    },
    url: null,
  },
  {
    id: "covid-py", year: 2022, date: "2022-03-16", stack: ["Python", "Plotly", "Dash", "Tableau"], tags: ["python", "viz"],
    name: { en: "COVID-19 Vaccination, Cases & Deaths Worldwide", zh: "全球新冠疫苗接种、病例与死亡分析" },
    summary: {
      en: "Global analysis of vaccination, cases and deaths with interactive Plotly/Dash visuals and a companion Tableau workbook.",
      zh: "全球疫苗接种、病例与死亡数据分析，配有 Plotly/Dash 交互图表与 Tableau 工作簿。",
    },
    url: "https://github.com/Zzyang0/Covid_19_analysis---Python",
  },
  {
    id: "covid-r", year: 2022, date: "2022-03-10", stack: ["R", "Shiny"], tags: ["r", "viz"],
    name: { en: "Global COVID-19 Vaccination Analysis (Shiny)", zh: "全球新冠疫苗接种分析（Shiny）" },
    summary: {
      en: "INFO 201 team project: an interactive Shiny app exploring vaccine adoption trends by brand and region.",
      zh: "INFO 201 课程团队项目：用 Shiny 交互应用探索各品牌、各地区的疫苗接种趋势。",
    },
    url: "https://github.com/Zzyang0/vaccination_visualization_inR",
  },
  {
    id: "dvogue", year: 2022, date: "2022-05-10", stack: ["JavaScript", "React", "Firebase"], tags: ["web"],
    name: { en: "Dvogue: Outfit Matching Web App", zh: "Dvogue：穿搭推荐网页应用" },
    summary: {
      en: "INFO 340 client-side app recommending outfits by weather, occasion, activity and budget, with saved items and pairing suggestions.",
      zh: "INFO 340 课程项目：根据天气、场合、活动与预算推荐穿搭，支持收藏单品与搭配建议。",
    },
    url: "https://github.com/Zzyang0/Cloth-web-Tzuyang-Lin",
  },
  {
    id: "healdish", year: 2022, date: "2022-01-23", stack: ["Product", "Design"], tags: ["web"],
    name: { en: "HealDish: WINFO Hackathon 2022", zh: "HealDish：2022 WINFO 黑客松" },
    summary: {
      en: "Affordable healthy eating: budget-aware recipes with video guides, plus a map to nearby food pantries and relief stations. Cooking + data, my two favorite things.",
      zh: "让健康饮食更平价：根据预算推荐带视频教程的食谱，并提供附近食物银行与救助站地图。做饭 + 数据，我最喜欢的两件事。",
    },
    url: "https://github.com/Zzyang0/HealDish",
  },
];

// Only projects that are published on GitHub are shown on the site.
export const projects = allProjects.filter((p) => p.url);

// level: 1–5
export const skills = [
  { group: { en: "languages", zh: "编程语言" }, icon: "fa-solid fa-code", items: [["Python", 5], ["SQL", 5], ["R", 4], ["JavaScript", 3], ["HTML / CSS", 3], ["Gurobi", 3]] },
  { group: { en: "analytics & ml", zh: "分析与机器学习" }, icon: "fa-solid fa-brain", items: [["Pandas / NumPy", 5], ["scikit-learn", 4], [{ en: "Statistical Modeling", zh: "统计建模" }, 4], [{ en: "Time Series", zh: "时间序列" }, 4], [{ en: "A/B Testing", zh: "A/B 测试" }, 3], ["XGBoost", 3], ["PyTorch", 2]] },
  { group: { en: "bi & viz", zh: "商业智能与可视化" }, icon: "fa-solid fa-chart-column", items: [["Tableau", 5], ["Matplotlib / Seaborn", 4], ["Plotly / Dash", 3], ["Streamlit", 4], ["Shiny", 3], ["Excel", 4]] },
  { group: { en: "data & cloud", zh: "数据库与工程" }, icon: "fa-solid fa-database", items: [["MySQL", 4], ["Azure SQL", 4], ["MaxCompute", 3], [{ en: "ETL Pipelines", zh: "ETL 流水线" }, 5], [{ en: "Data Warehousing", zh: "数据仓库" }, 4], ["SharePoint / Graph API", 3], ["Git", 4]] },
];

// type: "photo" (opens a gallery) or "article" (renders a markdown file)
// article files: give one per language; falls back to English.
export const log = [
  {
    id: "hello-world", type: "article", date: "2026-10-16", tags: ["meta"],
    title: { en: "hello_world.md", zh: "你好，世界" },
    excerpt: { en: "Why I finally finished this site, and what this log is for.", zh: "这个网站终于完成了，以及这里会写些什么。" },
    file: { en: "log/hello-world.md", zh: "log/hello-world.zh.md" },
  },
  {
    id: "point-reyes", type: "photo", date: "2025-01-01", tags: ["travel"],
    title: { en: "Point Reyes: shipwreck & coastline", zh: "雷斯岬：沉船与海岸线" },
    excerpt: { en: "Wind, waves, and an old boat that refuses to leave.", zh: "风、海浪，和一艘不肯离开的旧船。" },
    photos: ["assets/photos/coast-2.jpg", "assets/photos/shipwreck.jpg", "assets/photos/coast-1.jpg"],
  },
  {
    id: "berkeley", type: "photo", date: "2025-08-01", tags: ["milestone"],
    title: { en: "Graduated: UC Berkeley", zh: "毕业啦：伯克利" },
    excerpt: { en: "Master of Analytics, done. Frog keychain came along for the walk.", zh: "分析学硕士，顺利毕业。青蛙挂件也一起走完了这段路。" },
    photos: ["assets/photos/berkeley.jpg"],
  },
  {
    id: "indigo", type: "photo", date: "2024-01-01", tags: ["craft"],
    title: { en: "Indigo dyeing workshop", zh: "蓝染体验" },
    excerpt: { en: "Hands-on with a vat of indigo. Slow, analog, and very blue.", zh: "亲手体验一缸蓝靛。慢、手作，而且非常蓝。" },
    photos: ["assets/photos/indigo.jpg"],
  },
  {
    id: "michelin", type: "article", date: "2026-10-16", tags: ["food"],
    title: { en: "MICHELIN Dish", zh: "MICHELIN Dish" },
    excerpt: { en: "A foodie's star-rated dish table. First entries coming soon.", zh: "美食爱好者的星级菜品表，首批记录即将更新。" },
    file: { en: "log/michelin-dish.md", zh: "log/michelin-dish.zh.md" },
    icon: "fa-solid fa-star",
  },
];

// Ongoing: things I'm studying right now. Add `progress: 0-100` and/or a bilingual `note` to any item to show them.
const semi = { en: "Semiconductor industry", zh: "半导体行业" };
export const learning = [
  { name: "Linux", icon: "fa-brands fa-linux" },
  { name: "FAB", icon: "fa-solid fa-industry", note: semi },
  { name: "MAE", icon: "fa-solid fa-gears", note: semi },
  { name: "EAP", icon: "fa-solid fa-microchip", note: semi },
  { name: "HPC", icon: "fa-solid fa-server" },
  { name: "TCP/IP", icon: "fa-solid fa-network-wired" },
];

// Shown on the contact page.
export const contactInfo = {
  email: "franklin532232@gmail.com",
  timezone: "Asia/Shanghai",
  city: { en: "Shanghai", zh: "上海" },
  languages: "English · 中文",
};