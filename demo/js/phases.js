// ============================================================
//  phases.js — 四阶段流程
// ============================================================

// ==================== 角色创建 ====================

function showCharacterCreation() {
    state.phase = 'character';

    let html = '<div class="char-create"><h2>选择你的流派</h2>';
    html += '<p class="char-subtitle">不同的初始属性将决定你在5天中的策略路线</p>';
    html += '<div class="archetype-cards">';

    for (const [key, arch] of Object.entries(ARCHETYPES)) {
        const statLines = Object.entries(arch.stats).map(([sk, sv]) => {
            const base = 10;
            const diff = sv - base;
            const cls = diff > 0 ? 'stat-up' : diff < 0 ? 'stat-down' : 'stat-neutral';
            const sign = diff > 0 ? '+' : '';
            const names = { social: '社交', practice: '实践', sport: '体育' };
            return `<div class="${cls}">${names[sk]}：${sv}（${sign}${diff}）</div>`;
        }).join('');

        html += `<div class="archetype-card" data-arch="${key}">
            <div class="arch-icon">${arch.icon}</div>
            <div class="arch-name">${arch.name}</div>
            <div class="arch-desc">${arch.desc}</div>
            <div class="arch-stats">${statLines}</div>
        </div>`;
    }

    html += '</div></div>';
    setContent(html);

    $$('.archetype-card').forEach(card => {
        card.addEventListener('click', () => {
            const key = card.dataset.arch;
            const arch = ARCHETYPES[key];
            state.archetype = key;
            state.social = arch.stats.social;
            state.practice = arch.stats.practice;
            state.sport = arch.stats.sport;
            state.sanity = arch.sanity;
            state._prevSanity = arch.sanity;
            state.bonusAP = arch.bonusAP;
            state.ap = state.baseAP + state.bonusAP;
            const idx = Array.from({ length: WECHAT_POOL.length }, (_, i) => i);
            for (let i = idx.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [idx[i], idx[j]] = [idx[j], idx[i]];
            }
            state.chatOrder = idx.slice(0, 4);
            updateHUD();
            notify(`已选择流派：${arch.name}`, 'info');
            setTimeout(() => startDay(), 600);
        });
    });
}

// ==================== 队友地点预分配 ====================

function assignTeammateLocations() {
    const tmKeys = ['pigeon', 'scrollKing', 'slacker'];
    const locIds = LOCATIONS.map(l => l.id);
    const assignment = {};
    const remaining = [...locIds];

    tmKeys.sort(() => Math.random() - 0.5);

    for (const tmKey of tmKeys) {
        const weights = remaining.map(locId => {
            const loc = LOCATIONS.find(l => l.id === locId);
            return loc.likely[tmKey] || 0;
        });
        const total = weights.reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;
        let chosenIdx = 0;
        for (let i = 0; i < weights.length; i++) {
            roll -= weights[i];
            if (roll <= 0) { chosenIdx = i; break; }
        }
        const chosenLoc = remaining[chosenIdx];
        assignment[chosenLoc] = tmKey;
        remaining.splice(chosenIdx, 1);
    }

    state.teammateLocations = assignment;
}

function generateDynamicChat() {
    const msgs = [];
    const daysLeft = state.maxDay - state.day + 1;

    msgs.push({ sender: 'self', text: pick(DAY_GREETINGS).replace('{days}', daysLeft) });

    const locAssign = state.teammateLocations;
    for (const [locId, tmKey] of Object.entries(locAssign)) {
        const hints = LOCATION_HINT_TEMPLATES[tmKey][locId];
        if (hints) msgs.push({ sender: tmKey, text: pick(hints) });
    }

    msgs.push({ sender: '_time', text: '' });

    if (state.day >= state.maxDay) {
        msgs.push(...WECHAT_DAY5);
    } else {
        const chatIdx = state.chatOrder[state.day - 1];
        if (chatIdx != null) msgs.push(...WECHAT_POOL[chatIdx]);
    }

    return msgs;
}

// ==================== 阶段一：情报获取 ====================

function showPhaseIntel() {
    state.phase = 'intel';
    updateHUD();

    const msgs = generateDynamicChat();

    let wechatHTML = '<div class="wechat-group"><div class="wechat-header">📱 电子游戏创意与制作 - 第13组</div>';

    for (const msg of msgs) {
        if (msg.sender === '_time') {
            const hours = rand(13, 17);
            const mins = String(rand(0, 59)).padStart(2, '0');
            wechatHTML += `<div class="wechat-time">下午 ${hours - 12}:${mins}</div>`;
            continue;
        }
        const isSelf = msg.sender === 'self';
        const tm = TEAMMATES[msg.sender];
        const name = isSelf ? '你（组长）' : (tm ? tm.name : '???');
        const icon = isSelf ? '👤' : (tm ? tm.icon : '❓');
        const avatarBg = isSelf ? '#95ec69' : (tm ? tm.color : '#888');

        let avatarHTML;
        if (!isSelf && tm && tm.avatar) {
            avatarHTML = `<img class="wechat-avatar" src="${tm.avatar}" onerror="this.outerHTML='<div class=\\'wechat-avatar\\' style=\\'background:${tm.color}\\'>${tm.icon}</div>'" />`;
        } else {
            avatarHTML = `<div class="wechat-avatar" style="background:${avatarBg}">${icon}</div>`;
        }

        wechatHTML += `<div class="wechat-msg${isSelf ? ' self' : ''}">
            ${avatarHTML}
            <div>
                <div class="wechat-sender">${name}</div>
                <div class="wechat-bubble">${msg.text}</div>
            </div>
        </div>`;
    }
    wechatHTML += '</div>';

    let html = `<div class="phase-content">
        <div class="phase-title">阶段一：情报获取</div>
        <div class="phase-subtitle">查看微信群了解队友动态${state.day === 1 ? '，猜测他们今天可能出没的地点' : ''}</div>
        ${wechatHTML}
        <div class="phase-actions">
            <button class="btn-action" id="intel-continue">确认情报 →</button>
        </div>
    </div>`;

    setContent(html);

    $('#intel-continue').addEventListener('click', () => {
        triggerRandomEvent(() => {
            checkFamiliarityEvents(() => {
                showLocationChoice();
            });
        });
    });
}

// ==================== 地点选择 ====================

function showLocationChoice() {
    state.phase = 'location';
    updateHUD();

    let html = `<div class="phase-content">
        <div class="phase-title">选择前往地点</div>
        <div class="phase-subtitle">选择地点前往抓捕队友${state.day === 1 ? '——留意群聊中队友提到的地点，注意地图大小差异' : ''}</div>
        <div class="location-cards">`;

    for (const loc of LOCATIONS) {
        const mc = loc.mapConfig;
        const mapTag = mc.gridSize <= 7 ? '小型·拥挤' : mc.gridSize >= 9 ? '大型·开阔' : '中型·平衡';

        html += `<div class="location-card" data-loc="${loc.id}">
            <div class="loc-icon">${loc.icon}</div>
            <div class="loc-name">${loc.name}</div>
            <div class="loc-desc">${loc.desc}</div>
            <div class="loc-map-tag" style="font-size:11px;color:var(--text-dim);margin-top:4px">${mc.obsIcon} ${mapTag} · ${mc.gridSize}×${mc.gridSize}</div>
        </div>`;
    }

    html += '</div></div>';
    setContent(html);

    $$('.location-card').forEach(card => {
        card.addEventListener('click', () => {
            const locId = card.dataset.loc;
            const loc = LOCATIONS.find(l => l.id === locId);
            state.currentLocation = loc;

            state.currentTeammate = state.teammateLocations[locId] || 'slacker';

            const tm = TEAMMATES[state.currentTeammate];
            notify(`你到达了${loc.name}，发现了${tm.name}的身影！`, 'info');
            setTimeout(() => startCapturePhase(), 800);
        });
    });
}

// ==================== 阶段二A：网格抓捕 ====================

function startCapturePhase() {
    state.phase = 'capture';
    updateHUD();

    const tm = TEAMMATES[state.currentTeammate];
    const mc = state.currentLocation.mapConfig;
    const gridSize = mc.gridSize;
    const cellSize = mc.cellSize;
    const canvasSize = gridSize * cellSize;

    let html = `<div class="capture-phase phase-content">
        <div class="phase-title">阶段二：抓捕 —— ${tm.name}</div>
        <div class="phase-subtitle">方向键/WASD移动，接触队友即抓捕成功${state.day === 1 ? '。路上可以捡道具，📢大声呼喊必定使队友靠近但消耗3AP' : ''}</div>
        <div class="capture-info">
            <span style="color:${state.archetype === 'sport' ? 'var(--accent-green)' : 'var(--accent-blue)'}">🏃 AP: <strong id="grid-ap">${state.ap}</strong> <span style="font-size:11px;opacity:0.7">(基础${state.baseAP}${ARCHETYPES[state.archetype].bonusAP ? ' + 流派+' + ARCHETYPES[state.archetype].bonusAP : ''} + 体育+${Math.floor(state.sport / 5)})</span></span>
            <span style="color:var(--accent-yellow)">📍 目标: ${tm.icon} ${tm.name}</span>
        </div>
        <canvas id="capture-canvas" width="${canvasSize}" height="${canvasSize}"></canvas>
        <div class="capture-legend">
            <div class="legend-item"><div class="legend-dot" style="background:#4488ff;border-radius:50%"></div> 你</div>
            <div class="legend-item"><div class="legend-dot" style="background:#ff4444"></div> ${tm.name}</div>
            <div class="legend-item">${mc.obsIcon} 障碍物</div>
            <div class="legend-item">☕🥤📄 道具</div>
        </div>
        <div class="capture-controls">方向键 / WASD 移动 · 每步消耗 1 AP · 接触队友即抓捕成功</div>
        <button class="shout-btn" id="shout-btn">📢 大声呼喊（3AP）</button>
    </div>`;

    setContent(html);

    const canvas = $('#capture-canvas');
    gridGame = new GridCaptureGame(canvas, {
        gridSize,
        cellSize,
        ap: state.ap,
        teammate: tm,
        teammateSpeed: tm.speed + Math.floor(state.day / 3),
        obsCount: mc.obsCount,
        itemCount: mc.itemCount,
        obsIcon: mc.obsIcon,
        onComplete: (result) => {
            state.ap = result.ap;
            state.captured = result.captured;
            updateHUD();
            if (result.captured) {
                state.familiarity[state.currentTeammate] = Math.min(4, (state.familiarity[state.currentTeammate] || 0) + 1);
                notify(`成功抓到了${tm.name}！`, 'buff');
                setTimeout(() => startDicePhase(), 1000);
            } else {
                state.yesterdayResult = { teammate: state.currentTeammate, captured: false, materialName: '' };
                const failType = MATERIAL_TYPE_MAP[state.currentTeammate] || 'code';
                state.todayMaterial = { name: '匆忙笔记', icon: '📋', quality: 'buggy', type: failType, bonus: 8 };
                state.materials.push(state.todayMaterial);
                state.totalMaterialsCollected++;
                updateHUD();
                showModal(`
                    <div class="event-card debuff">
                        <div class="event-title">📋 匆忙笔记</div>
                        <div class="event-desc">你没能抓到${tm.name}，只能匆忙记下一些零碎的笔记。<br><br>
                        <span style="color:var(--text-dim)">获得【有Bug】品质的${TYPE_NAMES[failType]}材料，跳过掷骰阶段。</span></div>
                    </div>
                    <div class="phase-actions"><button class="btn-action" id="hasty-ok">继续 →</button></div>
                `);
                $('#hasty-ok').addEventListener('click', () => {
                    hideModal();
                    startMergePhase();
                });
            }
        },
        onAPChange: (ap) => {
            const el = document.getElementById('grid-ap');
            if (el) el.textContent = ap;
        }
    });

    $('#shout-btn').addEventListener('click', () => {
        if (gridGame) gridGame.shout();
    });
}

// ==================== 阶段二B：掷骰索要 ====================

function startDicePhase() {
    state.phase = 'dice';
    updateHUD();

    const tm = TEAMMATES[state.currentTeammate];
    const bonus = socialBonus();
    const dc = getDC(state.currentTeammate);
    const baseDC = TEAMMATES[state.currentTeammate].catchDC;
    const minRoll = Math.max(1, dc - bonus);
    const famReduction = baseDC - dc;

    let html = `<div class="dice-phase phase-content">
        <div class="phase-title">掷骰索要</div>
        <div class="dice-target">
            <img class="char-portrait" src="${tm.qAvatar || tm.avatar}" onerror="this.outerHTML='<div class=\\'char-portrait-fallback\\' style=\\'background:${tm.color}\\'>${tm.icon}</div>'" />
            <span style="font-size:16px;color:var(--text-bright)">${tm.name}</span>
        </div>
        <div class="phase-subtitle">堵住${tm.name}后，用你的口才索要产出${state.day === 1 ? '——社交属性越高加成越大' : ''}</div>
        <div class="dice-info">
            <div>难度等级 (DC): <strong style="color:var(--accent-yellow)">${dc}</strong>${famReduction > 0 ? ` <span style="font-size:11px;color:var(--accent-green)">(-${famReduction} 熟悉度加成)</span>` : ''} <span style="font-size:11px;color:var(--text-dim)">— 掷骰+社交加成 ≥ DC 即成功</span></div>
            <div>你的社交加成: <strong style="color:var(--accent-blue)">+${bonus}</strong> <span style="font-size:11px;color:var(--text-dim)">— 需要掷出 ≥ ${minRoll}</span></div>
            ${state.catBlessing ? '<div style="color:var(--accent-green)">🐱 猫の祝福：本次检定自动成功！</div>' : ''}
            ${{
                social: '<div style="color:var(--accent-green);margin-top:6px">🗣️ 社交天赋在此大显身手！</div>',
                practice: '<div style="color:var(--accent-blue);margin-top:6px">💻 社交并非你的强项……但你的实践能力将在化合阶段帮你兜底。</div>',
                sport: '<div style="color:var(--accent-orange);margin-top:6px">🏃 虽然口才一般，但你靠体力已经多追了好几次。</div>'
            }[state.archetype] || ''}
        </div>
        <div class="dice-container" id="dice">?</div>
        <div class="dice-bonus" id="dice-bonus-text"></div>
        <div class="phase-actions">
            <button class="btn-action" id="roll-btn">🎲 掷骰！</button>
        </div>
        <div id="dice-result-area"></div>
    </div>`;

    setContent(html);

    // Bug fix: boolean flag prevents double-roll
    let diceRolled = false;

    $('#roll-btn').addEventListener('click', async () => {
        if (diceRolled) return;
        diceRolled = true;
        $('#roll-btn').classList.add('btn-disabled');
        const diceEl = $('#dice');

        diceEl.classList.add('rolling');
        for (let i = 0; i < 15; i++) {
            diceEl.textContent = rand(1, 20);
            await delay(80 + i * 10);
        }
        diceEl.classList.remove('rolling');

        let roll = rand(1, 20);
        if (state.catBlessing) {
            roll = 20;
            state.catBlessing = false;
        }

        diceEl.textContent = roll;
        const total = roll + bonus;
        $('#dice-bonus-text').textContent = `${roll} + ${bonus}(社交) = ${total}`;

        let quality, resultTitle, resultDesc, resultClass;
        const captureTexts = CAPTURE_TEXTS[state.currentTeammate];

        if (roll === 20) {
            quality = 'perfect';
            resultTitle = '🌟 大成功！';
            resultDesc = pick(captureTexts.perfect);
            resultClass = 'crit-success';
        } else if (roll === 1) {
            quality = 'garbage';
            resultTitle = '💀 大失败！';
            resultDesc = pick(captureTexts.garbage);
            resultClass = 'crit-fail';
            state.sanity = clamp(state.sanity - 15, 0, state.maxSanity);
        } else if (total >= dc) {
            quality = 'normal';
            resultTitle = '✅ 成功！';
            resultDesc = pick(captureTexts.normal);
            resultClass = 'success';
        } else if (total >= dc - 3) {
            quality = 'buggy';
            resultTitle = '⚠️ 勉强成功';
            resultDesc = pick(captureTexts.buggy);
            resultClass = 'success';
        } else {
            quality = 'garbage';
            resultTitle = '❌ 失败';
            resultDesc = pick(captureTexts.garbage);
            resultClass = 'fail';
            state.sanity = clamp(state.sanity - 5, 0, state.maxSanity);
        }

        diceEl.classList.add(resultClass);

        const oldworkIdx = state.items.findIndex(i => i.type === 'oldwork');
        if (oldworkIdx >= 0 && quality !== 'perfect') {
            state.items.splice(oldworkIdx, 1);
            const upgradeMap = { garbage: 'buggy', buggy: 'normal', normal: 'perfect' };
            const oldQuality = quality;
            quality = upgradeMap[quality] || quality;
            const materialType = MATERIAL_TYPE_MAP[state.currentTeammate] || 'code';
            const oldName = MATERIAL_NAMES[materialType][oldQuality];
            const newName = MATERIAL_NAMES[materialType][quality];
            resultTitle += ' 📄 往年作业发挥了作用！';
            resultDesc = pick(captureTexts[quality]) + `\n\n品质提升一档！${oldName} → ${newName}`;
            if (quality === 'perfect') resultClass = 'crit-success';
        }

        const materialType = MATERIAL_TYPE_MAP[state.currentTeammate] || 'code';

        state.todayMaterial = {
            name: MATERIAL_NAMES[materialType][quality],
            icon: MATERIAL_ICONS[materialType],
            quality,
            type: materialType,
            bonus: QUALITY_BONUS[quality]
        };
        state.materials.push(state.todayMaterial);
        state.totalMaterialsCollected++;
        state.yesterdayResult = { teammate: state.currentTeammate, captured: true, materialName: state.todayMaterial.name };

        const qClass = `quality-${quality}`;
        const qName = QUALITY_NAMES[quality];

        $('#dice-result-area').innerHTML = `
            <div class="dice-result">
                <h3>${resultTitle}</h3>
                <p>${resultDesc.replace(/\n/g, '<br>')}</p>
                ${quality !== 'garbage' ? `<div class="material-reward">${MATERIAL_ICONS[materialType]} ${state.todayMaterial.name} <span class="${qClass}">【${qName}】</span></div>` : ''}
            </div>
            <div class="phase-actions">
                <button class="btn-action" id="dice-continue">继续 →</button>
            </div>`;

        updateHUD();

        $('#dice-continue').addEventListener('click', () => startMergePhase());
    });
}

// ==================== 阶段三：缝合推进 ====================

function startMergePhase() {
    state.phase = 'merge';
    updateHUD();

    if (state.sanity < 15) {
        determineEnding();
        return;
    }

    const usableMaterials = state.materials.filter(m => m.quality !== 'garbage');

    if (usableMaterials.length === 0) {
        let html = `<div class="merge-phase phase-content">
            <div class="phase-title">阶段三：缝合推进</div>
            <div class="phase-subtitle">你没有可用的材料来化合……</div>
            <div class="event-card debuff">
                <div class="event-title">😮‍💨 无材料可用</div>
                <div class="event-desc">你打开电脑，盯着空空如也的材料库，叹了口气。今天只能摆烂了。</div>
                <div class="effect-positive">摆烂恢复理智 +5</div>
            </div>
            <div class="phase-actions">
                <button class="btn-action" id="merge-skip">摆，都可以摆！→</button>
            </div>
        </div>`;
        setContent(html);
        state.sanity = clamp(state.sanity + 5, 0, state.maxSanity);
        updateHUD();
        $('#merge-skip').addEventListener('click', () => startGrowthPhase());
        return;
    }

    renderMergeUI(usableMaterials);
}

let selectedMaterial = null;
let selectedSanBurn = 0;
let selectedFamItem = null;

function renderMergeUI(usableMaterials) {
    selectedMaterial = null;
    selectedSanBurn = 0;
    selectedFamItem = null;

    const baseRate = Math.max(50, 80 - state.day * 5);
    const practiceAdd = practiceBonus();
    const hasCoffee = state.items.some(i => i.type === 'coffee');
    const famItems = state.items.filter(i => i.mergeEffect);

    const mergeArchTips = {
        social: { icon: '🗣️', color: 'var(--accent-yellow)', text: `你拿到的材料质量不错，但化合全靠手感了（实践加成: +${practiceAdd}%）` },
        practice: { icon: '💻', color: 'var(--accent-green)', text: `你的实践能力让化合更加稳定！（实践加成: +${practiceAdd}%）` },
        sport: { icon: '🏃', color: 'var(--accent-orange)', text: `化合不是你的强项，但你手里材料够多（实践加成: +${practiceAdd}%）` }
    };
    const mTip = mergeArchTips[state.archetype];

    let html = `<div class="merge-phase phase-content">
        <div class="phase-title">阶段三：缝合推进</div>
        <div class="phase-subtitle">选择材料化合推进完成度${state.day === 1 ? '——可燃烧理智提高成功率，咖啡也能+5%' : ''}</div>

        <div class="event-card buff" style="border-left-color:${mTip.color};padding:10px 14px;margin-bottom:14px">
            <div style="font-size:13px;color:${mTip.color}">${mTip.icon} ${mTip.text}</div>
        </div>

        <div class="merge-slots">
            <div class="merge-slot" id="mat-slot">
                <div class="slot-icon">❓</div>
                <div class="slot-label">点击选择材料</div>
            </div>
            <div class="merge-plus">+</div>
            <div class="merge-slot" id="item-slot">
                <div class="slot-icon">${hasCoffee ? '☕' : '—'}</div>
                <div class="slot-label">${hasCoffee ? '瑞幸咖啡 (+5%)' : '无道具'}</div>
            </div>
            ${famItems.length > 0 ? `<div class="merge-plus">+</div>
            <div class="merge-slot" id="fam-item-slot">
                <div class="slot-icon">💝</div>
                <div class="slot-label">点击选择羁绊道具</div>
            </div>` : ''}
        </div>

        <div class="san-burn-control">
            <label>🔥 燃烧理智值：</label>
            <select id="san-burn-select">
                <option value="0">不燃烧</option>
                <option value="5">消耗 5 San (+5%)</option>
                <option value="10">消耗 10 San (+10%)</option>
                <option value="15">消耗 15 San (+15%)</option>
            </select>
        </div>

        <div class="success-rate" id="merge-rate" style="color:var(--text-dim)">
            请先选择材料
        </div>

        <div style="font-size:11px;color:var(--text-dim);text-align:center;margin-bottom:12px">
            基础: ${baseRate}% ｜ 实践: +${practiceAdd}% ｜ 咖啡: ${hasCoffee ? '+5%' : '—'} ｜ 燃烧理智: 可选
        </div>

        <div class="phase-actions">
            <button class="btn-secondary" id="merge-bail">摆，都可以摆！（理智+5）</button>
            <button class="btn-action btn-disabled" id="merge-go">开始化合！</button>
        </div>

        <div id="merge-result-area"></div>
    </div>`;

    setContent(html);

    // Material selection
    $('#mat-slot').addEventListener('click', () => {
        let listHTML = '<h3 style="margin-bottom:12px">选择核心材料</h3><div class="material-list">';
        for (let i = 0; i < usableMaterials.length; i++) {
            const m = usableMaterials[i];
            const qClass = `quality-${m.quality}`;
            const qName = QUALITY_NAMES[m.quality];
            listHTML += `<div class="material-option" data-idx="${i}">
                <span class="mat-icon">${m.icon}</span>
                <div class="mat-info">
                    <div class="mat-name">${m.name}</div>
                    <div class="mat-quality ${qClass}">品质：${qName} ｜ 基础完成度 +${m.bonus}%</div>
                </div>
            </div>`;
        }
        listHTML += '</div>';
        showModal(listHTML);

        $$('.material-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const idx = parseInt(opt.dataset.idx);
                selectedMaterial = usableMaterials[idx];
                hideModal();
                const slot = $('#mat-slot');
                slot.classList.add('filled');
                slot.innerHTML = `<div class="slot-icon">${selectedMaterial.icon}</div><div class="slot-label">${selectedMaterial.name}</div>`;
                updateMergeRate();
                $('#merge-go').classList.remove('btn-disabled');
            });
        });
    });

    // Familiarity item selection
    if (famItems.length > 0) {
        $('#fam-item-slot').addEventListener('click', () => {
            let listHTML = '<h3 style="margin-bottom:12px">选择羁绊道具</h3><div class="material-list">';
            listHTML += `<div class="material-option" data-idx="-1"><span class="mat-icon">—</span><div class="mat-info"><div class="mat-name">不使用</div></div></div>`;
            for (let i = 0; i < famItems.length; i++) {
                const it = famItems[i];
                const famIconHTML = it.image ? `<img src="${it.image}" style="width:28px;height:28px;object-fit:contain">` : `<span class="mat-icon">${it.icon}</span>`;
                listHTML += `<div class="material-option" data-idx="${i}">
                    ${famIconHTML}
                    <div class="mat-info">
                        <div class="mat-name">${it.name}</div>
                        <div class="mat-quality" style="color:var(--accent-green)">${it.desc}</div>
                    </div>
                </div>`;
            }
            listHTML += '</div>';
            showModal(listHTML);

            $$('.material-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const idx = parseInt(opt.dataset.idx);
                    if (idx === -1) {
                        selectedFamItem = null;
                        const slot = $('#fam-item-slot');
                        slot.innerHTML = `<div class="slot-icon">💝</div><div class="slot-label">点击选择羁绊道具</div>`;
                    } else {
                        selectedFamItem = famItems[idx];
                        const slot = $('#fam-item-slot');
                        slot.classList.add('filled');
                        const slotIconHTML = selectedFamItem.image ? `<img src="${selectedFamItem.image}" style="width:32px;height:32px;object-fit:contain">` : selectedFamItem.icon;
                        slot.innerHTML = `<div class="slot-icon">${slotIconHTML}</div><div class="slot-label">${selectedFamItem.name}</div>`;
                    }
                    hideModal();
                    updateMergeRate();
                });
            });
        });
    }

    $('#san-burn-select').addEventListener('change', (e) => {
        selectedSanBurn = parseInt(e.target.value);
        updateMergeRate();
    });

    $('#merge-bail').addEventListener('click', () => {
        if ($('#merge-bail').classList.contains('btn-disabled')) return;
        state.sanity = clamp(state.sanity + 5, 0, state.maxSanity);
        updateHUD();
        notify('你选择了摆烂，理智恢复了一点', 'info');
        startGrowthPhase();
    });

    $('#merge-go').addEventListener('click', () => {
        if (!selectedMaterial) return;
        executeMerge();
    });

    function updateMergeRate() {
        if (!selectedMaterial) return;
        const rate = calcMergeRate();
        const rateEl = $('#merge-rate');
        rateEl.textContent = `成功率：${rate}%`;
        rateEl.style.color = rate >= 70 ? 'var(--accent-green)' : rate >= 40 ? 'var(--accent-yellow)' : 'var(--accent)';
    }

    function calcMergeRate() {
        const baseRate = Math.max(50, 80 - state.day * 5);
        const qualityMod = { perfect: 15, normal: 10, buggy: -5 }[selectedMaterial.quality] || 0;
        const coffeeMod = state.items.some(i => i.type === 'coffee') ? 5 : 0;
        const sanBurnMod = selectedSanBurn;
        const practiceMod = practiceBonus();
        let famMod = 0;
        if (selectedFamItem) {
            famMod = getFamItemRateBonus(selectedFamItem.mergeEffect, selectedMaterial.type);
        }
        return clamp(baseRate + qualityMod + coffeeMod + sanBurnMod + practiceMod + famMod, 5, 100);
    }

    function executeMerge() {
        $('#merge-bail').classList.add('btn-disabled');
        const rate = calcMergeRate();
        state.sanity = clamp(state.sanity - selectedSanBurn, 0, state.maxSanity);

        if (state.items.some(i => i.type === 'coffee')) {
            state.items = state.items.filter(i => i.type !== 'coffee');
        }

        // Consume familiarity item
        const activeFamEffect = selectedFamItem ? selectedFamItem.mergeEffect : null;
        if (selectedFamItem) {
            const idx = state.items.indexOf(selectedFamItem);
            if (idx >= 0) state.items.splice(idx, 1);
        }

        const rollVal = rand(1, 100);
        let success = rollVal <= rate;
        const critSuccess = rollVal <= 5 && success;
        let critFail = rollVal >= 96 && !success;

        // Familiarity item: pigeon_5 prevents crit fail
        if (critFail && activeFamEffect === 'pigeon_5') {
            critFail = false;
        }

        const matIdx = state.materials.indexOf(selectedMaterial);

        // Familiarity item: slacker_5 prevents material consumption on fail
        if (!success && activeFamEffect === 'slacker_5') {
            // Don't consume material
        } else {
            if (matIdx >= 0) state.materials.splice(matIdx, 1);
        }

        let resultHTML;
        if (critSuccess) {
            let bonus = selectedMaterial.bonus + 10;
            // scrollKing_5: crit success gives extra +5% to another module
            if (activeFamEffect === 'scrollKing_5') {
                const otherTypes = ['code', 'writing', 'art'].filter(t => t !== selectedMaterial.type);
                const otherType = pick(otherTypes);
                state.completion[otherType] = clamp(state.completion[otherType] + 5, 0, 100);
            }
            state.completion[selectedMaterial.type] = clamp(state.completion[selectedMaterial.type] + bonus, 0, 100);
            resultHTML = `<div class="merge-result success">
                <h3 style="color:var(--accent-green)">🌟 大成功！化合出了意想不到的成果！</h3>
                <p>${TYPE_NAMES[selectedMaterial.type]}完成度 +${bonus}%</p>
            </div>`;
        } else if (success) {
            let bonus = selectedMaterial.bonus;
            // slacker_1: success gives extra +3%
            if (activeFamEffect === 'slacker_1') bonus += 3;
            state.completion[selectedMaterial.type] = clamp(state.completion[selectedMaterial.type] + bonus, 0, 100);
            resultHTML = `<div class="merge-result success">
                <h3 style="color:var(--accent-green)">✅ 化合成功！</h3>
                <p>${TYPE_NAMES[selectedMaterial.type]}完成度 +${bonus}%</p>
            </div>`;
        } else if (critFail) {
            const penalty = 3;
            state.completion[selectedMaterial.type] = clamp(state.completion[selectedMaterial.type] - penalty, 0, 100);
            state.sanity = clamp(state.sanity - 8, 0, state.maxSanity);
            resultHTML = `<div class="merge-result fail">
                <h3 style="color:var(--accent)">💀 大失败！屎山崩塌！</h3>
                <p>完成度倒退 ${penalty}%，精神状态 -8</p>
            </div>`;
        } else {
            // Normal fail
            let sanLoss = 3;
            // slacker_1: no sanity loss on fail
            if (activeFamEffect === 'slacker_1') sanLoss = 0;
            // slacker_3: restore sanity +5 on fail
            if (activeFamEffect === 'slacker_3') {
                state.sanity = clamp(state.sanity + 5, 0, state.maxSanity);
            }
            state.sanity = clamp(state.sanity - sanLoss, 0, state.maxSanity);

            // slacker_5: treat as +5% instead of nothing
            if (activeFamEffect === 'slacker_5') {
                state.completion[selectedMaterial.type] = clamp(state.completion[selectedMaterial.type] + 5, 0, 100);
                resultHTML = `<div class="merge-result fail">
                    <h3 style="color:var(--accent-yellow)">⚠️ 勉强化合</h3>
                    <p>万能的大拇指发挥了作用！${TYPE_NAMES[selectedMaterial.type]}完成度 +5%</p>
                </div>`;
            } else {
                resultHTML = `<div class="merge-result fail">
                    <h3 style="color:var(--accent)">❌ 化合失败</h3>
                    <p>材料浪费了${sanLoss > 0 ? '，精神状态 -' + sanLoss : ''}。下次试试提高成功率吧。</p>
                </div>`;
            }
        }

        // scrollKing_3: sanity +8 (applied regardless of result)
        if (activeFamEffect === 'scrollKing_3') {
            state.sanity = clamp(state.sanity + 8, 0, state.maxSanity);
        }
        // pigeon_3: non-art material gives sanity +6
        if (activeFamEffect === 'pigeon_3' && selectedMaterial.type !== 'code') {
            state.sanity = clamp(state.sanity + 6, 0, state.maxSanity);
        }

        resultHTML += `<div class="phase-actions"><button class="btn-action" id="merge-next">继续 →</button></div>`;
        $('#merge-result-area').innerHTML = resultHTML;
        $('#merge-go').classList.add('btn-disabled');
        updateHUD();

        $('#merge-next').addEventListener('click', () => {
            const remaining = state.materials.filter(m => m.quality !== 'garbage');
            if (remaining.length > 0) {
                renderMergeUI(remaining);
            } else {
                startGrowthPhase();
            }
        });
    }
}

function getFamItemRateBonus(mergeEffect, materialType) {
    switch (mergeEffect) {
        case 'slacker_1': return 0;
        case 'slacker_3': return 8;
        case 'slacker_5': return 0;
        case 'scrollKing_1': return materialType === 'writing' ? 12 : 5;
        case 'scrollKing_3': return 6;
        case 'scrollKing_5': return 15;
        case 'pigeon_1': return 5;
        case 'pigeon_3': return materialType === 'code' ? 10 : 4;
        case 'pigeon_5': return 12;
        default: return 0;
    }
}

// ==================== 阶段四：结算成长 ====================

function startGrowthPhase() {
    state.phase = 'growth';
    updateHUD();

    if (state.sanity < 15) {
        determineEnding();
        return;
    }

    let html = `<div class="growth-phase phase-content">
        <div class="phase-title">阶段四：结算成长</div>
        <div class="phase-subtitle">选择活动提升属性${state.growthChoicesMade >= 1 ? '（已选 1/2）' : '（可选 2 项）'}${state.day === 1 ? '——⭐标记为流派推荐' : ''}</div>
        <div class="growth-options">`;

    const recommendMap = { social: 0, practice: 1, sport: 2 };
    const recommendIdx = recommendMap[state.archetype];

    for (let i = 0; i < GROWTH_OPTIONS.length; i++) {
        const opt = GROWTH_OPTIONS[i];
        const effectsText = opt.effects.map(e =>
            `<span class="${e.value > 0 ? 'effect-positive' : 'effect-negative'}">${e.label}</span>`
        ).join('　');
        const isRecommended = (i === recommendIdx);

        html += `<div class="growth-option" data-idx="${i}"${isRecommended ? ' style="border-color:var(--accent-yellow)"' : ''}>
            <div class="go-icon">${opt.icon}</div>
            <div class="go-info">
                <div class="go-name">${opt.name}${isRecommended ? ' <span style="font-size:11px;color:var(--accent-yellow)">⭐ 流派推荐</span>' : ''}</div>
                <div class="go-desc">${opt.desc}</div>
                <div class="go-effects">${effectsText}</div>
            </div>
        </div>`;
    }

    html += '</div></div>';
    setContent(html);

    $$('.growth-option').forEach(opt => {
        opt.addEventListener('click', () => {
            if (state.growthChoicesMade >= 2) return;
            const idx = parseInt(opt.dataset.idx);
            const growth = GROWTH_OPTIONS[idx];

            for (const e of growth.effects) {
                state[e.stat] = clamp((state[e.stat] || 0) + e.value, 0, e.stat === 'sanity' ? state.maxSanity : 99);
            }

            state.growthChoicesMade++;
            updateHUD();
            notify(`${growth.name}完成！`, 'buff');

            if (state.growthChoicesMade >= 2) {
                setTimeout(() => endDay(), 500);
            } else {
                startGrowthPhase();
            }
        });
    });
}
