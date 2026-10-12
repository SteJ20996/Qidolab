import {registerTranslations, translateDOM, formatCountCopy} from './i18n.mjs';
import {markCompleted} from './completion.mjs';
import {reportOutcome} from './outcomes.mjs';
import {FRACTIONS_DENOMINATORS, EXPLORE_C_MOVE_LIMIT, fractionsState, fractionsToggle, fractionsSolution, addFractions} from './explore-c-engine.mjs';

import {TOPOLOGY_COPY, installTopology} from './topology.mjs';

// Original UI copy, in zh-CN / en / es-MX. Only validated moves are persisted.
export const EXPLORE_C_COPY = {
  fractionsNav: ['分数拼合', 'Fraction pieces', 'Piezas de fracción'],
  undo: ['↶ 撤回', '↶ Undo', '↶ Deshacer'], reset: ['重来', 'Start over', 'Reiniciar'], replay: ['再探索一次', 'Explore again', 'Explorar de nuevo'],
  hint: ['✧ 给我一点灵感', '✧ A little hint', '✧ Una pista'], nextHint: ['再给一点提示 →', 'One more hint →', 'Otra pista →'], lastHint: ['✧ 再看这条提示', '✧ Read this hint again', '✧ Volver a ver la pista'],
  moveLimit: ['这次尝试已记录 10000 步。可以撤回一步，或重新开始。', 'This attempt has reached 10,000 saved moves. Undo a move or start over.', 'Este intento llegó a 10,000 movimientos guardados. Deshaz uno o reinicia.'],
  history: ['我的尝试', 'My experiments', 'Mis intentos'], historyCount: ['{count} 步', '{count} moves', '{count} movimientos'],
  emptyHistory: ['还没有尝试。每一步都可以撤回。', 'No moves yet. You can undo every step.', 'Aún no hay movimientos. Puedes deshacer cada paso.'],
  recentHistory: ['这里只显示最近 30 步。', 'Only the latest 30 moves are shown here.', 'Aquí se muestran los últimos 30 movimientos.'],
  fractionsEyebrow: ['同一个整体，不同大小的片段', 'One whole. Different pieces.', 'Un entero. Piezas distintas.'],
  fractionsTitle: ['用三种不同的单位分数拼出 5/6。', 'Three pieces make 5/6.', 'Tres piezas para formar 5/6.'],
  fractionsPremise: ["选恰好三张不同的分数卡，让它们相加恰好等于 5/6。每张卡的分子都是 1，分母可选 2–12，每张只能用一次。", "Choose exactly three different fraction cards that add up to exactly 5/6. Every numerator is 1; choose denominators from 2–12 and use each card at most once.", "Elige exactamente tres tarjetas de fracciones distintas que sumen exactamente 5/6. Todas tienen numerador 1; elige denominadores del 2 al 12 y usa cada tarjeta como máximo una vez."],
  fractionsLabel: ['分数实验', 'Fraction experiment', 'Experimento de fracciones'],
  fractionsRule: ['点击分数来加入或移除。每张卡都把同样大小的整体等分，只取其中一份。', 'Tap a fraction to add or remove it. Every card divides the same-sized whole into equal parts and takes one part.', 'Toca una fracción para agregarla o quitarla. Cada tarjeta divide un entero del mismo tamaño en partes iguales y toma una parte.'],
  fractionsCount: ['已选 {count} / 3 种', '{count} / 3 pieces chosen', '{count} / 3 piezas elegidas'],
  fractionsTarget: ['目标 5/6', 'Target 5/6', 'Meta: 5/6'], fractionsTotal: ['你的总和：{sum}', 'Your sum: {sum}', 'Tu suma: {sum}'],
  fractionsDiagram: ['目标是 5/6，当前总和是 {sum}。下方色块代表已选的分数；竖线标出一个整体。', 'Target 5/6; current sum {sum}. Lower colored pieces show your selected fractions. The vertical line marks one whole.', 'Meta: 5/6; suma actual: {sum}. Las piezas de color de abajo son tus fracciones. La línea vertical marca un entero.'],
  fractionsScale: ['上方是目标，下方是你的拼合。竖线标出 1。', 'Target above, your pieces below. The vertical line marks 1.', 'Arriba está la meta; abajo, tus piezas. La línea vertical marca 1.'],
  fractionsChoice: ['1/{denominator} · {state}', '1/{denominator} · {state}', '1/{denominator} · {state}'],
  fractionsChosen: ['已选，再点可移除', 'selected; tap to remove', 'elegida; toca para quitar'], fractionsAvailable: ['未选，点击加入', 'not selected; tap to add', 'sin elegir; toca para agregar'],
  fractionsStart: ['三块不同大小的片段，能刚好拼出 5/6 吗？', 'Can three different pieces fit 5/6 exactly?', '¿Pueden tres piezas distintas sumar exactamente 5/6?'],
  fractionsBelow: ['总和 {sum}，还差 {gap}。已选 {count} 种。', 'Sum {sum}; still {gap} short. {count} pieces chosen.', 'Suma: {sum}; falta {gap}. Elegiste {count} piezas.'],
  fractionsAbove: ['总和 {sum}，多了 {gap}。试着换一块。', 'Sum {sum}; that is {gap} too much. Try exchanging a piece.', 'Suma: {sum}; sobra {gap}. Prueba cambiar una pieza.'],
  fractionsEqual: ['总和正确，但只用了 {count} 种。要恰好三种不同的分数，试着把一块拆成两块。', 'The sum is right, but you used {count} pieces. You need exactly three different fractions. Try splitting one piece into two.', 'La suma es correcta, pero usaste {count} piezas. Necesitas exactamente tres fracciones distintas. Prueba dividir una pieza en dos.'],
  fractionsFull: ['最多选三种。先点击一块已选分数将它移除，再试另一块。', 'Choose at most three. Remove a selected piece before trying another.', 'Elige como máximo tres. Quita una pieza elegida antes de probar otra.'],
  fractionsWon: ['刚刚好！{equation} = 5/6，三种分数各用一次。', 'An exact fit! {equation} = 5/6, using three different fractions once each.', '¡Encajan exactamente! {equation} = 5/6, con tres fracciones distintas, una vez cada una.'],
  fractionsHint1: ['分母越大，每一份越小。先挑一块，再观察还差多少。', 'A larger denominator makes a smaller piece. Choose one and look at what remains.', 'Un denominador mayor hace una pieza más pequeña. Elige una y observa cuánto falta.'],
  fractionsHint2: ['如果先用 1/2，还差 1/3。怎样把 1/3 拆成两种不同的单位分数？', 'Starting with 1/2 leaves 1/3. How could 1/3 split into two different unit fractions?', 'Si empiezas con 1/2, falta 1/3. ¿Cómo puedes dividir 1/3 en dos fracciones unitarias distintas?'],
  fractionsHintNext: ['下一块试试 1/{denominator}。保留现在的选择，仍能用三种分数完成。', 'Try 1/{denominator} next. Your current choices can still finish with three pieces.', 'Prueba 1/{denominator}. Todavía puedes completar tres piezas conservando las que elegiste.'],
  fractionsHintChange: ['含有 1/{denominator} 的当前组合无法完成。先移除它，再看看 1/2、1/4 与剩余量的关系。', 'Your current set, including 1/{denominator}, cannot finish. Remove it and compare 1/2, 1/4 and what remains.', 'Tu selección, que incluye 1/{denominator}, no puede llegar a la meta. Quítala y compara 1/2, 1/4 y lo que falta.'],
  fractionsHintSolved: ['把各块都改写成十二分之几：6/12 + 3/12 + 1/12。', 'Write every piece in twelfths: 6/12 + 3/12 + 1/12.', 'Escribe cada pieza en doceavos: 6/12 + 3/12 + 1/12.'],
  fractionsAdd: ['加入', 'Add', 'Agregar'], fractionsRemove: ['移除', 'Remove', 'Quitar'],
  fractionsRecord: ['{action} 1/{denominator} → 总和 {sum}', '{action} 1/{denominator} → sum {sum}', '{action} 1/{denominator} → suma {sum}'],
  fractionsProofTitle: ['换一种分法，总量不变。', 'New pieces. The same amount.', 'Piezas nuevas. La misma cantidad.'],
  fractionsProof: ['1/2 + 1/4 + 1/12 = 6/12 + 3/12 + 1/12 = 10/12 = 5/6。关键是把 1/3 拆成 1/4 + 1/12。通分让不同大小的片段可以放在同一把尺子上比较。', '1/2 + 1/4 + 1/12 = 6/12 + 3/12 + 1/12 = 10/12 = 5/6. The useful split is 1/3 = 1/4 + 1/12. A common denominator gives differently sized pieces the same measuring scale.', '1/2 + 1/4 + 1/12 = 6/12 + 3/12 + 1/12 = 10/12 = 5/6. La división útil es 1/3 = 1/4 + 1/12. Un denominador común permite medir piezas de tamaños distintos con la misma escala.'],
  fractionsQuiet: ['总量一样，表达方式却可以不同。', 'The same amount can have a different shape.', 'La misma cantidad puede tomar otra forma.'],
  ...TOPOLOGY_COPY,
};
for (const key of ['fractionsNav', 'reflectionNav']) registerTranslations({[key]: {'zh-CN': EXPLORE_C_COPY[key][0], en: EXPLORE_C_COPY[key][1], 'es-MX': EXPLORE_C_COPY[key][2]}});
const $ = id => document.getElementById(id);
const languageIndex = () => document.documentElement.lang === 'es-MX' ? 2 : document.documentElement.lang === 'en' ? 1 : 0;
export function exploreCText(key, params = {}) { if (!EXPLORE_C_COPY[key]) throw new Error(`Missing UI copy: ${key}`); return formatCountCopy(EXPLORE_C_COPY[key][languageIndex()], params, document.documentElement.lang).replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`)); }
const copy = (id, key, params) => { $(id).textContent = exploreCText(key, params); };
const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const save = (id, value) => { try { localStorage.setItem(`quidence-${id}-v1`, JSON.stringify(value)); } catch {} };
const fractionText = value => value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`;
function restore(id, validate) { const value = read(`quidence-${id}-v1`); try { if (!value || !Array.isArray(value.moves)) throw 0; validate(value.moves); return {moves: value.moves}; } catch { return {moves: []}; } }
const intro = id => `<div class="intro"><p class="eyebrow"><span></span><span class="explore-c-eyebrow" data-explore-c-text="${id}Eyebrow"></span></p><h1 id="${id}-title" data-explore-c-text="${id}Title"></h1><p class="premise" data-explore-c-text="${id}Premise"></p></div>`;
const controls = id => `<div class="history-controls"><button id="${id}-undo" class="text-button" data-explore-c-text="undo"></button><button id="${id}-reset" class="text-button" data-explore-c-text="reset"></button></div>`;
const below = id => `<div class="mini-below"><button id="${id}-hint" class="hint-button" aria-expanded="false" aria-controls="${id}-hint-text"></button><p id="${id}-hint-text" class="hint-copy" hidden></p></div><div id="${id}-insight" class="discovery" hidden><h2 data-explore-c-text="${id}ProofTitle"></h2><p data-explore-c-text="${id}Proof"></p><button id="${id}-replay" class="text-button" data-explore-c-text="replay"></button></div><details class="explore-c-history"><summary><span data-explore-c-text="history"></span> <span id="${id}-count"></span></summary><ol id="${id}-log"></ol><p id="${id}-recent" data-explore-c-text="recentHistory" hidden></p></details><p class="quiet-note" data-explore-c-text="${id}Quiet"></p>`;
const root = $('activity-center');
root.insertAdjacentHTML('beforeend', `
<section id="activity-fractions" class="activity-view explore-c-game" hidden aria-labelledby="fractions-title">${intro('fractions')}<div class="playground mini-board"><div class="board-top"><span class="experiment-label" data-explore-c-text="fractionsLabel"></span><span id="fractions-chosen" class="board-caption"></span></div><p class="rule-reminder" data-explore-c-text="fractionsRule"></p>
<div class="fractions-comparison"><p data-explore-c-text="fractionsTarget"></p><svg id="fractions-diagram" viewBox="0 0 430 116" role="img" focusable="false"><rect class="fractions-base" x="10" y="10" width="360" height="26" rx="4"/><rect class="fractions-target" x="10" y="10" width="300" height="26" rx="4"/><rect class="fractions-base" x="10" y="60" width="360" height="26" rx="4"/><g id="fractions-pieces"></g><path class="fractions-one" d="M370 4 V93"/><text x="370" y="110" text-anchor="middle">1</text></svg><p id="fractions-total" class="fractions-total"></p><p class="explore-c-caption" data-explore-c-text="fractionsScale"></p></div><div id="fractions-options" class="fractions-options"></div><div class="status-row"><p id="fractions-status" role="status" aria-live="polite"></p>${controls('fractions')}</div></div>${below('fractions')}</section>`);
const renderReflection = installTopology(root);
function log(id, entries, count) { const list = $(id + '-log'); list.replaceChildren(); list.setAttribute('start', String(Math.max(1, count - 29))); for (const text of entries.length ? entries : [exploreCText('emptyHistory')]) { const li = document.createElement('li'); li.textContent = text; list.append(li); } copy(id + '-count', 'historyCount', {count}); $(id + '-recent').hidden = count <= 30; }
function hint(id, level, key, params = {}) { copy(id + '-hint', level === 0 ? 'hint' : level < 3 ? 'nextHint' : 'lastHint'); $(id + '-hint').setAttribute('aria-expanded', String(level > 0)); $(id + '-hint-text').hidden = !level; if (level) copy(id + '-hint-text', key, params); }
let fractions = restore('fractions', fractionsState), fractionsHint = 0, fractionsMessage = null;
const fractionButtons = [];
for (const denominator of FRACTIONS_DENOMINATORS) {
  const button = document.createElement('button'); button.id = 'fractions-piece-' + denominator; button.className = 'fractions-piece';
  button.insertAdjacentHTML('beforeend', `<span class="fractions-piece-name" aria-hidden="true">1/${denominator}</span><span class="fractions-unit" aria-hidden="true" style="--denominator:${denominator}">${Array.from({length: denominator}, (_, i) => `<span class="${i === 0 ? 'is-unit' : ''}"></span>`).join('')}</span>`);
  button.addEventListener('click', () => { try { fractions.moves = fractionsToggle(fractions.moves, denominator); fractionsHint = 0; fractionsMessage = null; } catch { fractionsMessage = fractions.moves.length >= EXPLORE_C_MOVE_LIMIT ? 'moveLimit' : 'fractionsFull'; } renderFractions(); }); fractionButtons.push(button); $('fractions-options').append(button);
}
function renderFractions() {
  const state = fractionsState(fractions.moves), sum = fractionText(state.sum), gap = fractionText({...state.difference, numerator: Math.abs(state.difference.numerator)});
  copy('fractions-chosen', 'fractionsCount', {count: state.count}); copy('fractions-total', 'fractionsTotal', {sum}); $('fractions-diagram').setAttribute('aria-label', exploreCText('fractionsDiagram', {sum}));
  fractionButtons.forEach((button, i) => { const denominator = FRACTIONS_DENOMINATORS[i], selected = state.selected.includes(denominator); button.disabled = state.won; button.setAttribute('aria-pressed', String(selected)); button.setAttribute('aria-label', exploreCText('fractionsChoice', {denominator, state: exploreCText(selected ? 'fractionsChosen' : 'fractionsAvailable')})); });
  let x = 10; $('fractions-pieces').innerHTML = state.selected.map((denominator, i) => { const width = 360 / denominator, rectangle = `<rect x="${x}" y="60" width="${width}" height="26" class="fractions-sum-piece piece-${i}"/>`; x += width; return rectangle; }).join('');
  copy('fractions-status', fractionsMessage || (state.won ? 'fractionsWon' : !state.count ? 'fractionsStart' : state.relation === 0 ? 'fractionsEqual' : state.relation > 0 ? 'fractionsAbove' : 'fractionsBelow'), {sum, gap, count: state.count, equation: state.selected.map(d => `1/${d}`).join(' + ')});
  $('fractions-undo').disabled = !fractions.moves.length; $('fractions-reset').disabled = !fractions.moves.length; $('fractions-insight').hidden = !state.won;
  const solution = fractionsSolution(fractions.moves), denominator = solution ? solution.find(d => !state.selected.includes(d)) : state.selected.find(d => ![2, 4, 12].includes(d));
  hint('fractions', fractionsHint, fractionsHint === 1 ? 'fractionsHint1' : fractionsHint === 2 ? 'fractionsHint2' : state.won ? 'fractionsHintSolved' : solution ? 'fractionsHintNext' : 'fractionsHintChange', {denominator});
  let selected = []; const entries = []; fractions.moves.forEach((denominator, index) => { const remove = selected.includes(denominator); selected = remove ? selected.filter(d => d !== denominator) : [...selected, denominator]; if (index >= fractions.moves.length - 30) { const total = selected.reduce((sum, d) => addFractions(sum, {numerator: 1, denominator: d}), {numerator: 0, denominator: 1}); entries.push(exploreCText('fractionsRecord', {action: exploreCText(remove ? 'fractionsRemove' : 'fractionsAdd'), denominator, sum: fractionText(total)})); } });
  log('fractions', entries, fractions.moves.length); save('fractions', fractions); if (state.won) markCompleted('fractions');
  reportOutcome('fractions',state.won);
}

$('fractions-reset').addEventListener('click', resetFractions);
$('fractions-replay').addEventListener('click', resetFractions);
function resetFractions() {fractions.moves=[];fractionsHint=0;fractionsMessage=null;renderFractions();}
$('fractions-undo').addEventListener('click',()=>{fractions.moves.pop();fractionsHint=0;fractionsMessage=null;renderFractions();});
$('fractions-hint').addEventListener('click',()=>{fractionsHint=Math.min(3,fractionsHint+1);renderFractions();});

function renderLanguage() { root.querySelectorAll('[data-explore-c-text]').forEach(element => { element.textContent = exploreCText(element.dataset.exploreCText); }); root.querySelectorAll('[data-explore-c-aria]').forEach(element => element.setAttribute('aria-label', exploreCText(element.dataset.exploreCAria))); renderFractions(); renderReflection(); }
translateDOM(); window.addEventListener('languagechange', renderLanguage); renderLanguage(); window.dispatchEvent(new Event('activitiesready'));
