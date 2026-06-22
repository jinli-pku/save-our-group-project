// ============================================================
//  state.js — 游戏状态 + 工具函数
// ============================================================

const state = {
    day: 1,
    maxDay: 5,
    phase: 'title',
    archetype: null,

    social: 10,
    practice: 10,
    sport: 10,
    sanity: 70,
    maxSanity: 100,

    ap: 12,
    baseAP: 12,
    bonusAP: 0,

    completion: { code: 0, writing: 0, art: 0 },

    materials: [],
    items: [],

    familiarity: { pigeon: 0, scrollKing: 0, slacker: 0 },
    familiarityTriggered: { pigeon: [], scrollKing: [], slacker: [] },

    catBlessing: false,
    aiRisk: false,
    _prevSanity: 70,
    _sanThreshold: 100,

    currentLocation: null,
    currentTeammate: null,
    captured: false,
    todayMaterial: null,
    growthChoicesMade: 0,

    totalMaterialsCollected: 0,
    teammateLocations: {},
    yesterdayResult: null,
    lowSanDays: 0,
    chatOrder: [],

    difficulty: function () {
        return 8 + this.day * 2;
    }
};

function resetState() {
    state.day = 1;
    state.phase = 'title';
    state.archetype = null;
    state.social = 10;
    state.practice = 10;
    state.sport = 10;
    state.sanity = 70;
    state.maxSanity = 100;
    state.ap = 12;
    state.baseAP = 12;
    state.bonusAP = 0;
    state.completion = { code: 0, writing: 0, art: 0 };
    state.materials = [];
    state.items = [];
    state.familiarity = { pigeon: 0, scrollKing: 0, slacker: 0 };
    state.familiarityTriggered = { pigeon: [], scrollKing: [], slacker: [] };
    state.catBlessing = false;
    state.aiRisk = false;
    state._prevSanity = 70;
    state._sanThreshold = 100;
    state.currentLocation = null;
    state.currentTeammate = null;
    state.captured = false;
    state.todayMaterial = null;
    state.growthChoicesMade = 0;
    state.totalMaterialsCollected = 0;
    state.teammateLocations = {};
    state.yesterdayResult = null;
    state.lowSanDays = 0;
    const indices = Array.from({ length: WECHAT_POOL.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    state.chatOrder = indices.slice(0, 4);
}

// ==================== 计算函数 ====================

function totalCompletion() {
    const { code, writing, art } = state.completion;
    const avg = (code + writing + art) / 3;
    if (avg <= 0) return 0;
    const variance = ((code - avg) ** 2 + (writing - avg) ** 2 + (art - avg) ** 2) / 3;
    const sigma = Math.sqrt(variance);
    return Math.round(Math.max(0, avg - 0.15 * sigma));
}

function socialBonus() {
    return Math.floor(state.social / 7);
}

function practiceBonus() {
    return Math.floor(state.practice / 7) * 3;
}

function getDC(teammateKey) {
    const baseDC = TEAMMATES[teammateKey].catchDC;
    const fam = state.familiarity[teammateKey] || 0;
    return Math.max(4, baseDC - fam);
}

// ==================== 通用工具 ====================

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, lo, hi) {
    return Math.max(lo, Math.min(hi, val));
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}
