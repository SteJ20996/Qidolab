(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EchoCourtGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const Court = Object.freeze({ width: 1000, height: 620, left: 62, right: 938, top: 104, bottom: 550, centerX: 500, centerY: 327 });
  const SoloCourt = Object.freeze({ ...Court, width: 560, right: Court.centerX, centerX: (Court.left + Court.centerX) / 2 });
  const Racket = Object.freeze({ pivotX: 12, pivotY: 9, headX: 12, headY: -5, radiusX: 12, radiusY: 16, tilt: 0.4 });
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function seededRandom(seed) {
    let s = seed >>> 0;
    return function () { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  }
  function distanceToSegmentSquared(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy;
    const u = length ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / length, 0, 1) : 0;
    const x = a.x + dx * u, y = a.y + dy * u;
    return (p.x - x) ** 2 + (p.y - y) ** 2;
  }
  function paddlePose(p) {
    const side = p.side === undefined ? (p.id ? -1 : 1) : p.side;
    const swingAngle = p.swing > 0 ? side * (-0.5 + (0.24 - p.swing) * 6) : side * 0.15;
    return {
      x: p.x + side * Racket.pivotX + side * Racket.headX * Math.cos(swingAngle) - Racket.headY * Math.sin(swingAngle),
      y: p.y + Racket.pivotY + side * Racket.headX * Math.sin(swingAngle) + Racket.headY * Math.cos(swingAngle),
      angle: swingAngle + side * Racket.tilt, swingAngle: swingAngle, radiusX: Racket.radiusX, radiusY: Racket.radiusY
    };
  }
  function paddleContact(previousBall, ball, oldPose, pose) {
    const padding = ball.radius + 7, cos = Math.cos(pose.angle), sin = Math.sin(pose.angle);
    function relative(point, center) {
      const dx = point.x - center.x, dy = point.y - center.y;
      return { x: (dx * cos + dy * sin) / (pose.radiusX + padding), y: (-dx * sin + dy * cos) / (pose.radiusY + padding) };
    }
    return distanceToSegmentSquared({ x: 0, y: 0 }, relative(previousBall, oldPose), relative(ball, pose)) <= 1;
  }
  function replayPoint(path, age) {
    if (age <= 0) return { x: path[0].x, y: path[0].y };
    const last = path[path.length - 1];
    if (age >= last.t) return { x: last.x, y: last.y };
    let lo = 0, hi = path.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (path[mid].t <= age) lo = mid; else hi = mid; }
    const a = path[lo], b = path[hi], u = (age - a.t) / (b.t - a.t || 1);
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  }
  class EchoCourt {
    constructor(options) {
      this.config = Object.assign({ mode: 'practice', echoEnabled: true, echoDelay: 1.8, assist: true, pace: 'chill', winScore: 5, practiceTarget: 12 }, options || {});
      this.random = this.config.random || Math.random;
      this.reset();
    }
    reset(overrides) {
      if (overrides) Object.assign(this.config, overrides);
      this.state = 'ready'; this.clock = 0; this.scores = [0, 0]; this.hearts = this.isCoop ? 1 : 3;
      this.returns = 0; this.rally = 0; this.bestRally = 0; this.winner = null;
      this.echoes = []; this.leg = []; this.particles = []; this.events = [];
      this.nextEchoId = 1; this.lastCause = ''; this.lastVictim = -1;
      this.players = [0, 1].map(function (id) {
        return { id: id, x: id ? 780 : 220, y: Court.centerY, vx: 0, vy: 0, radius: 16, swing: 0, cooldown: 0, invulnerable: 0, face: id ? Math.PI : 0 };
      });
      this.prepareServe(0, 0.7);
    }
    configure(options) {
      Object.assign(this.config, options);
      this.config.echoDelay = clamp(Number(this.config.echoDelay) || 1.8, 0.8, 3.2);
      if (!this.config.echoEnabled) this.echoes = [];
    }
    start() {
      if (this.state === 'finished') this.reset();
      if (this.state === 'ready' || this.state === 'paused') { this.state = 'running'; this.emit({ type: 'start' }); }
    }
    pause() { if (this.state === 'running') this.state = 'paused'; }
    resume() { if (this.state === 'paused') this.state = 'running'; }
    emit(event) { this.events.push(event); if (this.events.length > 64) this.events.shift(); }
    drainEvents() { const result = this.events; this.events = []; return result; }
    get isCoop() { return this.config.mode === 'coop'; }
    get isWall() { return this.config.mode !== 'local'; }
    get isSolo() { return this.isWall && !this.isCoop; }
    get isChallenge() { return this.config.mode === 'endless' || this.isCoop; }
    get court() { return this.isWall ? SoloCourt : Court; }
    movementBounds(id) {
      return { left: !this.isWall && id ? 580 : this.court.left - 12, right: this.isWall ? SoloCourt.centerX - 28 : id ? this.court.right + 12 : 420, top: this.court.top + 28, bottom: this.court.bottom - 28 };
    }
    get baseBallSpeed() { return this.config.pace === 'quick' ? 430 : 350; }
    get difficultyTier() {
      if (!this.isChallenge) return 0;
      return this.returns < 20 ? Math.floor(this.returns / 5) : 4 + Math.floor((this.returns - 20) / 10);
    }
    get endlessSpeed() { return this.baseBallSpeed + this.difficultyTier * (this.config.pace === 'quick' ? 60 : 50); }
    get nextSpeedAt() { return this.returns < 20 ? (Math.floor(this.returns / 5) + 1) * 5 : 30 + Math.floor((this.returns - 20) / 10) * 10; }
    get echoTrailsVisible() { return !this.isChallenge || this.returns < 20; }
    get activeEchoCount() { return this.echoes.filter((e) => this.clock >= e.spawnAt).length; }
    get pendingEchoCount() { return this.echoes.filter((e) => this.clock < e.spawnAt).length; }
    prepareServe(target, wait) {
      this.serveTarget = target; this.serveWait = wait;
      this.ball = { x: this.isWall ? this.court.right - 28 : Court.centerX, y: Court.centerY, vx: 0, vy: 0, radius: 9, speed: this.isChallenge ? this.endlessSpeed : this.baseBallSpeed, active: false };
      this.leg = [];
      this.players.forEach((p) => { p.x = this.isCoop ? (p.id ? 95 : 215) : p.id ? 780 : this.isSolo ? 150 : 220; p.side = this.isWall || !p.id ? 1 : -1; p.y = Court.centerY; p.vx = 0; p.vy = 0; p.swing = 0; p.cooldown = 0; p.invulnerable = 0.5; });
    }
    launchServe() {
      const p = this.players[this.serveTarget], b = this.ball;
      const target = this.isWall ? paddlePose({ ...p, swing: 0 }) : p;
      const angle = Math.atan2(target.y - b.y, target.x - b.x);
      b.vx = Math.cos(angle) * b.speed; b.vy = Math.sin(angle) * b.speed; b.active = true;
      this.recordLeg(); this.emit({ type: 'serve' });
    }
    step(seconds, inputs) {
      if (this.state !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(seconds, 0.05);
      // Keep fast balls and echoes within eight world pixels per physics step.
      const fastest = Math.max(this.ball.speed, Math.hypot(this.ball.vx, this.ball.vy), ...this.echoes.map((e) => e.speed || 0));
      const n = Math.ceil(dt / Math.min(1 / 120, 8 / Math.max(1, fastest)));
      for (let i = 0; i < n && this.state === 'running'; i++) this.tick(dt / n, inputs || [{}, {}]);
    }
    tick(dt, inputs) {
      const oldTime = this.clock; this.clock += dt;
      const court = this.court;
      const oldPlayers = this.players.map((p) => ({ x: p.x, y: p.y, id: p.id, swing: p.swing, side: p.side }));
      for (const p of this.players) {
        p.swing = Math.max(0, p.swing - dt); p.cooldown = Math.max(0, p.cooldown - dt); p.invulnerable = Math.max(0, p.invulnerable - dt);
        if (this.isSolo && p.id === 1) continue;
        const input = inputs[p.id] || {};
        const speed = this.config.pace === 'quick' ? 390 : 345;
        const bounds = this.movementBounds(p.id);
        if (input.target && Number.isFinite(input.target.x) && Number.isFinite(input.target.y)) {
          const tx = clamp(input.target.x, bounds.left, bounds.right), ty = clamp(input.target.y, bounds.top, bounds.bottom);
          // Pointer placement follows within a frame or two; keyboard travel keeps its speed limit.
          const follow = 1 - Math.exp(-140 * dt), ox = p.x, oy = p.y;
          p.x += (tx - p.x) * follow; p.y += (ty - p.y) * follow;
          if (Math.abs(tx - p.x) < 0.25) p.x = tx;
          if (Math.abs(ty - p.y) < 0.25) p.y = ty;
          p.vx = clamp((p.x - ox) / dt, -speed, speed); p.vy = clamp((p.y - oy) / dt, -speed, speed);
        } else {
          let dx = Number(input.x) || 0, dy = Number(input.y) || 0;
          const length = Math.hypot(dx, dy); if (length > 1) { dx /= length; dy /= length; }
          const smooth = 1 - Math.exp(-18 * dt);
          p.vx += (dx * speed - p.vx) * smooth; p.vy += (dy * speed - p.vy) * smooth;
          p.x = clamp(p.x + p.vx * dt, bounds.left, bounds.right);
          p.y = clamp(p.y + p.vy * dt, bounds.top, bounds.bottom);
        }
        if (input.swing && p.cooldown === 0) { p.swing = 0.24; p.cooldown = 0.34; this.emit({ type: 'swing', player: p.id }); }
      }
      this.particles = this.particles.filter(function (p) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-2 * dt); p.vy *= Math.exp(-2 * dt); return p.life > 0; });
      if (this.serveWait > 0) {
        this.serveWait -= dt; if (this.serveWait <= 0) this.launchServe();
        return;
      }
      const b = this.ball, previous = { x: b.x, y: b.y };
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < court.top + b.radius) { b.y = court.top + b.radius + (court.top + b.radius - b.y); b.vy = Math.abs(b.vy); }
      if (b.y > court.bottom - b.radius) { b.y = court.bottom - b.radius - (b.y - court.bottom + b.radius); b.vy = -Math.abs(b.vy); }
      this.recordLeg();
      let struck = false;
      for (const p of this.players) {
        if (this.isSolo && p.id === 1) continue;
        const approaching = p.side < 0 ? b.vx > 0 : b.vx < 0;
        const inFront = p.side < 0 ? b.x < p.x + 18 : b.x > p.x - 18;
        const canReturn = this.config.assist || p.swing > 0;
        if (approaching && inFront && canReturn && paddleContact(previous, b, paddlePose(oldPlayers[p.id]), paddlePose(p))) {
          this.returnBall(p); struck = true; break;
        }
      }
      if (!struck && this.isWall && b.x >= court.right - b.radius && b.vx > 0) {
        b.x = court.right - b.radius;
        this.finishLeg(false);
        const target = paddlePose({ ...this.players[0], swing: 0 });
        const aim = clamp(target.y + (this.random() - 0.5) * 170, court.top + 50, court.bottom - 50);
        const angle = Math.atan2(aim - b.y, target.x - b.x);
        b.vx = Math.cos(angle) * b.speed; b.vy = Math.sin(angle) * b.speed;
        this.recordLeg(); this.emit({ type: 'wall' });
      }
      if (b.x < court.left - b.radius) { this.scorePoint(1, 'miss', this.isCoop ? -1 : 0); return; }
      if (!this.isWall && b.x > court.right + b.radius) { this.scorePoint(0, 'miss', 1); return; }
      const expired = [];
      for (const e of this.echoes) {
        if (this.clock < e.spawnAt) continue;
        if (!e.announced) { e.announced = true; this.emit({ type: 'echo', id: e.id }); }
        const a = replayPoint(e.path, Math.max(0, oldTime - e.spawnAt));
        const c = replayPoint(e.path, this.clock - e.spawnAt);
        e.x = c.x; e.y = c.y; e.age = this.clock - e.spawnAt;
        for (const p of this.players) {
          if (this.isSolo && p.id === 1) continue;
          if (p.invulnerable > 0) continue;
          const before = oldPlayers[p.id];
          if (distanceToSegmentSquared({ x: 0, y: 0 }, { x: a.x - before.x, y: a.y - before.y }, { x: c.x - p.x, y: c.y - p.y }) <= (p.radius + 12) ** 2) {
            this.scorePoint(1 - p.id, 'echo', p.id); return;
          }
        }
        if (e.age >= e.duration) expired.push(e.id);
      }
      if (expired.length) this.echoes = this.echoes.filter(function (e) { return !expired.includes(e.id); });
    }
    recordLeg() { this.leg.push({ x: this.ball.x, y: this.ball.y, t: this.clock }); if (this.leg.length > 720) this.leg.shift(); }
    finishLeg(makeEcho) {
      if (makeEcho && this.config.echoEnabled && this.leg.length > 1) {
        const first = this.leg[0], duration = this.leg[this.leg.length - 1].t - first.t;
        if (duration > (this.isChallenge ? 0 : 0.08)) {
          const path = this.leg.map(function (p) { return { x: p.x, y: p.y, t: p.t - first.t }; });
          // An echo ignores the racket and continues briefly through its old contact point.
          const end = path[path.length - 1], throughTime = 0.22;
          path.push({ x: end.x + this.ball.vx * throughTime, y: end.y + this.ball.vy * throughTime, t: end.t + throughTime });
          this.echoes.push({ id: this.nextEchoId++, spawnAt: this.clock + this.config.echoDelay, path: path, speed: Math.hypot(this.ball.vx, this.ball.vy), duration: duration + throughTime, x: first.x, y: first.y, age: 0, announced: false });
          // Endless hazards expire by time; fast rallies must not drop pending echoes before they spawn.
          if (!this.isChallenge && this.echoes.length > 12) this.echoes.shift();
        }
      }
      this.leg = [];
    }
    returnBall(p) {
      const b = this.ball;
      this.finishLeg(true);
      const offset = (b.y - p.y) / 70;
      const angle = clamp(offset * 0.68 + p.vy * 0.0013, -0.78, 0.78);
      const previousTier = this.difficultyTier;
      this.rally++; this.bestRally = Math.max(this.bestRally, this.rally);
      if (this.isWall) this.returns++;
      b.speed = this.isChallenge ? this.endlessSpeed : Math.min(this.config.pace === 'quick' ? 700 : 600, b.speed + 13);
      b.vx = p.side * Math.cos(angle) * b.speed; b.vy = Math.sin(angle) * b.speed;
      b.x = p.x + p.side * clamp(p.side * (b.x - p.x), Racket.pivotX, Racket.pivotX + Racket.headX + Racket.radiusX + b.radius);
      // Automatic rackets settle before the next short, fast half-court return.
      p.swing = this.isWall && this.config.assist ? Math.min(0.16, Math.max(0, (this.court.right - b.radius - b.x) * 0.8 / b.speed)) : Math.max(p.swing, 0.16);
      this.recordLeg(); this.burst(b.x, b.y, p.id ? 'mint' : 'cream', 7);
      this.emit({ type: 'hit', player: p.id, rally: this.rally });
      if (this.difficultyTier > previousTier) this.emit({ type: 'speed-up', tier: this.difficultyTier, multiplier: b.speed / this.baseBallSpeed, hideTrails: this.returns === 20 });
      if (this.config.mode === 'practice' && this.returns >= this.config.practiceTarget) {
        this.state = 'finished'; this.winner = 0; this.echoes = []; b.active = false;
        this.emit({ type: 'finish', winner: 0, result: 'practice-win' });
      }
    }
    burst(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const a = this.random() * Math.PI * 2, speed = 45 + this.random() * 100;
        this.particles.push({ x: x, y: y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0.25 + this.random() * 0.35, color: color, radius: 2 + this.random() * 2 });
      }
      if (this.particles.length > 90) this.particles = this.particles.slice(-90);
    }
    scorePoint(scorer, cause, victim) {
      if (this.state !== 'running') return;
      this.lastCause = cause; this.lastVictim = victim;
      const p = this.players[victim]; this.burst(p ? p.x : this.ball.x, p ? p.y : this.ball.y, 'coral', 20);
      this.echoes = []; this.leg = []; this.rally = 0;
      if (this.isWall) {
        this.hearts--; this.emit({ type: 'point', cause: cause, victim: victim });
        if (this.hearts <= 0) {
          this.state = 'finished'; this.winner = null; this.ball.active = false;
          this.emit({ type: 'finish', result: this.isCoop ? 'coop-loss' : this.isChallenge ? 'endless-loss' : 'practice-loss' }); return;
        }
      } else {
        this.scores[scorer]++; this.emit({ type: 'point', cause: cause, victim: victim, scorer: scorer });
        if (this.scores[scorer] >= this.config.winScore) {
          this.state = 'finished'; this.winner = scorer; this.ball.active = false;
          this.emit({ type: 'finish', winner: scorer, result: 'local-win' }); return;
        }
      }
      this.prepareServe(this.isWall ? 0 : victim, 1.25);
    }
  }
  return { EchoCourt: EchoCourt, Court: Court, SoloCourt: SoloCourt, Racket: Racket, seededRandom: seededRandom, distanceToSegmentSquared: distanceToSegmentSquared, replayPoint: replayPoint, paddlePose: paddlePose };
});
