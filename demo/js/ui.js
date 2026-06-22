// ============================================================
//  ui.js — DOM 操作、HUD、通知系统
// ============================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
}

function setContent(html) {
    $('#content').innerHTML = html;
}

function showModal(html) {
    $('#modal-content').innerHTML = html;
    $('#modal-overlay').classList.remove('hidden');
}

function hideModal() {
    $('#modal-overlay').classList.add('hidden');
}

function showSanWarning(html) {
    $('#san-warn-content').innerHTML = html;
    $('#san-warn-overlay').classList.remove('hidden');
}

function hideSanWarning() {
    $('#san-warn-overlay').classList.add('hidden');
}

function showItemPickup(icon, name, desc) {
    const existing = document.querySelector('.item-pickup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'item-pickup-overlay';
    overlay.innerHTML = `
        <div class="item-pickup-card">
            <div class="item-pickup-icon">${icon}</div>
            <div class="item-pickup-name">${name}</div>
            <div class="item-pickup-desc">${desc}</div>
        </div>
    `;
    document.getElementById('content').appendChild(overlay);

    const invPanel = document.getElementById('inv-panel');
    if (invPanel) {
        invPanel.classList.add('inv-flash');
        setTimeout(() => invPanel.classList.remove('inv-flash'), 800);
    }

    setTimeout(() => {
        overlay.classList.add('item-pickup-fadeout');
        setTimeout(() => overlay.remove(), 500);
    }, 2000);
}

let _notifyTimer = null;
function notify(text, type = 'info', duration = 2500) {
    if (_notifyTimer) clearTimeout(_notifyTimer);
    const el = $('#notification');
    el.className = type;
    el.textContent = text;
    el.classList.remove('hidden');
    _notifyTimer = setTimeout(() => { el.classList.add('hidden'); _notifyTimer = null; }, duration);
}

// ==================== HUD ====================

function updateHUD() {
    $('#day-display').textContent = `Day [ ${state.day} ] / ${state.maxDay}`;

    const phaseNames = {
        intel: '阶段一：情报获取',
        location: '选择地点',
        capture: '阶段二：抓捕队友',
        dice: '阶段二：掷骰索要',
        merge: '阶段三：缝合推进',
        growth: '阶段四：结算成长'
    };
    $('#phase-display').textContent = phaseNames[state.phase] || '';

    const comp = totalCompletion();
    $('#completion-fill').style.width = comp + '%';
    $('#completion-pct').textContent = comp + '%';
    const passEl = $('#pass-status');
    if (comp >= 20) {
        passEl.textContent = '及格线达成！';
        passEl.className = 'pass';
    } else {
        passEl.textContent = '未达标';
        passEl.className = 'fail';
    }

    $('#code-fill').style.width = state.completion.code + '%';
    $('#code-pct').textContent = state.completion.code + '%';
    $('#writing-fill').style.width = state.completion.writing + '%';
    $('#writing-pct').textContent = state.completion.writing + '%';
    $('#art-fill').style.width = state.completion.art + '%';
    $('#art-pct').textContent = state.completion.art + '%';

    if (state.archetype) {
        const arch = ARCHETYPES[state.archetype];
        $('#stats-panel .panel-header').textContent = `${arch.icon} ${arch.name} · 属性`;
    }

    const statNames = { social: '社交', practice: '实践', sport: '体育' };
    const statKeys = ['social', 'practice', 'sport'];
    const maxStat = Math.max(50, state.social, state.practice, state.sport, 40);
    let statHTML = '';
    for (const k of statKeys) {
        const v = state[k];
        const pct = Math.min(v / (maxStat + 10) * 100, 95);
        statHTML += `<div class="stat-row">
            <span class="stat-label">${statNames[k]}</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill ${k}" style="width:${pct}%"></div></div>
            <span class="stat-value">${v}</span>
        </div>`;
    }
    $('#stats-bars').innerHTML = statHTML;

    const roleLabels = { pigeon: '💻代码', scrollKing: '📝文案', slacker: '🎨美术' };
    let famHTML = '';
    for (const [key, tm] of Object.entries(TEAMMATES)) {
        const fam = state.familiarity[key] || 0;
        const hearts = '♥'.repeat(Math.min(fam, 4)) + '♡'.repeat(Math.max(0, 4 - fam));
        const avatarHTML = tm.qAvatar
            ? `<img src="${tm.qAvatar}" class="fam-avatar" onerror="this.outerHTML='${tm.icon}'">`
            : tm.icon;
        famHTML += `<div class="fam-row"><span class="fam-name">${avatarHTML} ${tm.name}</span><span class="fam-hearts">${hearts}</span><span class="fam-role">${roleLabels[key] || ''}</span></div>`;
    }
    $('#fam-display').innerHTML = famHTML;

    const sanPct = (state.sanity / state.maxSanity * 100);
    const sanFill = $('#sanity-fill');
    sanFill.style.width = sanPct + '%';
    sanFill.className = sanPct > 60 ? 'healthy' : sanPct > 30 ? 'warning' : 'danger';
    $('#sanity-text').textContent = `${state.sanity} / ${state.maxSanity}`;

    const sanDelta = state.sanity - state._prevSanity;
    if (sanDelta !== 0 && state.phase !== 'title' && state.phase !== 'character') {
        const wrapper = $('#sanity-bar-wrapper');
        if (wrapper) {
            wrapper.style.position = 'relative';
            const floatEl = document.createElement('span');
            floatEl.className = 'san-change-float';
            floatEl.style.color = sanDelta > 0 ? 'var(--accent-green)' : 'var(--accent)';
            floatEl.textContent = (sanDelta > 0 ? '+' : '') + sanDelta;
            wrapper.appendChild(floatEl);
            setTimeout(() => floatEl.remove(), 1300);
        }
    }
    state._prevSanity = state.sanity;

    if (state.sanity <= 20 && state._sanThreshold > 20) {
        state._sanThreshold = 20;
        showSanWarning(`
            <div class="san-warning critical">
                <div class="san-warning-icon">💀</div>
                <div class="san-warning-title">精神崩溃边缘！</div>
                <div class="san-warning-text">你的手在发抖，屏幕上的字开始模糊……<br>
                <span style="color:var(--accent)">理智值已降至 ${state.sanity}，低于15将直接结束游戏！</span></div>
                <div class="phase-actions"><button class="btn-action" id="san-warn-ok">咬牙坚持</button></div>
            </div>
        `);
        $('#san-warn-ok').addEventListener('click', hideSanWarning);
    } else if (state.sanity <= 30 && state._sanThreshold > 30) {
        state._sanThreshold = 30;
        showSanWarning(`
            <div class="san-warning danger">
                <div class="san-warning-icon">😰</div>
                <div class="san-warning-title">精神状态告急！</div>
                <div class="san-warning-text">黑眼圈已经遮不住了……<br>
                <span style="color:var(--accent-yellow)">理智值降至 ${state.sanity}，连续两天低于30将直接结束游戏！</span></div>
                <div class="phase-actions"><button class="btn-action" id="san-warn-ok">我知道了</button></div>
            </div>
        `);
        $('#san-warn-ok').addEventListener('click', hideSanWarning);
    } else if (state.sanity <= 50 && state._sanThreshold > 50) {
        state._sanThreshold = 50;
        showSanWarning(`
            <div class="san-warning mild">
                <div class="san-warning-icon">😫</div>
                <div class="san-warning-title">感觉有点疲惫了……</div>
                <div class="san-warning-text">注意安排休息活动来恢复理智。</div>
                <div class="phase-actions"><button class="btn-action" id="san-warn-ok">好的</button></div>
            </div>
        `);
        $('#san-warn-ok').addEventListener('click', hideSanWarning);
    }

    const contentEl = $('#content');
    if (contentEl) {
        contentEl.classList.remove('low-sanity', 'critical-sanity');
        if (state.sanity <= 15) contentEl.classList.add('critical-sanity');
        else if (state.sanity <= 30) contentEl.classList.add('low-sanity');
    }

    const dangerBg = document.querySelector('.bg-danger');
    const normalBg = document.querySelector('.bg-normal');
    if (dangerBg && normalBg) {
        if (state.sanity <= 30) {
            const intensity = 1 - (state.sanity / 30);
            dangerBg.style.opacity = intensity * 0.65;
            normalBg.style.opacity = 0.6 * (1 - intensity);
        } else {
            dangerBg.style.opacity = 0;
            normalBg.style.opacity = 0.6;
        }
    }

    let invHTML = '';
    const allItems = [...state.materials, ...state.items];
    if (allItems.length === 0) {
        invHTML = '<div class="inv-empty">空空如也</div>';
    } else {
        for (const m of state.materials) {
            const qClass = `quality-${m.quality}`;
            const qName = QUALITY_NAMES[m.quality] || m.quality;
            invHTML += `<div class="inv-item"><span class="inv-icon">${m.icon}</span><span class="inv-name">${m.name}</span><span class="inv-count ${qClass}">${qName}</span></div>`;
        }
        const itemDescs = { coffee: '化合+5%', oldwork: '品质+1档' };
        for (const it of state.items) {
            const desc = it.mergeEffect ? it.desc : (itemDescs[it.type] || '');
            const itIconHTML = it.image ? `<img src="${it.image}" class="inv-icon-img">` : `<span class="inv-icon">${it.icon}</span>`;
            invHTML += `<div class="inv-item">${itIconHTML}<span class="inv-name">${it.name}</span></div>`;
            if (desc) {
                invHTML += `<div class="inv-desc">${desc}</div>`;
            }
        }
    }
    $('#inventory-list').innerHTML = invHTML;
}

// ==================== 新手教程 ====================

function showTutorial(callback) {
    const isMobile = window.innerWidth <= 600;
    const steps = [
        { target: '#sanity-panel', text: '这是你的理智值。低于 15 会直接结束游戏，连续两天低于 30 也会崩溃退出，注意保持！' },
        { target: '#hud-top .hud-right-group', text: '作业的总体完成度。代码、文案、美术三个模块均衡发展效果最好。' },
        { target: '#stats-panel', text: '社交影响掷骰加成，实践影响化合成功率，体育影响行动力（AP）。' },
        { target: '#fam-panel', text: '抓到队友会提升好感。好感越高，掷骰越容易，还能触发羁绊事件获得道具。' }
    ];
    if (isMobile) {
        steps.push({ target: '#sidebar-toggle', text: '点击这里可以随时展开或收起左侧面板，查看属性、好感和背包。' });
    }

    let currentStep = 0;

    const blocker = document.createElement('div');
    blocker.className = 'tutorial-blocker';

    const ring = document.createElement('div');
    ring.className = 'tutorial-ring';

    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';

    document.body.appendChild(blocker);
    document.body.appendChild(ring);
    document.body.appendChild(tooltip);

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.add('sidebar-expanded');

    function showStep(idx) {
        const step = steps[idx];
        const target = document.querySelector(step.target);
        if (!target) { finish(); return; }

        target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        const rect = target.getBoundingClientRect();
        const pad = 6;
        ring.style.left = (rect.left - pad) + 'px';
        ring.style.top = (rect.top - pad) + 'px';
        ring.style.width = (rect.width + pad * 2) + 'px';
        ring.style.height = (rect.height + pad * 2) + 'px';

        const isLast = idx === steps.length - 1;
        tooltip.innerHTML = `
            <div class="tutorial-step">${idx + 1} / ${steps.length}</div>
            <div class="tutorial-text">${step.text}</div>
            <button class="btn-action tutorial-btn">${isLast ? '开始游戏！' : '下一步 →'}</button>
        `;

        let left = rect.right + 16;
        let top = rect.top;
        if (left + 280 > window.innerWidth - 20) {
            left = Math.max(20, rect.left);
            top = rect.bottom + 12;
        }
        tooltip.style.left = left + 'px';
        tooltip.style.top = Math.min(top, window.innerHeight - 200) + 'px';

        tooltip.querySelector('.tutorial-btn').addEventListener('click', () => {
            currentStep++;
            if (currentStep >= steps.length) finish();
            else showStep(currentStep);
        });
    }

    function finish() {
        ring.remove();
        tooltip.remove();
        blocker.remove();
        if (sidebar) sidebar.classList.remove('sidebar-expanded');
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) toggleBtn.textContent = '展开面板 ▼';
        if (callback) callback();
    }

    showStep(0);
}
