// ============================================================
//  endings.js — 26 结局判定 + 渲染（优先级遍历）
// ============================================================

function getEndingSnapshot() {
    const comp = totalCompletion();
    const san = state.sanity;
    const { code, writing, art } = state.completion;

    const modules = [
        { key: 'code', value: code },
        { key: 'writing', value: writing },
        { key: 'art', value: art }
    ].sort((a, b) => b.value - a.value);

    const missingCount = [code, writing, art].filter(v => v < 10).length;

    let dominantModule = null;
    if (modules[0].value >= 35 && modules[0].value - modules[1].value >= 20) {
        dominantModule = modules[0].key;
    }

    const attrs = [
        { key: 'social', value: state.social },
        { key: 'practice', value: state.practice },
        { key: 'sport', value: state.sport }
    ].sort((a, b) => b.value - a.value);

    let dominantAttr = null;
    if (attrs[0].value >= 35 && attrs[0].value - attrs[1].value >= 8) {
        dominantAttr = attrs[0].key;
    }

    return {
        comp, san, code, writing, art,
        missingCount, dominantModule, dominantAttr,
        severeBias: missingCount >= 1
    };
}

const ENDING_RULES = [
    { id: 'E00', condition: s => s.san <= 0 },
    { id: 'E01', condition: s => s.comp < 10 },
    { id: 'E02', condition: s => s.comp < 20 && s.san < 30 },
    { id: 'E03', condition: s => s.comp < 20 && s.missingCount >= 2 },
    { id: 'E04', condition: s => s.comp < 20 && s.code < 10 },
    { id: 'E05', condition: s => s.comp < 20 && s.writing < 10 },
    { id: 'E06', condition: s => s.comp < 20 && s.art < 10 },
    { id: 'E07', condition: s => s.comp < 20 && s.san >= 60 },
    { id: 'E08', condition: s => s.comp < 20 },
    { id: 'E09', condition: s => s.comp >= 40 },
    { id: 'E10', condition: s => s.comp >= 29 && s.comp <= 31 },
    { id: 'E11', condition: s => s.comp >= 20 && s.comp < 35 && s.san < 30 },
    { id: 'E12', condition: s => s.comp >= 35 && s.san < 30 },
    { id: 'E13', condition: s => s.comp >= 20 && s.comp < 35 && s.missingCount >= 1 },
    { id: 'E14', condition: s => s.comp >= 20 && s.comp < 35 && s.dominantAttr === 'social' },
    { id: 'E15', condition: s => s.comp >= 20 && s.comp < 35 && s.dominantAttr === 'practice' },
    { id: 'E16', condition: s => s.comp >= 20 && s.comp < 35 && s.dominantAttr === 'sport' },
    { id: 'E17', condition: s => s.comp >= 20 && s.comp < 35 },
    { id: 'E18', condition: s => s.comp >= 35 && s.severeBias },
    { id: 'E19', condition: s => s.comp >= 35 && s.dominantModule === 'code' },
    { id: 'E20', condition: s => s.comp >= 35 && s.dominantModule === 'writing' },
    { id: 'E21', condition: s => s.comp >= 35 && s.dominantModule === 'art' },
    { id: 'E22', condition: s => s.comp >= 35 && s.dominantAttr === 'social' },
    { id: 'E23', condition: s => s.comp >= 35 && s.dominantAttr === 'practice' },
    { id: 'E24', condition: s => s.comp >= 35 && s.dominantAttr === 'sport' },
    { id: 'E25', condition: s => s.comp >= 35 }
];

const ENDING_DATA = {
    E00: {
        title: '不如相忘于江湖', type: 'BE · 坏结局', color: '#e94560',
        base: '你盯着屏幕上的项目文件，忽然发现自己已经不想知道它能不能交了。群聊还在跳，队友还在发"马上""快了""我电脑有点问题"，但这些字像隔着一层玻璃。你在输入框里打了一大段话，删掉。又打了一段，又删掉。最后只发出7个字："有缘树洞再相会。"然后你退出了所有课程群。\n\n第二天，老师问："你们组长呢？"徒留三个队友面面相觑。'
    },
    E01: {
        title: '离人很远了', type: 'BE · 坏结局', color: '#888',
        base: 'DDL 到了。项目文件夹里什么都有：旧版压缩包、临时截图、空目录、命名为"最终版真的最终版"的废稿。唯独没有一个像样的作品。你试着打开 Demo，屏幕没有报错。因为它根本没有东西可以报错。\n\n群里有人问："组长，还交吗？"你看着这句话，第一次觉得"交作业"三个字离自己很远，自己也离人很远了。'
    },
    E02: {
        title: '绷住！', type: 'BE · 坏结局', color: '#888',
        base: '你们确实努力过。可惜努力没有形成作品，只形成了失调的内分泌和一堆互相覆盖的文件。最后一天，你还想再救一次。你打开代码、打开文档、打开素材包，然后发现自己连哪个版本是新的都分不清。\n\n你没有立刻崩溃，因为你已经提前崩过了。'
    },
    E03: {
        title: '何为整体', type: 'BE · 坏结局', color: '#888',
        base: '这个项目最大的问题不是没做好，而是没有一个模块被做好。代码像实验残留，文案像会议纪要，美术像临时占位。它们被放进同一个文件夹里，却完全不像同一个游戏。\n\n路演时，你试图讲"整体设计"。评委老师看了看屏幕，又看了看你："你们这个整体，主要体现在哪里？"你沉默了。'
    },
    E04: {
        title: '代码断腿', type: 'BE · 坏结局', color: '#888',
        base: '策划可以讲，美术也能展示。但真正到 Demo 环节时，问题出现了：稀烂的代码根本无法支撑这复杂的游戏。你故作游刃有余地把鼠标停在"开始游戏"按钮旁边，实则手汗可以浸满一整条压缩毛巾。\n\n老师说："可以实际操作一下吗？"你尴尬地笑着说："我们先看一下流程图。"最后，流程图没有救下这门课。'
    },
    E05: {
        title: '文案失语', type: 'BE · 坏结局', color: '#888',
        base: 'Demo 勉强有一点，美术也不是完全空白。但没人说得清这个游戏到底在玩什么。老师问："你们的核心玩法目标是什么？"四个人同时沉默，只得由你临场编出了一套关于"协作困境"和"系统性失控"的解释。\n\n老师听完，表情复杂地点了点头。最后，成绩没有点头。'
    },
    E06: {
        title: '美术裸奔', type: 'BE · 坏结局', color: '#888',
        base: '功能也许有一点，文案也许能讲一点。但画面打开的一瞬间，全组都安静了。对话框像街边小广告，UI像是已经完全学会了设计，角色像学了三年动画的朋友。\n\n老师很体面地说："美术部分后续还有优化空间。"你们整齐地点头。但已经来不及了，比起挂科，你最大的心愿是没有被投厕。'
    },
    E07: {
        title: '最清醒', type: 'BE · 坏结局', color: '#888',
        base: '你没有崩溃，也没有失控。你非常清醒地知道：这个项目就是没达到及格线。你们做了取舍，做了复盘，甚至还保留了情绪稳定。但评分表不会因为你心态健康就自动加分。\n\n你叹了口气，把项目文件夹改名为"经验教训"，然后拖进了回收站的深处。'
    },
    E08: {
        title: 'See you again', type: 'BE · 坏结局', color: '#888',
        base: 'DDL 到了，你看着惨淡的完成度陷入沉默。老师没有说太重的话，只是告诉你们："这个完成度还不够。"你合上电脑，走出教室。盛夏，未名湖边的风吹过来，你觉得有点冷。\n\n明年，你也许会遇到新的队友。也许还是他们。'
    },
    E09: {
        title: '彩虹', type: 'HE · 满绩结局', color: '#ffd700',
        base: '你怀着紧张又期待的心情打开了树洞，一片彩虹跃入眼帘。你盯着这一抹亮色看了很久，甚至怀疑是页面出了bug。\n\n它未必是你想象中最完美的游戏，也未必是最顺利的小组合作；但在这门课的评分表上，你们真的把进度条推到了尽头。'
    },
    E10: {
        title: '平均点', type: 'HE · 普通结局', color: '#4488ff',
        base: '打开树洞，一个预料之内的成绩跃入眼帘。离优秀线只差一点，离不及格已经很远。这是一个微妙的分数。它不够耀眼，但足够体面；不值得大肆庆祝，但也绝对不该被说成失败。\n\n老师说："完成度还可以，整体达到了平均水平。"你点点头。这句话听起来平平无奇，但经历过整个小组作业之后，你突然觉得"平均"已经是一种难得的稳定。'
    },
    E11: {
        title: '真的燃尽了', type: 'OE · 开放结局', color: '#e94560',
        base: '作业过了，老师也没有再追问"你们这个能不能算完成"。可你没有想象中那么开心。这份及格来自最后几天的压榨、熬夜、返工和强行缝合。你把项目推过了线，却把自己留在了线后面。\n\n队友说："组长辛苦了。"你看着这句话，没有力气回复。'
    },
    E12: {
        title: '…献祭流？', type: 'OE · 开放结局', color: '#e94560',
        base: '老师说："这个作品完成度很高。"队友说："组长真的太强了。"你听见了，但没有力气回应。这个项目确实优秀。它有能展示的亮点，有能交代的设计，也有足够撑起高分的完成度。可你比任何人都清楚，它不是自然长出来的，而是被你一点点从废墟里拖出来的。\n\n路演结束后，掌声响起。你坐在原位，眼前有点发黑。'
    },
    E13: {
        title: '单核过线', type: 'HE · 普通结局', color: '#4488ff',
        base: '这个项目很难说是完整的。它更像是一个模块背着另一个缺席模块冲过了终点线。老师看得出来你们缺了东西，但也看得出来你们确实有一部分做到了能交。\n\n路演现场，你们小心翼翼地绕开所有不能展示的地方，只把能看的部分讲清楚。最终成绩出来：及格万岁！'
    },
    E14: {
        title: '讲故事的神力', type: 'HE · 普通结局', color: '#4488ff',
        base: '作品本身只能说刚好过线。但你把路演做成了一场小型发布会。你解释了设计目标，包装了开发取舍，甚至把几个明显的缺陷讲成了"开放式优化空间"。队友坐在旁边，表情从心虚逐渐变成敬畏。\n\n老师最后说："虽然完成度一般，但你们对项目的理解还算清楚。"'
    },
    E15: {
        title: '实践的胜利', type: 'HE · 普通结局', color: '#4488ff',
        base: '最后能交，主要因为你把能修的都修了。Bug 没有完全消失，只是被你关进了用户不太会点到的角落。流程没有完全顺畅，只是被你用无数判断语句勉强接了起来。\n\n老师说："这个版本还挺顽强。"你听了甚至有点感动。'
    },
    E16: {
        title: '完全人格，首在体育', type: 'HE · 普通结局', color: '#4488ff',
        base: '这个项目不是水到渠成的。它是被你从未名湖边、食堂四层和图书馆角落里一点点追回来的。最后几天，你靠着惊人的行动力，把所有人按在屏幕前，把所有能交的东西都拽进了项目文件夹。\n\n老师说："你们组执行力还可以。"你看了看队友，决定把这句话理解为对你的单独表扬。'
    },
    E17: {
        title: '普通及格', type: 'HE · 普通结局', color: '#4488ff',
        base: '这是一个标准的小组作业结局。不算漂亮，但能交；不算顺利，但过了；不算成功，但也没有失败。老师看完 Demo，问了两个不算致命的问题。你们用三分真诚、七分包装回答过去。\n\n最终成绩出来时，你没有欢呼，只是默默把课程群折叠进了免打扰。'
    },
    E18: {
        title: '偏科优秀', type: 'HE · 优秀结局', color: '#4ecca3',
        base: '这个作品拿到了优秀线以上的完成度。但只要稍微拆开看，就会发现它并不均衡。某一部分明显在发光，另一部分则明显在拖后腿。\n\n老师夸了你们最亮眼的地方，也指出了那个最不想被提起的短板。你点点头。你知道对方说得对。可无论如何，分数已经站在了优秀线上。'
    },
    E19: {
        title: '技术宅拯救世界', type: 'HE · 优秀结局', color: '#4ecca3',
        base: '这个项目最先站起来的是代码。核心机制是真的能跑，交互是真的成立，老师点开 Demo 的时候也确实没有翻车。文案和美术也许不是最亮眼的，但技术部分把整个项目稳稳托住了。\n\n路演后，有人问："你们最难的地方是什么？"你想了想，说："让它活着。"'
    },
    E20: {
        title: '策划的发力', type: 'HE · 优秀结局', color: '#4ecca3',
        base: '这个项目最像样的部分是设计和表达。玩法目标清楚，叙事包装完整，路演逻辑也很顺。即使 Demo 有些地方不够稳定，老师仍然能明白你们想做什么。\n\n卷王的五千字文档终于没有白写。当然，你还是把其中四千字删了。'
    },
    E21: {
        title: '美育的重要性', type: 'HE · 优秀结局', color: '#4ecca3',
        base: '这个项目一亮出来，气氛就变了。画面、UI、展示图和演示截图让它看起来比实际完成度更成熟。老师点头的次数明显变多，队友的腰板也肉眼可见地直了起来。\n\n你知道里面还有不少地方经不起细点。但第一印象已经赢了。'
    },
    E22: {
        title: '发布会式优秀', type: 'HE · 优秀结局', color: '#4ecca3',
        base: '这份作业完成度不错，而你把它讲得更不错。你没有回避问题，而是把每个取舍都包装成了设计决策；你没有掩盖短板，而是把它们放进了"后续优化计划"。\n\n路演结束后，队友问："我们原来想得这么清楚吗？"你笑了笑："现在清楚了。"'
    },
    E23: {
        title: '孤独の重构', type: 'HE · 优秀结局', color: '#4ecca3',
        base: '最后的 Demo 是你一点点修出来的。你重构了冲突代码，修掉了致命 Bug，把混乱素材塞进能运行的流程里，还顺手写了 README。\n\n老师看完说："你们组执行力很强。"你没有纠正对方。走出教室时，你只想暂时远离所有版本管理工具。'
    },
    E24: {
        title: 'DDL追击者', type: 'HE · 优秀结局', color: '#4ecca3',
        base: '这个项目的完成方式非常不优雅。你靠行动力把队友从未名湖边、食堂四层和图书馆里一个个抓回项目现场。有人补代码，有人改文档，有人交图，所有东西都在 DDL 前被你按进了同一个文件夹。\n\n老师说："你们组执行力很强。"你没有说话。执行力强不强不知道，追人能力确实练出来了。'
    },
    E25: {
        title: '优秀作业', type: 'HE · 优秀结局', color: '#4ecca3',
        base: 'Demo 完整，展示顺畅，老师问的问题不再是"你们做完了吗"，而是"你们之后考虑继续做吗"。这是一个真正像样的游戏项目：它有能玩的部分，有能看的界面，有能讲的设计，也有足够支撑优秀评价的完成度。\n\n你看了看队友。第一次觉得"继续做"这个问题不是嘲讽。'
    }
};

function determineEnding() {
    const snapshot = getEndingSnapshot();
    const rule = ENDING_RULES.find(r => r.condition(snapshot));
    showEnding(rule ? rule.id : 'E08');
}

function showEnding(endingKey) {
    const ending = ENDING_DATA[endingKey];
    const arch = ARCHETYPES[state.archetype];
    const comp = totalCompletion();

    const endingText = ending.base;

    const endingEl = $('#ending-screen');
    endingEl.innerHTML = `<div class="ending-content">
        <h2 style="color:${ending.color}">${ending.title}</h2>
        <div class="ending-type">${ending.type}</div>
        <div class="ending-stats">
            <div class="ending-stat"><div class="es-value">${comp}%</div><div class="es-label">作业完成度</div></div>
            <div class="ending-stat"><div class="es-value">${state.sanity}</div><div class="es-label">理智值</div></div>
            <div class="ending-stat"><div class="es-value">${state.day > state.maxDay ? state.maxDay : state.day}</div><div class="es-label">存活天数</div></div>
        </div>
        <div class="ending-text">${endingText.replace(/\n/g, '<br>')}</div>
        <div class="ending-stats" style="font-size:12px;gap:16px;margin-bottom:12px">
            <div class="ending-stat"><div class="es-value" style="font-size:18px">${state.social}</div><div class="es-label">社交</div></div>
            <div class="ending-stat"><div class="es-value" style="font-size:18px">${state.practice}</div><div class="es-label">实践</div></div>
            <div class="ending-stat"><div class="es-value" style="font-size:18px">${state.sport}</div><div class="es-label">体育</div></div>
        </div>
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:16px;line-height:1.8">
            💻 代码 ${state.completion.code}% ｜ 📝 文案 ${state.completion.writing}% ｜ 🎨 美术 ${state.completion.art}%
        </div>
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:16px">
            ♥ 鸽子 ${state.familiarity.pigeon || 0} ｜ 卷王 ${state.familiarity.scrollKing || 0} ｜ 混子 ${state.familiarity.slacker || 0}
        </div>
        <button class="btn-primary" id="restart-btn">再来一局</button>
        <p style="margin-top:20px;font-size:12px;color:var(--text-dim)">
            流派：${arch.name} ｜ 材料收集：${state.totalMaterialsCollected}份 ｜ Demo版本 v4.0
        </p>
    </div>`;

    showScreen('#ending-screen');
    $('#restart-btn').addEventListener('click', () => {
        resetState();
        showScreen('#title-screen');
        initTitle();
    });
}
