// ============================================================
//  main.js — 初始化 + 日流程编排
// ============================================================

function initTitle() {
    const btn = $('#start-btn');
    const handler = () => {
        btn.removeEventListener('click', handler);
        showScreen('#game-screen');
        showCharacterCreation();
    };
    btn.addEventListener('click', handler);
}

function startDay() {
    state.captured = false;
    state.todayMaterial = null;
    state.currentTeammate = null;
    state.growthChoicesMade = 0;
    state.ap = state.baseAP + state.bonusAP + Math.floor(state.sport / 5);
    state.bonusAP = ARCHETYPES[state.archetype].bonusAP;

    if (state.sanity < 15) {
        determineEnding();
        return;
    }

    state.sanity -= 1;
    state.sanity = clamp(state.sanity, 0, state.maxSanity);

    if (state.sanity < 15) {
        determineEnding();
        return;
    }

    assignTeammateLocations();
    if (state.day === 1) {
        state.phase = 'intel';
        updateHUD();
        showTutorial(() => showPhaseIntel());
    } else {
        showPhaseIntel();
    }
}

async function endDay() {
    if (state.sanity < 15) {
        determineEnding();
        return;
    }

    if (state.sanity < 30) {
        state.lowSanDays++;
    } else {
        state.lowSanDays = 0;
    }

    if (state.lowSanDays >= 2) {
        notify('连续两天精神状态低迷，你的身体终于撑不住了……', 'debuff', 3000);
        updateHUD();
        await delay(2000);
        determineEnding();
        return;
    }

    if (state.aiRisk) {
        state.aiRisk = false;
        const penalty = 5;
        state.completion.code = clamp(state.completion.code - penalty, 0, 100);
        notify('昨天用的策划案原来是AI生成的垃圾！进度倒退！', 'debuff', 3000);
        updateHUD();
        await delay(2000);
    }

    state.day++;

    if (state.day > state.maxDay) {
        determineEnding();
        return;
    }

    await showDayTransition();
    startDay();
}

async function showDayTransition() {
    const div = document.createElement('div');
    div.className = 'day-transition';
    div.innerHTML = `<h2>第 ${state.day} 天</h2><p>${state.day <= state.maxDay ? '新的一天开始了……' : '最终之日'}</p>`;
    document.body.appendChild(div);
    await delay(2000);
    div.remove();
}

// ==================== INIT ====================

window.addEventListener('DOMContentLoaded', () => {
    initTitle();

    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const expanded = sidebar.classList.toggle('sidebar-expanded');
            sidebarToggle.textContent = expanded ? '收起面板 ▲' : '展开面板 ▼';
        });
    }
});
