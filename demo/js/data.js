// ============================================================
//  data.js — 所有游戏常量数据
// ============================================================

const ARCHETYPES = {
    social: {
        name: '社牛骨干', icon: '🗣️',
        desc: '社交+5，实践-2。擅长从队友嘴里套出好东西，但自己动手整合材料时容易翻车。',
        stats: { social: 15, practice: 8, sport: 10 },
        sanity: 80, bonusAP: 0
    },
    practice: {
        name: '科研达人', icon: '💻',
        desc: '实践+5，社交-3。嘴笨，不太能说服队友交出好材料，但拿到手的东西都能稳稳整合成成果。',
        stats: { social: 7, practice: 15, sport: 10 },
        sanity: 80, bonusAP: 0
    },
    sport: {
        name: '体育健将', icon: '🏃',
        desc: '体育+4。跑得比别人快一些，靠行动力弥补其他短板。',
        stats: { social: 10, practice: 10, sport: 14 },
        sanity: 80, bonusAP: 2
    }
};

const TEAMMATES = {
    pigeon: {
        name: '鸽子', icon: '🕊️', color: '#888',
        avatar: '../asset/鸽子-头像.png',
        qAvatar: '../asset/tool+role/人物小图标/鸽子Q版.png',
        trait: '文艺少女，经常在未名湖畔写生失联',
        catchDC: 10, speed: 2,
        materialType: 'code'
    },
    scrollKing: {
        name: '卷王', icon: '📜', color: '#f0c040',
        avatar: '../asset/卷王-头像.png',
        qAvatar: '../asset/tool+role/人物小图标/卷王Q版.png',
        trait: '想法天马行空但不落地',
        catchDC: 10, speed: 1,
        materialType: 'writing'
    },
    slacker: {
        name: '混子', icon: '😴', color: '#88cc88',
        avatar: '../asset/混子-头像.png',
        qAvatar: '../asset/tool+role/人物小图标/混子Q版.png',
        trait: '什么都马马虎虎',
        catchDC: 10, speed: 1,
        materialType: 'art'
    }
};

const LOCATIONS = [
    {
        id: 'lake', name: '未名湖畔', icon: '🌊',
        desc: '湖光塔影，偶有猫出没',
        likely: { pigeon: 0.5, scrollKing: 0.2, slacker: 0.3 },
        mapConfig: { gridSize: 8, cellSize: 56, obsCount: [8, 12], itemCount: 2, obsIcon: '🪨' }
    },
    {
        id: 'canteen', name: '家园食堂四层', icon: '🍜',
        desc: '人来人往，适合蹲守',
        likely: { pigeon: 0.2, scrollKing: 0.2, slacker: 0.6 },
        mapConfig: { gridSize: 7, cellSize: 60, obsCount: [10, 14], itemCount: 2, obsIcon: '🍽️' }
    },
    {
        id: 'library', name: '图书馆', icon: '📚',
        desc: '安静的自习圣地',
        likely: { pigeon: 0.1, scrollKing: 0.7, slacker: 0.2 },
        mapConfig: { gridSize: 9, cellSize: 50, obsCount: [6, 10], itemCount: 2, obsIcon: '📚' }
    }
];

// ==================== 随机事件 ====================

const RANDOM_EVENTS = [
    // ---- 原有增益 ----
    {
        name: '瑞幸的馈赠',
        desc: '你发现了一杯无人认领的生椰拿铁，心情瞬间好了起来。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: 5 }],
        item: { name: '瑞幸咖啡', icon: '☕', type: 'coffee' }
    },
    {
        name: '北大发',
        desc: '银行卡突然收到一笔款项："北大发（￥60）"。你决定犒劳自己。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: 8 }]
    },
    {
        name: '猫の祝福',
        desc: '你在未名湖跑步时遇到了一只猫，它看了你一眼，似乎理解你的痛苦。获得猫の祝福 buff！',
        type: 'buff',
        effects: [],
        buff: 'catBlessing'
    },
    // ---- 新增增益 ----
    {
        name: '股神的祝福',
        desc: '你按照神秘地震男子的指引纵横股市，满屏红色欣欣向荣，你忍不住放声小笑一番。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: 2 }]
    },
    {
        name: '文明的游客',
        desc: '忙碌了一天的你想要去未名湖放松身心，不料却在湖边发现一位对着湖水解决个人需求的游客，你默默掏出了手机。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: -2 }, { stat: 'social', value: 1 }]
    },
    {
        name: '快乐的文化节',
        desc: '你路过百讲，发现众多摊位林立。欢快的氛围让你暂时忘却了小组作业的困扰。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: 1 }, { stat: 'social', value: 1 }]
    },
    {
        name: '树洞这一块儿',
        desc: '压抑了一天的你打开树洞，在一条popi洞中留下你的足迹，与洞u的交流让你身心舒畅无比。',
        type: 'buff',
        effects: [{ stat: 'social', value: 1 }]
    },
    {
        name: '难忘的主题夜奔',
        desc: '五四操场传来一阵阵劲爆的小曲儿，你奔向人潮，青春的气息萦绕在耳畔。',
        type: 'buff',
        effects: [{ stat: 'sport', value: 1 }]
    },
    {
        name: '食堂阿姨的慈悲',
        desc: '你在学五窗口前掏出校园卡，阿姨看了看你萎靡的脸色，默默给你多打了一勺肉。你忽然觉得这世界还没有彻底完蛋。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: 1 }]
    },
    {
        name: '博雅塔的凝视',
        desc: '你路过未名湖，抬头看见博雅塔在阳光里沉默地站着。它什么也没说，但你好像被某种古老的学术意志续了一口气。',
        type: 'buff',
        effects: [{ stat: 'practice', value: 1 }]
    },
    {
        name: '洞u显灵',
        desc: '你随手发了一条"小组作业实乃拉完了[流汗黄豆]"的树洞，没想到评论区全是同病相怜的洞u，还有人热心提供避雷建议。',
        type: 'buff',
        effects: [{ stat: 'social', value: 1 }]
    },
    {
        name: '嘎嘎？嘎嘎！',
        desc: '你路过图书馆，门口的草坪前居然卧着一对鸭子。你凑上前去，鸭子朝你嘎嘎了两声——你焦虑的大脑褶皱如同奶油般化开。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: 2 }]
    },
    {
        name: '？？？的名单',
        desc: '你打开小绿书，发现？？？正在为明早的排队预热。鬼使神差地，你定了明早七点的闹钟，沉寂已久的心灵隐隐有些躁动。',
        type: 'buff',
        effects: [{ stat: 'sanity', value: 2 }]
    },
    // ---- 原有减益 ----
    {
        name: '校园网崩了',
        desc: '凌晨两点，校园网突然崩了。你看着转圈的加载图标，想砸电脑。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -8 }]
    },
    {
        name: '共享单车全被扫光',
        desc: '你急着去堵人，结果楼下小黄车全被骑走了。只能走路了。',
        type: 'debuff',
        effects: [{ stat: 'bonusAP', value: -2 }]
    },
    {
        name: '教务系统的傲慢',
        desc: '你和教务发邮件，只得到"暂时不能给你明确的答复"。心态微崩。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -5 }]
    },
    // ---- 新增减益 ----
    {
        name: '翔到淋头',
        desc: '你着急忙慌地奔向理教，试图在八点前进入教室。突然，一滩雪白的鸟屎从天而降，正中你的头顶。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -3 }]
    },
    {
        name: '导师的召唤',
        desc: '你正为小组作业焦头烂额，突然间导师的电话堂堂来袭，原来是让你跑一趟报销。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -2 }, { stat: 'bonusAP', value: -2 }]
    },
    {
        name: '圆柏大人发力了',
        desc: '五四路上飘散的花粉疯狂攻击着你的上颚舌苔口腔鼻腔，你被刺激得喷嚏连连，头昏脑胀。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -8 }]
    },
    {
        name: '外卖贼露出坤脚',
        desc: '黄色外卖软件提醒你下楼取餐，当你气喘吁吁地到达楼下，发现自己的外卖早已不翼而飞。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -2 }]
    },
    {
        name: '占座战争',
        desc: '你终于下定了在教学楼认真自习的决心，却发现每个座位上都躺着水杯、充电器和一摞早已落灰的书。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -1 }]
    },
    {
        name: '浴卡余额的惊喜',
        desc: '你光溜溜地站在淋浴间，正打算洗个热水澡，却发现机器冷冰冰地显示余额 0 元。帘子外队伍的沉默比任何嘲笑都响亮。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -1 }]
    },
    {
        name: '未名湖边的鸽子',
        desc: '你在未名湖边看到一只真正的鸽子，恍惚间以为是队友变的。它看了你一眼，飞走了。',
        type: 'debuff',
        effects: [{ stat: 'sanity', value: -1 }]
    },
    // ---- 原有选择 ----
    {
        name: '社团紧急召唤',
        desc: '你加的社团突然有急事，需要你去帮忙。怎么办？',
        type: 'choice',
        choices: [
            { text: 'A. 去帮忙（社交+10，理智+3，但AP-2）', effects: [{ stat: 'social', value: 10 }, { stat: 'sanity', value: 3 }, { stat: 'bonusAP', value: -2 }] },
            { text: 'B. 装死（理智-5）', effects: [{ stat: 'sanity', value: -5 }] }
        ]
    },
    {
        name: 'AI幻觉的背刺',
        desc: '一直失联的鸽子突然发来了一份堪称完美的万字策划案。天下没有免费的午餐——你需要鉴定一下。',
        type: 'choice',
        choices: [
            { text: 'A. 仔细鉴定（理智-5，但能识破AI内容）', effects: [{ stat: 'sanity', value: -5 }], safe: true },
            { text: 'B. 直接用了（省事！但有50%概率明天进度倒退）', effects: [], risky: true }
        ]
    },
    // ---- 新增选择 ----
    {
        name: '讲座诱惑',
        desc: '老师在课程群里发来一场讲座的链接，和你们作业主题高度相关，还送文创。',
        type: 'choice',
        choices: [
            { text: 'A. 去听（实践+6，理智-2）', effects: [{ stat: 'practice', value: 6 }, { stat: 'sanity', value: -2 }] },
            { text: 'B. 不去（理智+3）', effects: [{ stat: 'sanity', value: 3 }] }
        ]
    },
    {
        name: '舍友的邀请',
        desc: '完成了所有ddl的舍友从床帘中探头问你："来一把吗？就一把。"你看了看小组作业，又看了看自己岌岌可危的理智。',
        type: 'choice',
        choices: [
            { text: 'A. 来一把（理智+5）', effects: [{ stat: 'sanity', value: 5 }] },
            { text: 'B. 忍痛拒绝（实践+3，理智-3）', effects: [{ stat: 'practice', value: 3 }, { stat: 'sanity', value: -3 }] }
        ]
    },
    {
        name: '给力的诡秘',
        desc: '你为小组作业奋斗的每个点滴都被诡秘看在眼里，对方提出一起前往小融城新开的萨某亚进行补给。',
        type: 'choice',
        choices: [
            { text: 'A. 去！我最喜欢萨某亚了（理智+3）', effects: [{ stat: 'sanity', value: 3 }] },
            { text: 'B. 含泪拒绝（理智-3，额外AP+1）', effects: [{ stat: 'sanity', value: -3 }, { stat: 'bonusAP', value: 1 }] }
        ]
    },
    {
        name: '老师的善意提醒',
        desc: '老师在课程群里发："大家不要最后一周才开始做哦。"你盯着屏幕，感觉这句话具有穿透灵魂的力量。',
        type: 'choice',
        choices: [
            { text: 'A. 立刻推进（随机模块完成度+1%，理智-5）', effects: [{ stat: 'sanity', value: -5 }], pushProgress: true },
            { text: 'B. 自我安慰（理智+2）', effects: [{ stat: 'sanity', value: 2 }] }
        ]
    }
];

// ==================== 熟悉度事件 ====================

const FAMILIARITY_EVENTS = {
    slacker: {
        1: {
            name: '糊弄学话术', icon: '🎭', image: '../asset/tool+role/熟悉度道具/混子糊弄学话术.png',
            story: '你质问混子为什么交上来的美术素材连底图都没有抠干净。他推了推并不存在的眼镜，认真地说："你问到问题的核心，先说结论，是你太清醒了。我就在这里，不躲、不藏、不逃，稳稳地接住你。"\n你心中本该燃起的无名火莫名其妙地消散了，只得扶额苦笑无奈。',
            desc: '化合失败不扣理智；成功额外+3%',
            mergeEffect: 'slacker_1'
        },
        3: {
            name: 'superidol的笑容', icon: '😊', image: '../asset/tool+role/熟悉度道具/混子的笑容.png',
            story: '你又一次在家园四层逮到了混子。听到你那熟悉的声音，他先是一僵，随后竟向你绽放出一个superidol的笑容。\n你脑海中不禁浮现出一位爱唱歌的三字男子的身影，这次是真的蚌埠住了。',
            desc: '化合成功率+8%；失败恢复理智+5',
            mergeEffect: 'slacker_3'
        },
        4: {
            name: '万能的大拇指', icon: '👍', image: '../asset/tool+role/熟悉度道具/混子表情包.png',
            story: '深夜，你已经做好了独自熬到天亮的准备。混子却突然给你发来一个压缩包，文件名是"我试着做了一下"。\n打开压缩包，屏幕上跳出已经整理好的素材工程：图标、UI、角色草图、背景参考，甚至还有一份AI味儿没那么冲的视觉风格说明。\n混子在群里沉默了很久，才发来一句："我以前总觉得，自己只会做题，别的什么都不会。后来发现，好像不是不会，只是没试过。"并附上了一个硕大的拇指表情包。\n你看着屏幕上那个43码大拇指和依旧没抠干净底图但画风还算精美的角色草图，忽然觉得，这份小组作业也许真的改变了点什么。',
            desc: '化合失败不消耗材料，降级为+5%',
            mergeEffect: 'slacker_5'
        }
    },
    scrollKing: {
        1: {
            name: 'story', icon: '📖', image: '../asset/tool+role/熟悉度道具/卷王story.png',
            story: '你和卷王讨论玩法时陷入争执。她沉思片刻，熟练地在文档里写下："本作试图在轻量化机制与叙事表达之间寻找平衡。"\n随后她认真地告诉你："比玩法更重要的，是要讲给玩家一个完整的好故事。"\n你觉得这句话似曾相识，心中升起一阵恶寒。',
            desc: '文案材料化合+12%；非文案+5%',
            mergeEffect: 'scrollKing_1'
        },
        3: {
            name: '鸭腿', icon: '🍗', image: '../asset/tool+role/熟悉度道具/卷王鸭腿.png',
            story: '夜色已深，你和卷王又一次在图书馆通宵达旦。走出图书馆时，她从腋下掏出一只香喷喷的鸭腿，神情平静得仿佛这是一件再自然不过的事。\n"趁热吃吧，"她说，"低血糖会影响效率。"\n你接过鸭腿，第一次意识到卷王的关心方式也许只是比较像实验室补给。',
            desc: '理智+8，化合成功率+6%',
            mergeEffect: 'scrollKing_3'
        },
        4: {
            name: 'life！新展开！', icon: '🌟', image: '../asset/tool+role/熟悉度道具/卷王道具3.png',
            story: '你在百讲门口遇见了卷王。她没有背电脑，也没有抱着厚厚的参考书，只是站在海报前，认真研究一场电影放映的简介。\n她有些不好意思地说："我以前总觉得，所有时间都应该用来做有用的事。但最近我在想，也许\'没用\'的东西也不是没有意义。"\n说完，她递给你一页手写笔记。上面不是论文提纲，也不是任务拆解，而是一份她整理的"想尝试的事情"：看电影、做游戏、学一点画画、也许还可以写一个真正属于自己的故事。\n你看着她略显生疏却真诚的笑容，突然觉得，她好像终于不只是为了完成什么而活着了。',
            desc: '化合成功率+15%；大成功额外+5%他项',
            mergeEffect: 'scrollKing_5'
        }
    },
    pigeon: {
        1: {
            name: '已读回执', icon: '📱', image: '../asset/tool+role/熟悉度道具/鸽子已读回执.png',
            story: '你在群里连发三条消息，鸽子依旧没有回复。正当你准备冲去未名湖抓人时，屏幕上突然出现两个字："收到。"\n虽然没有任何实质内容，但你感到了一丝微弱的人类连接。\n于此同时，你在朋友圈中刷到了鸽子的观鸟九宫格，发送时间为1分钟前。',
            desc: '化合成功率+5%',
            mergeEffect: 'pigeon_1'
        },
        3: {
            name: '百讲赠票', icon: '🎫', image: '../asset/tool+role/熟悉度道具/鸽子百讲赠票.png',
            story: '你和鸽子在理教盯着尚未完成的代码。正当你暗自头疼时，她温柔地拍了拍你的肩膀，手中不知何时出现了一张百讲赠票。\n"音乐剧和电影总让我动容，"她注视着你，缓缓开口，"你看起来很累。所以，今晚要和我一起去看吗？"\n你本想提醒她DDL将近，却忽然发现，自己确实已经很久没有在百讲完整地看完一部剧了。',
            desc: '代码材料+10%；非代码理智+6/+4%',
            mergeEffect: 'pigeon_3'
        },
        4: {
            name: '羽毛书签', icon: '🪶', image: '../asset/tool+role/熟悉度道具/鸽子羽毛书签.png',
            story: '距离DDL已经时日无多，鸽子罕见地准时出现在理教门口。她没有多说什么，只是把电脑推到你面前，还递给了你一个羽毛做的精致书签。\n你已经做好了替鸽子大调代码的准备，点开demo才发现，虽然仍有一些肉眼可见的小bug，但程序看起来居然可以正常运行。\n你充满感激地看向了鸽子，她反而不好意思地低下头："我以前总觉得，作业只是作业。但后来发现，如果要做一个世界，至少可以让它看起来像我真的去过那里。"\n你接过那个精美的书签，忽然明白，她并不是没有参与，只是一直以自己的节奏，在很远的地方观察着这个项目。',
            desc: '不会大失败；成功率+12%',
            mergeEffect: 'pigeon_5'
        }
    }
};

// ==================== 微信群聊 ====================

const WECHAT_POOL = [
    [ // 群聊1
        { sender: 'self', text: '今天能交代码的扣1' },
        { sender: 'slacker', text: '1' },
        { sender: 'scrollKing', text: '[文件]还差一点，再给我两个小时' },
        { sender: 'pigeon', text: '111（已读）' },
        { sender: 'self', text: '……你是扣1还是说"11月"？' }
    ],
    [ // 群聊2
        { sender: 'pigeon', text: '[分享视频：乌鸦偷薯条被当场抓获]' },
        { sender: 'self', text: '[愣住.jpg]干嘛，这是小组群' },
        { sender: 'pigeon', text: '乌鸦获得了食物' },
        { sender: 'slacker', text: '品质-普通' },
        { sender: 'scrollKing', text: '任务完成度+10%' },
        { sender: 'self', text: '我看你们仨都像材料' }
    ],
    [ // 群聊3
        { sender: 'scrollKing', text: '组长，我觉得我们的游戏缺少一个核心循环' },
        { sender: 'self', text: '什么核心循环' },
        { sender: 'scrollKing', text: '玩家为什么要一直玩下去' },
        { sender: 'slacker', text: '因为不玩会挂科' },
        { sender: 'self', text: '很强的核心驱动力' },
        { sender: 'scrollKing', text: '记一下' }
    ],
    [ // 群聊4
        { sender: 'slacker', text: '组长' },
        { sender: 'slacker', text: '如果一个模块没有人做' },
        { sender: 'slacker', text: '那它是不是自由的' },
        { sender: 'scrollKing', text: '从存在主义角度来说' },
        { sender: 'self', text: '闭嘴' },
        { sender: 'pigeon', text: '支持模块自主发展' }
    ],
    [ // 群聊5
        { sender: 'slacker', text: '我觉得DDL是一种薛定谔的存在' },
        { sender: 'self', text: '怎么说' },
        { sender: 'slacker', text: '没到的时候永远觉得很远' },
        { sender: 'slacker', text: '到了的时候已经晚了' },
        { sender: 'scrollKing', text: '时间感知偏差' },
        { sender: 'pigeon', text: '量子DDL' },
        { sender: 'self', text: '别研究了，快做作业！！！' }
    ],
    [ // 群聊7
        { sender: 'self', text: '今天的美术素材怎么样了' },
        { sender: 'slacker', text: '已完成一半' },
        { sender: 'self', text: '哪一半' },
        { sender: 'slacker', text: '心态' },
        { sender: 'scrollKing', text: '心态素材？' },
        { sender: 'pigeon', text: '可作为隐藏道具' },
        { sender: 'self', text: '…不要把摆烂说的这么冠冕堂皇啊喂！' }
    ],
    [ // 群聊8
        { sender: 'self', text: '大家对BE结局有什么想法' },
        { sender: 'slacker', text: '玩家失败' },
        { sender: 'slacker', text: '我们成功交差' },
        { sender: 'scrollKing', text: '不要把游戏目标和课程目标混淆！' },
        { sender: 'pigeon', text: '失败结局：主角打开任务列表' },
        { sender: 'self', text: '太真实了，册掉' }
    ],
    [ // 群聊9
        { sender: 'scrollKing', text: '我建议加入新手引导' },
        { sender: 'slacker', text: '我也需要' },
        { sender: 'self', text: '可你是开发者啊！' },
        { sender: 'slacker', text: '开发者也会卡关的好吗' },
        { sender: 'pigeon', text: '他不是卡关，他是自由试探' },
        { sender: 'scrollKing', text: '自由试探可不能跳过提交…！' }
    ],
    [ // 群聊10
        { sender: 'slacker', text: '我之前画过一个按钮' },
        { sender: 'self', text: '发来看看' },
        { sender: 'slacker', text: '[图片]' },
        { sender: 'pigeon', text: '它看起来不想被点' },
        { sender: 'scrollKing', text: '交互反馈很明确' },
        { sender: 'self', text: '明确地拒绝玩家是吧' }
    ],
    [ // 群聊11
        { sender: 'scrollKing', text: '文案需要统一语气' },
        { sender: 'self', text: '什么语气' },
        { sender: 'scrollKing', text: '轻松、克制、有一点讽刺' },
        { sender: 'slacker', text: '那不就是我们群聊' },
        { sender: 'pigeon', text: '建议直接导出' },
        { sender: 'self', text: '绝对不行啊！会被投厕的吧' }
    ],
    [ // 群聊12
        { sender: 'self', text: '混子，素材命名别叫"最终最终真的最终"' },
        { sender: 'slacker', text: '那叫"最终2"' },
        { sender: 'scrollKing', text: '版本管理可不是靠许愿啊' },
        { sender: 'pigeon', text: '可以叫"这次应该可以"' },
        { sender: 'self', text: '禁止玄学命名！' }
    ],
    [ // 群聊13
        { sender: 'scrollKing', text: '我把剧情分支表做完了' },
        { sender: 'self', text: '多少个结局' },
        { sender: 'scrollKing', text: '七个' },
        { sender: 'slacker', text: '包括我们小组解散吗' },
        { sender: 'pigeon', text: '隐藏真结局：大家睡够了' },
        { sender: 'self', text: '这比通关还难' }
    ],
    [ // 群聊14
        { sender: 'self', text: '今天能不能同步一下进度' },
        { sender: 'pigeon', text: '可以' },
        { sender: 'slacker', text: '可以' },
        { sender: 'scrollKing', text: '可以' },
        { sender: 'self', text: '那谁先说' },
        { sender: 'pigeon', text: '我先听' },
        { sender: 'slacker', text: '我先酝酿' },
        { sender: 'scrollKing', text: '我先打开文档' },
        { sender: 'self', text: '你们管这叫同步？！' }
    ],
    [ // 群聊15
        { sender: 'slacker', text: '我突然觉得做游戏也挺有意思' },
        { sender: 'self', text: '展开说说' },
        { sender: 'slacker', text: '规则写出来以后' },
        { sender: 'slacker', text: '真的有人会被它折磨' },
        { sender: 'scrollKing', text: '我们对"有意思"的理解是不是有些偏差' }
    ],
    [ // 群聊16
        { sender: 'self', text: '主角失败时应该提示什么啊' },
        { sender: 'scrollKing', text: '你做出了选择，也承担了结果' },
        { sender: 'slacker', text: '再来一次吧，反正我们也在重做' },
        { sender: 'pigeon', text: '啾' },
        { sender: 'self', text: '第三个意外地最有安慰感呢！' }
    ],
    [ // 群聊17
        { sender: 'slacker', text: '我在想能不能给BE结局画一个很平静的画面' },
        { sender: 'self', text: '为什么' },
        { sender: 'slacker', text: '因为真正的崩溃都很安静' },
        { sender: 'scrollKing', text: '这句话可以进文案' },
        { sender: 'pigeon', text: '你是不是偷看了我的剧' },
        { sender: 'slacker', text: '不是，我偷看了我的寄点' },
        { sender: 'self', text: '别笑了，有点痛' }
    ],
    [ // 群聊18
        { sender: 'self', text: '代码又报错了' },
        { sender: 'pigeon', text: '它在表达情绪' },
        { sender: 'scrollKing', text: '错误信息发一下' },
        { sender: 'pigeon', text: '[截图]' },
        { sender: 'slacker', text: '它说它不认识自己' },
        { sender: 'self', text: '那是变量没定义' },
        { sender: 'pigeon', text: '哎哎哎，现代人的共同处境啊' },
        { sender: 'scrollKing', text: '…不要把bug哲学化！' }
    ],
    [ // 群聊19
        { sender: 'slacker', text: '我申请给角色加一个"摆烂值"' },
        { sender: 'self', text: '有什么用' },
        { sender: 'slacker', text: '满了以后进入贤者模式' },
        { sender: 'scrollKing', text: '这会鼓励消极行为' },
        { sender: 'pigeon', text: '也可能鼓励休息' },
        { sender: 'self', text: '那叫"能量值"' },
        { sender: 'slacker', text: '你们真会包装' }
    ],
    [ // 群聊20
        { sender: 'pigeon', text: '我想把鸟叫写成隐藏彩蛋' },
        { sender: 'self', text: '彩蛋触发条件呢' },
        { sender: 'pigeon', text: '玩家连续沉默十秒' },
        { sender: 'slacker', text: '那我每次都能触发' },
        { sender: 'scrollKing', text: '…那叫挂机！' },
        { sender: 'self', text: '在我们组可以算现象' }
    ],
    [ // 群聊21
        { sender: 'self', text: '卷王，你文案太正式了' },
        { sender: 'scrollKing', text: '具体呢' },
        { sender: 'self', text: '"系统判定您已失去阶段性发展优势"' },
        { sender: 'slacker', text: '翻译：寄了' },
        { sender: 'scrollKing', text: '……可以稍微保留文学性吗' }
    ],
    [ // 群聊22
        { sender: 'slacker', text: '我发现画图比高中时的刷题还难' },
        { sender: 'self', text: '为什么' },
        { sender: 'slacker', text: '刷题至少知道答案' },
        { sender: 'slacker', text: '画图连问题都在嘲笑我' },
        { sender: 'scrollKing', text: '创作型任务确实不确定性更高，但人生也是如此' },
        { sender: 'pigeon', text: '🎵~欢迎你来到地球参观旅行~🎵' },
        { sender: 'self', text: '咋突然开始吟唱了啊喂' },
        { sender: 'self', text: '…不兑，怎么有点耳熟！' }
    ],
    [ // 群聊23
        { sender: 'slacker', text: '我发现在做作业的时候把眼睛闭上会很舒服' },
        { sender: 'scrollKing', text: '那是睡着了！' },
        { sender: 'pigeon', text: '那是睡着了！' },
        { sender: 'self', text: '那是睡着了！' },
        { sender: 'slacker', text: '我去，不早说' }
    ]
];

const WECHAT_DAY5 = [
    { sender: 'self', text: '老师要检查进度了' },
    { sender: 'scrollKing', text: '准备好了' },
    { sender: 'pigeon', text: '准备好了' },
    { sender: 'slacker', text: '准备好了' },
    { sender: 'self', text: '真的吗' },
    { sender: 'scrollKing', text: '准备好面对现实了' },
    { sender: 'pigeon', text: '准备好接受命运了' },
    { sender: 'slacker', text: '准备好挨骂了' }
];

// ==================== 成长选项 ====================

const GROWTH_OPTIONS = [
    {
        name: '社团聚餐', icon: '🍻',
        desc: '去参加社团聚餐/团建，锻炼社交能力。',
        effects: [{ stat: 'social', value: 8, label: '社交+8' }, { stat: 'sanity', value: -3, label: '理智-3' }]
    },
    {
        name: '图书馆敲代码', icon: '💻',
        desc: '去图书馆自习，提升实践能力。',
        effects: [{ stat: 'practice', value: 8, label: '实践+8' }, { stat: 'sanity', value: -5, label: '理智-5' }]
    },
    {
        name: '未名湖夜跑', icon: '🏃',
        desc: '去未名湖夜跑，锻炼体育能力。',
        effects: [{ stat: 'sport', value: 8, label: '体育+8' }]
    },
    {
        name: '回宿舍打游戏', icon: '🎮',
        desc: '在宿舍打游戏，大幅恢复精神状态。',
        effects: [{ stat: 'sanity', value: 10, label: '理智+10' }]
    }
];

// ==================== 查找表 ====================

const MATERIAL_TYPE_MAP = { pigeon: 'code', scrollKing: 'writing', slacker: 'art' };

const CAPTURE_TEXTS = {
    pigeon: {
        perfect: [
            '鸽子："昨天下雨没出去观鸟。"\n你忽然意识到这句话意味着她整整写了一天代码。',
            '鸽子："本来只是想写个简单功能，结果半夜灵感来了。"\n你打开代码，发现结构清晰，注释完整，甚至附带了一份开发文档。'
        ],
        normal: [
            '鸽子："应该能跑吧。"\n你尝试运行了一下。\n真的能跑。',
            '鸽子："我电视剧看到一半顺手写的。"\n你尝试运行，发现至少功能实现了。'
        ],
        buggy: [
            '鸽子给了你一小时赶出来的代码。\n你点开项目。\n控制台开始持续尖叫。',
            '鸽子："我觉得问题不大。"\n问题很大，你的电脑直接黑屏。'
        ],
        garbage: [
            '鸽子："啊？今天要交吗？"\n文件夹里只有一个README。\nREADME里只有一句："TODO"。',
            '鸽子："我本来快写完了。"\n"然后发现湖边有鸟。"'
        ]
    },
    scrollKing: {
        perfect: [
            '卷王："我简单整理了一下。"\n你打开文件。\n共42页。\n目录有三级标题。',
            '卷王："我顺便补充了竞品分析。"\n你开始怀疑这是硕士论文并且已经掌握了证据。'
        ],
        normal: [
            '卷王："时间有点赶。"\n她居然只写了8页。\n但内容意外地刚刚好。',
            '卷王："今天状态不太好。"\n文档只有12页。\n你第一次在她的文件里看见了"待补充"。'
        ],
        buggy: [
            '卷王："我昨晚突然有了新的想法。"\n第一页和最后一页仿佛来自两个不同项目。',
            '卷王："我修改了一点点。"\n这一点点包括推翻前三版。'
        ],
        garbage: [
            '卷王："我最近一直在思考游戏的本质。"\n文档写了六千字。\n没有一句和作业有关。',
            '卷王："我觉得这是很重要的理论基础。"\n你翻到最后。\n没有方案。\n只有参考文献。'
        ]
    },
    slacker: {
        perfect: [
            '混子脸上挂着黑眼圈看着你："我昨晚没睡。"\n你本以为他在打游戏。\n结果他通宵画了一套完整UI。',
            '混子挠了挠头："我觉得这个挺酷的。"\n你第一次从他的脸上看见了干劲。'
        ],
        normal: [
            '混子："AI画的，我调了一下。"\n你决定假装没听见后半句。',
            '混子："熬了两个小时。"\n虽然成果一般。\n但总比没做强。'
        ],
        buggy: [
            '混子："不好意思，压缩包发错版本了。"\n你抬头望天，希望是真的发错了。',
            '混子："导出的时候好像出了点问题，但我这儿看是正常的。"\n经典名言出现了。\n你放大图片。\n更糊了。',
            '混子："这是一种后现代风格。"\n你觉得这更像事故现场。'
        ],
        garbage: [
            '混子："我打开PS了。"\n"然后呢？"\n"然后关了。"\n你想，或许创作，最需要的就是留白吧。',
            '混子："我构思了一下午，本来准备做的。"\n"后来呢？"\n"我睡着了。"'
        ]
    }
};

const MATERIAL_NAMES = {
    code:    { perfect: '完美代码', normal: '能跑的代码', buggy: '充满Bug的代码', garbage: '空文件' },
    writing: { perfect: '完美策划案', normal: '及格的策划案', buggy: '逻辑混乱的文案', garbage: '一堆废话' },
    art:     { perfect: '精美UI设计', normal: '普通UI素材', buggy: '像素糊成一团', garbage: '空白画布' }
};

const MATERIAL_ICONS = { code: '💻', writing: '📝', art: '🎨' };

const QUALITY_NAMES = { perfect: '完美', normal: '普通', buggy: '有Bug', garbage: '依托答辩' };

const QUALITY_BONUS = { perfect: 25, normal: 15, buggy: 8, garbage: 0 };

const TYPE_NAMES = { code: '代码', writing: '文案', art: '美术' };

// ==================== 动态群聊模板 ====================

const LOCATION_HINT_TEMPLATES = {
    pigeon: {
        lake: ['今天想去湖边画会儿画', '未名湖的光线今天特别好…我去写生了', '听说未名湖边来了一只苍鹭，我去看看'],
        canteen: ['饿了，想去家园找点吃的', '听说家四有新菜了', '去家园吃饭，顺便带电脑画点东西'],
        library: ['去图书馆找找参考', '今天想安静待一会儿，去图书馆吧', '图书馆那边光线好，适合画画']
    },
    scrollKing: {
        lake: ['想去未名湖找灵感', '在湖边散步有利于思考…我去转转', '未名湖那边安静，我去写文档'],
        canteen: ['去食堂吃饭顺便头脑风暴', '家园四层有桌子可以讨论，我在那边', '去家四了，边吃边想方案'],
        library: ['今天泡图书馆', '图书馆有本书我一直想看', '我在图书馆，有事找我']
    },
    slacker: {
        lake: ['去湖边发呆好了', '未名湖那边信号好，可以打手游', '我去湖边坐坐，别找我'],
        canteen: ['要去家四吃饭谁一起', '食堂新出了番茄鸡蛋盖饭', '我在家园，刚吃完准备打会儿桌游'],
        library: ['图书馆有空调…去蹭一下', '去图书馆占个座睡觉', '我去图书馆了…不是去学习的']
    }
};

const CALLBACK_TEMPLATES = {
    captured: {
        pigeon: ['组长昨天追了我三圈…', '那个{material}你看了吗', '昨天给你的东西，凑合用吧'],
        scrollKing: ['昨天交给组长的{material}，我觉得还能改改', '组长收到我的成果了吧？质量绝对在线', '那个{material}我回头再优化一版'],
        slacker: ['组长，{material}我给了啊别催了', '昨天那个{material}不好用怪我咯', '你昨天抓我的样子好凶[流汗黄豆]']
    },
    missed: {
        pigeon: ['昨天好像有人在找我？', '组长你跑步速度挺快的哈', '抱歉昨天没注意到你…我在观鸟'],
        scrollKing: ['昨天怎么有人追我跑？我在赶论文啊', '抱歉组长，昨天真没看到你', '昨天我走得快是因为…在思考'],
        slacker: ['昨天在食堂看到有人跑来跑去…是你吗组长', '你们找我了？我昨天在睡觉', '组长你昨天是不是追我了…我还以为在做梦']
    }
};

const DAY_GREETINGS = [
    '今天有人能交点东西吗',
    '大家今天什么安排',
    '说一下今天的计划吧',
    '各位今天在哪里',
    '醒了吗？今天干点活吧'
];

const SELF_CAPTURED_REPLIES = ['收到了，质量嘛…', '嗯收到', '下次能不能提前交', '总算有点东西了'];
const SELF_MISSED_REPLIES = ['……', '你倒是别跑啊', '今天一定抓到你', '你可真能跑'];
