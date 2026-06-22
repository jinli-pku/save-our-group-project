// ============================================================
//  capture.js — GridCaptureGame 网格抓捕小游戏
// ============================================================

let gridGame = null;

class GridCaptureGame {
    constructor(canvas, opts) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = opts.gridSize;
        this.cellSize = opts.cellSize;
        this.ap = opts.ap;
        this.teammate = opts.teammate;
        this.tmSpeed = opts.teammateSpeed || 1;
        this.obsCount = opts.obsCount || [8, 14];
        this.itemCount = opts.itemCount || 2;
        this.obsIcon = opts.obsIcon || '🪑';
        this.onComplete = opts.onComplete;
        this.onAPChange = opts.onAPChange;

        this.player = { x: 0, y: this.gridSize - 1 };
        this.target = { x: this.gridSize - 2, y: 1 };
        this.obstacles = [];
        this.obsSet = new Set();
        this.gridItems = [];
        this.collectedItems = [];
        this.moveCount = 0;
        this.done = false;
        this.paused = false;

        this.tmImage = new Image();
        this.tmImage.src = this.teammate.qAvatar || this.teammate.avatar;
        this.tmImageLoaded = false;
        this.tmImage.onload = () => { this.tmImageLoaded = true; this.render(); };

        this.itemImages = {};
        const imgPaths = {
            coffee: '../asset/tool+role/地图道具/咖啡.png',
            oldwork: '../asset/tool+role/地图道具/往年作业.png',
            energy: '../asset/tool+role/地图道具/能量饮料.png'
        };
        for (const [type, src] of Object.entries(imgPaths)) {
            const img = new Image();
            img.src = src;
            img.onload = () => this.render();
            this.itemImages[type] = img;
        }

        this.generateMap();
        this.keyHandler = (e) => this.handleKey(e);
        window.addEventListener('keydown', this.keyHandler);
        this.render();
    }

    isReachableFrom(from, to, obstacles) {
        const visited = new Set();
        const queue = [`${from.x},${from.y}`];
        visited.add(queue[0]);
        while (queue.length > 0) {
            const [cx, cy] = queue.shift().split(',').map(Number);
            if (cx === to.x && cy === to.y) return true;
            for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
                const nx = cx + dx, ny = cy + dy;
                const key = `${nx},${ny}`;
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) continue;
                if (visited.has(key) || obstacles.has(key)) continue;
                visited.add(key);
                queue.push(key);
            }
        }
        return false;
    }

    generateMap() {
        const reserved = new Set();
        reserved.add(`${this.player.x},${this.player.y}`);
        reserved.add(`${this.target.x},${this.target.y}`);

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                reserved.add(`${this.player.x + x},${this.player.y + y}`);
                reserved.add(`${this.target.x + x},${this.target.y + y}`);
            }
        }

        const [obsMin, obsMax] = this.obsCount;
        const numObs = rand(obsMin, obsMax);
        for (let i = 0; i < numObs; i++) {
            let x, y, attempts = 0;
            do {
                x = rand(0, this.gridSize - 1);
                y = rand(0, this.gridSize - 1);
                attempts++;
            } while ((reserved.has(`${x},${y}`) || this.obsSet.has(`${x},${y}`)) && attempts < 100);
            if (attempts >= 100) break;
            this.obsSet.add(`${x},${y}`);
            if (!this.isReachableFrom(this.player, this.target, this.obsSet)) {
                this.obsSet.delete(`${x},${y}`);
                continue;
            }
            this.obstacles.push({ x, y });
        }

        const blocked = new Set([...reserved, ...this.obsSet]);

        const itemPool = [
            { name: '瑞幸咖啡', icon: '☕', type: 'coffee', image: '../asset/tool+role/地图道具/咖啡.png' },
            { name: '往年作业', icon: '📄', type: 'oldwork', image: '../asset/tool+role/地图道具/往年作业.png' },
            { name: '能量饮料', icon: '🥤', type: 'energy', image: '../asset/tool+role/地图道具/能量饮料.png' }
        ];
        const ic = this.itemCount;
        const numItems = Array.isArray(ic) ? rand(ic[0], ic[1]) : ic;
        const halfGrid = Math.floor(this.gridSize / 2);

        for (let i = 0; i < numItems; i++) {
            let x, y, attempts = 0;
            let placed = false;
            do {
                x = rand(0, this.gridSize - 1);
                y = rand(0, this.gridSize - 1);
                attempts++;
                if (blocked.has(`${x},${y}`)) continue;
                const distToTarget = Math.abs(x - this.target.x) + Math.abs(y - this.target.y);
                if (distToTarget < halfGrid && attempts < 80) continue;
                // Bug fix: check item is reachable from player
                if (this.isReachableFrom(this.player, { x, y }, this.obsSet)) {
                    placed = true;
                    break;
                }
            } while (attempts < 100);

            if (!placed) {
                // Fallback: find any reachable unblocked cell
                for (let fy = 0; fy < this.gridSize && !placed; fy++) {
                    for (let fx = 0; fx < this.gridSize && !placed; fx++) {
                        if (!blocked.has(`${fx},${fy}`) && this.isReachableFrom(this.player, { x: fx, y: fy }, this.obsSet)) {
                            x = fx; y = fy; placed = true;
                        }
                    }
                }
            }

            if (placed) {
                const item = itemPool[i % itemPool.length];
                this.gridItems.push({ x, y, ...item });
                blocked.add(`${x},${y}`);
            }
        }
    }

    isBlocked(x, y) {
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return true;
        return this.obsSet.has(`${x},${y}`);
    }

    handleKey(e) {
        if (this.done || this.paused) return;
        let dx = 0, dy = 0;
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': dy = -1; break;
            case 'ArrowDown': case 's': case 'S': dy = 1; break;
            case 'ArrowLeft': case 'a': case 'A': dx = -1; break;
            case 'ArrowRight': case 'd': case 'D': dx = 1; break;
            default: return;
        }
        e.preventDefault();
        this.movePlayer(dx, dy);
    }

    movePlayer(dx, dy) {
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;
        if (this.isBlocked(nx, ny)) return;
        if (this.ap <= 0) return;

        this.player.x = nx;
        this.player.y = ny;
        this.ap--;
        this.moveCount++;
        this.onAPChange(this.ap);

        const itemIdx = this.gridItems.findIndex(it => it.x === nx && it.y === ny);
        if (itemIdx >= 0) {
            const item = this.gridItems.splice(itemIdx, 1)[0];
            this.paused = true;
            const self = this;
            const pickupIcon = item.image ? `<img src="${item.image}" style="width:36px;height:36px;object-fit:contain">` : item.icon;
            if (item.type === 'energy') {
                this.ap += 3;
                this.onAPChange(this.ap);
                notify(`捡到 ${item.icon} ${item.name}！AP +3！`, 'buff');
                showItemPickup(pickupIcon, item.name, '立即恢复 3 点行动力 (AP)');
            } else {
                this.collectedItems.push({ name: item.name, icon: item.icon, type: item.type, image: item.image });
                state.items.push({ name: item.name, icon: item.icon, type: item.type, image: item.image });
                updateHUD();
                const descs = {
                    coffee: '缝合（化合）阶段成功率 +5%',
                    oldwork: '掷骰阶段获得的材料品质提升一档'
                };
                notify(`捡到 ${item.icon} ${item.name}！`, 'buff');
                showItemPickup(pickupIcon, item.name, descs[item.type] || '已存入背包');
            }
            setTimeout(() => { if (!self.done) self.paused = false; }, 2500);
        }

        if (nx === this.target.x && ny === this.target.y) {
            this.done = true;
            this.render();
            this.destroy();
            this.onComplete({ captured: true, ap: this.ap, items: this.collectedItems });
            return;
        }

        if (this.moveCount % 3 === 0) this.moveTarget();

        if (this.player.x === this.target.x && this.player.y === this.target.y) {
            this.done = true;
            this.render();
            this.destroy();
            this.onComplete({ captured: true, ap: this.ap, items: this.collectedItems });
            return;
        }

        if (this.ap <= 0) {
            this.done = true;
            this.render();
            this.destroy();
            this.onComplete({ captured: false, ap: 0, items: this.collectedItems });
            return;
        }

        this.render();
    }

    moveTarget() {
        const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

        dirs.sort((a, b) => {
            const distA = Math.abs(this.target.x + a.x - this.player.x) + Math.abs(this.target.y + a.y - this.player.y);
            const distB = Math.abs(this.target.x + b.x - this.player.x) + Math.abs(this.target.y + b.y - this.player.y);
            return distB - distA;
        });

        if (Math.random() < 0.3) {
            dirs.sort(() => Math.random() - 0.5);
        }

        for (const d of dirs) {
            const nx = this.target.x + d.x;
            const ny = this.target.y + d.y;
            if (!this.isBlocked(nx, ny)) {
                this.target.x = nx;
                this.target.y = ny;
                return;
            }
        }
    }

    bfsDirection(from, to) {
        const visited = new Set();
        const queue = [{ x: from.x, y: from.y, firstDir: null }];
        visited.add(`${from.x},${from.y}`);
        while (queue.length > 0) {
            const cur = queue.shift();
            if (cur.x === to.x && cur.y === to.y) return cur.firstDir;
            for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
                const nx = cur.x + dx, ny = cur.y + dy;
                const key = `${nx},${ny}`;
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) continue;
                if (visited.has(key) || this.isBlocked(nx, ny)) continue;
                visited.add(key);
                queue.push({ x: nx, y: ny, firstDir: cur.firstDir || { x: dx, y: dy } });
            }
        }
        return null;
    }

    shout() {
        if (this.done || this.paused || this.ap < 3) {
            if (this.ap < 3) notify('AP不足！需要3AP', 'debuff');
            return;
        }
        this.ap -= 3;
        this.onAPChange(this.ap);

        const steps = rand(1, 5);
        let actualSteps = 0;
        for (let i = 0; i < steps; i++) {
            const dir = this.bfsDirection(this.target, this.player);
            if (!dir) break;
            this.target.x += dir.x;
            this.target.y += dir.y;
            actualSteps++;
            if (this.target.x === this.player.x && this.target.y === this.player.y) break;
        }

        if (actualSteps > 0) {
            notify(`队友被你的呼喊吸引，向你靠近了${actualSteps}步！`, 'buff');
        } else {
            notify('队友被障碍物挡住了，无法靠近！', 'debuff');
        }

        if (this.player.x === this.target.x && this.player.y === this.target.y) {
            this.done = true;
            this.render();
            this.destroy();
            this.onComplete({ captured: true, ap: this.ap, items: this.collectedItems });
            return;
        }

        if (this.ap <= 0) {
            this.done = true;
            this.render();
            this.destroy();
            this.onComplete({ captured: false, ap: 0, items: this.collectedItems });
            return;
        }

        this.render();
    }

    render() {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const gs = this.gridSize;

        ctx.fillStyle = '#111122';
        ctx.fillRect(0, 0, gs * cs, gs * cs);

        ctx.strokeStyle = '#222244';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gs; i++) {
            ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, gs * cs); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * cs); ctx.lineTo(gs * cs, i * cs); ctx.stroke();
        }

        for (const obs of this.obstacles) {
            ctx.fillStyle = '#333355';
            ctx.fillRect(obs.x * cs + 2, obs.y * cs + 2, cs - 4, cs - 4);
            ctx.font = `${cs * 0.4}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.obsIcon, obs.x * cs + cs / 2, obs.y * cs + cs / 2);
        }

        for (const item of this.gridItems) {
            const itemImg = this.itemImages[item.type];
            if (itemImg && itemImg.complete && itemImg.naturalWidth > 0) {
                const pad = 4;
                ctx.drawImage(itemImg, item.x * cs + pad, item.y * cs + pad, cs - pad * 2, cs - pad * 2);
            } else {
                ctx.font = `${cs * 0.5}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.icon, item.x * cs + cs / 2, item.y * cs + cs / 2);
            }
        }

        if (this.tmImageLoaded) {
            const pad = 2;
            ctx.drawImage(this.tmImage, this.target.x * cs + pad, this.target.y * cs + pad, cs - pad * 2, cs - pad * 2);
        } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(this.target.x * cs + 4, this.target.y * cs + 4, cs - 8, cs - 8);
            ctx.font = `${cs * 0.45}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.teammate.icon, this.target.x * cs + cs / 2, this.target.y * cs + cs / 2);
        }

        ctx.fillStyle = '#4488ff';
        ctx.beginPath();
        ctx.arc(this.player.x * cs + cs / 2, this.player.y * cs + cs / 2, cs * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `${cs * 0.35}px serif`;
        ctx.fillText('🏃', this.player.x * cs + cs / 2, this.player.y * cs + cs / 2);
    }

    destroy() {
        window.removeEventListener('keydown', this.keyHandler);
        gridGame = null;
    }
}
