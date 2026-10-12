(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const C = EchoCourtGame.Court, game = new EchoCourtGame.EchoCourt({ mode: 'endless' });
  const canvas = $('court'), ctx = canvas.getContext('2d'), stage = $('stage');
  const dictionaries = {
    en: {
      title: 'Echo Court', subtitle: 'Your last shot comes back. Be somewhere else.', localTag: 'A court for one more round',
      practice: 'Wall practice', local: 'Two players', welcome: 'MEET YOUR ECHO', readyTitle: 'Hit. Move. Repeat.',
      endless: 'Endless', endlessMode: 'ENDLESS CHALLENGE', targetEndless: 'No limit · 3 chances',
      readyEndless: 'Back court only. 3 chances, no limit. Speed up every 5 returns to 20, then every 10. Echo trails vanish after 20.',
      halfCourt: 'HALF COURT', backCourt: 'BACK COURT · MOVE HERE', frontCourt: 'FRONT COURT · BALL ZONE', reboundWall: 'REBOUND WALL',
      coop: 'Same-side pair', coopMode: 'TEAM CHALLENGE', team: 'TEAM', partners: 'PARTNERS', cover: 'cover each other',
      readyCoop: 'Both in the back court. Cover a missed shot. A team miss or echo contact ends the run. Speed rises every 5 returns to 20, then every 10.',
      coopHint: 'P1: mouse / WASD · P2: arrows · Auto swing on', coopTouchHint: 'P1: mouse or WASD. P2: arrows. Touch: drag the player nearest your finger.',
      teamMiss: 'Both missed the ball!', teamEcho: 'An echo caught the team!',
      speed: 'Speed', nextBoost: 'Next boost at', returnsUnit: 'returns', trailsBefore: 'Echo trails visible until 20 returns', trailsAfter: 'Echo trails hidden · watch the balls', speedUp: 'Speed up!', trailsGone: 'Echo trails hidden!', startingPace: 'Starting pace',
      readyPractice: 'Stay in the back court. Return 12 balls off the net-side wall and dodge your orange echoes.', readyLocal: 'First to 5 points. Return the solid ball. Dodge the echoes. They pass through rackets.',
      start: "Let's play", readyHint: 'Back court · Mouse / touch · Auto swing on', readyLocalHint: 'WASD / arrows · Auto swing on', manualHint: 'Manual: P1 click / Space · P2 Enter',
      restart: 'Start fresh', swing: 'Swing', realLegend: 'Solid ball: hit it', echoLegend: 'Orange echo: dodge it',
      pathLegend: 'Dashed path: coming soon', reset: 'Reset court', touchHint: 'Move in the back court with your mouse or touch. Auto swing starts on.',
      localTouchHint: 'P1: mouse or WASD. P2: arrows. Touch: drag on your own half.',
      settings: 'Tune the court', echoSetting: 'Echo balls', echoSettingHint: 'Earlier shots return as hazards', assistSetting: 'Auto swing', assistSettingHint: 'Focus on moving and dodging',
      delaySetting: 'Echo delay', paceSetting: 'Pace', chill: 'Easygoing', quick: 'Quick', footer: 'A little tennis. A little trouble.',
      you: 'YOU', returns: 'returns', chances: 'CHANCES', keepMoving: 'keep moving', player1: 'PLAYER 1', player2: 'PLAYER 2', points: 'points',
      wallMode: 'WALL PRACTICE', localMode: 'LOCAL DUEL', targetPractice: '12 returns · 3 chances', targetLocal: 'First to 5', rally: 'Rally',
      echoesOff: 'Echoes off', echoWaiting: 'Echoes are waiting', echoIn: 'Echo in', echoesLive: 'echoes in play',
      pausedKicker: 'TAKE A BREATHER', paused: 'Court paused', pausedText: 'Your rally is right here. Come back when you are ready.', resume: 'Back to the court',
      winKicker: 'WELL PLAYED', practiceWin: 'You found your rhythm.', practiceWinText: 'Twelve returns, echoes and all. Try a quicker pace or turn auto swing off.',
      practiceLoss: 'One more round?', practiceLossText: ' returns. Your best rally was ', localWin: ' takes the court.', localWinText: 'Play again or swap sides for a rematch.',
      again: 'Play again', ghostHit: 'Echo caught you!', miss: 'Ball got away!', playerPoint: ' gets a point', pauseLabel: 'Pause', soundOn: 'Turn sound on', soundOff: 'Turn sound off', expand: 'Expand court', close: 'Close expanded court',
      canvasLabel: 'Return the solid tennis ball and dodge orange echo balls. Player one uses WASD and Space; player two uses arrow keys and Enter.'
    },
    zh: {
      title: '回声球场', subtitle: '上一球会回来。别停在原地。', localTag: '再来一局的小球场', practice: '回弹墙练习', local: '同屏双人',
      welcome: '遇见你的回声', readyTitle: '击球。移动。再来。',
      readyPractice: '在后场向中网处的回弹墙成功回球 12 次。躲开旧球路产生的橙色回声。', readyLocal: '先得 5 分获胜。击回实心球，躲开回声。回声会穿过球拍。',
      endless: '无限挑战', endlessMode: '无限挑战', targetEndless: '无限回球 · 3 次机会',
      readyEndless: '只在后场移动，接球无上限，保留 3 次机会。前 20 球每 5 球提速，之后每 10 球提速。第 20 次接球后，回声轨迹消失。',
      halfCourt: '单人半场', backCourt: '后场 · 人物移动区', frontCourt: '前场 · 球路区', reboundWall: '中网回弹墙',
      coop: '双人同侧', coopMode: '同侧搭档挑战', team: '全队', partners: '搭档', cover: '互相补位',
      readyCoop: '两人都在后场，搭档可以补救漏过的球。全队漏接或任一人被回声碰到，本局结束。前 20 球每 5 球提速，之后每 10 球提速。',
      coopHint: 'P1 鼠标 / WASD · P2 方向键 · 自动挥拍', coopTouchHint: 'P1：鼠标或 WASD。P2：方向键。触屏：按住靠近手指的人物拖动。',
      teamMiss: '两人都漏接了！', teamEcho: '回声碰到了搭档！',
      speed: '球速', nextBoost: '下次提速：', returnsUnit: '次接球', trailsBefore: '前 20 球：回声轨迹可见', trailsAfter: '回声轨迹已隐藏 · 观察球的位置', speedUp: '提速！', trailsGone: '回声轨迹已隐藏！', startingPace: '起始球速',
      start: '开始玩', readyHint: '后场移动 · 鼠标 / 触屏 · 自动挥拍', readyLocalHint: 'WASD / 方向键 · 自动挥拍已开启', manualHint: '手动：P1 点击 / 空格 · P2 回车',
      restart: '重新开始', swing: '挥拍', realLegend: '实心球：击回', echoLegend: '橙色回声：躲开', pathLegend: '虚线路径：即将出现',
      reset: '重置球场', touchHint: '鼠标跟随 / 触屏拖动，人物只能在后场移动。默认自动挥拍。', localTouchHint: 'P1：鼠标或 WASD。P2：方向键。触屏玩家各自在自己的半场拖动。', settings: '调整球场',
      echoSetting: '回声球', echoSettingHint: '旧球路会变成新的危险', assistSetting: '自动挥拍', assistSettingHint: '专注移动和躲避',
      delaySetting: '回声延迟', paceSetting: '球速', chill: '轻松', quick: '快速', footer: '一点网球，一点小混乱。',
      you: '你', returns: '成功回球', chances: '机会', keepMoving: '记得移动', player1: '玩家 1', player2: '玩家 2', points: '得分',
      wallMode: '回弹墙练习', localMode: '同屏对战', targetPractice: '回球 12 次 · 3 次机会', targetLocal: '先得 5 分', rally: '本轮回球',
      echoesOff: '回声已关闭', echoWaiting: '回声正在等待', echoIn: '回声将在', echoesLive: '颗回声在场',
      pausedKicker: '喘口气', paused: '球场已暂停', pausedText: '这一球替你留着。准备好后再继续。', resume: '继续玩',
      winKicker: '打得不错', practiceWin: '找到节奏了。', practiceWinText: '成功回球 12 次！可以试试更快的球速，或关闭自动挥拍。',
      practiceLoss: '再来一局？', practiceLossText: ' 次回球。最长连续回球：', localWin: ' 赢下这一局。', localWinText: '再来一局，也可以交换两边的位置。',
      again: '再玩一局', ghostHit: '被回声碰到了！', miss: '漏接了！', playerPoint: ' 得一分', pauseLabel: '暂停', soundOn: '开启声音', soundOff: '关闭声音', expand: '放大球场', close: '退出放大',
      canvasLabel: '击回实心网球，躲开橙色回声。玩家一用 WASD 移动、空格挥拍。玩家二用方向键移动、回车挥拍。'
    },
    tw: {
      title: '回聲球場', subtitle: '上一球會回來。別停在原地。', localTag: '再來一局的小球場', practice: '回彈牆練習', local: '同機雙人',
      welcome: '遇見你的回聲', readyTitle: '擊球。移動。再來。',
      readyPractice: '在後場向中網處的回彈牆成功回球 12 次。閃開舊球路產生的橘色回聲。', readyLocal: '先得 5 分獲勝。擊回實心球，閃開回聲。回聲會穿過球拍。',
      endless: '無限挑戰', endlessMode: '無限挑戰', targetEndless: '無限回球 · 3 次機會',
      readyEndless: '只在後場移動，接球無上限，保留 3 次機會。前 20 球每 5 球加速，之後每 10 球加速。第 20 次接球後，回聲軌跡消失。',
      halfCourt: '單人半場', backCourt: '後場 · 人物移動區', frontCourt: '前場 · 球路區', reboundWall: '中網回彈牆',
      coop: '雙人同側', coopMode: '同側搭檔挑戰', team: '全隊', partners: '搭檔', cover: '互相補位',
      readyCoop: '兩人都在後場，搭檔可以補救漏過的球。全隊漏接或任一人被回聲碰到，本局結束。前 20 球每 5 球加速，之後每 10 球加速。',
      coopHint: 'P1 滑鼠 / WASD · P2 方向鍵 · 自動揮拍', coopTouchHint: 'P1：滑鼠或 WASD。P2：方向鍵。觸控：按住靠近手指的人物拖曳。',
      teamMiss: '兩人都漏接了！', teamEcho: '回聲碰到了搭檔！',
      speed: '球速', nextBoost: '下次加速：', returnsUnit: '次接球', trailsBefore: '前 20 球：回聲軌跡可見', trailsAfter: '回聲軌跡已隱藏 · 觀察球的位置', speedUp: '加速！', trailsGone: '回聲軌跡已隱藏！', startingPace: '起始球速',
      start: '開始玩', readyHint: '後場移動 · 滑鼠 / 觸控 · 自動揮拍', readyLocalHint: 'WASD / 方向鍵 · 自動揮拍已開啟', manualHint: '手動：P1 點擊 / 空白鍵 · P2 Enter',
      restart: '重新開始', swing: '揮拍', realLegend: '實心球：擊回', echoLegend: '橘色回聲：閃開', pathLegend: '虛線路徑：即將出現',
      reset: '重設球場', touchHint: '滑鼠跟隨 / 觸控拖曳，人物只能在後場移動。預設自動揮拍。', localTouchHint: 'P1：滑鼠或 WASD。P2：方向鍵。觸控玩家各自在自己的半場拖曳。', settings: '調整球場',
      echoSetting: '回聲球', echoSettingHint: '舊球路會變成新的危險', assistSetting: '自動揮拍', assistSettingHint: '專注移動和閃避',
      delaySetting: '回聲延遲', paceSetting: '球速', chill: '輕鬆', quick: '快速', footer: '一點網球，一點小混亂。',
      you: '你', returns: '成功回球', chances: '機會', keepMoving: '記得移動', player1: '玩家 1', player2: '玩家 2', points: '得分',
      wallMode: '回彈牆練習', localMode: '同機對戰', targetPractice: '回球 12 次 · 3 次機會', targetLocal: '先得 5 分', rally: '本輪回球',
      echoesOff: '回聲已關閉', echoWaiting: '回聲正在等待', echoIn: '回聲將在', echoesLive: '顆回聲在場',
      pausedKicker: '喘口氣', paused: '球場已暫停', pausedText: '這一球替你留著。準備好後再繼續。', resume: '繼續玩',
      winKicker: '打得不錯', practiceWin: '找到節奏了。', practiceWinText: '成功回球 12 次！可以試試更快的球速，或關閉自動揮拍。',
      practiceLoss: '再來一局？', practiceLossText: ' 次回球。最長連續回球：', localWin: ' 贏下這一局。', localWinText: '再來一局，也可以交換兩邊的位置。',
      again: '再玩一局', ghostHit: '被回聲碰到了！', miss: '漏接了！', playerPoint: ' 得一分', pauseLabel: '暫停', soundOn: '開啟音效', soundOff: '關閉音效', expand: '放大球場', close: '退出放大',
      canvasLabel: '擊回實心網球，閃開橘色回聲。玩家一用 WASD 移動、空白鍵揮拍。玩家二用方向鍵移動、Enter 揮拍。'
    }
  };
  let locale = 'en';
  try { const stored = localStorage.getItem('qidoball.echoCourt.language'); if (dictionaries[stored]) locale = stored; } catch (_) {}
  let view = { width: 1000, height: 620, dpr: 1, scale: 1, x: 0, y: 0 };
  let previousFrame = performance.now(), lastUI = 0, overlayKey = '', toastUntil = 0, muted = true, audioContext = null;
  const keys = new Set(), targets = [null, null], pointerOwners = new Map(), swingPointers = [new Set(), new Set()];
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function t(key) { return dictionaries[locale][key] || dictionaries.en[key] || key; }
  function setText(element, value) { if (element.textContent !== String(value)) element.textContent = String(value); }
  function applyLanguage() {
    document.documentElement.lang = locale === 'tw' ? 'zh-Hant' : locale === 'zh' ? 'zh-Hans' : 'en';
    $('language').value = locale;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (el.getAttribute('data-i18n') === 'title') { el.textContent = t('title'); const dot = document.createElement('span'); dot.className = 'title-dot'; dot.textContent = '.'; el.appendChild(dot); }
      else setText(el, t(el.getAttribute('data-i18n')));
    });
    document.title = 'Qidoball · ' + t('title');
    canvas.setAttribute('aria-label', t('canvasLabel'));
    overlayKey = ''; updateUI(); updateSoundLabel();
    $('expandButton').setAttribute('aria-label', t(stage.classList.contains('expanded') ? 'close' : 'expand'));
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    view.width = rect.width; view.height = rect.height; view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const court = game.court;
    view.scale = Math.min(rect.width / court.width, rect.height / court.height); view.x = (rect.width - court.width * view.scale) / 2; view.y = (rect.height - court.height * view.scale) / 2;
    const width = Math.round(rect.width * view.dpr), height = Math.round(rect.height * view.dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }
  function clearInputs() {
    keys.clear(); pointerOwners.clear(); targets[0] = targets[1] = null; swingPointers[0].clear(); swingPointers[1].clear();
    $('swingOne').classList.remove('pressed'); $('swingTwo').classList.remove('pressed');
  }
  function pause() { clearInputs(); game.pause(); overlayKey = ''; updateUI(); }
  function start() {
    if (game.state === 'paused') game.resume(); else game.start();
    clearInputs(); canvas.focus({ preventScroll: true }); overlayKey = ''; toastUntil = 0;
    if (!muted) unlockAudio(); updateUI();
  }
  function reset() { clearInputs(); game.reset(); overlayKey = ''; toastUntil = 0; updateUI(); }
  function setMode(mode) {
    clearInputs(); game.reset({ mode: mode, assist: true });
    $('assistToggle').checked = game.config.assist; overlayKey = ''; toastUntil = 0; updateUI();
  }
  function updateUI() {
    const practice = game.config.mode === 'practice', endless = game.config.mode === 'endless', solo = game.isSolo, coop = game.isCoop, wall = game.isWall, running = game.state === 'running';
    const resized = stage.classList.contains('solo') !== wall;
    stage.classList.toggle('solo', wall); document.body.classList.toggle('solo-layout', wall);
    if (resized) resize();
    [['practiceMode', practice], ['endlessMode', endless], ['coopMode', coop], ['localMode', !wall]].forEach(function (entry) {
      $(entry[0]).classList.toggle('active', entry[1]); $(entry[0]).setAttribute('aria-pressed', String(entry[1]));
    });
    $('swingTwo').hidden = solo; $('p2Controls').hidden = solo;
    setText(document.querySelector('[data-i18n="touchHint"]'), t(coop ? 'coopTouchHint' : solo ? 'touchHint' : 'localTouchHint'));
    setText($('leftName'), t(coop ? 'team' : solo ? 'you' : 'player1')); setText($('leftDetail'), t(wall ? 'returns' : 'points')); setText($('leftScore'), wall ? game.returns : game.scores[0]);
    setText($('rightName'), t(coop ? 'partners' : solo ? 'chances' : 'player2')); setText($('rightDetail'), t(coop ? 'cover' : solo ? 'keepMoving' : 'points'));
    $('rightScore').classList.toggle('hearts', wall);
    setText($('rightScore'), wall ? ('♥ '.repeat(game.hearts).trim() || '—') : game.scores[1]);
    setText($('modeStatus'), t(coop ? 'coopMode' : endless ? 'endlessMode' : practice ? 'wallMode' : 'localMode'));
    setText($('rallyStatus'), game.rally ? t('rally') + ' ' + game.rally : coop ? 'P1 + P2' : t(endless ? 'targetEndless' : practice ? 'targetPractice' : 'targetLocal'));
    $('challengeBar').hidden = !game.isChallenge;
    setText($('speedStatus'), t('speed') + ' ×' + (game.ball.speed / game.baseBallSpeed).toFixed(2));
    setText($('nextSpeedStatus'), t('nextBoost') + ' ' + game.nextSpeedAt + ' ' + t('returnsUnit'));
    setText($('trailStatus'), t(!game.config.echoEnabled ? 'echoesOff' : game.echoTrailsVisible ? 'trailsBefore' : 'trailsAfter'));
    $('pathLegendItem').hidden = !game.echoTrailsVisible;
    setText(document.querySelector('[data-i18n="paceSetting"]'), t(game.isChallenge ? 'startingPace' : 'paceSetting'));
    const active = game.activeEchoCount, pending = game.echoes.filter((e) => game.clock < e.spawnAt);
    if (!game.config.echoEnabled) setText($('echoStatus'), t('echoesOff'));
    else if (active) setText($('echoStatus'), active + ' ' + t('echoesLive'));
    else if (pending.length) setText($('echoStatus'), t('echoIn') + ' ' + Math.max(0, pending[0].spawnAt - game.clock).toFixed(1) + 's');
    else setText($('echoStatus'), t('echoWaiting'));
    $('pauseButton').disabled = !running && game.state !== 'paused'; $('pauseButton').setAttribute('aria-label', t(game.state === 'paused' ? 'resume' : 'pauseLabel'));
    $('overlay').hidden = running;
    const currentKey = [game.state, game.config.mode, locale, game.config.assist, game.winner, game.returns, game.bestRally].join('|');
    if (currentKey !== overlayKey) {
      overlayKey = currentKey; $('restartButton').hidden = game.state !== 'paused';
      if (game.state === 'ready') {
        setText($('overlayKicker'), t('welcome')); setText($('overlayTitle'), t('readyTitle')); setText($('overlayText'), t(coop ? 'readyCoop' : endless ? 'readyEndless' : practice ? 'readyPractice' : 'readyLocal')); setText($('startLabel'), t('start'));
      } else if (game.state === 'paused') {
        setText($('overlayKicker'), t('pausedKicker')); setText($('overlayTitle'), t('paused')); setText($('overlayText'), t('pausedText')); setText($('startLabel'), t('resume'));
      } else if (game.state === 'finished') {
        setText($('overlayKicker'), t('winKicker')); setText($('startLabel'), t('again'));
        if (practice && game.winner === 0) { setText($('overlayTitle'), t('practiceWin')); setText($('overlayText'), t('practiceWinText')); }
        else if (wall) { setText($('overlayTitle'), t(coop ? game.lastCause === 'echo' ? 'teamEcho' : 'teamMiss' : 'practiceLoss')); setText($('overlayText'), game.returns + t('practiceLossText') + game.bestRally + '.'); }
        else { setText($('overlayTitle'), 'P' + (game.winner + 1) + t('localWin')); setText($('overlayText'), game.scores.join(' — ') + '. ' + t('localWinText')); }
      }
      setText($('overlayHint'), t(game.config.assist ? (coop ? 'coopHint' : solo ? 'readyHint' : 'readyLocalHint') : 'manualHint'));
    }
    $('pointToast').classList.toggle('visible', running && performance.now() < toastUntil);
  }
  function unlockAudio() {
    try { if (!audioContext) { const Audio = window.AudioContext || window.webkitAudioContext; if (Audio) audioContext = new Audio(); } if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(function () {}); } catch (_) {}
  }
  function tone(frequency, duration, shape, volume) {
    if (muted || !audioContext || audioContext.state !== 'running') return;
    try {
      const osc = audioContext.createOscillator(), gain = audioContext.createGain(), now = audioContext.currentTime;
      osc.type = shape || 'sine'; osc.frequency.setValueAtTime(frequency, now); osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.7), now + duration);
      gain.gain.setValueAtTime(volume || 0.045, now); gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + duration); osc.onended = function () { osc.disconnect(); gain.disconnect(); };
    } catch (_) {}
  }
  function updateSoundLabel() {
    $('soundButton').classList.toggle('active', !muted); $('soundButton').setAttribute('aria-label', t(muted ? 'soundOn' : 'soundOff'));
    $('soundMark').setAttribute('d', muted ? 'm16 9 5 6m0-6-5 6' : 'M15 8q5 4 0 8m3-11q7 7 0 14');
  }
  function handleEvents() {
    for (const e of game.drainEvents()) {
      if (e.type === 'hit') tone(490 + (e.rally % 5) * 55, 0.08, 'triangle', 0.055);
      if (e.type === 'wall') tone(240, 0.045, 'sine', 0.03);
      if (e.type === 'echo') tone(710, 0.12, 'sine', 0.018);
      if (e.type === 'point') {
        tone(145, 0.2, 'triangle', 0.08);
        setText($('pointToast'), game.isCoop ? t(e.cause === 'echo' ? 'teamEcho' : 'teamMiss') : game.isSolo ? t(e.cause === 'echo' ? 'ghostHit' : 'miss') : 'P' + (e.scorer + 1) + t('playerPoint'));
        toastUntil = performance.now() + 1050;
      }
      if (e.type === 'speed-up') {
        tone(820, 0.13, 'triangle', 0.035);
        setText($('pointToast'), e.hideTrails && game.config.echoEnabled ? t('trailsGone') : t('speedUp') + ' ×' + e.multiplier.toFixed(2));
        toastUntil = performance.now() + 1050; updateUI();
      }
      if (e.type === 'finish') { tone(game.winner === null ? 220 : 650, 0.26, 'sine', 0.04); overlayKey = ''; updateUI(); }
    }
  }
  function readInputs() {
    return [
      { x: Number(keys.has('KeyD')) - Number(keys.has('KeyA')), y: Number(keys.has('KeyS')) - Number(keys.has('KeyW')), swing: keys.has('Space') || swingPointers[0].size > 0, target: targets[0] },
      { x: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')), y: Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp')), swing: keys.has('Enter') || swingPointers[1].size > 0, target: targets[1] }
    ];
  }
  const gameKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter']);
  window.addEventListener('keydown', function (e) {
    if (e.target && e.target.closest && e.target.closest('input,select,button,summary,a')) return;
    if (e.code === 'Escape' && stage.classList.contains('expanded')) { e.preventDefault(); closeExpanded(); return; }
    if (e.code === 'KeyP' || e.code === 'Escape') { if (game.state === 'running') pause(); else if (game.state === 'paused') start(); e.preventDefault(); return; }
    if (gameKeys.has(e.code) && game.state === 'running') {
      e.preventDefault(); keys.add(e.code);
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) targets[0] = null;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) targets[1] = null;
    }
  });
  window.addEventListener('keyup', function (e) { keys.delete(e.code); });
  window.addEventListener('blur', function () { if (game.state === 'running') pause(); else clearInputs(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && game.state === 'running') pause(); });
  function worldPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - view.x) / view.scale, y: (e.clientY - r.top - view.y) / view.scale };
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (game.state !== 'running') return;
    e.preventDefault(); canvas.focus({ preventScroll: true });
    if (e.pointerType === 'mouse' && e.button !== undefined && e.button !== 0) return;
    const point = worldPoint(e);
    let id = e.pointerType === 'mouse' || game.isSolo ? 0 : Number(point.x >= C.centerX);
    if (game.isCoop && e.pointerType !== 'mouse') {
      const available = game.players.filter((p) => !Array.from(pointerOwners.values()).includes(p.id));
      if (!available.length) return;
      available.sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y));
      id = available[0].id;
    }
    pointerOwners.set(e.pointerId, id); targets[id] = point;
    if (e.pointerType === 'mouse') swingPointers[0].add(e.pointerId);
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener('pointermove', function (e) {
    if (game.state !== 'running') return;
    if (pointerOwners.has(e.pointerId)) { e.preventDefault(); targets[pointerOwners.get(e.pointerId)] = worldPoint(e); }
    else if (e.pointerType === 'mouse') {
      const point = worldPoint(e);
      if (game.isWall || point.x < C.centerX) targets[0] = point;
      else targets[0] = null;
    }
  });
  function releasePointer(e) {
    swingPointers[0].delete(e.pointerId);
    if (!pointerOwners.has(e.pointerId)) return;
    const id = pointerOwners.get(e.pointerId); pointerOwners.delete(e.pointerId);
    if (e.pointerType !== 'mouse' && !Array.from(pointerOwners.values()).includes(id)) {
      targets[id] = null; game.players[id].vx = 0; game.players[id].vy = 0;
    }
  }
  canvas.addEventListener('pointerup', releasePointer); canvas.addEventListener('pointercancel', releasePointer); canvas.addEventListener('lostpointercapture', releasePointer);
  [0, 1].forEach(function (id) {
    const button = $(id ? 'swingTwo' : 'swingOne');
    button.addEventListener('pointerdown', function (e) { if (game.state !== 'running') return; e.preventDefault(); swingPointers[id].add(e.pointerId); button.classList.add('pressed'); try { button.setPointerCapture(e.pointerId); } catch (_) {} });
    const release = function (e) { swingPointers[id].delete(e.pointerId); if (!swingPointers[id].size) button.classList.remove('pressed'); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });
  $('startButton').addEventListener('click', start); $('restartButton').addEventListener('click', reset); $('resetButton').addEventListener('click', reset);
  $('practiceMode').addEventListener('click', function () { if (game.config.mode !== 'practice') setMode('practice'); });
  $('endlessMode').addEventListener('click', function () { if (game.config.mode !== 'endless') setMode('endless'); });
  $('coopMode').addEventListener('click', function () { if (game.config.mode !== 'coop') setMode('coop'); });
  $('localMode').addEventListener('click', function () { if (game.config.mode !== 'local') setMode('local'); });
  $('pauseButton').addEventListener('click', function () { if (game.state === 'running') pause(); else if (game.state === 'paused') start(); });
  $('language').addEventListener('change', function (e) { locale = dictionaries[e.target.value] ? e.target.value : 'en'; try { localStorage.setItem('qidoball.echoCourt.language', locale); } catch (_) {} applyLanguage(); });
  $('soundButton').addEventListener('click', function () { muted = !muted; if (!muted) { unlockAudio(); tone(520, 0.1); } updateSoundLabel(); canvas.focus({ preventScroll: true }); });
  $('settings').addEventListener('toggle', function () { if ($('settings').open && game.state === 'running') pause(); });
  $('echoToggle').addEventListener('change', function (e) { game.configure({ echoEnabled: e.target.checked }); updateUI(); });
  $('assistToggle').addEventListener('change', function (e) { game.configure({ assist: e.target.checked }); overlayKey = ''; updateUI(); });
  $('delaySlider').addEventListener('input', function (e) { game.configure({ echoDelay: Number(e.target.value) }); setText($('delayValue'), Number(e.target.value).toFixed(1) + 's'); });
  $('paceSelect').addEventListener('change', function (e) { game.configure({ pace: e.target.value }); reset(); });
  function restoreTouchActions() { if ($('touchActions').parentElement === stage) stage.after($('touchActions')); }
  function closeExpanded() {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    stage.classList.remove('expanded'); document.body.style.overflow = ''; restoreTouchActions(); $('expandButton').setAttribute('aria-label', t('expand')); resize();
  }
  $('expandButton').addEventListener('click', function () {
    if (stage.classList.contains('expanded')) { closeExpanded(); return; }
    stage.appendChild($('touchActions')); stage.classList.add('expanded'); document.body.style.overflow = 'hidden';
    $('expandButton').setAttribute('aria-label', t('close')); resize();
    if (stage.requestFullscreen) stage.requestFullscreen().catch(function () {});
    canvas.focus({ preventScroll: true });
  });
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && stage.classList.contains('expanded')) closeExpanded(); resize(); });
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.arcTo(x + width, y, x + width, y + height, radius); ctx.arcTo(x + width, y + height, x, y + height, radius); ctx.arcTo(x, y + height, x, y, radius); ctx.arcTo(x, y, x + width, y, radius); ctx.closePath();
  }
  function drawCourt() {
    const court = game.court;
    const background = ctx.createLinearGradient(0, 0, court.width, 620); background.addColorStop(0, '#285b49'); background.addColorStop(1, '#16453c');
    ctx.fillStyle = background; ctx.fillRect(0, 0, court.width, 620);
    ctx.fillStyle = '#103d3527';
    for (let x = 0; x < court.width; x += 90) if ((x / 90) % 2 === 0) ctx.fillRect(x, 90, 90, 470);
    if (game.isWall) {
      const depth = court.right - court.left, height = court.bottom - court.top;
      ctx.fillStyle = '#80ac8016'; roundedRect(22, court.top + 18, court.left - 22, height - 36, 5); ctx.fill();
      ctx.fillStyle = '#80ac8040'; roundedRect(court.left, court.top, depth, height, 5); ctx.fill();
      ctx.fillStyle = '#ffffff0a'; ctx.fillRect(court.left, court.top, court.centerX - court.left, height);
      ctx.fillStyle = '#0d383127'; ctx.fillRect(court.centerX, court.top, court.right - court.centerX, height);
      ctx.strokeStyle = '#e6e8c687'; ctx.lineWidth = 2; ctx.strokeRect(court.left, court.top, depth, height);
      ctx.strokeStyle = '#e6e8c64d'; ctx.beginPath();
      ctx.moveTo(court.centerX, court.top); ctx.lineTo(court.centerX, court.bottom);
      ctx.moveTo(court.centerX, court.centerY); ctx.lineTo(court.right, court.centerY);
      ctx.moveTo(court.left, 160); ctx.lineTo(court.right, 160); ctx.moveTo(court.left, 494); ctx.lineTo(court.right, 494); ctx.stroke();
      ctx.fillStyle = '#c5d1ad'; roundedRect(court.right - 2, 116, 8, 423, 3); ctx.fill();
      ctx.fillStyle = '#638e75'; for (let y = 122; y < 532; y += 18) ctx.fillRect(court.right, y, 4, 8);
      ctx.fillStyle = '#eef0d2'; ctx.beginPath(); ctx.arc(court.right + 2, 102, 4, 0, Math.PI * 2); ctx.arc(court.right + 2, 552, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cadac08c'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(t('backCourt'), (court.left + court.centerX) / 2, 137);
      ctx.fillText(t('frontCourt'), (court.centerX + court.right) / 2, 137);
      ctx.save(); ctx.translate(court.right + 25, court.centerY); ctx.rotate(Math.PI / 2); ctx.fillText(t('reboundWall'), 0, 0); ctx.restore();
      ctx.fillStyle = '#95b9a655'; ctx.font = '10px sans-serif'; ctx.fillText('Q I D O B A L L', court.width / 2, 591);
      return;
    }
    ctx.fillStyle = '#80ac8016'; roundedRect(22, court.top + 18, 40, court.bottom - court.top - 36, 5); ctx.fill(); roundedRect(court.right, court.top + 18, 40, court.bottom - court.top - 36, 5); ctx.fill();
    ctx.fillStyle = '#80ac8040'; roundedRect(62, 104, 876, 446, 5); ctx.fill();
    ctx.fillStyle = '#ffffff04'; ctx.fillRect(62, 104, 438, 446);
    ctx.strokeStyle = '#e6e8c687'; ctx.lineWidth = 2; ctx.strokeRect(62, 104, 876, 446);
    ctx.strokeStyle = '#e6e8c64d'; ctx.beginPath(); ctx.moveTo(270, 104); ctx.lineTo(270, 550); ctx.moveTo(730, 104); ctx.lineTo(730, 550); ctx.moveTo(270, 327); ctx.lineTo(730, 327); ctx.moveTo(62, 160); ctx.lineTo(938, 160); ctx.moveTo(62, 494); ctx.lineTo(938, 494); ctx.stroke();
    ctx.fillStyle = '#12352e35'; ctx.fillRect(496, 100, 10, 456);
    ctx.strokeStyle = '#dfe2c27a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(500, 103); ctx.lineTo(500, 550); ctx.stroke();
    ctx.strokeStyle = '#dfe2c224'; ctx.lineWidth = 1;
    for (let y = 105; y < 550; y += 10) { ctx.beginPath(); ctx.moveTo(495, y); ctx.lineTo(505, y); ctx.stroke(); }
    ctx.fillStyle = '#eef0d2'; ctx.beginPath(); ctx.arc(500, 102, 4, 0, Math.PI * 2); ctx.arc(500, 552, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#95b9a655'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Q I D O B A L L', 500, 591);
  }
  function drawPlayer(p) {
    if (game.isSolo && p.id === 1) return;
    const idle = game.state === 'ready' ? 0 : Math.sin(game.clock * 9 + p.id) * Math.min(1, Math.hypot(p.vx, p.vy) / 300);
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.save(); ctx.scale(0.8, 0.8);
    ctx.fillStyle = '#0b302b55'; ctx.beginPath(); ctx.ellipse(3, 21, 23, 8, 0, 0, Math.PI * 2); ctx.fill();
    const color = p.id ? '#bbd9ae' : '#eda58a', edge = p.id ? '#749a6e' : '#c67f63';
    ctx.fillStyle = '#142f2a'; roundedRect(-13, 10 + idle * 2, 10, 11, 4); ctx.fill(); roundedRect(4, 10 - idle * 2, 10, 11, 4); ctx.fill();
    ctx.fillStyle = color; ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff4d9'; ctx.beginPath(); ctx.arc(0, -9, 16, Math.PI, 0); ctx.fill(); roundedRect(p.side < 0 ? -21 : 0, -13, 21, 6, 3); ctx.fill();
    ctx.fillStyle = '#343f34'; ctx.beginPath(); ctx.arc(p.side * 7, -2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f6d8b2'; ctx.beginPath(); ctx.arc(p.side * 15, 11, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const side = p.side, angle = EchoCourtGame.paddlePose(p).swingAngle, r = EchoCourtGame.Racket;
    ctx.save(); ctx.translate(side * r.pivotX, r.pivotY); ctx.rotate(angle); ctx.strokeStyle = '#dccca1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(side * 8, -3); ctx.stroke();
    ctx.lineWidth = 2.4; ctx.strokeStyle = '#f1dfb7'; ctx.fillStyle = '#cee7bd42'; ctx.beginPath(); ctx.ellipse(side * r.headX, r.headY, r.radiusX, r.radiusY, r.tilt * side, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 0.7; ctx.strokeStyle = '#e7ecd57d';
    for (let y = r.headY - r.radiusY; y <= r.headY + r.radiusY; y += 6) { ctx.beginPath(); ctx.moveTo(side * r.headX - r.radiusX - 4, y); ctx.lineTo(side * r.headX + r.radiusX + 4, y); ctx.stroke(); }
    ctx.restore(); ctx.restore();
    if (p.swing > 0) { ctx.strokeStyle = '#ffefd857'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 42, side < 0 ? 2.3 : -0.85, side < 0 ? 4 : 0.85); ctx.stroke(); }
    if (game.isCoop) { ctx.fillStyle = p.id ? '#d5e6c6' : '#f9c4a9'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('P' + (p.id + 1), 0, -25); }
    ctx.restore();
  }
  function drawBall(x, y, ghost, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    if (ghost) {
      ctx.shadowBlur = 12; ctx.shadowColor = '#efb19c'; ctx.fillStyle = '#f1a88c3b'; ctx.strokeStyle = '#ffc1a4'; ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      ctx.shadowBlur = 0; ctx.strokeStyle = '#ffc9b2'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, 4); ctx.moveTo(4, -4); ctx.lineTo(-4, 4); ctx.stroke();
    } else {
      ctx.shadowBlur = 15; ctx.shadowColor = '#fff1c97a'; ctx.fillStyle = '#fff1b7'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.strokeStyle = '#bcbd85'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(-9, 0, 9, -1.1, 1.1); ctx.arc(9, 0, 9, 2.05, 4.25); ctx.stroke();
    }
    ctx.restore();
  }
  function drawEchoes() {
    const court = game.court;
    ctx.save(); ctx.beginPath(); ctx.rect(court.left - 24, court.top - 20, court.right - court.left + 48, court.bottom - court.top + 40); ctx.clip();
    for (const e of game.echoes) {
      const until = e.spawnAt - game.clock;
      if (game.echoTrailsVisible && until > 0 && until <= 0.85) {
        ctx.strokeStyle = '#f6b194'; ctx.globalAlpha = 0.16 + (1 - until / 0.85) * 0.3; ctx.lineWidth = 2; ctx.setLineDash([6, 9]); ctx.beginPath();
        e.path.forEach(function (p, index) { if (index === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke(); ctx.setLineDash([]);
        const end = e.path[e.path.length - 1]; ctx.beginPath(); ctx.arc(end.x, end.y, 17, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      } else if (until <= 0) {
        for (let i = game.echoTrailsVisible ? 3 : 0; i > 0; i--) {
          const age = e.age - i * 0.065;
          if (age >= 0) { const p = EchoCourtGame.replayPoint(e.path, age); drawBall(p.x, p.y, true, (4 - i) * 0.08); }
        }
        drawBall(e.x, e.y, true, 0.85);
      }
    }
    ctx.restore();
  }
  function draw(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#19463d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale * view.dpr, 0, 0, view.scale * view.dpr, view.x * view.dpr, view.y * view.dpr);
    drawCourt(); drawEchoes(); game.players.forEach(drawPlayer);
    if (game.state === 'ready') {
      const court = game.court, range = game.isWall ? 140 : 285;
      const phase = reducedMotion ? 0.9 : now / 1400, x = court.centerX + Math.cos(phase) * range, y = 322 + Math.sin(phase * 1.8) * 86;
      drawBall(x, y, false); drawBall(court.centerX + Math.cos(phase - 1.05) * range, 322 + Math.sin((phase - 1.05) * 1.8) * 86, true, 0.55);
    } else if (game.ball.active || game.serveWait > 0) {
      if (game.leg.length > 2) {
        ctx.strokeStyle = '#f7e5a52b'; ctx.lineWidth = 3; ctx.beginPath();
        game.leg.slice(-12).forEach(function (p, i) { if (!i) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke();
      }
      drawBall(game.ball.x, game.ball.y, false);
    }
    for (const p of game.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 3); ctx.fillStyle = p.color === 'coral' ? '#eaa68d' : p.color === 'mint' ? '#c5e2b4' : '#f3e4ad'; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    const dt = Math.min((now - previousFrame) / 1000, 0.05); previousFrame = now;
    game.step(dt, readInputs()); handleEvents(); draw(now);
    if (now - lastUI > 90) { updateUI(); lastUI = now; }
    requestAnimationFrame(frame);
  }
  resize(); applyLanguage(); requestAnimationFrame(frame);
})();
