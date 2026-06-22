// ============================================================
//  events.js — 随机事件 + 熟悉度事件系统
// ============================================================

function applyEventEffects(effects) {
    for (const e of effects) {
        if (e.stat === 'bonusAP') {
            state.bonusAP += e.value;
            state.ap = Math.max(1, state.ap + e.value);
        } else {
            state[e.stat] = clamp((state[e.stat] || 0) + e.value, 0, e.stat === 'sanity' ? state.maxSanity : 99);
        }
    }
}

function triggerRandomEvent(callback) {
    const buffs = RANDOM_EVENTS.filter(e => e.type === 'buff');
    const debuffs = RANDOM_EVENTS.filter(e => e.type === 'debuff');
    const choices = RANDOM_EVENTS.filter(e => e.type === 'choice');
    const roll = Math.random();
    const event = roll < 0.4 ? pick(buffs) : roll < 0.8 ? pick(debuffs) : pick(choices);

    if (event.type === 'choice') {
        showChoiceEvent(event, callback);
    } else {
        applyEventEffects(event.effects);

        if (event.item) {
            state.items.push({ ...event.item });
        }
        if (event.buff === 'catBlessing') {
            state.catBlessing = true;
        }

        const effectTexts = event.effects.map(e => {
            const names = { sanity: '理智', social: '社交', practice: '实践', sport: '体育', bonusAP: '额外AP' };
            const sign = e.value > 0 ? '+' : '';
            return `<span class="${e.value > 0 ? 'effect-positive' : 'effect-negative'}">${names[e.stat]} ${sign}${e.value}</span>`;
        }).join('　');

        showModal(`
            <div class="event-card ${event.type}">
                <div class="event-title">🎲 随机事件：${event.name}</div>
                <div class="event-desc">${event.desc}</div>
                <div class="event-effect">${effectTexts}</div>
                ${event.item ? `<div style="margin-top:8px;font-size:13px;color:var(--accent-green)">获得道具：${event.item.icon} ${event.item.name}</div>` : ''}
                ${event.buff === 'catBlessing' ? '<div style="margin-top:8px;font-size:13px;color:var(--accent-green)">获得 Buff：猫の祝福（下次检定自动成功）</div>' : ''}
            </div>
            <div class="phase-actions"><button class="btn-action" id="event-ok">知道了</button></div>
        `);

        updateHUD();

        $('#event-ok').addEventListener('click', () => {
            hideModal();
            callback();
        });
    }
}

function showChoiceEvent(event, callback) {
    let choicesHTML = '<div class="event-choices">';
    event.choices.forEach((c, i) => {
        choicesHTML += `<button class="event-choice-btn" data-idx="${i}">${c.text}</button>`;
    });
    choicesHTML += '</div>';

    showModal(`
        <div class="event-card choice">
            <div class="event-title">🎲 随机事件：${event.name}</div>
            <div class="event-desc">${event.desc}</div>
            ${choicesHTML}
        </div>
    `);

    $$('.event-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            const choice = event.choices[idx];
            applyEventEffects(choice.effects);

            if (choice.pushProgress) {
                const types = ['code', 'writing', 'art'];
                const t = pick(types);
                state.completion[t] = clamp(state.completion[t] + 1, 0, 100);
                notify(`${TYPE_NAMES[t]}完成度 +1%`, 'buff');
            }

            if (choice.risky && Math.random() < 0.5) {
                state.aiRisk = true;
                notify('你觉得这份策划案写得很好……明天再看看吧', 'debuff', 3000);
            }
            if (choice.safe) {
                notify('你识破了AI生成的内容，打回重做！', 'buff');
            }

            updateHUD();
            hideModal();
            callback();
        });
    });
}

// ==================== 熟悉度事件 ====================

function checkFamiliarityEvents(callback) {
    const pending = [];
    for (const key of Object.keys(FAMILIARITY_EVENTS)) {
        for (const threshold of [1, 3, 4]) {
            const fam = state.familiarity[key] || 0;
            if (fam >= threshold && !state.familiarityTriggered[key].includes(threshold)) {
                pending.push({ key, threshold });
            }
        }
    }

    if (pending.length === 0) {
        callback();
        return;
    }

    showFamiliarityEventChain(pending, 0, callback);
}

function showFamiliarityEventChain(pending, index, callback) {
    if (index >= pending.length) {
        callback();
        return;
    }

    const { key, threshold } = pending[index];
    showFamiliarityEvent(key, threshold, () => {
        showFamiliarityEventChain(pending, index + 1, callback);
    });
}

function showFamiliarityEvent(teammateKey, level, callback) {
    const evt = FAMILIARITY_EVENTS[teammateKey][level];
    const tm = TEAMMATES[teammateKey];

    state.familiarityTriggered[teammateKey].push(level);

    const item = {
        name: evt.name,
        icon: evt.icon,
        image: evt.image || null,
        type: 'familiarity',
        desc: evt.desc,
        mergeEffect: evt.mergeEffect
    };
    state.items.push(item);
    updateHUD();

    const iconHTML = evt.image
        ? `<img src="${evt.image}" style="width:28px;height:28px;object-fit:contain;vertical-align:middle;margin-right:4px">`
        : evt.icon;

    showModal(`
        <div class="event-card familiarity">
            <div class="event-title">${tm.icon} 羁绊事件：${evt.name}</div>
            <div class="fam-story">${evt.story.replace(/\n/g, '<br>')}</div>
            <div style="margin-top:12px;padding:8px 12px;background:rgba(78,204,163,0.1);border-radius:6px;border-left:3px solid var(--accent-green)">
                <div style="font-size:13px;color:var(--accent-green)">获得道具：${iconHTML} ${evt.name}</div>
                <div style="font-size:12px;color:var(--text-dim);margin-top:4px">${evt.desc}</div>
            </div>
        </div>
        <div class="phase-actions"><button class="btn-action" id="fam-evt-ok">继续</button></div>
    `);

    $('#fam-evt-ok').addEventListener('click', () => {
        hideModal();
        callback();
    });
}
